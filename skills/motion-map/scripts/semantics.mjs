import { resolveMotionEdge } from './relations.mjs';
const owner = anchor => Array.isArray(anchor) ? null : String(anchor ?? '').split(/[.@]/)[0];

export function validateDependencies(spec) {
  const errors = [], flows = new Map((spec.flows || []).map(f => [f.id,f]));
  const edges = (spec.edges || []).map(e => resolveMotionEdge(e, flows.get(e.flow)));
  const deps = edges.filter(e => e.meaning === 'dependency');
  if (deps.length && spec.dependencyConvention !== 'dependent-to-prerequisite') errors.push('dependencies require dependencyConvention: dependent-to-prerequisite');
  const direct = new Set(deps.filter(e => !e.indirect && !e.inferred).map(e => owner(e.from)+'\0'+owner(e.to)));
  for (const e of edges) {
    if (e.indirect != null && typeof e.indirect !== 'boolean') errors.push('indirect must be a boolean');
    if (e.inferred != null && typeof e.inferred !== 'boolean') errors.push('inferred must be a boolean');
    if ((e.indirect || e.viaPath) && e.meaning !== 'dependency') errors.push('indirect / viaPath is only valid for a dependency');
    if (e.meaning !== 'dependency') continue;
    const a=owner(e.from), b=owner(e.to);
    if (!a || !b || a===b) errors.push('dependency endpoints must name distinct entities');
    if (e.arrow !== true) errors.push('a dependency must be directed: dependent → prerequisite');
    if (!e.indirect && e.viaPath) errors.push('viaPath requires indirect: true');
    if (!e.indirect) continue;
    const path=e.viaPath;
    if (!Array.isArray(path) || path.length<3 || path[0]!==a || path.at(-1)!==b || new Set(path).size!==path.length) {errors.push('indirect dependency requires a non-cyclic viaPath from source to target with an intermediate entity');continue;}
    for(let i=1;i<path.length;i++) if(!direct.has(path[i-1]+'\0'+path[i])) errors.push(`indirect dependency has no direct evidence for ${path[i-1]} → ${path[i]}`);
  }
  return errors;
}
