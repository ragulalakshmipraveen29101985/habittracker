import { useState, type CSSProperties } from "react";
import type { User } from "@streak/shared";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { useAuth } from "../state/AuthContext";
import { requestOtp, verifyOtp, updateProfile } from "../api/auth";
import { ApiError, setToken } from "../api/client";

type Step = "phone" | "otp" | "profile";

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
];

export function Login() {
  const { setSession } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [country, setCountry] = useState("+91");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Profile-step state (used after first-time OTP verify when needsProfile=true)
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const fullPhone = `${country}${phone.replace(/\D/g, "")}`;

  const onSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Failed to send OTP");
    } finally {
      setBusy(false);
    }
  };

  const onVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErr(null);
    if (!/^\d{6}$/.test(code)) {
      setErr("OTP must be 6 digits");
      return;
    }
    setBusy(true);
    try {
      const r = await verifyOtp(fullPhone, code);
      if (r.needsProfile) {
        // Stash token so the upcoming PATCH /auth/me is authenticated, but
        // don't put the user into the AuthContext yet — we want the Login
        // screen to keep rendering until profile is complete.
        setToken(r.token);
        setPendingToken(r.token);
        setPendingUser(r.user);
        setStep("profile");
      } else {
        setSession(r.token, r.user);
      }
    } catch (e2) {
      setErr(
        e2 instanceof ApiError && e2.status === 401
          ? "Invalid or expired code"
          : e2 instanceof Error ? e2.message : "Verification failed",
      );
    } finally {
      setBusy(false);
    }
  };

  const onSaveProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
      setSession(pendingToken, user);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    if (step === "phone") return onSendOtp(e);
    if (step === "otp") return onVerify(e);
    return onSaveProfile(e);
  };

  const stepKicker =
    step === "phone" ? "Sign in" :
    step === "otp"   ? "Enter code" :
                       "About you";
  const stepHeadline =
    step === "phone" ? <>Welcome to <span className="it">Streak</span>.</> :
    step === "otp"   ? <>Check your <span className="it">phone</span>.</> :
                       <>One <span className="it">quick</span> thing.</>;
  const stepSub =
    step === "phone" ? "Enter your phone number. We'll send you a one-time code." :
    step === "otp"   ? `We sent a 6-digit code to ${fullPhone}.` :
                       "Tell us a little about yourself. We only ask once.";
  const submitLabel =
    step === "phone" ? "Send OTP" :
    step === "otp"   ? "Verify & continue" :
                       "Continue";

  return (
    <div className="login-shell">
      <BrandPanel />

      <main className="login-form-pane">
        <form
          onSubmit={onSubmit}
          style={{ width: "min(420px, 100%)" }}
        >
          <p className="mono" style={{
            fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
            color: "var(--bg-text-mute)", margin: 0,
          }}>
            {stepKicker}
          </p>
          <h2 className="serif" style={{ fontSize: 40, margin: "10px 0 6px", letterSpacing: "-0.02em" }}>
            {stepHeadline}
          </h2>
          <p style={{ color: "var(--bg-text-soft)", margin: "0 0 28px", fontSize: 14.5 }}>
            {stepSub}
          </p>

          {step === "phone" && (
            <div style={{ marginBottom: 16 }}>
              <Label>Phone number</Label>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 8 }}>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={{ ...fieldStyle, paddingRight: 28, cursor: "pointer", minWidth: 100 }}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <input
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  inputMode="numeric"
                  style={fieldStyle}
                />
              </div>
            </div>
          )}

          {step === "otp" && (
            <>
              {devOtp && (
                <div style={{
                  marginBottom: 12, padding: "8px 12px", borderRadius: 8,
                  background: "var(--sage-soft)", color: "var(--sage-deep)",
                  fontFamily: "var(--mono)", fontSize: 12, letterSpacing: 0.4,
                }}>
                  DEV OTP: <span style={{ fontWeight: 500, fontSize: 14 }}>{devOtp}</span>
                  <button
                    type="button"
                    onClick={() => setCode(devOtp)}
                    style={{
                      marginLeft: 10, background: "transparent", border: "none",
                      color: "var(--sage-deep)", textDecoration: "underline", cursor: "pointer",
                      font: "inherit",
                    }}
                  >fill</button>
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <Label>6-digit code</Label>
                <input
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="• • • • • •"
                  inputMode="numeric"
                  maxLength={6}
                  style={{ ...fieldStyle, fontFamily: "var(--mono)", fontSize: 18, letterSpacing: 6, textAlign: "center" }}
                />
              </div>
            </>
          )}

          {step === "profile" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <Label>First name</Label>
                <input
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Praveen"
                  style={fieldStyle}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Label>Last name</Label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Ragula"
                  style={fieldStyle}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Label>Email</Label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  style={fieldStyle}
                />
              </div>
            </>
          )}

          {err && (
            <div style={{ color: "#FFE0E0", fontSize: 13, margin: "0 0 14px" }}>
              {err}
            </div>
          )}

          <Button
            type="submit"
            kind="primary"
            disabled={busy}
            style={{
              width: "100%", justifyContent: "center",
              opacity: busy ? 0.5 : 1, cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {submitLabel}{" "}
            <Icon name="chev" size={14} />
          </Button>

          {step === "otp" && (
            <button
              type="button"
              onClick={() => { setStep("phone"); setCode(""); setDevOtp(null); setErr(null); }}
              style={{
                marginTop: 16, background: "transparent", border: "none",
                color: "var(--bg-text-soft)", fontSize: 13, cursor: "pointer", padding: 0,
              }}
            >
              ← Use a different number
            </button>
          )}

        </form>
      </main>
    </div>
  );
}

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 14.5,
  background: "var(--paper)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  outline: "none",
  color: "var(--ink)",
  transition: "border-color .15s ease",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono" style={{
      fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase",
      color: "var(--bg-text-mute)", marginBottom: 6,
    }}>{children}</div>
  );
}

