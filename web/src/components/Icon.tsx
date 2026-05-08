import type { CSSProperties } from "react";

export type IconName =
  | "plus" | "check" | "x" | "back" | "chev" | "down"
  | "edit" | "trash" | "search" | "calendar" | "settings"
  | "logout" | "flame" | "sparkle" | "grid" | "dots" | "palette";

interface Props {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
}

export function Icon({ name, size = 16, stroke = 1.6, style }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style,
  };
  switch (name) {
    case "plus":   return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case "check":  return <svg {...common}><path d="M4 12l5 5L20 6" /></svg>;
    case "x":      return <svg {...common}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "back":   return <svg {...common}><path d="M15 6l-6 6 6 6" /></svg>;
    case "chev":   return <svg {...common}><path d="M9 6l6 6-6 6" /></svg>;
    case "down":   return <svg {...common}><path d="M6 9l6 6 6-6" /></svg>;
    case "edit":   return <svg {...common}><path d="M4 20h4l10-10-4-4L4 16v4z" /><path d="M14 6l4 4" /></svg>;
    case "trash":  return <svg {...common}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>;
    case "search": return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case "calendar": return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case "settings": return <svg {...common}><circle cx="12" cy="12" r="3"/></svg>;
    case "logout": return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    case "flame":  return <svg {...common}><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 8 12 8 14a4 4 0 0 0 8 0c0-3-2-5-4-12z"/></svg>;
    case "sparkle":return <svg {...common}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"/></svg>;
    case "grid":   return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case "dots":   return <svg {...common}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>;
    case "palette": return <svg {...common}><path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.9-.5-1.4 0-1.1.9-2 2-2h2.5A3.5 3.5 0 0 0 21 10.5C21 6.4 16.97 3 12 3z"/><circle cx="7" cy="11" r="1.2"/><circle cx="9.5" cy="7" r="1.2"/><circle cx="14.5" cy="7" r="1.2"/><circle cx="17" cy="11" r="1.2"/></svg>;
    default: return null;
  }
}
