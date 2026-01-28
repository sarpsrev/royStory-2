/**
 * fillAiDescriptions.js
 *
 * Fills AI descriptions in inspector.json using Gemini API.
 * This script reads the existing inspector.json, sends it to Gemini,
 * and updates the aiDescription fields with AI-generated content.
 *
 * Usage: node scripts/fillAiDescriptions.js
 * Requires: GEMINI_API_KEY in .env file or as environment variable
 */

const fs = require("fs");
const path = require("path");

// =============================================================================
// CONFIGURATION
// =============================================================================

const INSPECTOR_JSON_PATH = path.resolve(__dirname, "../dist/inspector.json");
const ENV_PATH = path.resolve(__dirname, "../.env");
const GEMINI_MODEL = "gemini-2.0-flash";

// =============================================================================
// LOAD .ENV FILE (simple implementation without external dependencies)
// =============================================================================

function loadEnvFile() {
  if (fs.existsSync(ENV_PATH)) {
    const envContent = fs.readFileSync(ENV_PATH, "utf-8");
    const lines = envContent.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eqIndex = trimmed.indexOf("=");
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        let value = trimmed.substring(eqIndex + 1).trim();
        // Remove surrounding quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        // Only set if not already defined in environment
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
    console.log("Loaded environment variables from .env file\n");
  }
}

// Load .env file before anything else
loadEnvFile();

// =============================================================================
// GEMINI API FUNCTIONS
// =============================================================================

/**
 * Generates AI descriptions for the inspector config using Gemini API
 * Uses TOON format for 30-60% token reduction
 *
 * @param {Object[]} config - The inspector configuration
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<Record<string, string>>} - Map of IDs to descriptions
 */
async function generateAiDescriptions(config, apiKey) {
  // Import TOON encoder dynamically (ES module)
  const { encode } = await import("@toon-format/toon");

  // 1. Minimize config to reduce token usage
  const minimalConfig = config.map((section) => ({
    id: section.id,
    title: section.title,
    properties: section.properties.map((group, gIndex) => ({
      // Use a composite key for groups since they don't have IDs
      _key: `group_${section.id}_${gIndex}`,
      group: group.group,
      controls: group.controls.map((control) => ({
        id: control.id,
        label: control.label,
        type: control.type,
        options: control.options?.map((o) => o.label).join(", "),
      })),
    })),
  }));

  // 2. Encode to TOON format (30-60% fewer tokens than JSON)
  const toonData = encode(minimalConfig);

  // 3. Construct Prompt with TOON format explanation
  const prompt = `You are an AI assistant for a game inspector tool. Your task is to generate "AI Descriptions" for the following game configuration.

The input data is in TOON format (Token-Oriented Object Notation) - a compact tabular format where:
- Array headers like "controls[N]{id,label,type}" declare N items with those fields
- Values follow on subsequent lines, comma-separated
- Nested objects use indentation

The descriptions should be concise, helpful, and explain what the control likely does based on its ID, label, and context.
Return ONLY a JSON object where the keys are the IDs (or _key for groups) and the values are the generated descriptions.
Do not include any other text.

Example Output:
{
  "camera": "Settings related to camera behavior and positioning.",
  "group_camera_0": "Coordinates defining the camera's location.",
  "camX": "Controls the horizontal position of the camera."
}

Input Configuration (TOON format):
${toonData}
`;

  // 3. Call Gemini API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  console.log("  Sending request to Gemini API...");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2, // Low temperature for deterministic results
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.message ||
        `API request failed with status ${response.status}`,
    );
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(text);
}

/**
 * Applies AI descriptions to the inspector config
 *
 * @param {Object[]} config - The inspector configuration
 * @param {Record<string, string>} descriptions - Map of IDs to descriptions
 * @returns {number} - Number of descriptions applied
 */
function applyDescriptions(config, descriptions) {
  let updateCount = 0;

  config.forEach((section) => {
    // Section aiDescription
    if (descriptions[section.id]) {
      section.aiDescription = descriptions[section.id];
      updateCount++;
    }

    section.properties.forEach((group, gIndex) => {
      // Group aiDescription
      const groupKey = `group_${section.id}_${gIndex}`;
      if (descriptions[groupKey]) {
        group.aiDescription = descriptions[groupKey];
        updateCount++;
      }

      // Control aiDescriptions
      group.controls.forEach((control) => {
        if (descriptions[control.id]) {
          control.aiDescription = descriptions[control.id];
          updateCount++;
        }
      });
    });
  });

  return updateCount;
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log("Filling AI Descriptions...\n");

  // Check for API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY environment variable is not set.");
    console.error("\nTo use this script, set your Gemini API key:");
    console.error('  Windows (PowerShell): $env:GEMINI_API_KEY="your-api-key"');
    console.error("  Windows (CMD): set GEMINI_API_KEY=your-api-key");
    console.error("  Linux/Mac: export GEMINI_API_KEY=your-api-key");
    console.error("\nOr pass it inline:");
    console.error(
      "  GEMINI_API_KEY=your-api-key node scripts/fillAiDescriptions.js",
    );
    process.exit(1);
  }

  // Check if inspector.json exists
  if (!fs.existsSync(INSPECTOR_JSON_PATH)) {
    console.error(`Error: inspector.json not found at ${INSPECTOR_JSON_PATH}`);
    console.error(
      "Please run 'npm run build' first to generate inspector.json",
    );
    process.exit(1);
  }

  // Read inspector.json
  console.log("Reading inspector.json...");
  const config = JSON.parse(fs.readFileSync(INSPECTOR_JSON_PATH, "utf-8"));

  // Count items
  let totalSections = config.length;
  let totalGroups = 0;
  let totalControls = 0;
  config.forEach((section) => {
    section.properties.forEach((group) => {
      totalGroups++;
      totalControls += group.controls.length;
    });
  });
  console.log(
    `  Found ${totalSections} sections, ${totalGroups} groups, ${totalControls} controls\n`,
  );

  // Generate descriptions
  console.log("Generating AI descriptions with Gemini...");
  try {
    const descriptions = await generateAiDescriptions(config, apiKey);
    const descriptionCount = Object.keys(descriptions).length;
    console.log(`  Received ${descriptionCount} descriptions from AI\n`);

    // Apply descriptions
    console.log("Applying descriptions to config...");
    const updateCount = applyDescriptions(config, descriptions);
    console.log(`  Updated ${updateCount} items\n`);

    // Write updated config
    fs.writeFileSync(INSPECTOR_JSON_PATH, JSON.stringify(config, null, 2));
    console.log(`Successfully updated inspector.json with AI descriptions!`);
    console.log(`  Location: ${INSPECTOR_JSON_PATH}`);
  } catch (error) {
    console.error("\nError generating AI descriptions:", error.message);
    process.exit(1);
  }
}

main();