function BrandPanel() {
  return (
    <aside className="login-brand">
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="9" height="9" rx="1.5" fill="var(--paper)" />
          <rect x="13" y="2" width="9" height="9" rx="1.5" fill="none" stroke="var(--paper)" strokeWidth="1.6" />
          <rect x="2" y="13" width="9" height="9" rx="1.5" fill="none" stroke="var(--paper)" strokeWidth="1.6" />
          <rect x="13" y="13" width="9" height="9" rx="1.5" fill="var(--sage)" />
        </svg>
        <span className="serif" style={{ fontSize: 26, letterSpacing: "-0.01em" }}>Streak</span>
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <p className="mono" style={{
          fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase",
          color: "var(--sage-soft)", margin: 0, opacity: 0.85,
        }}>
          Daily habit tracker
        </p>
        <h1 className="serif login-brand-headline">
          One tick a day.<br /><span className="it">Build</span> a habit.
        </h1>
      </div>

      <div className="login-brand-decor" style={{ display: "flex", gap: 36, alignItems: "flex-end" }}>
        <DecorMonth />
        <div className="mono" style={{ fontSize: 11, letterSpacing: 0.6, color: "rgba(244,239,230,0.55)" }}>
          <div>EST. 2026</div>
          <div style={{ marginTop: 4 }}>v 1.0</div>
        </div>
      </div>

      <div aria-hidden className="login-brand-rings" style={{
        position: "absolute", right: -120, top: -80, width: 380, height: 380,
        borderRadius: "50%", border: "1px solid rgba(217,227,205,0.14)", pointerEvents: "none",
      }} />
      <div aria-hidden className="login-brand-rings" style={{
        position: "absolute", right: -200, top: -180, width: 560, height: 560,
        borderRadius: "50%", border: "1px solid rgba(217,227,205,0.08)", pointerEvents: "none",
      }} />
    </aside>
  );
}

function DecorMonth() {
  const cells = Array.from({ length: 28 });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 14px)", gap: 4 }}>
      {cells.map((_, i) => {
        const filled = (i * 53) % 100 < 62;
        return (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 2,
            background: filled ? "var(--sage)" : "transparent",
            border: filled ? "none" : "1px solid rgba(217,227,205,0.3)",
            opacity: filled ? 0.55 + ((i * 7) % 50) / 120 : 1,
          }} />
        );
      })}
    </div>
  );
}
