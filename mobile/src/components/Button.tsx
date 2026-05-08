import { Pressable, Text, View, type PressableProps, type ViewStyle, type TextStyle } from "react-native";
import { colors } from "../theme/tokens";

type Kind = "primary" | "secondary" | "ghost" | "sage";

interface Props extends PressableProps {
  kind?: Kind;
  size?: "sm" | "md";
  title: string;
  leftIcon?: React.ReactNode;
}

const KIND_BG: Record<Kind, string> = {
  primary: colors.ink,
  secondary: "transparent",
  ghost: "transparent",
  sage: colors.sageDeep,
};
const KIND_FG: Record<Kind, string> = {
  primary: colors.paper,
  secondary: colors.ink,
  ghost: colors.ink,
  sage: "#fff",
};
const KIND_BORDER: Record<Kind, string> = {
  primary: colors.ink,
  secondary: colors.lineStrong,
  ghost: "transparent",
  sage: colors.sageDeep,
};

export function Button({
  kind = "primary",
  size = "md",
  title,
  leftIcon,
  disabled,
  style,
  ...rest
}: Props) {
  const containerStyle: ViewStyle = {
    backgroundColor: KIND_BG[kind],
    borderColor: KIND_BORDER[kind],
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: size === "sm" ? 7 : 10,
    paddingHorizontal: size === "sm" ? 14 : 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    opacity: disabled ? 0.4 : 1,
  };
  const textStyle: TextStyle = {
    color: KIND_FG[kind],
    fontSize: size === "sm" ? 12.5 : 13.5,
    fontWeight: "500",
  };
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        containerStyle,
        pressed && !disabled && { opacity: 0.7 },
        typeof style === "function" ? undefined : style,
      ]}
      {...rest}
    >
      {leftIcon && <View>{leftIcon}</View>}
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}
