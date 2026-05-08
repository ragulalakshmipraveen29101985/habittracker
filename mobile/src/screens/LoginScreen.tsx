import { useState } from "react";
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { User } from "@streak/shared";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { colors, fonts } from "../theme/tokens";
import { useAuth } from "../state/AuthContext";
import { requestOtp, verifyOtp, updateProfile } from "../api";
import { ApiError, saveToken } from "../api/client";

type Step = "phone" | "otp" | "profile";

const COUNTRY_CODES = [
  { code: "+91", flag: "IN" },
  { code: "+1", flag: "US" },
  { code: "+44", flag: "UK" },
  { code: "+61", flag: "AU" },
  { code: "+971", flag: "AE" },
];

export function LoginScreen() {
  const { setSession } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [country, setCountry] = useState("+91");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Profile-step state
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const fullPhone = `${country}${phone.replace(/\D/g, "")}`;

  const onSendOtp = async () => {
    setErr(null);
    if (phone.replace(/\D/g, "").length < 6) {
      setErr("Enter a valid phone number");
      return;
    }
    setBusy(true);
    try {
      const r = await requestOtp(fullPhone);
      setDevOtp(r.devOtp ?? null);
      setStep("otp");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setBusy(false);
    }
  };

  const onVerify = async () => {
    setErr(null);
    if (!/^\d{6}$/.test(code)) {
      setErr("OTP must be 6 digits");
      return;
    }
    setBusy(true);
    try {
      const r = await verifyOtp(fullPhone, code);
      if (r.needsProfile) {
        // Cache token so the upcoming PATCH is authenticated, but stay on Login
        // until profile is filled.
        await saveToken(r.token);
        setPendingToken(r.token);
        setPendingUser(r.user);
        setStep("profile");
      } else {
        await setSession(r.token, r.user);
      }
    } catch (e) {
      setErr(
        e instanceof ApiError && e.status === 401
          ? "Invalid or expired code"
          : e instanceof Error ? e.message : "Verification failed",
      );
    } finally {
      setBusy(false);
    }
  };

  const onSaveProfile = async () => {
    setErr(null);
    if (!firstName.trim()) { setErr("First name is required"); return; }
    if (!lastName.trim())  { setErr("Last name is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr("Enter a valid email address");
      return;
    }
    if (!pendingToken) { setErr("Session lost — please sign in again"); setStep("phone"); return; }
    setBusy(true);
    try {
      const { user } = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
      await setSession(pendingToken, user);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  };

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
            {step === "phone" ? "SIGN IN" : step === "otp" ? "ENTER CODE" : "ABOUT YOU"}
          </Text>
          <Text style={{ fontFamily: fonts.serif, fontSize: 32, marginTop: 6, marginBottom: 18, color: colors.ink }}>
            {step === "phone" ? "Welcome to Streak."
              : step === "otp" ? "Check your phone."
              : "One quick thing."}
          </Text>

          {step === "phone" && (
            <View style={{ gap: 8 }}>
              <Label>Phone number</Label>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <CountryPicker value={country} onChange={setCountry} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="9876543210"
                  placeholderTextColor={colors.inkMute}
                  keyboardType="phone-pad"
                  style={fieldStyle}
                />
              </View>
            </View>
          )}

          {step === "otp" && (
            <View style={{ gap: 12 }}>
              {devOtp && (
                <View style={{
                  backgroundColor: colors.sageSoft, padding: 10,
                  borderRadius: 8, flexDirection: "row", justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <Text style={{ fontFamily: fonts.mono, color: colors.sageDeep }}>
                    DEV OTP: {devOtp}
                  </Text>
                  <Pressable onPress={() => setCode(devOtp)}>
                    <Text style={{ color: colors.sageDeep, textDecorationLine: "underline" }}>fill</Text>
                  </Pressable>
                </View>
              )}
              <Label>6-digit code</Label>
              <TextInput
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                placeholderTextColor={colors.inkMute}
                keyboardType="number-pad"
                maxLength={6}
                style={[fieldStyle, {
                  fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6, textAlign: "center",
                }]}
              />
            </View>
          )}

          {step === "profile" && (
            <View style={{ gap: 12 }}>
              <Label>First name</Label>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="e.g. Praveen"
                placeholderTextColor={colors.inkMute}
                autoCapitalize="words"
                style={fieldStyle}
              />
              <Label>Last name</Label>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="e.g. Ragula"
                placeholderTextColor={colors.inkMute}
                autoCapitalize="words"
                style={fieldStyle}
              />
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
            </View>
          )}

          {err && <Text style={{ color: colors.coral, fontSize: 13, marginTop: 12 }}>{err}</Text>}

          <View style={{ marginTop: 22 }}>
            <Button
              kind="primary"
              title={
                step === "phone" ? (busy ? "Sending…" : "Send OTP")
                : step === "otp" ? (busy ? "Verifying…" : "Verify & continue")
                : (busy ? "Saving…" : "Continue")
              }
              onPress={
                step === "phone" ? onSendOtp
                : step === "otp" ? onVerify
                : onSaveProfile
              }
              disabled={busy}
            />
          </View>

          {step === "otp" && (
            <Pressable
              onPress={() => { setStep("phone"); setCode(""); setDevOtp(null); setErr(null); }}
              style={{ marginTop: 14, alignSelf: "center" }}
            >
              <Text style={{ color: colors.inkSoft, fontSize: 13 }}>← Use a different number</Text>
            </Pressable>
          )}
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
  flex: 1,
  backgroundColor: colors.paper,
  borderColor: colors.line,
  borderWidth: 1,
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 15,
  color: colors.ink,
} as const;

function CountryPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const idx = COUNTRY_CODES.findIndex((c) => c.code === value);
  const next = () => {
    const n = (idx + 1) % COUNTRY_CODES.length;
    onChange(COUNTRY_CODES[n].code);
  };
  return (
    <Pressable
      onPress={next}
      style={{
        backgroundColor: colors.paper,
        borderColor: colors.line,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        justifyContent: "center",
        minWidth: 80,
      }}
    >
      <Text style={{ fontSize: 14, color: colors.ink }}>{value}</Text>
    </Pressable>
  );
}
