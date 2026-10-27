// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const helper = fileURLToPath(new URL('../verify-live-page.sh', import.meta.url));
const base = 'https://example.test';
const marker = 'build-regression-test';

function verify({
  path = '/canceled',
  guide = false,
  buildMarker = marker,
  redirectStatus = '303',
  target = `${base}/book-direct?canceled=1`,
  documentStatus = '200',
  body = `<!doctype html><!-- ${marker} -->`,
  failure = '',
} = {}) {
  // Every curl call is replaced with this local fixture. Never execute deploy.sh:
  // its build/upload/secret/alert operations must not run during these tests.
  const script = String.raw`
    source "$1"
    base="$2"; path="$3"; marker="$4"; guide="$5"
    redirect_status="$6"; fixture_target="$7"; document_status="$8"
    document_body="$9"; failure="${'$'}{10}"
    calls=$(mktemp)
    trap 'rm -f "$calls"' EXIT
    curl() {
      local url="${'$'}{!#}"
      printf '%s\n' "$url" >> "$calls"
      if [[ "$url" == "$base/canceled" || "$url" == "$base/canceled.html" ]]; then
        [[ "$failure" == "redirect" ]] && return 28
        printf '%s\n%s' "$redirect_status" "$fixture_target"
      else
        [[ "$failure" == "document" ]] && return 28
        printf '%s\n%s' "$document_body" "$document_status"
      fi
    }
    if verify_live_page "$base" "$path" "$marker" "$guide"; then status=0; else status=$?; fi
    printf '%s\n' "$LIVE_VERIFY_ERROR"
    cat "$calls"
    exit "$status"
  `;
  const result = spawnSync('bash', ['-c', script, 'verification-test',
    helper, base, path, buildMarker, guide ? '1' : '0',
    redirectStatus, target, documentStatus, body, failure,
  ], { encoding: 'utf8', timeout: 5000 });
  if (result.error) throw result.error;
  const [error, ...calls] = result.stdout.trimEnd().split('\n');
  return { status: result.status, error, calls };
}

describe('read-only deployment verification', () => {
  it.each(['/canceled', '/canceled.html'])(
    'accepts the bodyless %s redirect only after verifying its destination build',
    path => {
      const result = verify({ path });
      expect(result.status).toBe(0);
      expect(result.calls).toEqual([`${base}${path}`, `${base}/book-direct?canceled=1`]);
    },
  );

  it('accepts additional query fields on the correct cancellation destination', () => {
    const target = `${base}/book-direct?currency=EUR&canceled=1&ref=retained`;
    expect(verify({ target }).calls).toEqual([`${base}/canceled`, target]);
  });

  it.each(['200', '301', '302', '500'])('rejects HTTP %s instead of the expected redirect', redirectStatus => {
    const result = verify({ redirectStatus });
    expect(result.status).toBe(1);
    expect(result.error).toContain('expected cancellation redirect HTTP 303');
    expect(result.calls).toHaveLength(1);
  });

  it.each([
    `${base}/`,
    `${base}/book-direct`,
    `${base}/book-direct?canceled=0`,
    `${base}/book-direct?canceled=0&canceled=1`,
    `${base}/book-direct?canceled=&canceled=1`,
    `${base}/book-direct?uncanceled=1`,
    'https://other.example/book-direct?canceled=1',
    'https://access.example/login?canceled=1',
  ])('does not follow an unexpected redirect to %s', target => {
    const result = verify({ target });
    expect(result.status).toBe(1);
    expect(result.error).toContain('unexpected destination or state');
    expect(result.calls).toEqual([`${base}/canceled`]);
  });

  it('still rejects a stale redirect destination', () => {
    const result = verify({ body: '<!doctype html><!-- old-build -->' });
    expect(result.status).toBe(1);
    expect(result.error).toContain('build marker is missing');
  });

  it.each(['302', '404', '500'])('rejects destination HTTP %s even with a fresh marker', documentStatus => {
    expect(verify({ documentStatus }).status).toBe(1);
  });

  it('keeps guide checks on bare URLs', () => {
    const result = verify({ path: '/getting-to-ponta-do-ouro', guide: true });
    expect(result.status).toBe(0);
    expect(result.calls).toEqual([`${base}/getting-to-ponta-do-ouro`]);
  });

  it('rejects old standalone guides even if they contain the current marker', () => {
    const result = verify({
      path: '/getting-to-ponta-do-ouro', guide: true,
      body: `<script src="/js/shared-nav.js"></script><!-- ${marker} -->`,
    });
    expect(result.status).toBe(1);
    expect(result.error).toContain('old standalone guide HTML');
  });

  it('retains cache-busting for ordinary HTML pages', () => {
    const result = verify({ path: '/book-direct' });
    expect(result.status).toBe(0);
    expect(result.calls).toHaveLength(1);
    const url = new URL(result.calls[0]);
    expect(url.pathname).toBe('/book-direct');
    expect(url.searchParams.has('smoke')).toBe(true);
  });

  it.each(['redirect', 'document'])('fails explicitly on a %s network error', failure => {
    const result = verify({ failure });
    expect(result.status).toBe(1);
    expect(result.error).toContain('request failed');
  });

  it('never treats an empty marker as a successful verification', () => {
    const result = verify({ buildMarker: '' });
    expect(result.status).toBe(1);
    expect(result.error).toContain('verification inputs');
    expect(result.calls).toEqual([]);
  });
});
