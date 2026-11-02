#!/usr/bin/env node
// usage: node build.mjs <spec.json> <out.html> [--theme NAME]
// Inlines the engine, the stylesheet and the spec into one self-contained HTML file.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [specPath, outPath, ...args] = process.argv.slice(2);
const themes = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'themes.json'), 'utf8'));
const themeAt = args.indexOf('--theme');
const themeOverride = themeAt >= 0 ? args[themeAt + 1] : null;
if (!specPath || !outPath) {
  console.error('usage: node build.mjs <spec.json> <out.html> [--theme NAME]');
  process.exit(2);
}
const assets = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const read = f => readFileSync(join(assets, f), 'utf8');

let spec;
try {
  spec = JSON.parse(readFileSync(specPath, 'utf8'));
} catch (e) {
  console.error(`spec is not valid JSON: ${e.message}`);
  process.exit(1);
}

if (themeAt >= 0 && !themeOverride) { console.error('--theme needs a name'); process.exit(2); }
if (themeOverride) spec.theme = themeOverride;
if (spec.theme && !Object.hasOwn(themes, spec.theme)) { console.error('unknown theme: ' + spec.theme); process.exit(2); }

// cheap structural checks; layout problems are caught later by check.mjs
const errs = [];
const ids = new Set();
const seen = id => { if (ids.has(id)) errs.push(`duplicate id "${id}"`); ids.add(id); };
for (const n of spec.nodes || []) {
  if (!n.id) errs.push(`node without id: ${JSON.stringify(n).slice(0, 60)}`); else seen(n.id);
  if (n.x == null || n.y == null || n.w == null) errs.push(`node "${n.id}" needs x, y and w`);
  for (const r of n.rows || []) if (r.id) seen(r.id);
}
for (const g of spec.groups || []) if (g.id) seen(g.id);
for (const n of spec.notes || []) if (n.id) seen(n.id);
for (const [i, e] of (spec.edges || []).entries()) {
  for (const end of [e.from, e.to]) {
    if (Array.isArray(end)) continue;
    const id = String(end ?? '').split(/[.@]/)[0];
    if (!ids.has(id)) errs.push(`edge #${i}: unknown anchor "${end}"`);
  }
}
if (errs.length) {
  console.error(errs.map(e => '✗ ' + e).join('\n'));
  process.exit(1);
}

const plain = s => String(s || '').replace(/\{\w+:([^{}]*)\}/g, '$1');
const escHtml = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const fill = {
  __LANG__: escHtml(spec.lang || 'zh-CN'),
  __TITLE__: escHtml(spec.pageTitle || plain(spec.title) || 'Architecture'),
  __CSS__: read('style.css'),
  __THEMES__: JSON.stringify(themes).replace(/</g, '\\u003c'),
  // keep "</script>" inside strings from closing the tag early
  __SPEC__: JSON.stringify(spec, null, 1).replace(/</g, '\\u003c'),
  __ENGINE__: read('engine.js'),
};
const html = read('template.html').replace(/__LANG__|__TITLE__|__CSS__|__SPEC__|__THEMES__|__ENGINE__/g, k => fill[k]);
mkdirSync(dirname(resolve(outPath)), { recursive: true });
writeFileSync(outPath, html);
console.log(`✓ built ${outPath} (${(html.length / 1024).toFixed(1)} KB, ${(spec.nodes || []).length} nodes, ${(spec.edges || []).length} edges)`);
