# Atelier visual language

The engine implements this style; edit the spec for content and layout.

- Warm ivory canvas `#f7f6f2`, white panels `#ffffff`, subtle dot grid and a restrained outer shadow.
- Rounded modules (10px), groups (14px), and canvas (18px). Borders use muted semantic accents; hovering emphasizes the module.
- Body 13px monospace with local CJK fallbacks; module and page titles use system sans for a quieter hierarchy. No remote fonts or external assets.
- Muted slate blue, forest teal, moss green, ochre and plum encode element kinds and flow meanings. Red indicates failure. Keep legends accurate.
- Orthogonal wires, small moving packets and compact trace rows retain the upstream renderer and export timing.
- Toolbar provides pause/resume and actual-size/fit controls, with keyboard focus indicators and pressed states. It is outside the export canvas and hidden in check/loop modes.
- Reduced motion disables animation; PNG output uses the deterministic check mode. Keep content coordinates compatible with upstream specs.

## Presentation composition

The optional `presentation` mode adapts the layout/style separation, numbered process and short labels from baoyu-infographic's `linear-progression` and `technical-schematic` references. It uses a warm paper palette and terracotta step markers, without claiming the hand-drawn Morandi style. This remains a repo-native HTML/SVG renderer, not an AI-generated raster image.

Use one prominent headline, two clearly labeled phases for this six-step demo, short left-aligned explanations, and section frames to establish containment. Keep the animated trace subordinate to the main story. Compact repository maps retain the existing default metrics.

Design reference: [baoyu-skills / baoyu-infographic](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-infographic).

## Four theme presets

- Paper: cream canvas, warm white cards, forest teal and terracotta markers.
- Porcelain: cool white canvas, slate blue accents and compact 8px corners.
- Blueprint: navy canvas, light semantic lines and precise 3px corners.
- Graphite: charcoal canvas, muted warm accents and soft 14px corners.

All themes keep semantic color roles and geometry. `assets/themes.json` is the shared token source for browser and export. Set `theme` in the spec or use `--theme` at build/export.
