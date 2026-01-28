/**
 * createInspector.js
 *
 * Generates inspector.json from:
 * - dist/storage.json (storage assets with metadata)
 * - src/config/data.js (game configuration variables)
 * - storage.js (collectStorage function linking data.js to storage)
 *
 * This script replicates the logic from the inspector-generator Tauri app.
 */

const fs = require("fs");
const path = require("path");

// =============================================================================
// FILE PATHS
// =============================================================================

const STORAGE_JSON_PATH = path.resolve(__dirname, "../dist/storage.json");
const DATA_JS_PATH = path.resolve(__dirname, "../src/config/data.js");
const STORAGE_JS_PATH = path.resolve(__dirname, "../storage.js");
const OUTPUT_PATH = path.resolve(__dirname, "../dist/inspector.json");

// =============================================================================
// TYPE DEFINITIONS (as JSDoc comments)
// =============================================================================

/**
 * @typedef {Object} ParsedVariable
 * @property {string} name
 * @property {string|number|boolean} value
 * @property {'string'|'number'|'boolean'} type
 * @property {boolean} [isNull]
 * @property {string} [section]
 * @property {string} [group]
 * @property {string} [controlType]
 * @property {string[]} [dropdownOptions]
 * @property {number} [sliderMin]
 * @property {number} [sliderMax]
 * @property {number} [sliderStep]
 */

/**
 * @typedef {Object} InspectorControl
 * @property {string} id
 * @property {'text'|'slider'|'switch'|'dropdown'|'color_picker'|'asset_upload'|'number'} type
 * @property {string} label
 * @property {string} [description]
 * @property {string} [aiDescription]
 * @property {string|number|boolean} defaultValue
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 * @property {Array<{label: string, value: string|number}>} [options]
 * @property {string} [targetId]
 */

/**
 * @typedef {Object} InspectorPropertyGroup
 * @property {string} group
 * @property {string} description
 * @property {string} aiDescription
 * @property {InspectorControl[]} controls
 */

/**
 * @typedef {Object} InspectorSection
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} aiDescription
 * @property {string} uiIcon
 * @property {InspectorPropertyGroup[]} properties
 */

// =============================================================================
// PARSING FUNCTIONS
// =============================================================================

/**
 * Extracts content between balanced braces starting from a given index.
 * Handles nested braces correctly.
 *
 * @param {string} content - The full file content
 * @param {number} startIndex - Index where the opening brace { starts
 * @returns {string|null} - The content inside the braces (excluding the braces themselves)
 */
function extractBalancedBraces(content, startIndex) {
  if (content[startIndex] !== "{") {
    return null;
  }

  let depth = 0;
  let inString = false;
  let stringChar = "";

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];

    // If we're in a string, handle string content
    if (inString) {
      if (char === "\\" && i + 1 < content.length) {
        // Skip escaped character
        i++;
        continue;
      }
      if (char === stringChar) {
        // End of string
        inString = false;
        stringChar = "";
      }
      continue;
    }

    // Not in a string - check for string start
    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      stringChar = char;
      continue;
    }

    // Handle single-line comments - skip to end of line
    if (char === "/" && i + 1 < content.length && content[i + 1] === "/") {
      // Skip to end of line
      while (i < content.length && content[i] !== "\n") {
        i++;
      }
      continue;
    }

    // Handle multi-line comments
    if (char === "/" && i + 1 < content.length && content[i + 1] === "*") {
      i += 2; // Skip /*
      while (
        i + 1 < content.length &&
        !(content[i] === "*" && content[i + 1] === "/")
      ) {
        i++;
      }
      i++; // Skip the closing */
      continue;
    }

    // Count braces
    if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        // Found the matching closing brace
        // Return content between the braces (excluding braces themselves)
        return content.substring(startIndex + 1, i);
      }
    }
  }

  return null; // Unbalanced braces
}

/**
 * Parses a JavaScript file content that contains a data object with primitive properties
 * Supports markdown-style comment organization:
 * - // # SectionName - Creates a new section (H1)
 * - // ## GroupName - Creates a new group within the current section (H2)
 *
 * @param {string} content - The JS file content
 * @returns {ParsedVariable[]}
 */
