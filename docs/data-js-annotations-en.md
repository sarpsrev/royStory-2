# Data.js Annotations Guide

This guide explains how to structure your `data.js` file for optimal inspector.json generation.

## Section & Group Labels

Use markdown-style comments to organize variables into sections and groups:

```javascript
const data = window.gameData ?? {
  // # Section Name
  // ## Group Name
  variableName: value,

  // ## Another Group
  anotherVariable: value,

  // # Another Section
  // ## Its Group
  moreVariables: value,
};
```

### Example

```javascript
const data = window.gameData ?? {
  // # Camera
  // ## Position
  camPosX: 0,
  camPosY: 5,
  camPosZ: 10,

  // ## Zoom
  camFov: 65,
  camRadius: 10,

  // # Audio
  // ## Background Music
  bgmVolume: 0.5,
  bgmSrc: null,
};
```

---

## Control Type Annotations

Override automatically inferred control types using inline annotations:

| Annotation                   | Control Type  | Example                                          |
| ---------------------------- | ------------- | ------------------------------------------------ |
| `@slider: min, max, step`    | Slider        | `speed: 1.0, // @slider: 0, 10, 0.1`             |
| `@dropdown: opt1, opt2, ...` | Dropdown      | `mode: "easy", // @dropdown: easy, medium, hard` |
| `@text`                      | Text input    | `value: 123, // @text`                           |
| `@number`                    | Number input  | `count: "5", // @number`                         |
| `@color`                     | Color picker  | `tint: 0xff0000, // @color`                      |
| `@switch`                    | Toggle switch | `count: 1, // @switch`                           |
| `@asset`                     | Asset upload  | `data: "", // @asset`                            |

### Example

```javascript
const data = window.gameData ?? {
  // # Game Settings
  // ## Difficulty
  difficulty: "normal", // @dropdown: easy, normal, hard, extreme
  gameSpeed: 1.0, // @slider: 0.5, 2.0, 0.1

  // ## Visual
  backgroundColor: 0x1a1a2e, // @color
  debugMode: false, // (auto-detected as switch)
};
```

---

## Auto-Detection Rules

When no annotation is provided, control types are inferred automatically:

| Value/Pattern                                   | Inferred Type  |
| ----------------------------------------------- | -------------- |
| null                                            | `asset_upload` |
| true / false                                    | `switch`       |
| "#RRGGBB" or 0xRRGGBB                           | `color_picker` |
| Number + name has "opacity/scale/volume/pos..." | `slider`       |
| Other numbers                                   | `number`       |
| Strings                                         | `text`         |

### Slider Auto-Params

For sliders, min/max/step are inferred from the variable name:

| Name Pattern               | Range               |
| -------------------------- | ------------------- |
| `opacity`, `alpha`         | 0 → 1, step 0.01    |
| `volume`                   | 0 → 1, step 0.05    |
| `scale`                    | 0 → 5, step 0.05    |
| `fov`                      | 20 → 120, step 1    |
| `theta`, `phi`, `rotation` | -2π → 2π, step 0.01 |

---

## Quick Reference

```javascript
const data = window.gameData ?? {
  // # Section Name          ← Creates a new section
  // ## Group Name           ← Creates a new group within section

  // Auto-detected types
  enabled: true, // → switch
  logoSrc: null, // → asset_upload
  bgColor: "#ffffff", // → color_picker
  opacity: 0.8, // → slider (0-1)
  count: 5, // → number
  title: "Hello", // → text

  // Manual overrides
  mode: "a", // @dropdown: a, b, c
  speed: 1, // @slider: 0, 10, 0.5
};

export default data;
```
