import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  accentColor, MONTH_NAMES, buildMonthDays, isCurrentMonth, pct,
} from "@streak/shared";
import type { Tracker } from "@streak/shared";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { Pill } from "../components/Pill";
import { Ring } from "../components/Ring";
import { Icon } from "../components/Icon";
import { useAuth } from "../state/AuthContext";
import {
  listTrackers, deleteTracker, fetchCompletions, createTracker,
} from "../api/trackers";
import { CreateTrackerModal } from "../modals/CreateTrackerModal";
import { ProfileModal } from "../modals/ProfileModal";
import { ThemeModal } from "../modals/ThemeModal";

type CompletionsByTracker = Map<string, Map<string, Set<number>>>;

export function Dashboard() {
  const nav = useNavigate();
  const { user, signOut } = useAuth();
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [completionsByTracker, setCompletionsByTracker] = useState<CompletionsByTracker>(new Map());
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTheme, setShowTheme] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const today = new Date();
  const Y = today.getFullYear();
  const M = today.getMonth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const ts = await listTrackers();
        if (cancelled) return;
        setTrackers(ts);
        // Fetch this month's completions for each tracker in parallel
        const days = buildMonthDays(Y, M);
        const from = days[0].iso;
        const to = days[days.length - 1].iso;
        const map: CompletionsByTracker = new Map();
        await Promise.all(
          ts.map(async (t) => {
            const comps = await fetchCompletions(t.id, from, to);
            const byHabit = new Map<string, Set<number>>();
            t.habits.forEach((h) => byHabit.set(h.id, new Set()));
            comps.forEach((c) => {
              const day = parseInt(c.date.slice(8, 10), 10);
              const set = byHabit.get(c.habitId) ?? new Set<number>();
              set.add(day);
              byHabit.set(c.habitId, set);
            });
            map.set(t.id, byHabit);
          }),
        );
        if (!cancelled) setCompletionsByTracker(map);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [Y, M]);

  const stats = useMemo(() => {
    let totalDone = 0, totalSlots = 0, longest = 0;
    const t0 = new Date();
    trackers.forEach((t) => {
      const days = buildMonthDays(Y, M);
      const sameMonth = isCurrentMonth(Y, M);
      const cap = sameMonth ? t0.getDate() : days.length;
      const byHabit = completionsByTracker.get(t.id) ?? new Map();
      t.habits.forEach((h) => {
        const set: Set<number> = byHabit.get(h.id) ?? new Set();
        for (let d = 1; d <= cap; d++) {
          totalSlots++;
          if (set.has(d)) totalDone++;
        }
        let run = 0;
        for (let d = cap; d >= 1; d--) {
          if (set.has(d)) run++;
          else break;
        }
        longest = Math.max(longest, run);
      });
    });
    return { pct: pct(totalDone, totalSlots), totalDone, longest, count: trackers.length };
  }, [trackers, completionsByTracker, Y, M]);

  const handleDelete = async (id: string) => {
    const t = trackers.find((x) => x.id === id);
    if (!t) return;
    if (!confirm(`Move "${t.name}" to Archive? You can restore it later from your profile menu.`)) return;
    await deleteTracker(id);
    setTrackers((prev) => prev.filter((x) => x.id !== id));
    setCompletionsByTracker((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const handleCreate = async (data: { name: string; emoji: string; accent: "sage" | "coral" | "navy"; habits: string[] }) => {
    const created = await createTracker({
      name: data.name,
      emoji: data.emoji,
      accent: data.accent,
      habits: data.habits.map((n) => ({ name: n })),
    });
    setTrackers((prev) => [...prev, created]);
    setCompletionsByTracker((prev) => {
      const next = new Map(prev);
      const byHabit = new Map<string, Set<number>>();
      created.habits.forEach((h) => byHabit.set(h.id, new Set()));
      next.set(created.id, byHabit);
      return next;
    });
    setShowCreate(false);
    nav(`/tracker/${created.id}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header className="dash-header">
        <Logo size={20} />
        <nav style={{ display: "flex", gap: 22, fontSize: 13.5, color: "var(--bg-text-soft)" }}>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--bg-text)", fontWeight: 500 }}>Trackers</a>
        </nav>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--ink)", color: "var(--paper)",
              display: "grid", placeItems: "center",
              fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
            }}
          >
            {((user?.firstName || user?.name || user?.email) ?? "·")
              .charAt(0)
              .toUpperCase()}
          </button>
          {menuOpen && (
            <>
              <div
                onClick={() => setMenuOpen(false)}
                style={{ position: "fixed", inset: 0, zIndex: 8 }}
              />
              <div
                role="menu"
                style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  minWidth: 200, background: "var(--paper)",
                  border: "1px solid var(--line)", borderRadius: 12,
                  boxShadow: "0 14px 40px rgba(27,26,22,0.12)",
                  zIndex: 9, overflow: "hidden",
                  animation: "fadeIn .12s ease",
                }}
              >
                <MenuItem
                  icon="settings"
                  label="Profile"
                  onClick={() => { setMenuOpen(false); setShowProfile(true); }}
                />
                <MenuItem
                  icon="palette"
                  label="Theme"
                  onClick={() => { setMenuOpen(false); setShowTheme(true); }}
                />
                <MenuItem
                  icon="trash"
                  label="Archive"
                  onClick={() => { setMenuOpen(false); nav("/archive"); }}
                />
                <div style={{ height: 1, background: "var(--line)" }} />
                <MenuItem
                  icon="logout"
                  label="Sign out"
                  onClick={() => { setMenuOpen(false); signOut(); }}
                />
              </div>
            </>
          )}
        </div>
      </header>

      <div className="dash-content">
        <section className="dash-hero">
          <div>
            <p className="mono" style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: "var(--bg-text-mute)", margin: 0 }}>
              {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="serif" style={{ fontSize: 52, lineHeight: 1.05, margin: "10px 0 0", letterSpacing: "-0.02em" }}>
              Hello, <span className="it">{user?.name || "friend"}</span>.
            </h1>
            <p style={{ color: "var(--bg-text-soft)", margin: "10px 0 0", fontSize: 15.5 }}>
              You've kept {stats.totalDone} ticks across {stats.count} tracker{stats.count === 1 ? "" : "s"} this month.
            </p>
          </div>

          <div className="stats-strip" style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <Stat label="This month" value={`${stats.pct}%`} />
            <Divider />
            <Stat label="Longest streak" value={`${stats.longest}d`} />
            <Divider />
            <Stat label="Trackers" value={stats.count} />
          </div>
        </section>

        <section>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="serif" style={{ fontSize: 24, margin: 0, letterSpacing: "-0.01em" }}>Your trackers</h2>
            <Button kind="primary" size="sm" icon="plus" onClick={() => setShowCreate(true)}>New tracker</Button>
          </div>

          {loading ? (
            <p style={{ color: "var(--bg-text-mute)" }}>Loading…</p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 480px))",
              justifyContent: "center",
              gap: 18,
            }}>
              {trackers.map((t) => (
                <TrackerCard
                  key={t.id}
                  tracker={t}
                  year={Y}
                  monthIdx={M}
                  completedByHabit={completionsByTracker.get(t.id) ?? new Map()}
                  onOpen={() => nav(`/tracker/${t.id}`)}
                  onDelete={() => handleDelete(t.id)}
                />
              ))}
              <CreateCard onClick={() => setShowCreate(true)} />
            </div>
          )}
        </section>
      </div>

      {showCreate && (
        <CreateTrackerModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showTheme && <ThemeModal onClose={() => setShowTheme(false)} />}
    </div>
  );
}

function MenuItem({
  icon, label, onClick,
}: {
  icon: "settings" | "trash" | "logout" | "palette";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "10px 14px",
        background: "transparent", border: "none",
        color: "var(--ink)", fontSize: 13.5, textAlign: "left",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cream)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <Icon name={icon} size={14} />
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div className="mono" style={{ fontSize: 10.5, color: "var(--bg-text-mute)", letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
      <div className="serif" style={{ fontSize: 30, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function Divider() { return <div style={{ width: 1, height: 36, background: "var(--bg-line-strong)" }} />; }

interface CardProps {
  tracker: Tracker;
  year: number;
  monthIdx: number;
  completedByHabit: Map<string, Set<number>>;
  onOpen: () => void;
  onDelete: () => void;
}

function TrackerCard({ tracker, year, monthIdx, completedByHabit, onOpen, onDelete }: CardProps) {
  const days = buildMonthDays(year, monthIdx);
  const sameMonth = isCurrentMonth(year, monthIdx);
  const cap = sameMonth ? new Date().getDate() : days.length;

  let done = 0, total = 0;
  tracker.habits.forEach((h) => {
    const set = completedByHabit.get(h.id) ?? new Set();
    total += cap;
    for (let d = 1; d <= cap; d++) if (set.has(d)) done++;
  });
  const percent = pct(done, total);
  const ac = accentColor(tracker.accent, true);

  let bestName = "—", bestPct = -1;
  tracker.habits.forEach((h) => {
    const set = completedByHabit.get(h.id) ?? new Set();
    let d = 0;
    for (let i = 1; i <= cap; i++) if (set.has(i)) d++;
    const p = pct(d, cap);
    if (p > bestPct) { bestPct = p; bestName = h.name; }
  });

  return (
    <article
      onClick={onOpen}
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 22,
        cursor: "pointer",
        transition: "transform .15s ease, border-color .15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--ink)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center",
              background: ac, color: "var(--paper)", fontSize: 14, flexShrink: 0,
            }}>{tracker.emoji}</span>
            <Pill tone="cream">{MONTH_NAMES[monthIdx]} {year}</Pill>
          </div>
          <h3 className="serif" style={{ fontSize: 22, margin: "4px 0 2px", letterSpacing: "-0.01em" }}>{tracker.name}</h3>
          <p style={{ color: "var(--ink-soft)", margin: 0, fontSize: 13 }}>
            {tracker.habits.length} habit{tracker.habits.length === 1 ? "" : "s"} · {cap} day{cap === 1 ? "" : "s"} tracked
          </p>
        </div>
        <Ring value={percent} size={56} stroke={5} color={ac} />
      </div>

      <div style={{
        marginTop: 18, paddingTop: 14, borderTop: "1px dashed var(--line)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-soft)" }}>
          <Icon name="flame" size={14} />
          <span>Strongest: {bestName} ({bestPct < 0 ? 0 : bestPct}%)</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label="Delete tracker"
          style={{
            background: "transparent", border: "none", color: "var(--ink-mute)",
            display: "grid", placeItems: "center", padding: 4, borderRadius: 6, cursor: "pointer",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--coral)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--ink-mute)"}
        >
          <Icon name="trash" size={15} />
        </button>
      </div>
    </article>
  );
}

function CreateCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        border: "1.5px dashed var(--bg-line-strong)",
        borderRadius: 14,
        padding: 22,
        minHeight: 240,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
        color: "var(--bg-text-soft)", cursor: "pointer",
        transition: "all .15s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--bg-text)"; e.currentTarget.style.color = "var(--bg-text)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--bg-line-strong)"; e.currentTarget.style.color = "var(--bg-text-soft)"; }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "1px solid currentColor", display: "grid", placeItems: "center",
      }}>
        <Icon name="plus" size={20} />
      </div>
      <div className="serif" style={{ fontSize: 20 }}>New tracker</div>
      <div style={{ fontSize: 12.5, color: "var(--bg-text-mute)", maxWidth: 220, textAlign: "center" }}>
        Pick a name, list the habits you want to keep, and start ticking.
      </div>
    </button>
  );
}
