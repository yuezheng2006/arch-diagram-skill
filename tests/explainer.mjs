import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
import { findChrome, runChrome, readDiag, fileUrl } from '../skills/motion-map/scripts/lib.mjs';
const dir = mkdtempSync(join(tmpdir(),'atelier-explainer-'));
try {
  const spec = JSON.parse(readFileSync('skills/motion-map/examples/dsh-explainer.json','utf8'));
  delete spec.theme;
  const json = join(dir,'spec.json'), html = join(dir,'diagram.html');
  writeFileSync(json,JSON.stringify(spec));
  execFileSync(process.execPath,['bin/cli.mjs','build',json,html]);
  assert.equal(readDiag(findChrome(),html).issues.length,0);
  const probe = `<script>try {
    const svg = document.getElementById('wires');
    const panel = document.querySelector('.group');
    const card = document.querySelector('.box');
    if (!(+getComputedStyle(panel).zIndex < +getComputedStyle(svg).zIndex && +getComputedStyle(svg).zIndex < +getComputedStyle(card).zIndex)) throw Error('wires obscured');
    if (document.querySelectorAll('.panel-step').length !== 6) throw Error('panel hierarchy');
    if (!document.querySelector('.shape-person .node-icon svg') || !document.querySelector('.shape-stack') || !document.querySelector('.shape-hub')) throw Error('illustrated primitives');
    if (getComputedStyle(document.querySelector('#watchdog')).borderTopStyle !== 'dashed') throw Error('design boundary lost');
    if (document.documentElement.dataset.theme !== 'sketch') throw Error('default theme');
    if (document.documentElement.scrollWidth > innerWidth) throw Error('page overflow');
    document.body.dataset.explainerTest='passed';
  } catch(e) { document.body.dataset.explainerTest=e.message; }</script>`;
  writeFileSync(html,readFileSync(html,'utf8').replace('</body>',probe+'</body>'));
  for (const width of [390,1440]) {
    const dom=runChrome(findChrome(),[`--window-size=${width},1000`,'--dump-dom',fileUrl(html)]);
    assert(dom.includes('data-explainer-test="passed"'),dom.match(/data-explainer-test="([^"]*)"/)?.[1]);
    console.log(`✓ explainer wire painting order, six panels, shape primitives, dashed boundary and narrow layout (${width}px)`);
  }
  spec.groups[0].step='<img src=x onerror="alert(1)">';
  spec.nodes[0].icon='<img src=x onerror="alert(1)">';
  spec.nodes[0].shape='person" onclick="alert(1)';
  writeFileSync(json,JSON.stringify(spec));
  execFileSync(process.execPath,['bin/cli.mjs','build',json,html]);
  const dom=runChrome(findChrome(),['--dump-dom',fileUrl(html)]).replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/<pre id="__diag"[\s\S]*?<\/pre>/,'');
  assert(!dom.includes('<img'));
  assert(!dom.includes('onclick='));
  console.log('✓ badges escape markup; icon and shape names cannot inject elements or handlers');
} finally { rmSync(dir,{recursive:true,force:true}); }
