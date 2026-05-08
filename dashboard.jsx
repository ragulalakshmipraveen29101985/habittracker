// Dashboard — list of tracker cards + create-new card.
const { useMemo: useDashMemo } = React;

function Dashboard({ user, trackers, completionsByTracker, onOpen, onCreate, onLogout, onDelete }) {
  const stats = useDashMemo(() => {
    let totalDone = 0, totalSlots = 0, longest = 0;
    trackers.forEach((t) => {
      const days = buildMonthDays(t.year, t.monthIdx);
      const today = new Date();
      const sameMonth = today.getFullYear() === t.year && today.getMonth() === t.monthIdx;
      const cap = sameMonth ? today.getDate() : days.length;
      t.habits.forEach((h) => {
        const set = completionsByTracker[t.id]?.[h.id] || new Set();
        for (let d = 1; d <= cap; d++) {
          totalSlots++;
          if (set.has(d)) totalDone++;
        }
        // streak: longest run ending today (or month end)
        let run = 0;
        for (let d = cap; d >= 1; d--) {
          if (set.has(d)) run++; else break;
        }
        longest = Math.max(longest, run);
      });
    });
    return { pct: pct(totalDone, totalSlots), totalDone, longest, count: trackers.length };
  }, [trackers, completionsByTracker]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Top bar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", borderBottom: "1px solid var(--line)",
        background: "var(--cream)", position: "sticky", top: 0, zIndex: 5,
      }}>
        <Logo size={20} />
        <nav style={{ display: "flex", gap: 22, fontSize: 13.5, color: "var(--ink-soft)" }}>
          <a href="#" onClick={(e)=>e.preventDefault()} style={{ color: "var(--ink)", fontWeight: 500 }}>Trackers</a>
          <a href="#" onClick={(e)=>e.preventDefault()} style={{ color: "var(--ink-soft)" }}>Insights</a>
          <a href="#" onClick={(e)=>e.preventDefault()} style={{ color: "var(--ink-soft)" }}>Archive</a>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button kind="ghost" size="sm" icon="logout" onClick={onLogout}>Sign out</Button>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "var(--ink)", color: "var(--paper)",
            display: "grid", placeItems: "center", fontSize: 13, fontWeight: 500,
          }}>{(user?.name || "A").charAt(0).toUpperCase()}</div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 80px" }}>
        {/* Hero */}
        <section style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40, marginBottom: 36 }}>
          <div>
            <p className="mono" style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: "var(--ink-mute)", margin: 0 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="serif" style={{ fontSize: 52, lineHeight: 1.05, margin: "10px 0 0", letterSpacing: "-0.02em" }}>
              Hello, <span className="it">{user?.name || "friend"}</span>.
            </h1>
            <p style={{ color: "var(--ink-soft)", margin: "10px 0 0", fontSize: 15.5 }}>
              You've kept {stats.totalDone} ticks across {stats.count} tracker{stats.count === 1 ? "" : "s"} this month.
            </p>
          </div>

          {/* stats strip */}
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <Stat label="This month" value={`${stats.pct}%`} />
            <Divider/>
            <Stat label="Longest streak" value={`${stats.longest}d`} />
            <Divider/>
            <Stat label="Trackers" value={stats.count} />
          </div>
        </section>

        {/* Trackers grid */}
        <section>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="serif" style={{ fontSize: 24, margin: 0, letterSpacing: "-0.01em" }}>Your trackers</h2>
            <Button kind="primary" size="sm" icon="plus" onClick={onCreate}>New tracker</Button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: 18,
          }}>
            {trackers.map((t) => (
              <TrackerCard key={t.id} tracker={t}
                completions={completionsByTracker[t.id] || {}}
                onOpen={() => onOpen(t.id)}
                onDelete={() => onDelete(t.id)} />
            ))}
            <CreateCard onClick={onCreate} />
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-mute)", letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
      <div className="serif" style={{ fontSize: 30, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
    </div>
  );
}
const Divider = () => <div style={{ width: 1, height: 36, background: "var(--line-strong)" }}/>;

