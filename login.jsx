// Login screen — split layout: brand panel on left, form on right.
const { useState } = React;

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("alex@streak.app");
  const [password, setPassword] = useState("••••••••••");
  const [mode, setMode] = useState("signin"); // signin | signup
  const [name, setName] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const display = mode === "signup" ? (name || "Friend") : "Alex";
    onLogin({ email, name: display });
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1.05fr 1fr",
      background: "var(--cream)",
    }}>
      {/* LEFT: brand panel */}
      <aside style={{
        background: "var(--navy)",
        color: "var(--paper)",
        padding: "44px 56px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="9" height="9" rx="1.5" fill="var(--paper)" />
            <rect x="13" y="2" width="9" height="9" rx="1.5" fill="none" stroke="var(--paper)" strokeWidth="1.6"/>
            <rect x="2" y="13" width="9" height="9" rx="1.5" fill="none" stroke="var(--paper)" strokeWidth="1.6"/>
            <rect x="13" y="13" width="9" height="9" rx="1.5" fill="var(--sage)"/>
          </svg>
          <span className="serif" style={{ fontSize: 26, letterSpacing: "-0.01em" }}>Streak</span>
        </div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <p className="mono" style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase",
              color: "var(--sage-soft)", margin: 0, opacity: 0.85 }}>
            A quiet daily practice
          </p>
          <h1 className="serif" style={{
            fontSize: 64, lineHeight: 1.02, margin: "14px 0 22px",
            letterSpacing: "-0.02em",
          }}>
            Small marks,<br/><span className="it">honest</span> months.
          </h1>
          <p style={{
            fontSize: 15.5, lineHeight: 1.55, maxWidth: 420,
            color: "rgba(244, 239, 230, 0.78)",
          }}>
            Build a tracker for any rhythm — morning rituals, fitness, reading.
            Tick the days. Watch the months tell the truth.
          </p>
        </div>

        {/* decorative dot grid */}
        <div style={{ display: "flex", gap: 36, alignItems: "flex-end" }}>
          <DecorMonth />
          <div className="mono" style={{ fontSize: 11, letterSpacing: 0.6, color: "rgba(244,239,230,0.55)" }}>
            <div>EST. 2026</div>
            <div style={{ marginTop: 4 }}>v 1.0 — May</div>
          </div>
        </div>

        {/* subtle background marks */}
        <div aria-hidden style={{
          position: "absolute", right: -120, top: -80, width: 380, height: 380,
          borderRadius: "50%", border: "1px solid rgba(217,227,205,0.14)", pointerEvents: "none",
        }}/>
        <div aria-hidden style={{
          position: "absolute", right: -200, top: -180, width: 560, height: 560,
          borderRadius: "50%", border: "1px solid rgba(217,227,205,0.08)", pointerEvents: "none",
        }}/>
      </aside>

      {/* RIGHT: form */}
      <main style={{
        display: "grid", placeItems: "center", padding: "48px",
      }}>
        <form onSubmit={submit} style={{ width: "min(420px, 100%)" }}>
          <p className="mono" style={{
            fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
            color: "var(--ink-mute)", margin: 0,
          }}>
            {mode === "signin" ? "Welcome back" : "Begin"}
          </p>
          <h2 className="serif" style={{ fontSize: 40, margin: "10px 0 6px", letterSpacing: "-0.02em" }}>
            {mode === "signin" ? <>Sign in to your <span className="it">streak</span>.</> : <>Create your <span className="it">account</span>.</>}
          </h2>
          <p style={{ color: "var(--ink-soft)", margin: "0 0 28px", fontSize: 14.5 }}>
            {mode === "signin"
              ? "Pick up where you left off — your trackers are waiting."
              : "It takes ten seconds. No credit card. Ever."}
          </p>

          {mode === "signup" && (
            <Field label="Your name" value={name} onChange={setName} placeholder="Jordan Rivera" />
          )}
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Password" type="password" value={password} onChange={setPassword} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "8px 0 22px" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-soft)" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--sage-deep)" }}/>
              Remember me
            </label>
            <a href="#" onClick={(e)=>e.preventDefault()} style={{ fontSize: 13, color: "var(--ink-soft)" }}>Forgot?</a>
          </div>

          <Button type="submit" kind="primary" style={{ width: "100%", justifyContent: "center" }}>
            {mode === "signin" ? "Continue" : "Create account"} <Icon name="chev" size={14} />
          </Button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }}/>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-mute)", letterSpacing: 1 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }}/>
          </div>

          <Button type="button" kind="secondary" style={{ width: "100%", justifyContent: "center" }}>
            <GoogleG /> Continue with Google
          </Button>

          <p style={{ marginTop: 28, textAlign: "center", color: "var(--ink-soft)", fontSize: 13 }}>
            {mode === "signin" ? "New here? " : "Already have an account? "}
            <a href="#" onClick={(e)=>{e.preventDefault(); setMode(mode==="signin"?"signup":"signin");}}
              style={{ color: "var(--ink)", fontWeight: 500 }}>
              {mode === "signin" ? "Create an account" : "Sign in"}
            </a>
          </p>
        </form>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div className="mono" style={{
        fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase",
        color: "var(--ink-mute)", marginBottom: 6,
      }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 14px",
          fontSize: 14.5,
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          outline: "none",
          color: "var(--ink)",
          transition: "border-color .15s ease",
        }}
        onFocus={(e)=> e.target.style.borderColor = "var(--ink)"}
        onBlur={(e)=> e.target.style.borderColor = "var(--line)"}
      />
    </label>
  );
}

function GoogleG() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.2h6c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2.1-2 3.2-4.9 3.2-8z"/>
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.8l-3.6-2.7c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.6H2.1v2.8C3.9 20.5 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.8 14c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V6.8H2.1C1.4 8.3 1 9.9 1 11.8s.4 3.5 1.1 5l3.7-2.8z"/>
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.2-3.2C17.5 2.1 15 1 12 1 7.7 1 3.9 3.5 2.1 6.8l3.7 2.8C6.7 7 9.1 5.4 12 5.4z"/>
    </svg>
  );
}

function DecorMonth() {
  // a small 7x4 month grid, tinted, hinting at the product
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
            opacity: filled ? 0.55 + ((i*7)%50)/120 : 1,
          }}/>
        );
      })}
    </div>
  );
}

window.LoginScreen = LoginScreen;
