export const colors = {
  cream: "#F4EFE6",
  cream2: "#ECE5D6",
  paper: "#FBF8F2",
  ink: "#1B1A16",
  inkSoft: "#4A4640",
  inkMute: "#8A857C",
  line: "#E2DACA",
  lineStrong: "#C9BFA9",
  navy: "#1E2740",
  navy2: "#2A2A2A",
  sage: "#E63946",
  sageDeep: "#D40000",
  sageSoft: "#FCDCDC",
  coral: "#8B1A1A",
  coralSoft: "#FCDCDC",
  amber: "#C9A24A",
} as const;

export const fonts = {
  serif: '"Instrument Serif", "Times New Roman", Georgia, serif',
  sans: '"Helvetica Neue", Helvetica, "Arial", sans-serif',
  mono: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 14,
  pill: 999,
} as const;

export type AccentName = "sage" | "coral" | "navy";

export const accentColor = (a: AccentName | string | undefined, cssVar = false): string => {
  switch (a) {
    case "sage":
      return cssVar ? "var(--sage-deep)" : colors.sageDeep;
    case "coral":
      return colors.coral;
    case "navy":
      return colors.navy2;
    default:
      return cssVar ? "var(--sage-deep)" : colors.sageDeep;
  }
};

export const ACCENT_OPTIONS: { id: AccentName; color: string; label: string }[] = [
  { id: "sage", color: colors.sageDeep, label: "Theme" },
  { id: "coral", color: colors.coral, label: "Bordeaux" },
  { id: "navy", color: colors.navy2, label: "Charcoal" },
];

export const EMOJI_OPTIONS = ["☼", "◐", "✦", "❀", "♕", "✿", "△", "◇", "♥", "✱"];