function parseJsFile(content) {
  const variables = [];
  let objectContent = null;

  // Pattern 1: Look for `const defaults = { ... }` using balanced braces
  // This is more robust than regex for nested objects
  const defaultsMatch = content.match(/const\s+defaults\s*=\s*\{/);
  if (defaultsMatch) {
    const startIndex = defaultsMatch.index + defaultsMatch[0].length - 1;
    objectContent = extractBalancedBraces(content, startIndex);
  }

  // Pattern 2: Fallback to regex if balanced braces failed
  if (!objectContent) {
    const objectMatch = content.match(
      /(?:const|let|var)\s+\w+\s*=\s*(?:window\.\w+\s*\?\?\s*)?\{([\s\S]*?)\};?\s*(?:export|$)/,
    );
    if (objectMatch) {
      objectContent = objectMatch[1];
    }
  }

  if (!objectContent) {
    return variables;
  }

  const lines = objectContent.split("\n");

  // Track current section and group from comments
  let currentSection = undefined;
  let currentGroup = undefined;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      continue;
    }

    // Check for markdown-style section: // # SectionName
    const sectionMatch = trimmed.match(/^\/\/\s*#\s+(.+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      currentGroup = undefined; // Reset group when section changes
      continue;
    }

    // Check for markdown-style group: // ## GroupName
    const groupMatch = trimmed.match(/^\/\/\s*##\s+(.+)$/);
    if (groupMatch) {
      currentGroup = groupMatch[1].trim();
      continue;
    }

    // Skip other comment-only lines
    if (trimmed.startsWith("//") || trimmed.startsWith("/*")) {
      continue;
    }

    // Match property: value pattern (capture trailing comment too)
    const propertyMatch = trimmed.match(/^(\w+)\s*:\s*(.+?)\s*,?\s*(\/\/.*)?$/);

    if (propertyMatch) {
      const name = propertyMatch[1];
      let rawValue = propertyMatch[2].trim();
      const inlineComment = propertyMatch[3] || "";

      // Remove trailing comma if present
      if (rawValue.endsWith(",")) {
        rawValue = rawValue.slice(0, -1).trim();
      }

      const parsed = parseValue(rawValue);
      if (parsed !== null) {
        const variable = {
          name,
          value: parsed.value,
          type: parsed.type,
          isNull: parsed.isNull,
          section: currentSection,
          group: currentGroup,
        };

        // Parse inline annotations from comment
        parseInlineAnnotations(inlineComment, variable);

        variables.push(variable);
      }
    }
  }

  return variables;
}

/**
 * Parse inline annotations from trailing comments
 * Supports:
 * - @dropdown: opt1, opt2, opt3
 * - @slider: min, max, step
 * - @text, @number, @color (type overrides)
 *
 * @param {string} comment
 * @param {ParsedVariable} variable
 */
function parseInlineAnnotations(comment, variable) {
  if (!comment) return;

  // Check for @dropdown: option1, option2, option3
  const dropdownMatch = comment.match(/@dropdown:\s*([^@]+)/i);
  if (dropdownMatch) {
    variable.controlType = "dropdown";
    variable.dropdownOptions = dropdownMatch[1]
      .split(",")
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);
    return;
  }

  // Check for @slider: min, max, step
  const sliderMatch = comment.match(
    /@slider:\s*([\d.\-]+)\s*,\s*([\d.\-]+)\s*(?:,\s*([\d.\-]+))?/i,
  );
  if (sliderMatch) {
    variable.controlType = "slider";
    variable.sliderMin = parseFloat(sliderMatch[1]);
    variable.sliderMax = parseFloat(sliderMatch[2]);
    if (sliderMatch[3]) {
      variable.sliderStep = parseFloat(sliderMatch[3]);
    }
    return;
  }

  // Check for simple type overrides
  if (/@text\b/i.test(comment)) {
    variable.controlType = "text";
    return;
  }
  if (/@number\b/i.test(comment)) {
    variable.controlType = "number";
    return;
  }
  if (/@color\b/i.test(comment)) {
    variable.controlType = "color_picker";
    return;
  }
  if (/@switch\b/i.test(comment)) {
    variable.controlType = "switch";
    return;
  }
  if (/@asset\b/i.test(comment)) {
    variable.controlType = "asset_upload";
    return;
  }
}

/**
 * Parse a raw value string into typed value
 *
 * @param {string} rawValue
 * @returns {{value: string|number|boolean, type: 'string'|'number'|'boolean', isNull?: boolean}|null}
 */
