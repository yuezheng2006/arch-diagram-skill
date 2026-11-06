# Relationship maps

Start with entity → predicate → entity triples. A predicate should explain why the line exists; "related to" is often too vague. Distinguish relationship type from visual color and from node category.

```json
{
  "kind": "relations",
  "title": "读者如何协作",
  "lang": "zh-CN",
  "flows": [
    {"id": "belongs", "label": "成员关系", "color": "blue", "dash": true, "relation": "association"},
    {"id": "talks", "label": "讨论", "color": "green", "relation": "bidirectional"},
    {"id": "creates", "label": "产出", "color": "purple", "relation": "directed"}
  ],
  "nodes": [
    {"id": "host", "x": 40, "y": 180, "w": 220, "title": "主持人"},
    {"id": "readers", "x": 450, "y": 180, "w": 220, "title": "读者"}
  ],
  "edges": [
    {"from": "host.r", "to": "readers.l", "flow": "talks", "label": "组织与反馈"}
  ]
}
```

Use `examples/reading-club.json` for a richer fictional scenario showing all three types. Names and roles there are teaching devices, not claims about real people.

## Direction decisions

- "A belongs to B": usually an undirected association in a relationship map, with the predicate clarifying membership. A taxonomy may choose an explicit directed parent relation; explain that convention.
- "A depends on B": choose an arrow convention and say it in the legend (e.g. dependent → prerequisite). Do not reverse it later to shorten a path.
- "A causes B": requires causal evidence. If sources only show co-occurrence, use association and label it accordingly.
- "A exchanges feedback with B": bidirectional. If each direction carries a different meaning, draw two separately labeled directed edges instead.

`relation` may be set on an edge or inherited from its flow; an edge override wins. `association` always disables arrowheads, packets, marching dashes and arrival logging. It stays static in MP4/GIF too. `bidirectional` produces two arrowheads and two packet streams; disabling `packet` stops those streams. Unknown types fail the build before output is written.

Do not require every line to animate. For a conceptual dependency that does not imply activity, use a directed arrow with `packet: false` and a solid line. Specify what the animation represents in the caption.
