import Svg, { Rect } from "react-native-svg";
import { Text, View } from "react-native";
import { colors, fonts } from "../theme/tokens";

export function Logo({ size = 22, dark = false }: { size?: number; dark?: boolean }) {
  const fill = dark ? colors.paper : colors.ink;
  const accent = dark ? colors.sage : colors.sageDeep;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x={2} y={2} width={9} height={9} rx={1.5} fill={fill} />
        <Rect x={13} y={2} width={9} height={9} rx={1.5} fill="none" stroke={fill} strokeWidth={1.6} />
        <Rect x={2} y={13} width={9} height={9} rx={1.5} fill="none" stroke={fill} strokeWidth={1.6} />
        <Rect x={13} y={13} width={9} height={9} rx={1.5} fill={accent} />
      </Svg>
      <Text style={{ fontFamily: fonts.serif, fontSize: size + 4, color: dark ? colors.paper : colors.ink }}>
        Streak
      </Text>
    </View>
  );
}