function parseValue(rawValue) {
  // Remove inline comments
  let value = rawValue
    .replace(/\/\/.*$/, "")
    .replace(/\/\*.*?\*\//g, "")
    .trim();

  // Remove trailing comma
  if (value.endsWith(",")) {
    value = value.slice(0, -1).trim();
  }

  // null/undefined values - return with isNull flag
  if (value === "null" || value === "undefined") {
    return { value: "", type: "string", isNull: true };
  }

  // Boolean
  if (value === "true") {
    return { value: true, type: "boolean" };
  }
  if (value === "false") {
    return { value: false, type: "boolean" };
  }

  // Hex color number (0xRRGGBB)
  if (/^0x[0-9a-fA-F]+$/.test(value)) {
    const num = parseInt(value, 16);
    return { value: num, type: "number" };
  }

  // Regular number
  if (/^-?\d+\.?\d*$/.test(value)) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return { value: num, type: "number" };
    }
  }

  // String (double quotes)
  if (value.startsWith('"') && value.endsWith('"')) {
    return { value: value.slice(1, -1), type: "string" };
  }

  // String (single quotes)
  if (value.startsWith("'") && value.endsWith("'")) {
    return { value: value.slice(1, -1), type: "string" };
  }

  // Template literals without expressions
  if (value.startsWith("`") && value.endsWith("`") && !value.includes("${")) {
    return { value: value.slice(1, -1), type: "string" };
  }

  return null;
}

/**
 * Infers the best control type based on variable name and value
 *
 * Rules:
 * - asset_upload: ONLY when value is null (not name-based)
 * - color_picker: ONLY by value format (hex/rgb) not name
 * - switch: boolean values
 * - slider: numbers with specific name patterns
 * - number: other numbers
 * - text: strings
 *
 * @param {ParsedVariable} variable
 * @returns {string}
 */
function inferControlType(variable) {
  const name = variable.name.toLowerCase();

  // null/undefined values -> asset upload (value-based only)
  if (variable.isNull) {
    return "asset_upload";
  }

  // Color detection - ONLY by value format, not name
  // Supports: "#RRGGBB", "RRGGBB", 0xRRGGBB, "rgb(...)", "rgba(...)"
  if (variable.type === "number") {
    // Check if it's a hex color number (0x000000 to 0xFFFFFF range)
    const numValue = variable.value;
    if (numValue >= 0 && numValue <= 0xffffff) {
      // Could be a color, but we need more context
      // Check if it looks like a color value (has typical color range)
      const hexStr = numValue.toString(16).padStart(6, "0");
      // If it's a valid 6-digit hex, treat as color
      if (/^[0-9a-f]{6}$/i.test(hexStr)) {
        // Additional heuristic: if name contains color-related terms, it's definitely a color
        if (
          name.includes("color") ||
          name.includes("colour") ||
          name.includes("tint") ||
          name.includes("bg") ||
          name.includes("stroke")
        ) {
          return "color_picker";
        }
      }
    }
  }
  if (variable.type === "string") {
    const strValue = variable.value;
    // "#RRGGBB" or "#RGB" format
    if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(strValue)) {
      return "color_picker";
    }
    // "RRGGBB" format (6 hex digits without #)
    if (/^[0-9a-f]{6}$/i.test(strValue)) {
      return "color_picker";
    }
    // "rgb(...)" or "rgba(...)" format
    if (/^rgba?\s*\(/i.test(strValue)) {
      return "color_picker";
    }
  }

  // Boolean -> switch
  if (variable.type === "boolean") {
    return "switch";
  }

  // Number patterns -> slider or number
  if (variable.type === "number") {
    // Check for common slider patterns
    if (
      name.includes("opacity") ||
      name.includes("alpha") ||
      name.includes("scale") ||
      name.includes("speed") ||
      name.includes("size") ||
      name.includes("radius") ||
      name.includes("offset") ||
      name.includes("duration") ||
      name.includes("delay") ||
      name.includes("intensity") ||
      name.includes("volume") ||
      name.includes("multiplier") ||
      name.includes("thickness") ||
      name.includes("position") ||
      name.includes("pos")
    ) {
      return "slider";
    }
    return "number";
  }

  // Default to text for strings
  return "text";
}

/**
 * Infers slider min/max/step based on variable name and value
 *
 * @param {ParsedVariable} variable
 * @returns {{min: number, max: number, step: number}}
 */
