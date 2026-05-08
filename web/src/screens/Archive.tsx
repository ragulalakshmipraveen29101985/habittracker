import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { accentColor } from "@streak/shared";
import type { Tracker } from "@streak/shared";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { Icon } from "../components/Icon";
import {
  listArchivedTrackers, unarchiveTracker, deleteTracker,
} from "../api/trackers";

export function Archive() {
  const nav = useNavigate();
  const [items, setItems] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listArchivedTrackers();
        if (!cancelled) setItems(list);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load archive");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onUnarchive = async (id: string) => {
    try {
      await unarchiveTracker(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not unarchive");
    }
  };

  const onDeleteForever = async (t: Tracker) => {
    if (!confirm(`Permanently delete "${t.name}"? This cannot be undone.`)) return;
    try {
      await deleteTracker(t.id);
      setItems((prev) => prev.filter((x) => x.id !== t.id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not delete");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <header className="dash-header">
        <Logo size={20} />
        <div style={{ display: "flex", gap: 22, fontSize: 13.5 }}>
          <Button kind="ghost" size="sm" icon="back" onClick={() => nav("/")}>Trackers</Button>
        </div>
        <div style={{ width: 32 }} />
      </header>

      <div className="dash-content" style={{ maxWidth: 760 }}>
        <p className="mono" style={{
          fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
          color: "var(--ink-mute)", margin: 0,
        }}>
          Archive
        </p>
        <h1 className="serif" style={{ fontSize: 40, lineHeight: 1.05, margin: "8px 0 4px", letterSpacing: "-0.02em" }}>
          Trackers you've <span className="it">set aside</span>.
        </h1>
        <p style={{ color: "var(--ink-soft)", margin: "0 0 24px", fontSize: 14.5 }}>
          Restore one to bring it back, or remove it for good.
        </p>

        {err && (
          <div style={{
            color: "var(--coral)", fontSize: 13, marginBottom: 14,
            padding: "8px 12px", border: "1px solid var(--line)", borderRadius: 8,
          }}>{err}</div>
        )}

        {loading ? (
          <p style={{ color: "var(--ink-mute)" }}>Loading…</p>
        ) : items.length === 0 ? (
          <div style={{
            border: "1.5px dashed var(--line-strong)", borderRadius: 14,
            padding: 28, textAlign: "center", color: "var(--ink-soft)",
          }}>
            <div className="serif" style={{ fontSize: 22, marginBottom: 6 }}>Nothing archived yet.</div>
            <div style={{ fontSize: 13, color: "var(--ink-mute)" }}>
              Trackers you archive will appear here.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((t) => (
              <ArchiveRow
                key={t.id}
                tracker={t}
                onUnarchive={() => onUnarchive(t.id)}
                onDelete={() => onDeleteForever(t)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArchiveRow({
  tracker, onUnarchive, onDelete,
}: {
  tracker: Tracker;
  onUnarchive: () => void;
  onDelete: () => void;
}) {
  const ac = accentColor(tracker.accent);
  const archivedRel = relativeTime(tracker.archivedAt);
  return (
    <article style={{
      background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 14,
      padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center",
          background: ac, color: "var(--paper)", fontSize: 15, flexShrink: 0,
        }}>{tracker.emoji}</span>
        <div style={{ minWidth: 0 }}>
          <h3 className="serif" style={{
            fontSize: 19, margin: 0, letterSpacing: "-0.01em",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{tracker.name}</h3>
          <p style={{
            color: "var(--ink-mute)", margin: "2px 0 0",
            fontSize: 12.5, fontFamily: "var(--mono)",
          }}>
            {tracker.habits.length} habit{tracker.habits.length === 1 ? "" : "s"} · archived {archivedRel}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button kind="secondary" size="sm" onClick={onUnarchive}>Unarchive</Button>
        <button
          onClick={onDelete}
          style={{
            background: "transparent", border: "1px solid transparent",
            color: "var(--coral)", fontSize: 12.5, fontWeight: 500,
            padding: "7px 14px", borderRadius: 999, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--coral)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
        >
          <Icon name="trash" size={13} /> Delete forever
        </button>
      </div>
    </article>
  );
}

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.max(0, Math.floor((now - then) / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}
