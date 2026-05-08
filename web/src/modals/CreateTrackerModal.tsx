import { useState } from "react";
import { ACCENT_OPTIONS, EMOJI_OPTIONS, type AccentName } from "@streak/shared";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";

interface Props {
  onClose: () => void;
  onCreate: (data: {
    name: string;
    emoji: string;
    accent: AccentName;
    habits: string[];
  }) => void;
}

export function CreateTrackerModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [accent, setAccent] = useState<AccentName>("sage");
  const [habits, setHabits] = useState<string[]>(["", "", ""]);
  const [draft, setDraft] = useState("");

  const addHabit = () => {
    const v = draft.trim();
    if (!v) return;
    setHabits((prev) => {
      const idx = prev.findIndex((x) => !x.trim());
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = v;
        return next;
      }
      return [...prev, v];
    });
    setDraft("");
  };

  const removeHabit = (i: number) => setHabits((prev) => prev.filter((_, j) => j !== i));
  const editHabit = (i: number, v: string) => setHabits((prev) => prev.map((x, j) => (j === i ? v : x)));

  const filled = habits.map((h) => h.trim()).filter(Boolean);
  const canCreate = !!name.trim() && filled.length >= 1;

  const submit = () => {
    if (!canCreate) return;
    onCreate({ name: name.trim(), emoji, accent, habits: filled });
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <p className="mono" style={{ fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-mute)", margin: 0 }}>New tracker</p>
          <h3 className="serif" style={{ fontSize: 30, margin: "6px 0 0", letterSpacing: "-0.02em" }}>What will you keep?</h3>
        </div>
        <button onClick={onClose} aria-label="Close" style={{
          background: "transparent", border: "none", color: "var(--ink-mute)", padding: 4, cursor: "pointer",
        }}><Icon name="x" size={20} /></button>
      </div>

      <p style={{ color: "var(--ink-soft)", margin: "6px 0 18px", fontSize: 14 }}>
        A tracker is a small group of habits you check off each day.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 16 }}>
        <input
          autoFocus value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Name your tracker"
          style={{
            padding: "12px 14px", fontSize: 15, background: "var(--cream)",
            border: "1px solid var(--line)", borderRadius: 10, outline: "none",
          }}
        />
        <select value={emoji} onChange={(e) => setEmoji(e.target.value)}
          style={{
            padding: "0 12px", fontSize: 18, background: "var(--cream)",
            border: "1px solid var(--line)", borderRadius: 10, outline: "none", cursor: "pointer",
          }}>
          {EMOJI_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {ACCENT_OPTIONS.map((a) => {
          const swatch = a.id === "sage" ? "var(--sage-deep)" : a.color;
          return (
            <button key={a.id} onClick={() => setAccent(a.id)}
              style={{
                flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                background: accent === a.id ? swatch : "var(--cream)",
                color: accent === a.id ? "#fff" : "var(--ink-soft)",
                border: `1px solid ${accent === a.id ? swatch : "var(--line)"}`,
                fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              <span style={{
                width: 10, height: 10, borderRadius: "50%",
                background: accent === a.id ? "#fff" : swatch,
              }} />
              {a.label}
            </button>
          );
        })}
      </div>

      <div className="mono" style={{
        fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase",
        color: "var(--ink-mute)", marginBottom: 8,
      }}>
        Habits ({filled.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
        {habits.map((h, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-mute)", width: 18 }}>{String(i + 1).padStart(2, "0")}</span>
            <input value={h} onChange={(e) => editHabit(i, e.target.value)}
              placeholder={i === 0 ? "e.g. Daily Exercise" : i === 1 ? "e.g. Read 10 pages" : "Another habit"}
              style={{
                flex: 1, padding: "9px 12px", fontSize: 14, background: "var(--cream)",
                border: "1px solid var(--line)", borderRadius: 8, outline: "none",
              }}
            />
            <button onClick={() => removeHabit(i)} aria-label="Remove"
              style={{
                background: "transparent", border: "none", color: "var(--ink-mute)",
                padding: 4, cursor: "pointer", display: "grid", placeItems: "center",
              }}>
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          placeholder="Add another habit"
          onKeyDown={(e) => { if (e.key === "Enter") addHabit(); }}
          style={{
            flex: 1, padding: "9px 12px", fontSize: 14, background: "var(--cream)",
            border: "1px solid var(--line)", borderRadius: 8, outline: "none",
          }}
        />
        <Button kind="ghost" size="sm" icon="plus" onClick={addHabit}>Add</Button>
      </div>

      <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button kind="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button
          kind="primary" size="sm" onClick={submit} disabled={!canCreate}
          style={!canCreate ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
        >
          Create tracker <Icon name="chev" size={14} />
        </Button>
      </div>
    </Modal>
  );
}