function inferSliderParams(variable) {
  const name = variable.name.toLowerCase();
  const value = variable.value;

  // Opacity/Alpha: 0-1
  if (name.includes("opacity") || name.includes("alpha")) {
    return { min: Math.min(0, value), max: 1, step: 0.01 };
  }

  // Volume: 0-1
  if (name.includes("volume")) {
    return { min: Math.min(0, value), max: 1, step: 0.01 };
  }

  // UV positions: 0-1
  if (
    name.includes("positionx") ||
    name.includes("positiony") ||
    (name.includes("pos") && (name.endsWith("x") || name.endsWith("y")))
  ) {
    if (value >= 0 && value <= 1) {
      return { min: 0, max: 1, step: 0.01 };
    }
  }

  // Scale: typically 0-5 or based on current value
  if (name.includes("scale")) {
    return { min: Math.min(0, value), max: Math.max(5, value * 3), step: 0.01 };
  }

  // Duration/Delay: seconds
  if (
    name.includes("duration") ||
    name.includes("delay") ||
    name.includes("interval")
  ) {
    if (value > 100) {
      // Likely milliseconds
      return {
        min: Math.min(0, value),
        max: Math.max(5000, value * 2),
        step: 0.01,
      };
    }
    // Likely seconds
    return {
      min: Math.min(0, value),
      max: Math.max(10, value * 3),
      step: 0.01,
    };
  }

  // Thickness
  if (name.includes("thickness")) {
    return {
      min: Math.min(0, value),
      max: Math.max(20, value * 2),
      step: 0.01,
    };
  }

  // Intensity
  if (name.includes("intensity")) {
    return {
      min: Math.min(0, value),
      max: Math.max(10, value * 2),
      step: 0.01,
    };
  }

  // Angles (theta, phi, rotation)
  if (
    name.includes("theta") ||
    name.includes("phi") ||
    name.includes("rot") ||
    name.includes("angle")
  ) {
    return { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 };
  }

  // FOV
  if (name.includes("fov")) {
    return { min: Math.min(20, value), max: 120, step: 0.01 };
  }

  // Generic number based on current value
  if (value === 0) {
    return { min: -100, max: 100, step: 0.01 };
  }

  const absValue = Math.abs(value);
  if (absValue <= 1) {
    return { min: Math.min(-2, value), max: Math.max(2, value), step: 0.01 };
  }
  if (absValue < 10) {
    return {
      min: Math.min(-absValue * 3, value),
      max: Math.max(absValue * 3, value),
      step: 0.01,
    };
  }

  return {
    min: Math.min(-absValue * 2, value),
    max: Math.max(absValue * 2, value),
    step: 0.01,
  };
}

/**
 * Converts a camelCase or snake_case name to a human-readable label
 *
 * @param {string} name
 * @returns {string}
 */
function nameToLabel(name) {
  return (
    name
      // Insert space before capitals
      .replace(/([A-Z])/g, " $1")
      // Replace underscores with spaces
      .replace(/_/g, " ")
      // Capitalize first letter
      .replace(/^./, (s) => s.toUpperCase())
      .trim()
  );
}

/**
 * Returns an appropriate Font Awesome icon name based on section name keywords
 *
 * @param {string} name
 * @returns {string}
 */
