export const CATEGORIES = [
  "POTHOLE",
  "SEWAGE",
  "UTILITY_POLE",
  "ROAD_DAMAGE",
  "STREET_LIGHT",
  "OTHER",
];

export const SEVERITIES = ["LOW", "MEDIUM", "HIGH"];

// Sensible starting point per category — user can always override.
export const DEFAULT_SEVERITY = {
  POTHOLE: "MEDIUM",
  SEWAGE: "HIGH",
  UTILITY_POLE: "HIGH",
  ROAD_DAMAGE: "MEDIUM",
  STREET_LIGHT: "LOW",
  OTHER: "MEDIUM",
};