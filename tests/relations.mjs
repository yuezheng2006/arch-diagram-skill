import { mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { findChrome, runChrome, fileUrl } from '../skills/motion-map/scripts/lib.mjs';
const dir=mkdtempSync(join(tmpdir(),'motion-map-relations-'));
const run=(...args)=>execFileSync(process.execPath,args,{stdio:'pipe'});
try {
  const spec={lang:'en',kind:'relations',width:800,title:'Relationship semantics',flows:[
    {id:'one',label:'Influence',color:'purple',relation:'directed'},
    {id:'both',label:'Collaboration',color:'green',relation:'bidirectional'},
    {id:'link',label:'Association',color:'blue',relation:'association',dash:true}
  ],nodes:[],edges:[]};
  for (let i=0;i<4;i++) {
    spec.nodes.push({id:'a'+i,x:40,y:170+i*140,w:220,title:'Source '+i},{id:'b'+i,x:540,y:170+i*140,w:220,title:'Target '+i});
    spec.edges.push({from:'a'+i+'.r',to:'b'+i+'.l',flow:['one','both','link','link'][i],label:'predicate '+i,...(i===3?{relation:'directed',arrow:false}:{})});
  }
  const json=join(dir,'spec.json'),html=join(dir,'map.html'),mmd=join(dir,'map.mmd');
  writeFileSync(json,JSON.stringify(spec));
  run('bin/cli.mjs','build',json,html);
  const probe=`<script>try {
    const lines=[...document.querySelectorAll('#wires polyline')];
    if (!lines[0].hasAttribute('marker-end') || lines[0].hasAttribute('marker-start')) throw Error('directed');
    if (!lines[1].hasAttribute('marker-start') || !lines[1].hasAttribute('marker-end')) throw Error('bidirectional');
    if (lines[2].hasAttribute('marker-start') || lines[2].hasAttribute('marker-end') || lines[2].classList.contains('flow')) throw Error('association direction/motion');
    if (lines[3].dataset.relation!=='directed' || !lines[3].hasAttribute('marker-end')) throw Error('edge override');
    if(document.querySelectorAll('#wires animateMotion').length!==4) throw Error('packet direction count');
    document.body.dataset.relationsTest='passed';
  }catch(e){document.body.dataset.relationsTest=e.message;}</script>`;
  writeFileSync(html,readFileSync(html,'utf8').replace('</body>',probe+'</body>'));
  const dom=runChrome(findChrome(),['--dump-dom',fileUrl(html)]);
  assert(dom.includes('data-relations-test="passed"'),dom.match(/data-relations-test="([^"]*)"/)?.[1]);
  run('bin/cli.mjs','export',html,mmd);
  const text=readFileSync(mmd,'utf8');
  assert(text.includes('a0 -->')); assert(text.includes('a1 <-->')); assert(text.includes('a2 -.-')); assert(text.includes('a3 -.->'));
  console.log('✓ browser and Mermaid preserve single/double/no direction; association has no motion; edge override wins');
  const onlyAssociation={...spec,edges:[spec.edges[2]],log:{live:true}};
  writeFileSync(json,JSON.stringify(onlyAssociation));run('bin/cli.mjs','build',json,html);
  const staticDom=runChrome(findChrome(),['--virtual-time-budget=3000','--dump-dom',fileUrl(html)]);
  assert(!staticDom.includes('<animateMotion'));assert(!staticDom.includes('class="row new"'));
  console.log('✓ an association-only map has no packet animations or arrival records');
  spec.edges[0].relation='not-real';writeFileSync(json,JSON.stringify(spec));
  const before=readFileSync(html,'utf8');const bad=spawnSync(process.execPath,['bin/cli.mjs','build',json,html]);
  assert.equal(bad.status,1);assert.equal(readFileSync(html,'utf8'),before);
  console.log('✓ invalid relation fails before overwriting output');
  const install=join(dir,'skills');mkdirSync(join(install,'arch-diagram'),{recursive:true});writeFileSync(join(install,'arch-diagram','keep.txt'),'legacy');
  run('bin/cli.mjs','install','--dir',install);
  const skill=join(install,'motion-map');assert(existsSync(join(skill,'SKILL.md')));assert(existsSync(join(skill,'LICENSE')));
  const installedHtml=join(dir,'installed.html');
  run(join(skill,'scripts','build.mjs'),'skills/motion-map/examples/reading-club.json',installedHtml);
  run(join(skill,'scripts','export.mjs'),installedHtml,join(dir,'installed.mmd'));
  run('bin/cli.mjs','uninstall','--dir',install);
  assert(!existsSync(skill));assert.equal(readFileSync(join(install,'arch-diagram','keep.txt'),'utf8'),'legacy');
  console.log('✓ motion-map installs/builds/exports/uninstalls independently and preserves the legacy skill');
} finally {rmSync(dir,{recursive:true,force:true});}