function getIconForSection(name) {
  const nameLower = name.toLowerCase();

  // Special case: Endcard section uses a computer screen icon
  if (nameLower.includes("endcard")) return "FaDoorOpen";

  // Special case: Badge section uses a badge/certificate icon
  if (nameLower.includes("badge")) return "FaCertificate";

  // Camera / View related
  if (nameLower.includes("camera") || nameLower.includes("cam"))
    return "FaCamera";
  if (nameLower.includes("view") || nameLower.includes("viewport"))
    return "FaEye";

  // UI / Interface
  if (
    nameLower.includes("ui") ||
    nameLower.includes("interface") ||
    nameLower.includes("hud")
  )
    return "FaDisplay";
  if (nameLower.includes("menu") || nameLower.includes("navigation"))
    return "FaBars";
  if (nameLower.includes("button") || nameLower.includes("btn"))
    return "FaSquare";
  if (
    nameLower.includes("text") ||
    nameLower.includes("label") ||
    nameLower.includes("font")
  )
    return "FaFont";
  if (nameLower.includes("icon")) return "FaIcons";
  if (
    nameLower.includes("popup") ||
    nameLower.includes("modal") ||
    nameLower.includes("dialog")
  )
    return "FaWindowRestore";
  if (nameLower.includes("banner") || nameLower.includes("header"))
    return "FaRectangleAd";

  // Audio / Sound
  if (
    nameLower.includes("audio") ||
    nameLower.includes("sound") ||
    nameLower.includes("sfx")
  )
    return "FaVolumeHigh";
  if (nameLower.includes("music") || nameLower.includes("bgm"))
    return "FaMusic";
  if (nameLower.includes("voice")) return "FaMicrophone";

  // Light / Visual Effects
  if (nameLower.includes("light") || nameLower.includes("lighting"))
    return "FaLightbulb";
  if (nameLower.includes("shadow")) return "FaMoon";
  if (nameLower.includes("fog") || nameLower.includes("mist")) return "FaSmog";
  if (
    nameLower.includes("particle") ||
    nameLower.includes("effect") ||
    nameLower.includes("vfx") ||
    nameLower.includes("fx")
  )
    return "FaWandMagicSparkles";
  if (nameLower.includes("glow") || nameLower.includes("bloom"))
    return "FaStar";

  // Character / Player / NPC
  if (nameLower.includes("character") || nameLower.includes("player"))
    return "FaUser";
  if (
    nameLower.includes("enemy") ||
    nameLower.includes("npc") ||
    nameLower.includes("ai")
  )
    return "FaRobot";
  if (nameLower.includes("avatar")) return "FaUserAstronaut";
  if (nameLower.includes("hero")) return "FaMask";

  // Game / Gameplay
  if (nameLower.includes("game") || nameLower.includes("gameplay"))
    return "FaGamepad";
  if (nameLower.includes("level") || nameLower.includes("stage"))
    return "FaLayerGroup";
  if (nameLower.includes("score") || nameLower.includes("point"))
    return "FaTrophy";
  if (
    nameLower.includes("timer") ||
    nameLower.includes("time") ||
    nameLower.includes("clock")
  )
    return "FaClock";
  if (nameLower.includes("difficulty")) return "FaGauge";
  if (nameLower.includes("spawn")) return "FaBurst";

  // Settings / Config
  if (
    nameLower.includes("setting") ||
    nameLower.includes("config") ||
    nameLower.includes("option")
  )
    return "FaGear";
  if (
    nameLower.includes("general") ||
    nameLower.includes("main") ||
    nameLower.includes("global")
  )
    return "FaSliders";
  if (nameLower.includes("debug") || nameLower.includes("dev")) return "FaBug";

  // Market / Shop
  if (
    nameLower.includes("market") ||
    nameLower.includes("shop") ||
    nameLower.includes("store")
  )
    return "FaCartShopping";

  // Weapons
  if (
    nameLower.includes("weapon") ||
    nameLower.includes("sword") ||
    nameLower.includes("gun") ||
    nameLower.includes("rifle") ||
    nameLower.includes("pistol")
  )
    return "FaCrosshairs";

  // Towers / Buildings / Structures
  if (
    nameLower.includes("tower") ||
    nameLower.includes("building") ||
    nameLower.includes("castle") ||
    nameLower.includes("structure") ||
    nameLower.includes("base")
  )
    return "FaChessRook";

  // Projectiles
  if (
    nameLower.includes("projectile") ||
    nameLower.includes("bullet") ||
    nameLower.includes("arrow") ||
    nameLower.includes("missile")
  )
    return "FaLocationArrow";

  // Obstacles / Traps / Hazards
  if (
    nameLower.includes("obstacle") ||
    nameLower.includes("trap") ||
    nameLower.includes("hazard") ||
    nameLower.includes("barrier")
  )
    return "FaTriangleExclamation";

  // Powerups / Items / Collectibles
  if (
    nameLower.includes("powerup") ||
    nameLower.includes("item") ||
    nameLower.includes("collectible") ||
    nameLower.includes("pickup") ||
    nameLower.includes("loot")
  )
    return "FaGem";

  // Environment / Terrain / World
  if (
    nameLower.includes("environment") ||
    nameLower.includes("terrain") ||
    nameLower.includes("map") ||
    nameLower.includes("world") ||
    nameLower.includes("landscape")
  )
    return "FaEarthAmericas";

  // Vehicles
  if (
    nameLower.includes("vehicle") ||
    nameLower.includes("car") ||
    nameLower.includes("ship") ||
    nameLower.includes("plane") ||
    nameLower.includes("rocket")
  )
    return "FaCar";

  // Default fallback
  return "FaGear";
}

/**
 * Generates a smart description for a section based on its name
 *
 * @param {string} name
 * @returns {string}
 */
function generateSectionDescription(name) {
  const nameLower = name.toLowerCase();

  // Camera related
  if (nameLower.includes("camera"))
    return `Camera positioning, angles, and view settings`;
  if (nameLower.includes("view"))
    return `Viewport and visual perspective controls`;

  // UI related
  if (nameLower.includes("ui") || nameLower.includes("interface"))
    return `User interface elements and display settings`;

  // Audio
  if (nameLower.includes("audio") || nameLower.includes("sound"))
    return `Sound effects and audio playback settings`;

  // Lighting & Effects
  if (nameLower.includes("light"))
    return `Scene lighting and illumination controls`;

  // Characters
  if (nameLower.includes("character") || nameLower.includes("player"))
    return `Player character attributes and behavior`;

  // Gameplay
  if (nameLower.includes("game")) return `Core gameplay mechanics and rules`;

  // Settings
  if (nameLower.includes("setting") || nameLower.includes("config"))
    return `Configuration options and preferences`;

  // Default
  return `${name} configuration and settings`;
}

/**
 * Generates a smart AI description for a section
 *
 * @param {string} name
 * @returns {string}
 */
