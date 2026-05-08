import { Modal } from "../components/Modal";
import { Icon } from "../components/Icon";
import { useTheme } from "../state/ThemeContext";
import type { Theme } from "../theme/themes";

export function ThemeModal({ onClose }: { onClose: () => void }) {
  const { theme, themes, setTheme } = useTheme();

  const pick = (t: Theme) => {
    setTheme(t);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <h2 className="serif" style={{ fontSize: 26, margin: 0, letterSpacing: "-0.01em", color: "var(--ink)" }}>
          Theme
        </h2>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: "transparent", border: "none", color: "var(--ink-mute)",
            cursor: "pointer", padding: 4, borderRadius: 6,
          }}
        >
          <Icon name="x" size={16} />
        </button>
      </div>
      <p style={{ color: "var(--ink-soft)", margin: "0 0 18px", fontSize: 13 }}>
        Pick a background. Cards stay cream.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        maxHeight: "60vh",
        overflowY: "auto",
      }}>
        {themes.map((t) => {
          const active = t.id === theme.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => pick(t)}
              aria-label={t.label}
              aria-pressed={active}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{
                position: "relative",
                display: "block",
                width: "100%",
                aspectRatio: "1 / 1",
                background: t.bg,
                borderRadius: 12,
                border: active ? "2px solid var(--ink)" : "2px solid var(--line)",
                boxShadow: active ? "0 0 0 3px var(--cream-2)" : "none",
                transition: "transform .12s ease, border-color .12s ease",
              }}>
                <span style={{
                  position: "absolute", right: 6, bottom: 6,
                  width: 12, height: 12, borderRadius: "50%",
                  background: t.accent,
                  border: "1.5px solid var(--paper)",
                }} />
                {active && (
                  <span style={{
                    position: "absolute", top: 6, left: 6,
                    width: 18, height: 18, borderRadius: "50%",
                    background: "var(--paper)", color: "var(--ink)",
                    display: "grid", placeItems: "center",
                  }}>
                    <Icon name="check" size={11} stroke={2.4} />
                  </span>
                )}
              </span>
              <span className="mono" style={{
                fontSize: 10.5, color: "var(--ink-soft)", letterSpacing: 0.4,
                textAlign: "center", lineHeight: 1.2,
              }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
