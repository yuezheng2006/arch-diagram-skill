// Shared edge semantics used by the browser renderer, builder and Mermaid exporter.
export const RELATION_TYPES = new Set(['directed', 'bidirectional', 'association']);

export function resolveMotionEdge(edge, flow = {}) {
  const result = { color: flow.color, dash: flow.dash, ...edge };
  const relation = edge.relation ?? flow.relation;
  const meaning = edge.meaning ?? flow.meaning;
  if (meaning != null) result.meaning = meaning;
  if (meaning === 'dependency') { result.packet = false; result.log = false; if (edge.indirect) result.dash = true; }
  if (relation == null) return result; // Preserve legacy arrow / packet fields.
  if (!RELATION_TYPES.has(relation)) throw new Error('unknown relation: ' + String(relation));
  result.relation = relation;
  if (relation === 'directed') result.arrow = true;
  if (relation === 'bidirectional') result.arrow = 'both';
  if (relation === 'association') Object.assign(result, { arrow: false, packet: false, log: false });
  return result;
}
