import Svg, { Circle, G } from "react-native-svg";
import { Text, View } from "react-native";
import { colors, fonts } from "../theme/tokens";

interface Props {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: string;
}

export function Ring({
  value,
  size = 56,
  stroke = 5,
  color = colors.sageDeep,
  track = colors.line,
  label,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={off}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <Text style={{
        fontFamily: fonts.mono, fontSize: size < 56 ? 10 : 12, color: colors.inkSoft,
      }}>
        {label ?? `${Math.round(value)}%`}
      </Text>
    </View>
  );
}
