import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const root = new URL('../', import.meta.url);
const require = createRequire(import.meta.url);
const installed = require('dompurify');
const bundlePath = join(dirname(require.resolve('dompurify')), 'purify.min.js');
const bundleIntegrity = 'sha384-' + createHash('sha384').update(readFileSync(bundlePath)).digest('base64');

test('DOMPurify manifest, lockfile and installed package include all three advisory fixes', () => {
  const manifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
  const lock = JSON.parse(readFileSync(new URL('package-lock.json', root), 'utf8'));
  for (const version of [
    manifest.dependencies.dompurify, lock.packages['node_modules/dompurify'].version, installed.version,
  ]) {
    const [major, minor, patch] = version.replace(/^[~^]/, '').split('.').map(Number);
    assert.ok(major > 3 || (major === 3 && (minor > 4 || (minor === 4 && patch >= 17))),
      `DOMPurify must include all three fixes: ${version}`);
  }
  assert.equal(lock.packages[''].dependencies.dompurify, manifest.dependencies.dompurify);
  assert.equal(lock.packages['node_modules/dompurify'].version, installed.version);
  assert.equal(lock.packages['node_modules/dompurify'].resolved,
    `https://registry.npmjs.org/dompurify/-/dompurify-${installed.version}.tgz`);
});

for (const page of ['privacy', 'terms', 'cookies', 'GDPR', 'CRIC']) {
  test(`${page}: browser CDN version and integrity match the installed patched bundle`, () => {
    const html = readFileSync(new URL(`WebsiteProject/public/legal/${page}.html`, root), 'utf8');
    const script = html.match(/<script\b[^>]*src="https:\/\/cdn\.jsdelivr\.net\/npm\/dompurify@[^"]+"[^>]*><\/script>/)?.[0];
    assert.ok(script, 'missing sanitizer script');
    assert.ok(script.includes(`/dompurify@${installed.version}/dist/purify.min.js"`));
    assert.ok(script.includes(`integrity="${bundleIntegrity}"`), 'incorrect CDN integrity hash');
    assert.ok(script.includes('crossorigin="anonymous"'));
  });
}

