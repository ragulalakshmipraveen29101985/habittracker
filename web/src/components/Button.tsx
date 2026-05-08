import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type Kind = "primary" | "secondary" | "ghost" | "sage" | "danger";
type Size = "sm" | "md";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: Kind;
  size?: Size;
  icon?: IconName;
  children?: ReactNode;
}

export function Button({
  kind = "primary",
  size = "md",
  icon,
  children,
  style,
  ...rest
}: Props) {
  const base: CSSProperties = {
    border: "1px solid transparent",
    borderRadius: 999,
    fontSize: size === "sm" ? 12.5 : 13.5,
    fontWeight: 500,
    letterSpacing: 0.1,
    padding: size === "sm" ? "7px 14px" : "10px 18px",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "all .14s ease",
    whiteSpace: "nowrap",
  };
  const styles: Record<Kind, CSSProperties> = {
    primary:   { ...base, background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" },
    secondary: { ...base, background: "transparent", color: "var(--ink)", borderColor: "var(--line-strong)" },
    ghost:     { ...base, background: "transparent", color: "var(--ink)", borderColor: "transparent" },
    sage:      { ...base, background: "var(--sage-deep)", color: "#fff", borderColor: "var(--sage-deep)" },
    danger:    { ...base, background: "transparent", color: "var(--coral)", borderColor: "transparent" },
  };
  return (
    <button style={{ ...styles[kind], ...(style ?? {}) }} {...rest}>
      {icon && <Icon name={icon} size={size === "sm" ? 13 : 15} />}
      {children}
    </button>
  );
}
