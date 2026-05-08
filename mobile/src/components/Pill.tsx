import { Text, View } from "react-native";
import { colors, fonts } from "../theme/tokens";

type Tone = "ink" | "sage" | "cream" | "coral";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  ink:   { bg: colors.ink,       fg: colors.paper },
  sage:  { bg: colors.sageSoft,  fg: colors.sageDeep },
  cream: { bg: colors.cream2,    fg: colors.inkSoft },
  coral: { bg: colors.coralSoft, fg: colors.coral },
};

export function Pill({ children, tone = "ink" }: { children: React.ReactNode; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <View style={{
      backgroundColor: t.bg,
      paddingVertical: 3, paddingHorizontal: 9,
      borderRadius: 999, alignSelf: "flex-start",
    }}>
      <Text style={{ color: t.fg, fontSize: 11.5, fontFamily: fonts.mono, letterSpacing: 0.2 }}>
        {children}
      </Text>
    </View>
  );
}
