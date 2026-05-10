import { useState } from "react";
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { colors, fonts } from "../theme/tokens";
import { useAuth } from "../state/AuthContext";
import { signup, login } from "../api";
import { ApiError } from "../api/client";

type Mode = "login" | "signup";

export function LoginScreen() {
  const { setSession } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async () => {
    setErr(null);
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErr("Enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters");
      return;
    }
    if (mode === "signup" && !firstName.trim()) {
      setErr("First name is required");
      return;
    }
    setBusy(true);
    try {
      const r = mode === "signup"
        ? await signup({ email: trimmedEmail, password, firstName: firstName.trim() })
        : await login({ email: trimmedEmail, password });
      await setSession(r.token, r.user);
    } catch (e) {
      if (e instanceof ApiError) {
        setErr(e.message || (mode === "login" ? "Invalid email or password" : "Could not sign up"));
      } else {
        setErr(e instanceof Error ? e.message : "Something went wrong");
      }
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (m: Mode) => { setMode(m); setErr(null); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} keyboardShouldPersistTaps="handled">
          <View style={{
            backgroundColor: colors.navy, padding: 22, borderRadius: 16,
            marginBottom: 28,
          }}>
            <Logo size={20} dark />
            <Text style={{
              color: colors.sageSoft, fontSize: 11, letterSpacing: 1.2,
              fontFamily: fonts.mono, marginTop: 22, opacity: 0.85,
            }}>
              DAILY HABIT TRACKER
            </Text>
            <Text style={{
              color: colors.paper, fontSize: 36, fontFamily: fonts.serif,
              marginTop: 10, lineHeight: 38,
            }}>
              One tick a day.{"\n"}Build a habit.
            </Text>
          </View>

          <Text style={{
            fontFamily: fonts.mono, fontSize: 11, color: colors.inkMute, letterSpacing: 1.2,
          }}>
            {mode === "login" ? "LOG IN" : "SIGN UP"}
          </Text>
          <Text style={{ fontFamily: fonts.serif, fontSize: 32, marginTop: 6, marginBottom: 18, color: colors.ink }}>
            {mode === "login" ? "Welcome to Streak." : "Start your streak."}
          </Text>

          <View style={{ gap: 12 }}>
            {mode === "signup" && (
              <>
                <Label>First name</Label>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="e.g. Praveen"
                  placeholderTextColor={colors.inkMute}
                  autoCapitalize="words"
                  style={fieldStyle}
                />
              </>
            )}
            <Label>Email</Label>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.inkMute}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={fieldStyle}
            />
            <Label>Password</Label>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={mode === "signup" ? "Min 8 characters" : "Your password"}
              placeholderTextColor={colors.inkMute}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={mode === "signup" ? "password-new" : "password"}
              style={fieldStyle}
            />
          </View>

          {err && <Text style={{ color: colors.coral, fontSize: 13, marginTop: 12 }}>{err}</Text>}

          <View style={{ marginTop: 22 }}>
            <Button
              kind="primary"
              title={busy
                ? (mode === "login" ? "Logging in…" : "Creating account…")
                : (mode === "login" ? "Log in" : "Create account")}
              onPress={onSubmit}
              disabled={busy}
            />
          </View>

          <Pressable
            onPress={() => switchMode(mode === "login" ? "signup" : "login")}
            style={{ marginTop: 18, alignSelf: "center" }}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 13 }}>
              {mode === "login"
                ? "New here? Create an account"
                : "Already have an account? Log in"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{
      fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1,
      color: colors.inkMute, textTransform: "uppercase", marginBottom: 4,
    }}>{children}</Text>
  );
}

const fieldStyle = {
  flex: 0,
  backgroundColor: colors.paper,
  borderColor: colors.line,
  borderWidth: 1,
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 15,
  color: colors.ink,
} as const;