// Run the actual installed UMD bundle in Chromium. DOM emulators are not a
// reliable substitute for shadow trees, detached-node hooks and XHTML parsing.
function browserRegressions() {
  const results = [];
  const check = (name, run) => {
    try {
      run();
      results.push({ name, passed: true });
    } catch (error) {
      results.push({ name, passed: false, error: error.message });
    }
  };
  const expect = (condition, message) => {
    if (!condition) throw new Error(message);
  };

  check('default sanitization preserves benign markup and removes active content', () => {
    const clean = window.DOMPurify.sanitize(
      '<p>Welcome <strong>guests</strong></p><a href="https://example.com">Guide</a>' +
      '<img src="data:," onerror="alert(1)"><scr' + 'ipt>alert(1)</scr' + 'ipt>',
    );
    expect(clean.includes('<strong>guests</strong>'), 'benign formatting was removed');
    expect(clean.includes('href="https://example.com"'), 'safe link was removed');
    expect(!/<script\b|onerror/i.test(clean), 'active content survived');
  });

  for (const [dialect, expression] of [
    ['template literal', '${alert(1)}'],
    ['mustache', '{{alert(1)}}'],
    ['ERB', '<%alert(1)%>'],
  ]) {
    check(`GHSA-cg2g-xh64-v4q7: ${dialect} fragments in attached shadow roots`, () => {
      const host = document.createElement('div');
      const shadow = host.attachShadow({ mode: 'open' });
      const safe = document.createElement('span');
      safe.textContent = 'Safe shadow content';
      shadow.append(safe);
      // No individual text node contains an opening or closing delimiter.
      for (const character of expression) {
        shadow.append(document.createTextNode(character), document.createElement('object'));
      }
      document.body.append(host);
      try {
        window.DOMPurify(window).sanitize(host, { IN_PLACE: true, SAFE_FOR_TEMPLATES: true });
        expect(!shadow.textContent.includes(expression), 'split template expression survived');
        expect(shadow.querySelector('span')?.textContent === 'Safe shadow content',
          'independent benign shadow content was removed');
      } finally {
        host.remove();
      }
    });
  }

  for (const hook of [
    'beforeSanitizeElements', 'uponSanitizeElement', 'afterSanitizeElements',
    'beforeSanitizeAttributes', 'afterSanitizeAttributes',
  ]) {
    for (const mode of ['self', 'parent', 'nextSibling']) {
      check(`GHSA-mrv2-3pqr-j5jr: ${hook} detaches ${mode}`, () => {
        const purify = window.DOMPurify(window);
        const root = document.createElement('div');
        root.innerHTML = '<figure><img class="bad" src="data:,">' +
          '<img id="evil" src="data:," onerror="alert(1)"></figure><p>OK</p>';
        const evil = root.querySelector('#evil');
        purify.addHook(hook, (node) => {
          if (node.getAttribute?.('class') !== 'bad') return;
          if (mode === 'self') node.remove();
          if (mode === 'parent') node.parentNode.remove();
          if (mode === 'nextSibling') node.nextElementSibling.remove();
        });
        purify.sanitize(root, { IN_PLACE: true });
        expect(evil.getAttribute('onerror') === null, 'detached event handler remains armed');
        expect(root.textContent.includes('OK'), 'benign sibling was removed');
      });
    }
  }

  for (const target of ['href', 'xlink:href']) {
    check(`GHSA-c6gr-qvv4-5v3f: XHTML SVG animation targeting ${target}`, () => {
      const dirty = '<svg xmlns="http://www.w3.org/2000/svg"><a>' +
        `<animate attributeName="${target}" values="x;javascript:alert(1)" dur="0.01s" fill="freeze"/>` +
        '<text>Guide</text></a></svg>';
      const clean = window.DOMPurify(window).sanitize(dirty, {
        PARSER_MEDIA_TYPE: 'application/xhtml+xml',
        ALLOWED_TAGS: ['svg', 'a', 'animate', 'text'],
        ALLOWED_ATTR: ['attributeName', 'values', 'dur', 'fill'],
      });
      const doc = new DOMParser().parseFromString(clean, 'application/xhtml+xml');
      const animation = doc.querySelector('animate');
      expect(doc.querySelector('text')?.textContent === 'Guide', 'benign SVG was removed');
      expect(animation !== null, 'SVG animation positive control is missing');
      expect(animation.getAttribute('attributeName') === null, 'unsafe SMIL target survived');
    });
  }

  return { version: window.DOMPurify?.version, results };
}

test('Chromium verifies the three advisory attack scenarios against the installed bundle', async (t) => {
  const browser = [
    process.env.CHROME_BIN, '/repl/tools/bin/chromium', '/usr/bin/chromium',
    '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
  ].find(path => path && existsSync(path));
  assert.ok(browser, 'Install Chromium or set CHROME_BIN to run the sanitizer browser regressions.');
  const directory = mkdtempSync(join(tmpdir(), 'dompurify-security-'));
  try {
    const harness = join(directory, 'sanitizer.html');
    writeFileSync(harness, '<!doctype html><meta charset="utf-8">' +
      `<script src="${pathToFileURL(bundlePath).href}"></script>` +
      '<body><pre id="sanitizer-results">pending</pre><script>' +
      `document.getElementById('sanitizer-results').textContent = encodeURIComponent(JSON.stringify((${browserRegressions.toString()})()));` +
      '</script></body>');
    const result = spawnSync(browser, [
      '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
      '--disable-background-networking', '--no-first-run',
      `--user-data-dir=${join(directory, 'profile')}`, '--dump-dom',
      pathToFileURL(harness).href,
    ], { encoding: 'utf8', timeout: 30_000, maxBuffer: 2 * 1024 * 1024 });
    assert.equal(result.status, 0, result.error?.message || result.stderr);
    const encoded = result.stdout.match(/<pre id="sanitizer-results">([^<]+)<\/pre>/)?.[1];
    assert.ok(encoded && encoded !== 'pending', 'browser sanitizer regressions did not finish');
    const report = JSON.parse(decodeURIComponent(encoded));
    assert.equal(report.version, installed.version);
    assert.equal(report.results.length, 21);
    for (const result of report.results) {
      await t.test(result.name, () => assert.equal(result.passed, true, result.error));
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
