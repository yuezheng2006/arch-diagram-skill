# Sequence diagrams: order is data

Use `kind: "sequence"` when the question is who sends what to whom, and in what order. Do not represent a request and a later response with one bidirectional edge; those are two separate messages and may have other events between them.

```json
{
  "kind": "sequence",
  "title": "一次调用",
  "sequence": {
    "participants": [{"id":"client","label":"客户端"},{"id":"api","label":"接口"}],
    "messages": [
      {"id":"request","from":"client","to":"api","type":"call","label":"请求数据"},
      {"id":"response","from":"api","to":"client","type":"return","replyTo":"request","label":"返回数据"}
    ]
  }
}
```

The compiler assigns geometry; do not supply manual nodes/edges. Participant order determines horizontal position. Message array order determines vertical position and packet scheduling, not real timestamps or measured duration.

| Type | HTML | Native Mermaid |
| --- | --- | --- |
| `call` | synchronous call, solid line, filled arrow | `->>` |
| `async` | solid line, open arrow | `-)` |
| `return` | dashed line, filled arrow | `-->>` |

The Mermaid mapping follows its [official sequence syntax](https://mermaid.js.org/syntax/sequenceDiagram.html). The export emits `sequenceDiagram` with participants and ordered messages, instead of dropping point-anchored wires into a flowchart. Mermaid chooses its own visual layout/theme; the important invariants are actor identity, order, type and direction.

## Validation

- 2–8 uniquely identified participants, 1–30 uniquely identified ordered messages.
- Every sender/recipient must name a participant. Self-messages are allowed and render as a loop.
- A return requires `replyTo` pointing to one earlier unanswered call/async message, with sender and recipient exactly reversed. This is a single-response model; streaming/multiple-response protocols need an explicit richer model rather than reusing the same response key.
- `call` is synchronous within this linear, one-control-thread-per-participant model: its sender cannot send another message until the matching return. Nested synchronous work must finish before the outer response. Self-call/self-return is supported. Multiple concurrent threads for one participant need a richer explicit concurrency model, not implicit interleaving.
- Asynchronous sends do not imply that later operations run in parallel, nor that a delivery acknowledgement happened.
- This version models a linear message order. Parallel/alternative/loop fragments, activation bars and user-supplied timestamps are not implemented. Explicit unsupported timing/activation fields fail rather than silently changing meaning. Split a complex protocol into scoped diagrams and explain the omitted control structure.

## Animation

Each message has one packet that is visible only in its assigned window. The packet moves from that message's sender toward its recipient, including reversed responses and self-messages. All messages share a compiled cycle, rounded to a multiple of four seconds; sequence video export captures that entire cycle. Prefer exporting an integer multiple of `sequence.period` from the built HTML (the example is 8s, so its demo video is 16s).

The timing is for teaching. It does not claim latency, blocking duration or concurrency. Reduced motion/PNG retain the complete static sequence.

See `examples/order-sequence.json` for a request, nested call, self-validation, asynchronous event and correlated responses.
