import type { Theme } from "./ThemeContext";

export const BRAND_COLORS = {
  stories: "#156644", // Stories Green, sampled directly from the client's logo (public/stories-logo.png)
  accent: "#d9b382", // warm tan — Stories secondary accent, sparing UI use only
} as const;

// Dark-mode brand green — the light value (#156644) is a deep, low-chroma
// green that fails WCAG AA against the dark page surfaces; this is the same
// OKLCH hue (160.1°) lightened+boosted to L=0.74/C×1.15, which clears 6.80:1
// against --color-surface-2 (#1c2a23) and 8.10:1 against page-bg (#0f1a16).
// accent is unchanged — already 9.09:1 against the dark page background, no
// dark variant needed.
export const DARK_BRAND_COLORS = {
  stories: "#68c093",
  accent: "#d9b382",
} as const;

export const COMPETITOR_COLORS: Record<string, string> = {
  "Espresso Lab": "#66c4dd", // Sky Aqua
  "Dunkin Donuts": "#2b96af", // Deep Turquoise
  "Joe & the Juice": "#ea5c3f", // Burnt Coral
  Starbucks: "#f7b759", // Sunset Gold
};

export const SEMANTIC_COLORS = {
  overpriced: "#dc2626", // red-600 — icon/text only, never a filled brand-style chip
  underpriced: "#7c3aed", // violet-600 — icon/text only, never a filled brand-style chip
} as const;

// Dark-mode semantic colors — red-600/violet-600 clear only ~3:1 against the
// dark surfaces (below the 4.5:1 text floor); Tailwind's red-400/violet-400
// clear 5.4:1 / 5.5:1 against --color-surface-2 (#1c2a23), same hue family.
export const DARK_SEMANTIC_COLORS = {
  overpriced: "#f87171",
  underpriced: "#a78bfa",
} as const;

// Neutral fallback for any brand not present in CHART_COLORS below.
export const CONTEXT_COLOR = "#94a3b8"; // slate-400
export const DARK_CONTEXT_COLOR = "#7c9187"; // clears 5.3:1 against the dark page background

// Chart-series colors for competitors, used where each competitor
// needs to be individually distinguishable (e.g. the Price Positioning Map).
// The literal brand secondary palette (COMPETITOR_COLORS above) fails
// accessibility validation as a categorical series set — validated with the
// dataviz skill's validate_palette.js: two pairs were indistinguishable even
// to normal color vision.
//
// IMPORTANT: none of these may be a red or violet hue — SEMANTIC_COLORS
// above uses red = overpriced / violet = underpriced elsewhere on the same
// page (heatmap, Category Positioning), and an earlier version picked a red
// and a purple here, so "red" meant two contradictory things depending on
// which chart you were looking at. Stories itself never appears here; it always renders
// as BRAND_COLORS.stories so it reads as "us" regardless of chart.
export const CHART_COLORS: Record<string, string> = {
  "Espresso Lab": "#0d8fae",
  "Dunkin Donuts": "#2b5aa8",
  "Joe & the Juice": "#c2477a",
  Starbucks: "#5a7a0f",
  "Socrate (Beirut)": "#8b5a2b",
  "Ana Beirut": "#d4a574",
  "abdel Wahab": "#c78d3b",
  "Diwan Beirut": "#a67c52",
  Pinkberry: "#00897b",
  Cremino: "#795548",
  "Fro - U": "#ff9800",
  "Pain d'Or": "#5c6bc0",
  "Pain D'or": "#5c6bc0",
  Fakhani: "#d84315",
  "Wooden Bakery": "#6d4c41",
  "Zaatar w Zeit": "#2e7d32",
  "Urban Fresh": "#00695c",
};

// Dark-mode chart series — the light set's OKLCH lightness (0.38–0.60) falls
// well below the dark-surface band (0.48–0.67); these are the same hues
// re-stepped into that band. Do not reorder or reuse for anything else,
// same rule as the light set above.
export const DARK_CHART_COLORS: Record<string, string> = {
  "Espresso Lab": "#00969f",
  "Dunkin Donuts": "#526ac3",
  "Joe & the Juice": "#d05486",
  Starbucks: "#678723",
  "Socrate (Beirut)": "#b8865c",
  "Ana Beirut": "#e8c9a8",
  "abdel Wahab": "#d9a862",
  "Diwan Beirut": "#c49a6c",
  Pinkberry: "#00bfa5",
  Cremino: "#a1887f",
  "Fro - U": "#ffb74d",
  "Pain d'Or": "#7986cb",
  "Pain D'or": "#7986cb",
  Fakhani: "#f57c00",
  "Wooden Bakery": "#8d6e63",
  "Zaatar w Zeit": "#43a047",
  "Urban Fresh": "#00897b",
};

export function themedBrandColors(theme: Theme) {
  return theme === "dark" ? DARK_BRAND_COLORS : BRAND_COLORS;
}

export function themedSemanticColors(theme: Theme) {
  return theme === "dark" ? DARK_SEMANTIC_COLORS : SEMANTIC_COLORS;
}

export function themedChartColors(theme: Theme): Record<string, string> {
  return theme === "dark" ? DARK_CHART_COLORS : CHART_COLORS;
}

export function themedContextColor(theme: Theme): string {
  return theme === "dark" ? DARK_CONTEXT_COLOR : CONTEXT_COLOR;
}
