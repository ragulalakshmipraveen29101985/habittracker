import { useState, type CSSProperties } from "react";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { useAuth } from "../state/AuthContext";
import { signup, login } from "../api/auth";
import { ApiError } from "../api/client";

type Mode = "login" | "signup";

export function Login() {
  const { setSession } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setSession(r.token, r.user);
    } catch (e2) {
      if (e2 instanceof ApiError) {
        setErr(e2.message || (mode === "login" ? "Invalid email or password" : "Could not sign up"));
      } else {
        setErr(e2 instanceof Error ? e2.message : "Something went wrong");
      }
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setErr(null);
  };

  const headline = mode === "login"
    ? <>Welcome to <span className="it">Streak</span>.</>
    : <>Start your <span className="it">streak</span>.</>;
  const sub = mode === "login"
    ? "Log in with your email and password."
    : "Create an account in a few seconds.";
  const submitLabel = mode === "login" ? "Log in" : "Create account";

  return (
    <div className="login-shell">
      <BrandPanel />

      <main className="login-form-pane">
        <form onSubmit={onSubmit} style={{ width: "min(420px, 100%)" }}>
          <p className="mono" style={{
            fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
            color: "var(--bg-text-mute)", margin: 0,
          }}>
            {mode === "login" ? "Log in" : "Sign up"}
          </p>
          <h2 className="serif" style={{ fontSize: 40, margin: "10px 0 6px", letterSpacing: "-0.02em" }}>
            {headline}
          </h2>
          <p style={{ color: "var(--bg-text-soft)", margin: "0 0 28px", fontSize: 14.5 }}>
            {sub}
          </p>

          {mode === "signup" && (
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
          )}

          <div style={{ marginBottom: 16 }}>
            <Label>Email</Label>
            <input
              autoFocus={mode === "login"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              inputMode="email"
              autoComplete="email"
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <Label>Password</Label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "Min 8 characters" : "Your password"}
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              style={fieldStyle}
            />
          </div>

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

          <div style={{ marginTop: 16, fontSize: 13, color: "var(--bg-text-soft)" }}>
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  style={linkStyle}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  style={linkStyle}
                >
                  Log in
                </button>
              </>
            )}
          </div>
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

const linkStyle: CSSProperties = {
  background: "transparent", border: "none",
  color: "var(--bg-text)", textDecoration: "underline",
  cursor: "pointer", padding: 0, font: "inherit",
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