function generateSectionAiDescription(name) {
  const nameLower = name.toLowerCase();

  if (nameLower.includes("camera"))
    return `Camera controls including position offsets (X, Y, Z), zoom levels, field of view, and look-at targets. Adjust these to frame the game scene properly.`;
  if (nameLower.includes("ui") || nameLower.includes("interface"))
    return `User interface configuration including element positioning, sizing, colors, and visibility toggles for on-screen elements.`;
  if (nameLower.includes("audio") || nameLower.includes("sound"))
    return `Audio settings controlling sound effect volumes, playback options, and audio triggers throughout the experience.`;
  if (nameLower.includes("light"))
    return `Lighting parameters controlling scene illumination, including colors, intensities, positions, and shadow casting properties.`;

  return `Configuration controls for ${name.toLowerCase()}. Modify these values to customize the ${name.toLowerCase()} behavior and appearance.`;
}

/**
 * Generates a smart description for a property group
 *
 * @param {string} groupName
 * @param {string} sectionName
 * @returns {string}
 */
function generateGroupDescription(groupName, sectionName) {
  const nameLower = groupName.toLowerCase();
  const sectionLower = sectionName.toLowerCase();

  if (nameLower.includes("position") || nameLower.includes("offset"))
    return `Spatial positioning controls for ${sectionLower}`;
  if (nameLower.includes("scale") || nameLower.includes("size"))
    return `Sizing and scale adjustments`;
  if (nameLower.includes("color") || nameLower.includes("tint"))
    return `Color and tinting options`;
  if (nameLower.includes("animation")) return `Animation timing and playback`;
  if (nameLower.includes("text") || nameLower.includes("content"))
    return `Text content and messaging`;

  return `${groupName} properties for ${sectionLower}`;
}

/**
 * Generates a smart AI description for a property group
 *
 * @param {string} groupName
 * @param {string} sectionName
 * @returns {string}
 */
function generateGroupAiDescription(groupName, sectionName) {
  const nameLower = groupName.toLowerCase();
  const sectionLower = sectionName.toLowerCase();

  if (nameLower.includes("position") || nameLower.includes("offset"))
    return `XYZ coordinate values that determine the placement of ${sectionLower} elements in 3D or 2D space.`;
  if (nameLower.includes("scale") || nameLower.includes("size"))
    return `Scale multipliers and size values. Use uniform values for proportional scaling or different XYZ values for stretching.`;
  if (nameLower.includes("color") || nameLower.includes("tint"))
    return `Color values in hex format. Modify these to change the visual appearance and theming.`;

  return `Controls for ${groupName.toLowerCase()} within ${sectionLower}. Adjust these parameters to customize behavior.`;
}

/**
 * Generates a smart description for a control based on its name and type
 *
 * @param {string} name
 * @param {string} controlType
 * @param {string} label
 * @returns {string}
 */
function generateControlDescription(name, controlType, label) {
  const nameLower = name.toLowerCase();
  const labelLower = label.toLowerCase();

  // Type-specific prefixes
  let action = "Controls";
  if (controlType === "switch") action = "Enables/disables";
  if (controlType === "slider") action = "Adjusts";
  if (controlType === "color_picker") action = "Sets the color for";
  if (controlType === "dropdown") action = "Selects";
  if (controlType === "asset_upload") action = "Asset reference for";

  // Specific patterns
  if (nameLower.includes("enabled") || nameLower.includes("active"))
    return `${action} whether ${labelLower
      .replace("enabled", "")
      .replace("active", "")
      .trim()} is active`;
  if (nameLower.includes("visible") || nameLower.includes("show"))
    return `${action} visibility of ${labelLower
      .replace("visible", "")
      .replace("show", "")
      .trim()}`;
  if (nameLower.includes("speed")) return `${action} the movement speed`;
  if (nameLower.includes("scale")) return `${action} the size multiplier`;
  if (nameLower.includes("opacity") || nameLower.includes("alpha"))
    return `${action} the transparency level`;
  if (nameLower.includes("duration"))
    return `${action} how long the effect lasts`;
  if (nameLower.includes("delay"))
    return `${action} the wait time before action`;
  if (nameLower.includes("offset")) return `${action} the position offset`;
  if (nameLower.endsWith("x")) return `${action} the X-axis value`;
  if (nameLower.endsWith("y")) return `${action} the Y-axis value`;
  if (nameLower.endsWith("z")) return `${action} the Z-axis value`;

  // Default based on type
  if (controlType === "switch") return `Toggle switch for ${labelLower}`;
  if (controlType === "slider") return `Slider to adjust ${labelLower}`;
  if (controlType === "color_picker") return `Color picker for ${labelLower}`;
  if (controlType === "dropdown") return `Selection menu for ${labelLower}`;
  if (controlType === "asset_upload") return `Asset file for ${labelLower}`;

  return `${action} the ${labelLower}`;
}

