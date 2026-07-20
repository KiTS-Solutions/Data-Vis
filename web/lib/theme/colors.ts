export const BRAND_COLORS = {
  stories: "#2f5b6b", // Ocean
  accent: "#e7e569", // Lime Dust — sparing UI accent only
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