function TrackerCard({ tracker, completions, onOpen, onDelete }) {
  const days = buildMonthDays(tracker.year, tracker.monthIdx);
  const today = new Date();
  const sameMonth = today.getFullYear() === tracker.year && today.getMonth() === tracker.monthIdx;
  const cap = sameMonth ? today.getDate() : days.length;

  let done = 0, total = 0;
  tracker.habits.forEach((h) => {
    const set = completions[h.id] || new Set();
    total += cap;
    for (let d = 1; d <= cap; d++) if (set.has(d)) done++;
  });
  const percent = pct(done, total);
  const accentColor = ({ sage: "var(--sage-deep)", coral: "var(--coral)", navy: "var(--navy-2)" })[tracker.accent] || "var(--sage-deep)";

  return (
    <article
      onClick={onOpen}
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 22,
        cursor: "pointer",
        transition: "transform .15s ease, border-color .15s ease, box-shadow .2s ease",
        position: "relative",
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
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center",
              background: accentColor, color: "var(--paper)", fontSize: 14,
            }}>{tracker.emoji}</span>
            <Pill tone="cream">{MONTH_NAMES[tracker.monthIdx]} {tracker.year}</Pill>
          </div>
          <h3 className="serif" style={{ fontSize: 22, margin: "4px 0 2px", letterSpacing: "-0.01em" }}>{tracker.name}</h3>
          <p style={{ color: "var(--ink-soft)", margin: 0, fontSize: 13 }}>
            {tracker.habits.length} habit{tracker.habits.length === 1 ? "" : "s"} · {cap} day{cap === 1 ? "" : "s"} tracked
          </p>
        </div>
        <Ring value={percent} size={56} stroke={5} color={accentColor} />
      </div>

      <div style={{ marginTop: 18 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 8 }}>
          Days this month
        </div>
        <MiniHeatmap tracker={tracker} completions={completions} color={accentColor}/>
      </div>

      <div style={{
        marginTop: 18, paddingTop: 14, borderTop: "1px dashed var(--line)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-soft)" }}>
          <Icon name="flame" size={14} stroke={1.6}/>
          <span>{computeBestHabit(tracker, completions)}</span>
        </div>
        <button
          onClick={(e)=>{ e.stopPropagation(); if (confirm(`Delete "${tracker.name}"?`)) onDelete(); }}
          aria-label="Delete tracker"
          style={{
            background: "transparent", border: "none", color: "var(--ink-mute)",
            display: "grid", placeItems: "center", padding: 4, borderRadius: 6,
          }}
          onMouseEnter={(e)=>e.currentTarget.style.color="var(--coral)"}
          onMouseLeave={(e)=>e.currentTarget.style.color="var(--ink-mute)"}
        >
          <Icon name="trash" size={15} />
        </button>
      </div>
    </article>
  );
}

function computeBestHabit(tracker, completions) {
  const today = new Date();
  const sameMonth = today.getFullYear() === tracker.year && today.getMonth() === tracker.monthIdx;
  const cap = sameMonth ? today.getDate() : daysInMonth(tracker.year, tracker.monthIdx);
  let bestName = "—", bestPct = -1;
  tracker.habits.forEach((h) => {
    const set = completions[h.id] || new Set();
    let done = 0;
    for (let d = 1; d <= cap; d++) if (set.has(d)) done++;
    const p = pct(done, cap);
    if (p > bestPct) { bestPct = p; bestName = h.name; }
  });
  return `Strongest: ${bestName} (${bestPct}%)`;
}

function CreateCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        border: "1.5px dashed var(--line-strong)",
        borderRadius: 14,
        padding: 22,
        minHeight: 240,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
        color: "var(--ink-soft)", cursor: "pointer",
        transition: "all .15s ease",
      }}
      onMouseEnter={(e)=>{ e.currentTarget.style.borderColor="var(--ink)"; e.currentTarget.style.color="var(--ink)"; }}
      onMouseLeave={(e)=>{ e.currentTarget.style.borderColor="var(--line-strong)"; e.currentTarget.style.color="var(--ink-soft)"; }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "1px solid currentColor", display: "grid", placeItems: "center",
      }}>
        <Icon name="plus" size={20}/>
      </div>
      <div className="serif" style={{ fontSize: 20 }}>New tracker</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-mute)", maxWidth: 220, textAlign: "center" }}>
        Pick a name, list the habits you want to keep, and start ticking.
      </div>
    </button>
  );
}

window.Dashboard = Dashboard;
