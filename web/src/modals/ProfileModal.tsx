import { useState, type CSSProperties } from "react";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { useAuth } from "../state/AuthContext";
import { updateProfile } from "../api/auth";

interface Props {
  onClose: () => void;
}

export function ProfileModal({ onClose }: Props) {
  const { user, setUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!firstName.trim()) { setErr("First name is required"); return; }
    if (!lastName.trim())  { setErr("Last name is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr("Enter a valid email address");
      return;
    }
    setBusy(true);
    try {
      const { user: updated } = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
      setUser(updated);
      onClose();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <p className="mono" style={{ fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-mute)", margin: 0 }}>
              Your profile
            </p>
            <h3 className="serif" style={{ fontSize: 30, margin: "6px 0 0", letterSpacing: "-0.02em" }}>
              Edit your <span className="it">details</span>.
            </h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{
            background: "transparent", border: "none", color: "var(--ink-mute)", padding: 4, cursor: "pointer",
          }}><Icon name="x" size={20} /></button>
        </div>

        <p style={{ color: "var(--ink-soft)", margin: "6px 0 18px", fontSize: 14 }}>
          Change your name or email. Your phone number stays the same.
        </p>

        <Label>Phone (read-only)</Label>
        <div style={{
          ...fieldStyle, color: "var(--ink-mute)", fontFamily: "var(--mono)",
          background: "var(--cream-2)", marginBottom: 16,
        }}>
          {user?.phone ?? "—"}
        </div>

        <Label>First name</Label>
        <input
          autoFocus
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{ ...fieldStyle, marginBottom: 14 }}
        />
        <Label>Last name</Label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={{ ...fieldStyle, marginBottom: 14 }}
        />
        <Label>Email</Label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          inputMode="email"
          autoComplete="email"
          style={{ ...fieldStyle, marginBottom: 6 }}
        />

        {err && (
          <div style={{ color: "var(--coral)", fontSize: 13, marginTop: 8 }}>{err}</div>
        )}

        <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button kind="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
          <Button kind="primary" size="sm" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono" style={{
      fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase",
      color: "var(--ink-mute)", marginBottom: 6,
    }}>{children}</div>
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
};