// =============================================================================
// STORAGE ASSETS INTEGRATION
// =============================================================================

/**
 * Parses storage.js to extract the collectStorage function mappings
 * Returns a map of data.js property name -> storage path (e.g., "bgmSrc" -> "bgms.items.default")
 *
 * @param {string} content
 * @returns {Map<string, {storagePath: string, storageCategory: string, itemKey: string}>}
 */
function parseCollectStorageFunction(content) {
  const mappings = new Map();

  // Match lines like: data.bgmSrc = storage.bgms.items.default.src;
  const regex = /data\.(\w+)\s*=\s*storage\.(\w+)\.items\.(\w+)(?:\.src)?;?/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const dataPropertyName = match[1];
    const storageCategory = match[2];
    const itemKey = match[3];

    mappings.set(dataPropertyName, {
      storagePath: `${storageCategory}.items.${itemKey}`,
      storageCategory,
      itemKey,
    });
  }

  return mappings;
}

/**
 * Creates an "Assets" section from storage.json with proper controls
 *
 * @param {Object} storageJson
 * @param {Map<string, Object>} storageToDataMappings - reverse of collectStorage mappings
 * @returns {InspectorSection}
 */
function createAssetsSection(storageJson, storageToDataMappings) {
  const properties = [];

  for (const [categoryKey, category] of Object.entries(storageJson)) {
    if (!category.items) continue;

    const groupControls = [];

    for (const [itemKey, item] of Object.entries(category.items)) {
      const targetId = storageToDataMappings.get(
        `${categoryKey}.items.${itemKey}`,
      );

      const control = {
        id: `storage.${categoryKey}.${itemKey}`,
        type: "asset_upload",
        label: item.label || nameToLabel(itemKey),
        description: item.description || `Asset for ${nameToLabel(itemKey)}`,
        aiDescription: "ai description",
        defaultValue: item.src || "",
      };

      // If we have a mapping to a data.js property, add targetId
      if (targetId) {
        control.targetId = targetId;
      }

      groupControls.push(control);
    }

    if (groupControls.length > 0) {
      properties.push({
        group: category.label || nameToLabel(categoryKey),
        description:
          category.description || `${nameToLabel(categoryKey)} assets`,
        aiDescription: "ai description",
        controls: groupControls,
      });
    }
  }

  return {
    id: "assets",
    title: "Assets",
    description: "Asset management for images, audio, fonts, and 3D models",
    aiDescription: "ai description",
    uiIcon: "FaBoxArchive",
    properties,
  };
}

// =============================================================================
// MAIN CONVERSION FUNCTIONS
// =============================================================================

/**
 * Groups variables into property groups based on:
 * 1. Comment-based @section/@group annotations (priority)
 * 2. Smart prefix detection (fallback)
 *
 * @param {ParsedVariable[]} variables
 * @returns {Map<string, Map<string, ParsedVariable[]>>}
 */
function groupVariables(variables) {
  // Section -> Group -> Variables
  const sections = new Map();

  for (const variable of variables) {
    // Use comment-based section/group labels (// # Section, // ## Group)
    const sectionName = variable.section || "General";
    const groupName = variable.group || "General";

    if (!sections.has(sectionName)) {
      sections.set(sectionName, new Map());
    }

    const sectionGroups = sections.get(sectionName);
    if (!sectionGroups.has(groupName)) {
      sectionGroups.set(groupName, []);
    }

    sectionGroups.get(groupName).push(variable);
  }

  return sections;
}

/**
 * Converts parsed variables into inspector config sections
 *
 * @param {ParsedVariable[]} variables
 * @param {Map<string, Object>} storageMappings - property name -> storage info
 * @param {Object|null} storageJson - parsed storage.json with base64 assets
 * @returns {InspectorSection[]}
 */
