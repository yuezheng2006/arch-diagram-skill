// Canonical ordered messages are compiled to coordinates, never inferred from layout.
export function compileSequence(input) {
  if(input.kind!=='sequence') return input;
  const seq=input.sequence, actors=seq?.participants, messages=seq?.messages;
  if(!Array.isArray(actors)||actors.length<2||actors.length>8)throw Error('sequence requires 2–8 participants');
  if(!Array.isArray(messages)||!messages.length||messages.length>30)throw Error('sequence requires 1–30 ordered messages');
  if(input.nodes?.length||input.edges?.length)throw Error('sequence generates nodes/edges; do not mix manual geometry with ordered messages');
  if (seq.fragments || seq.parallel || seq.activations) throw Error('sequence currently supports ordered messages, not control fragments or activation bars');
  const ids=new Set(), previous=new Map(), replied=new Set(), waiting=new Map();
  for(const a of actors){if(!/^[A-Za-z][\w-]*$/.test(a.id)||ids.has(a.id))throw Error('sequence participant ids must be unique identifiers');ids.add(a.id);}
  for(const m of messages){
    if (['at','time','timestamp','duration','parallel','activate','deactivate'].some(k => m[k] != null)) throw Error('sequence uses ordinal order; timestamps, parallel fragments and activations are not supported');
    if(!/^[A-Za-z][\w-]*$/.test(m.id)||previous.has(m.id))throw Error('sequence message ids must be unique identifiers');
    if(!ids.has(m.from)||!ids.has(m.to))throw Error(`unknown sequence participant in ${m.id}`);
    if(!['call','async','return'].includes(m.type)||(typeof m.label !== 'string' || !m.label.trim()))throw Error('sequence messages need type call/async/return and a label');
    let request;
    if(m.type==='return'){
      request=previous.get(m.replyTo);
      if(!request||request.type==='return'||request.from!==m.to||request.to!==m.from||replied.has(m.replyTo))throw Error(`return ${m.id} must reverse exactly one earlier unanswered request named by replyTo`);
    }else if(m.replyTo!=null)throw Error('replyTo is only valid on return messages');
    const pending=waiting.get(m.from);
    if(pending && !(m.type==='return' && m.from===m.to && pending===m.replyTo)) throw Error(`participant ${m.from} still awaits synchronous call ${pending}; use a separate concurrent model rather than implicit parallelism`);
    if(m.type==='return'){ replied.add(m.replyTo); if(request.type==='call') waiting.delete(request.from); }
    else if(m.type==='call') waiting.set(m.from,m.id);
    previous.set(m.id,m);
  }
  const width=Math.max(900,actors.length*270+80), startY=280, gap=78;
  const endY=startY+messages.length*gap+20, period=Math.ceil((messages.length*.85+1)/4)*4;
  const positions=new Map(actors.map((a,i)=>[a.id,160+i*(width-320)/(actors.length-1)]));
  const nodes=actors.map(a=>({id:a.id,x:positions.get(a.id)-90,y:180,w:180,h:58,title:a.label||a.id,color:'blue'}));
  const edges=actors.map(a=>({from:[positions.get(a.id),250],to:[positions.get(a.id),endY],relation:'association',dash:true,color:'faint',lifeline:true}));
  messages.forEach((m,i)=>{
    const x=positions.get(m.from),z=positions.get(m.to),y=startY+i*gap,self=x===z;
    edges.push({id:m.id,from:[x,y],to:[z,y+(self?24:0)],...(self?{via:[[x+85,y],[x+85,y+24]]}:{}),label:`${i+1}. ${m.label}`,labelPos:[self?x+145:(x+z)/2,y-12],relation:'directed',dash:m.type==='return',arrowStyle:m.type==='async'?'open':'filled',color:m.type==='return'?'green':m.type==='async'?'purple':'blue',timeline:{at:(i+.5)*.85,duration:.5,period},log:false,messageType:m.type,order:i+1});
  });
  return {...input,layout:undefined,presentation:false,width,nodes,edges,wireLegend:false,sequence:{...seq,period},notes:[...(input.notes||[]),{id:'sequence-reading-rule',x:24,y:endY+24,w:width-48,text:'从上到下是消息顺序，不代表真实耗时。实线实心箭头＝同步调用；实线开放箭头＝异步发送；虚线箭头＝响应，replyTo 指向原请求。',align:'left'},{id:'sequence-motion-rule',x:24,y:endY+54,w:width-48,text:`光点按消息顺序演示，每 ${period} 秒循环。异步发送表示发送者无需等待，不等于后续步骤必然并行。`,align:'left'}]};
}
export function sequenceMermaid(spec) {
  const seq=spec.sequence, actors=seq.participants, ids=new Map(actors.map((a,i)=>[a.id,'p'+i]));
  const safe=t=>String(t).replace(/[\r\n]/g,' ').replace(/;/g,'#59;').replace(/[<>]/g,c=>c==='<'?'#60;':'#62;');
  const lines=['sequenceDiagram','  autonumber'];
  for(const a of actors)lines.push(`  participant ${ids.get(a.id)} as ${safe(a.label||a.id)}`);
  for(const m of seq.messages)lines.push(`  ${ids.get(m.from)}${m.type==='return'?'-->>':m.type==='async'?'-)':'->>'}${ids.get(m.to)}: ${safe(m.label)}`);
  return lines.join('\n')+'\n';
}
