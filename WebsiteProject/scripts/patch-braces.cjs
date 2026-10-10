'use strict';

// Local mitigation for GHSA-vfj7-8cjw-p6xm. There is no patched upstream
// release as of 2026-10-10. Keep the real upstream version for audit visibility.
const fs = require('node:fs');
const path = require('node:path');

const edits = {
  'lib/parse.js': [
    ["if (value === CHAR_LEFT_PARENTHESES) {", "if (value === CHAR_LEFT_PARENTHESES) {\n      if (stack.length >= 128) throw new SyntaxError('braces nesting exceeds safety limit (128)');"],
    ["if (value === CHAR_LEFT_CURLY_BRACE) {", "if (value === CHAR_LEFT_CURLY_BRACE) {\n      if (stack.length >= 128) throw new SyntaxError('braces nesting exceeds safety limit (128)');"],
  ],
  'lib/compile.js': [
    ['const walk = (node, parent = {}) => {', "const walk = (node, parent = {}, depth = 0) => {\n    if (depth > 128) throw new SyntaxError('braces nesting exceeds safety limit (128)');"],
    ['output += walk(child, node);', 'output += walk(child, node, depth + 1);'],
  ],
  'lib/stringify.js': [
    ['const stringify = (node, parent = {}) => {', "const stringify = (node, parent = {}, depth = 0) => {\n    if (depth > 128) throw new SyntaxError('braces nesting exceeds safety limit (128)');"],
    ['output += stringify(child);', 'output += stringify(child, node, depth + 1);'],
  ],
  'lib/expand.js': [
    ["const append = (queue = '', stash = '', enclose = false) => {", "const append = (queue = '', stash = '', enclose = false, depth = 0) => {\n  if (depth > 128) throw new SyntaxError('braces nesting exceeds safety limit (128)');"],
    ['append(value, stash, enclose)', 'append(value, stash, enclose, depth + 1)'],
    ['append(item, ele, enclose)', 'append(item, ele, enclose, depth + 1)'],
    ['const walk = (node, parent = {}) => {', "const walk = (node, parent = {}, depth = 0) => {\n    if (depth > 128) throw new SyntaxError('braces nesting exceeds safety limit (128)');"],
    ['walk(child, node);', 'walk(child, node, depth + 1);'],
  ],
  'lib/utils.js': [
    ['const flat = arr => {', "const flat = (arr, depth = 0) => {\n    if (depth > 128) throw new SyntaxError('braces nesting exceeds safety limit (128)');"],
    ['flat(ele);', 'flat(ele, depth + 1);'],
  ],
};

function patchPackage(directory) {
  const pkg = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
  if (pkg.name !== 'braces') return;
  if (pkg.version !== '3.0.3') {
    throw new Error(`Review the braces security patch for upstream version ${pkg.version}`);
  }
  // Check every source before writing; unknown upstream source must fail the install.
  const files = Object.entries(edits).map(([file, replacements]) => {
    const filename = path.join(directory, file);
    let source = fs.readFileSync(filename, 'utf8');
    for (const [before, after] of replacements) {
      if (source.includes(after)) continue;
      if (source.split(before).length !== 2) {
        throw new Error(`Cannot safely apply braces security patch: ${filename}`);
      }
      source = source.replace(before, after);
    }
    return [filename, source];
  });
  for (const [filename, source] of files) fs.writeFileSync(filename, source);
  console.log(`Applied braces depth guards: ${directory}`);
}

function patchTree(root) {
  const seen = new Set();
  let count = 0;
  function visit(directory) {
    const real = fs.realpathSync(directory);
    if (seen.has(real)) return;
    seen.add(real);
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      const child = path.join(directory, entry.name);
      if (entry.name === 'braces' && fs.existsSync(path.join(child, 'package.json'))) {
        patchPackage(child);
        count++;
      }
      // npm's package scopes and nested node_modules; don't scan package assets.
      if (entry.name.startsWith('@') || entry.name === 'node_modules') visit(child);
      else if (fs.existsSync(path.join(child, 'node_modules'))) visit(path.join(child, 'node_modules'));
    }
  }
  visit(root);
  return count;
}

module.exports = { edits, patchPackage, patchTree };
if (require.main === module) {
  patchTree(path.resolve(process.argv[2] || 'node_modules'));
}
