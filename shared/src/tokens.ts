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
  navy2: "#2A3556",
  sage: "#7C9A6B",
  sageDeep: "#5F7E50",
  sageSoft: "#D9E3CD",
  coral: "#C97C5D",
  coralSoft: "#F4DDD2",
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

export const accentColor = (a: AccentName | string | undefined): string => {
  switch (a) {
    case "sage":
      return colors.sageDeep;
    case "coral":
      return colors.coral;
    case "navy":
      return colors.navy2;
    default:
      return colors.sageDeep;
  }
};

export const ACCENT_OPTIONS: { id: AccentName; color: string; label: string }[] = [
  { id: "sage", color: colors.sageDeep, label: "Sage" },
  { id: "coral", color: colors.coral, label: "Coral" },
  { id: "navy", color: colors.navy2, label: "Navy" },
];

export const EMOJI_OPTIONS = ["☼", "◐", "✦", "❀", "♕", "✿", "△", "◇", "♥", "✱"];
