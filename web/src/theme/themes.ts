export type ThemeMode = "dark" | "light";

export interface Theme {
  id: string;
  label: string;
  bg: string;
  accent: string;
  mode: ThemeMode;
}

export const THEMES: Theme[] = [
  { id: "ferrari-red", label: "Ferrari Red", bg: "#D40000", accent: "#D40000", mode: "dark" },
  { id: "crimson",     label: "Crimson",     bg: "#B91C1C", accent: "#B91C1C", mode: "dark" },
  { id: "burgundy",    label: "Burgundy",    bg: "#7F1D1D", accent: "#7F1D1D", mode: "dark" },
  { id: "coral",       label: "Coral",       bg: "#E11D48", accent: "#E11D48", mode: "dark" },
  { id: "sunset",      label: "Sunset",      bg: "#EA580C", accent: "#EA580C", mode: "dark" },
  { id: "mustard",     label: "Mustard",     bg: "#B45309", accent: "#B45309", mode: "dark" },
  { id: "olive",       label: "Olive",       bg: "#4D7C0F", accent: "#4D7C0F", mode: "dark" },
  { id: "forest",      label: "Forest",      bg: "#166534", accent: "#166534", mode: "dark" },
  { id: "emerald",     label: "Emerald",     bg: "#047857", accent: "#047857", mode: "dark" },
  { id: "teal",        label: "Teal",        bg: "#0F766E", accent: "#0F766E", mode: "dark" },
  { id: "ocean",       label: "Ocean",       bg: "#1E3A8A", accent: "#1E3A8A", mode: "dark" },
  { id: "cobalt",      label: "Cobalt",      bg: "#1D4ED8", accent: "#1D4ED8", mode: "dark" },
  { id: "indigo",      label: "Indigo",      bg: "#4338CA", accent: "#4338CA", mode: "dark" },
  { id: "royal",       label: "Royal",       bg: "#6D28D9", accent: "#6D28D9", mode: "dark" },
  { id: "magenta",     label: "Magenta",     bg: "#BE185D", accent: "#BE185D", mode: "dark" },
  { id: "hot-pink",    label: "Hot Pink",    bg: "#DB2777", accent: "#DB2777", mode: "dark" },
  { id: "charcoal",    label: "Charcoal",    bg: "#1F2937", accent: "#1F2937", mode: "dark" },
  { id: "midnight",    label: "Midnight",    bg: "#0F172A", accent: "#0F172A", mode: "dark" },
  { id: "slate",       label: "Slate",       bg: "#334155", accent: "#334155", mode: "dark" },
  { id: "cream",       label: "Cream",       bg: "#F4EFE6", accent: "#5F7E50", mode: "light" },
  { id: "paper",       label: "Paper",       bg: "#FAFAF7", accent: "#1B1A16", mode: "light" },
  { id: "mint",        label: "Mint",        bg: "#D1FAE5", accent: "#047857", mode: "light" },
  { id: "sky",         label: "Sky",         bg: "#DBEAFE", accent: "#1D4ED8", mode: "light" },
  { id: "blush",       label: "Blush",       bg: "#FCE7F3", accent: "#BE185D", mode: "light" },
];

export const DEFAULT_THEME = THEMES.find((t) => t.id === "mint") ?? THEMES[0];

export function findTheme(id: string | null | undefined): Theme {
  if (!id) return DEFAULT_THEME;
  return THEMES.find((t) => t.id === id) ?? DEFAULT_THEME;
}
