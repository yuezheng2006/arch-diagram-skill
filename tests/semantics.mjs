import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import assert from 'node:assert/strict';
import {findChrome,runChrome,readDiag,fileUrl} from '../skills/motion-map/scripts/lib.mjs';
const dir=mkdtempSync(join(tmpdir(),'motion-semantics-'));
const sequence=JSON.parse(readFileSync('skills/motion-map/examples/order-sequence.json','utf8'));
const dependency=JSON.parse(readFileSync('skills/motion-map/examples/dependency-paths.json','utf8'));
const run=(...args)=>execFileSync(process.execPath,args,{stdio:'pipe'});
function build(name,spec){const json=join(dir,name+'.json'),html=join(dir,name+'.html');writeFileSync(json,JSON.stringify(spec));run('bin/cli.mjs','build',json,html);return html;}
function probe(html,code){writeFileSync(html,readFileSync(html,'utf8').replace('</body>',`<script>(async()=>{try{await new Promise(r=>setTimeout(r,100));${code};document.body.dataset.semanticTest='passed';}catch(e){document.body.dataset.semanticTest=e.message;}})();</script></body>`));const dom=runChrome(findChrome(),['--virtual-time-budget=1500','--dump-dom',fileUrl(html)]);assert(dom.includes('data-semantic-test="passed"'),dom.match(/data-semantic-test="([^"]*)"/)?.[1]);}
try {
 const html=build('sequence',sequence);assert.deepEqual(readDiag(findChrome(),html).issues,[]);
 probe(html,`const svg=document.getElementById('wires');svg.pauseAnimations();const seek=async t=>{svg.setCurrentTime(t);await new Promise(r=>setTimeout(r,25));};
 const lines=[...svg.querySelectorAll('polyline[data-order]')];
 if(lines.map(x=>+x.dataset.order).join(',')!=='1,2,3,4,5,6,7')throw Error('message order');
 if(!lines[4].getAttribute('marker-end').includes('-open'))throw Error('async arrow');
 if(lines[5].getAttribute('stroke-dasharray')!=='5 4'||lines[5].classList.contains('flow'))throw Error('response pattern');
 const packets=[...svg.querySelectorAll('[data-message-packet]')];
 if(packets.length!==7)throw Error('one packet per message');
 const visible=()=>packets.map(x=>+getComputedStyle(x).opacity);
 await seek(.65);if(visible()[0]<.9||visible().slice(1).some(x=>x>.1))throw Error('first message time window '+JSON.stringify(visible()));
 const early=packets[0].getCTM().e;await seek(.85);if(packets[0].getCTM().e<=early)throw Error('request packet reversed');
 await seek(1.5);if(visible()[0]>.1||visible()[1]<.9)throw Error('second message window');
 await seek(4.8);const responseStart=packets[5].getCTM().e;await seek(5.1);if(packets[5].getCTM().e>=responseStart)throw Error('return packet reversed');`);
 const seqMmd=join(dir,'seq.mmd');run('bin/cli.mjs','export',html,seqMmd);const text=readFileSync(seqMmd,'utf8');
 assert(text.startsWith('sequenceDiagram'));assert(text.includes('p2-)p3: 发布 OrderCreated 事件'));assert(text.includes('p2-->>p1: 返回订单编号'));assert(text.indexOf('提交订单')<text.indexOf('创建订单'));
 console.log('✓ sequence order, reversed replies, async markers, self calls and actual SVG packet positions/time windows; sequenceDiagram export');
 const dep=build('dependency',dependency);assert.deepEqual(readDiag(findChrome(),dep).issues,[]);
 probe(dep,`const edges=[...document.querySelectorAll('polyline[data-meaning="dependency"]')];if(edges.length!==3)throw Error('dependency edges');if(edges.some(x=>!x.hasAttribute('marker-end')||x.hasAttribute('marker-start')||x.classList.contains('flow')))throw Error('dependency direction/activity');if(edges[2].getAttribute('stroke-dasharray')!=='5 4')throw Error('indirect must be dashed');if(document.querySelectorAll('#wires animateMotion').length!==2)throw Error('only collaboration animates');`);
 const depMmd=join(dir,'dep.mmd');run('bin/cli.mjs','export',dep,depMmd);assert(readFileSync(depMmd,'utf8').includes('app -.->'));
 console.log('✓ dependency arrows and dashed indirect paths agree in browser/Mermaid; static dependencies do not animate');
 const cases=[
  ['wrong reply endpoint',sequence,s=>s.sequence.messages[5].to='user'],
  ['return before request',sequence,s=>s.sequence.messages.unshift(s.sequence.messages.splice(5,1)[0])],
  ['missing correlation',sequence,s=>delete s.sequence.messages[5].replyTo],
  ['duplicate reply',sequence,s=>s.sequence.messages.push({...s.sequence.messages[5],id:'duplicate'})],
  ['unknown actor',sequence,s=>s.sequence.messages[0].to='ghost'],
  ['fake parallel timing',sequence,s=>s.sequence.messages[0].parallel=true],
  ['silent timestamp',sequence,s=>s.sequence.messages[0].timestamp=123],
  ['nested return before synchronous work completes',sequence,s=>{const x=s.sequence.messages.splice(5,1)[0];s.sequence.messages.splice(3,0,x);}],
  ['sender emits while awaiting synchronous reply',sequence,s=>s.sequence.messages.splice(2,0,{id:'extra',from:'web',to:'queue',type:'async',label:'send while blocked'})],
  ['missing evidence hop',dependency,s=>s.edges.splice(1,1)],
  ['reversed evidence path',dependency,s=>s.edges[2].viaPath.reverse()],
  ['association is not dependency evidence',dependency,s=>{s.edges[1].flow='belongs';}],
  ['inferred edge is not evidence',dependency,s=>s.edges[1].inferred=true],
  ['cyclic evidence',dependency,s=>s.edges[2].viaPath=['app','api','app','database']],
  ['missing convention',dependency,s=>delete s.dependencyConvention],
  ['bidirectional dependency',dependency,s=>s.edges[0].relation='bidirectional'],
  ['duplicate flow',dependency,s=>s.flows.push({...s.flows[0]})],
  ['unknown flow',dependency,s=>s.edges[0].flow='ghost'],
  ['reserved node id',dependency,s=>s.nodes[0].id='spec']
 ];
 for(const [name,base,mutate] of cases){const value=structuredClone(base);mutate(value);const json=join(dir,'invalid.json'),out=join(dir,'kept.html');writeFileSync(json,JSON.stringify(value));writeFileSync(out,'keep');const result=spawnSync(process.execPath,['bin/cli.mjs','build',json,out]);assert.notEqual(result.status,0,name);assert.equal(readFileSync(out,'utf8'),'keep',name);}
 console.log(`✓ ${cases.length} invalid direction/order/correlation/evidence/identity cases rejected before modifying output`);
}finally{rmSync(dir,{recursive:true,force:true});}
