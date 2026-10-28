# Atelier visual language

The engine implements this style; edit the spec for content and layout.

- Warm ivory canvas `#f7f6f2`, white panels `#ffffff`, subtle dot grid and a restrained outer shadow.
- Rounded modules (10px), groups (14px), and canvas (18px). Borders use muted semantic accents; hovering emphasizes the module.
- Body 13px monospace with local CJK fallbacks; module and page titles use system sans for a quieter hierarchy. No remote fonts or external assets.
- Muted slate blue, forest teal, moss green, ochre and plum encode element kinds and flow meanings. Red indicates failure. Keep legends accurate.
- Orthogonal wires, small moving packets and compact trace rows retain the upstream renderer and export timing.
- Toolbar provides pause/resume and actual-size/fit controls, with keyboard focus indicators and pressed states. It is outside the export canvas and hidden in check/loop modes.
- Reduced motion disables animation; PNG output uses the deterministic check mode. Keep content coordinates compatible with upstream specs.