function variablesToInspectorConfig(variables, storageMappings, storageJson) {
  const sectionGroups = groupVariables(variables);
  const sections = [];

  for (const [sectionName, groups] of sectionGroups) {
    const properties = [];

    for (const [groupName, vars] of groups) {
      const controls = vars.map((v) => {
        // Use annotated controlType if provided, otherwise infer
        const controlType = v.controlType ?? inferControlType(v);
        const label = nameToLabel(v.name);
        // Determine defaultValue - check if we have a storage mapping with actual asset data
        let defaultValue = v.value;
        if (storageMappings.has(v.name) && storageJson) {
          const storageInfo = storageMappings.get(v.name);
          // Look up the actual src value from storage.json
          const category = storageJson[storageInfo.storageCategory];
          if (
            category &&
            category.items &&
            category.items[storageInfo.itemKey]
          ) {
            const assetSrc = category.items[storageInfo.itemKey].src;
            if (assetSrc) {
              defaultValue = assetSrc;
            }
          }
        }

        // Convert color_picker defaultValue from number to hex string
        let finalDefaultValue = defaultValue;
        if (
          controlType === "color_picker" &&
          typeof defaultValue === "number"
        ) {
          finalDefaultValue = "#" + defaultValue.toString(16).padStart(6, "0");
        }

        const control = {
          id: v.name,
          type: controlType,
          label: label,
          description: generateControlDescription(v.name, controlType, label),
          aiDescription: "ai description",
          defaultValue: finalDefaultValue,
        };

        // Add dropdown options if provided
        if (controlType === "dropdown" && v.dropdownOptions) {
          control.options = v.dropdownOptions.map((opt) => ({
            label: opt, // Preserve original casing
            value: opt,
          }));
        }

        // Add slider params - use annotations if provided, otherwise infer
        if (controlType === "slider") {
          let min, max, step;

          if (v.sliderMin !== undefined && v.sliderMax !== undefined) {
            min = v.sliderMin;
            max = v.sliderMax;
            step = v.sliderStep ?? 1;
          } else if (v.type === "number") {
            const params = inferSliderParams(v);
            min = params.min;
            max = params.max;
            step = params.step;
          }

          if (min !== undefined) control.min = parseFloat(min.toFixed(2));
          if (max !== undefined) control.max = parseFloat(max.toFixed(2));
          if (step !== undefined) control.step = step;
        }

        // Check if this property has a storage mapping (for asset_upload controls)
        if (storageMappings.has(v.name)) {
          const storageInfo = storageMappings.get(v.name);
          // For asset_upload: id is the storage path, targetId is the data.js variable
          control.targetId = v.name;
          control.id = `storage.${storageInfo.storageCategory}.${storageInfo.itemKey}`;
        }

        return control;
      });

      properties.push({
        group: groupName,
        description: generateGroupDescription(groupName, sectionName),
        aiDescription: "ai description",
        controls,
      });
    }

    sections.push({
      id: sectionName.toLowerCase().replace(/\s+/g, "_"),
      title: sectionName,
      description: generateSectionDescription(sectionName),
      aiDescription: " ",
      uiIcon: getIconForSection(sectionName),
      properties,
    });
  }

  return sections;
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

function main() {
  console.log("Creating inspector.json...\n");

  // Check if required files exist
  if (!fs.existsSync(DATA_JS_PATH)) {
    console.error(`Error: data.js not found at ${DATA_JS_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(STORAGE_JS_PATH)) {
    console.error(`Error: storage.js not found at ${STORAGE_JS_PATH}`);
    process.exit(1);
  }

  // Read files
  const dataJsContent = fs.readFileSync(DATA_JS_PATH, "utf-8");
  const storageJsContent = fs.readFileSync(STORAGE_JS_PATH, "utf-8");

  // Parse data.js variables
  console.log("Parsing data.js...");
  const variables = parseJsFile(dataJsContent);
  console.log(`  Found ${variables.length} variables\n`);

  // Parse collectStorage mappings
  console.log("Parsing storage.js collectStorage function...");
  const storageMappings = parseCollectStorageFunction(storageJsContent);
  console.log(`  Found ${storageMappings.size} storage mappings\n`);

  // Create reverse mapping for assets section
  const reverseStorageMappings = new Map();
  for (const [dataProperty, storageInfo] of storageMappings) {
    reverseStorageMappings.set(
      `${storageInfo.storageCategory}.items.${storageInfo.itemKey}`,
      dataProperty,
    );
  }

  // Load storage.json if it exists (for populating defaultValues with base64 assets)
  let storageJson = null;
  if (fs.existsSync(STORAGE_JSON_PATH)) {
    storageJson = JSON.parse(fs.readFileSync(STORAGE_JSON_PATH, "utf-8"));
    console.log("Loaded storage.json for asset default values\n");
  }

  // Convert to inspector config
  console.log("Generating inspector sections...");
  const inspectorSections = variablesToInspectorConfig(
    variables,
    storageMappings,
    storageJson,
  );
  console.log(`  Created ${inspectorSections.length} sections\n`);

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write inspector.json
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(inspectorSections, null, 2));

  console.log(`Successfully created inspector.json at ${OUTPUT_PATH}`);
  console.log(`\nSummary:`);
  console.log(`  - ${variables.length} variables parsed`);
  console.log(`  - ${inspectorSections.length} sections created`);

  let totalControls = 0;
  for (const section of inspectorSections) {
    for (const group of section.properties) {
      totalControls += group.controls.length;
    }
  }
  console.log(`  - ${totalControls} total controls generated`);
}

main();
