// Tracker detail — the Excel-style matrix + pictorial weekly summary.
const { useMemo: useTrkMemo, useState: useTrkState, useRef: useTrkRef, useEffect: useTrkEff } = React;

function TrackerScreen({ tracker, completions, onBack, onToggle, onUpdateTracker, onAddHabit, onRemoveHabit, onRenameHabit, onChangeMonth }) {
  const days = useTrkMemo(() => buildMonthDays(tracker.year, tracker.monthIdx), [tracker]);
  const weeks = useTrkMemo(() => groupIntoWeeks(days), [days]);
  const accentColor = ({ sage: "var(--sage-deep)", coral: "var(--coral)", navy: "var(--navy-2)" })[tracker.accent] || "var(--sage-deep)";
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === tracker.year && today.getMonth() === tracker.monthIdx;
  const todayDay = isCurrentMonth ? today.getDate() : null;

  const [editingName, setEditingName] = useTrkState(false);
  const [draftName, setDraftName] = useTrkState(tracker.name);
  const [showAdd, setShowAdd] = useTrkState(false);
  const [newHabit, setNewHabit] = useTrkState("");
  const [editHabitId, setEditHabitId] = useTrkState(null);
  const [editHabitDraft, setEditHabitDraft] = useTrkState("");

  // ---- summary computations ----
  const summary = useTrkMemo(() => {
    const cap = isCurrentMonth ? todayDay : days.length;
    let totalDone = 0, totalSlots = 0;
    const perHabit = {};
    const perDayCount = {}; // day -> count
    const perWeekday = [0,0,0,0,0,0,0]; // count of completions per weekday
    const perWeekdaySlots = [0,0,0,0,0,0,0];

    tracker.habits.forEach((h) => {
      const set = completions[h.id] || new Set();
      let done = 0;
      for (let d = 1; d <= cap; d++) {
        totalSlots++;
        const wd = days[d-1]?.weekday ?? 0;
        perWeekdaySlots[wd]++;
        perDayCount[d] = (perDayCount[d] || 0);
        if (set.has(d)) {
          totalDone++; done++;
          perDayCount[d]++;
          perWeekday[wd]++;
        }
      }
      // current streak (consecutive days back from cap)
      let cur = 0;
      for (let d = cap; d >= 1; d--) {
        if (set.has(d)) cur++; else break;
      }
      // longest streak in month
      let longest = 0, run = 0;
      for (let d = 1; d <= cap; d++) {
        if (set.has(d)) { run++; longest = Math.max(longest, run); } else { run = 0; }
      }
      perHabit[h.id] = { done, cap, pct: pct(done, cap), streak: cur, longest };
    });

    // best/worst weekdays
    const weekdayPct = perWeekdaySlots.map((s, i) => s ? Math.round((perWeekday[i]/s)*100) : 0);
    let bestWd = 0, worstWd = 0;
    for (let i = 1; i < 7; i++) {
      if (weekdayPct[i] > weekdayPct[bestWd]) bestWd = i;
      if (weekdayPct[i] < weekdayPct[worstWd]) worstWd = i;
    }
    return {
      cap, totalDone, totalSlots,
      pct: pct(totalDone, totalSlots),
      perHabit, perDayCount, weekdayPct, bestWd, worstWd,
    };
  }, [tracker, completions, days, isCurrentMonth, todayDay]);

  const saveName = () => {
    setEditingName(false);
    if (draftName.trim() && draftName !== tracker.name) {
      onUpdateTracker({ ...tracker, name: draftName.trim() });
    } else { setDraftName(tracker.name); }
  };

  const submitNewHabit = () => {
    const v = newHabit.trim();
    if (!v) return;
    onAddHabit(v);
    setNewHabit("");
    setShowAdd(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", borderBottom: "1px solid var(--line)",
        background: "var(--cream)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Button kind="ghost" size="sm" icon="back" onClick={onBack}>Trackers</Button>
          <div style={{ width: 1, height: 22, background: "var(--line-strong)" }}/>
          <span style={{
            width: 26, height: 26, borderRadius: 7, display: "grid", placeItems: "center",
            background: accentColor, color: "var(--paper)", fontSize: 13,
          }}>{tracker.emoji}</span>
          {editingName ? (
            <input
              autoFocus value={draftName} onChange={(e)=>setDraftName(e.target.value)}
              onBlur={saveName} onKeyDown={(e)=>{ if (e.key==="Enter") saveName(); if (e.key==="Escape") { setDraftName(tracker.name); setEditingName(false); } }}
              className="serif"
              style={{ fontSize: 22, background: "transparent", border: "none", outline: "1px solid var(--line-strong)", outlineOffset: 4, borderRadius: 4, padding: 0, color: "var(--ink)", width: 320 }}
            />
          ) : (
            <h2 className="serif" style={{ fontSize: 22, margin: 0, letterSpacing: "-0.01em", cursor: "text" }}
                onClick={()=>setEditingName(true)}>
              {tracker.name}
            </h2>
          )}
        </div>

        <MonthSwitcher tracker={tracker} onChangeMonth={onChangeMonth}/>

        <div style={{ display: "flex", gap: 8 }}>
          {todayDay && <Button kind="ghost" size="sm" onClick={() => {
            const el = document.querySelector(`[data-day="${todayDay}"]`);
            const scroller = el?.closest('[data-grid-scroll]');
            if (el && scroller) {
              const left = el.offsetLeft - scroller.clientWidth / 2 + el.clientWidth / 2;
              scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
            }
          }}>Today</Button>}
          <Button kind="secondary" size="sm" icon="plus" onClick={()=>setShowAdd(true)}>Add habit</Button>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 40px 80px" }}>

        {/* Stat strip */}
        <section style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28,
        }}>
          <StatCard label="Completion" value={`${summary.pct}%`} sub={`${summary.totalDone} of ${summary.totalSlots} ticks`} ring={summary.pct} color={accentColor}/>
          <StatCard label="Days tracked" value={summary.cap} sub={`of ${days.length} in ${MONTH_NAMES[tracker.monthIdx]}`}/>
          <StatCard label="Best weekday" value={DAY_SHORT[summary.bestWd]} sub={`${summary.weekdayPct[summary.bestWd]}% avg completion`}/>
          <StatCard label="Toughest day" value={DAY_SHORT[summary.worstWd]} sub={`${summary.weekdayPct[summary.worstWd]}% avg completion`} tone="coral"/>
        </section>

        {/* Matrix */}
        <section style={{ marginBottom: 36 }}>
          <SectionLabel kicker="01 — daily" title="The Grid" hint="Click any cell to toggle a habit for that day."/>
          <div style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            overflow: "hidden",
          }}>
            <MatrixGrid
              tracker={tracker}
              days={days}
              weeks={weeks}
              completions={completions}
              accentColor={accentColor}
              todayDay={todayDay}
              onToggle={onToggle}
              onRemoveHabit={onRemoveHabit}
              editHabitId={editHabitId}
              setEditHabitId={setEditHabitId}
              editHabitDraft={editHabitDraft}
              setEditHabitDraft={setEditHabitDraft}
              onRenameHabit={onRenameHabit}
              summary={summary}
            />
          </div>
        </section>

        {/* Pictorial weekly view */}
        <section>
          <SectionLabel kicker="02 — pictorial" title="Weeks at a glance" hint="A dot per day. Filled = done. Empty = missed."/>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}>
            {weeks.map((wk, wi) => (
              <WeekCard key={wi} weekIdx={wi} weekDays={wk} tracker={tracker} completions={completions} accent={accentColor} todayDay={todayDay}/>
            ))}
          </div>
        </section>

      </div>

      {showAdd && (
        <Modal onClose={()=>{ setShowAdd(false); setNewHabit(""); }}>
          <h3 className="serif" style={{ fontSize: 26, margin: "0 0 6px" }}>Add a new habit</h3>
          <p style={{ color: "var(--ink-soft)", margin: "0 0 18px", fontSize: 14 }}>
            Keep it concrete and small. "Read 10 pages" beats "read more".
          </p>
          <input autoFocus value={newHabit} onChange={(e)=>setNewHabit(e.target.value)}
            placeholder="e.g. Walk after dinner"
            onKeyDown={(e)=>{ if (e.key==="Enter") submitNewHabit(); }}
            style={{
              width: "100%", padding: "12px 14px", fontSize: 15,
              background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 10, outline: "none",
            }}/>
          <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button kind="ghost" size="sm" onClick={()=>{ setShowAdd(false); setNewHabit(""); }}>Cancel</Button>
            <Button kind="primary" size="sm" onClick={submitNewHabit}>Add habit</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---- Section label ----
function SectionLabel({ kicker, title, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-mute)", letterSpacing: 1.2, textTransform: "uppercase" }}>{kicker}</span>
        <h3 className="serif" style={{ fontSize: 22, margin: 0, letterSpacing: "-0.01em" }}>{title}</h3>
      </div>
      {hint && <span style={{ fontSize: 12.5, color: "var(--ink-mute)" }}>{hint}</span>}
    </div>
  );
}

function StatCard({ label, value, sub, ring, color = "var(--sage-deep)", tone }) {
  return (
    <div style={{
      background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12,
      padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
    }}>
      <div>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-mute)", letterSpacing: 1.2, textTransform: "uppercase" }}>{label}</div>
        <div className="serif" style={{ fontSize: 32, lineHeight: 1.1, marginTop: 4, color: tone === "coral" ? "var(--coral)" : "var(--ink)" }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>{sub}</div>
      </div>
      {ring !== undefined && <Ring value={ring} size={56} stroke={5} color={color}/>}
    </div>
  );
}

function MonthSwitcher({ tracker, onChangeMonth }) {
  const prev = () => {
    let m = tracker.monthIdx - 1, y = tracker.year;
    if (m < 0) { m = 11; y--; }
    onChangeMonth(m, y);
  };
  const next = () => {
    let m = tracker.monthIdx + 1, y = tracker.year;
    if (m > 11) { m = 0; y++; }
    onChangeMonth(m, y);
  };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 999, padding: 4 }}>
      <button onClick={prev} aria-label="Previous month" style={navBtnStyle}><Icon name="back" size={14}/></button>
      <div className="serif" style={{ padding: "2px 12px", fontSize: 16, letterSpacing: "-0.01em" }}>
        {MONTH_NAMES[tracker.monthIdx]} <span style={{ color: "var(--ink-mute)" }}>{tracker.year}</span>
      </div>
      <button onClick={next} aria-label="Next month" style={navBtnStyle}><Icon name="chev" size={14}/></button>
    </div>
  );
}
const navBtnStyle = {
  width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent",
  display: "grid", placeItems: "center", color: "var(--ink-soft)", cursor: "pointer",
};

// ---- Matrix grid ----
function MatrixGrid({ tracker, days, weeks, completions, accentColor, todayDay, onToggle, onRemoveHabit, editHabitId, setEditHabitId, editHabitDraft, setEditHabitDraft, onRenameHabit, summary }) {
  const habitColWidth = 220;
  const cellSize = 30; // square cell

  return (
    <div data-grid-scroll style={{ overflowX: "auto" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `${habitColWidth}px repeat(${days.length}, ${cellSize}px) 70px`,
        minWidth: habitColWidth + days.length * cellSize + 70,
      }}>
        {/* Row 1: week banner */}
        <div style={{ ...stickyLeftHeader, background: "var(--navy)", color: "var(--paper)", borderTopLeftRadius: 14 }}>
          <span className="mono" style={{ fontSize: 10.5, letterSpacing: 1.4, textTransform: "uppercase", opacity: 0.85 }}>Habits</span>
        </div>
        {weeks.map((wk, wi) => (
          <div key={`wk-${wi}`} style={{
            gridColumn: `span ${wk.length}`,
            background: "var(--navy)", color: "var(--paper)",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderLeft: wi === 0 ? "none" : "1px solid rgba(255,255,255,0.12)",
            padding: "10px 0",
            fontSize: 12, letterSpacing: 0.4,
          }}>
            <span className="mono" style={{ fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.85 }}>Week {wi+1}</span>
          </div>
        ))}
        <div style={{ background: "var(--navy)", color: "var(--paper)", borderTopRightRadius: 14, display: "grid", placeItems: "center" }}>
          <span className="mono" style={{ fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.85 }}>Total</span>
        </div>

        {/* Row 2: day labels */}
        <div style={{ ...stickyLeftHeader, background: "var(--navy-2)", color: "var(--paper)" }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Daily ticks</span>
        </div>
        {days.map((d) => {
          const isToday = d.day === todayDay;
          return (
            <div key={`d-${d.day}`} data-day={d.day}
              style={{
                background: isToday ? accentColor : "var(--navy-2)",
                color: "var(--paper)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "6px 0", lineHeight: 1.05,
                borderLeft: d.day === 1 ? "none" : "1px solid rgba(255,255,255,0.08)",
                position: "relative",
              }}>
              <span style={{ fontSize: 9.5, letterSpacing: 0.5, opacity: 0.78, textTransform: "uppercase" }}>{DAY_SHORT[d.weekday]}</span>
              <span className="mono" style={{ fontSize: 11.5, fontWeight: 500 }}>{d.day}</span>
            </div>
          );
        })}
        <div style={{ background: "var(--navy-2)", color: "var(--paper)", display: "grid", placeItems: "center" }}>
          <span className="mono" style={{ fontSize: 10.5, opacity: 0.85 }}>%</span>
        </div>

        {/* Habit rows */}
        {tracker.habits.map((h, hi) => {
          const set = completions[h.id] || new Set();
          const stat = summary.perHabit[h.id];
          const rowBg = hi % 2 === 0 ? "var(--paper)" : "rgba(236, 229, 214, 0.35)";
          return (
            <React.Fragment key={h.id}>
              {/* Habit name (sticky left) */}
              <div style={{
                ...stickyLeftCell, background: rowBg,
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                paddingLeft: 16, paddingRight: 10,
              }}>
                {editHabitId === h.id ? (
                  <input
                    autoFocus value={editHabitDraft}
                    onChange={(e)=>setEditHabitDraft(e.target.value)}
                    onBlur={()=>{ if (editHabitDraft.trim()) onRenameHabit(h.id, editHabitDraft.trim()); setEditHabitId(null); }}
                    onKeyDown={(e)=>{
                      if (e.key === "Enter") { if (editHabitDraft.trim()) onRenameHabit(h.id, editHabitDraft.trim()); setEditHabitId(null); }
                      if (e.key === "Escape") setEditHabitId(null);
                    }}
                    style={{ flex: 1, background: "transparent", border: "none", outline: "1px solid var(--line-strong)", borderRadius: 4, fontSize: 13.5, color: "var(--ink)", padding: "2px 4px" }}
                  />
                ) : (
                  <div onClick={()=>{ setEditHabitId(h.id); setEditHabitDraft(h.name); }}
                    style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: "var(--ink)", cursor: "text",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {h.name}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="mono" title={`Streak: ${stat.streak} day${stat.streak===1?"":"s"} (longest ${stat.longest})`}
                    style={{ fontSize: 10.5, color: "var(--ink-mute)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <Icon name="flame" size={11} stroke={1.6}/>{stat.streak}
                  </span>
                  <button onClick={()=>{ if (confirm(`Remove "${h.name}"?`)) onRemoveHabit(h.id); }}
                    style={{ background: "transparent", border: "none", color: "var(--ink-mute)", cursor: "pointer", padding: 2, display: "grid", placeItems: "center" }}
                    aria-label="Remove habit"
                    onMouseEnter={(e)=>e.currentTarget.style.color="var(--coral)"}
                    onMouseLeave={(e)=>e.currentTarget.style.color="var(--ink-mute)"}>
                    <Icon name="x" size={13}/>
                  </button>
                </div>
              </div>

              {/* Cells */}
              {days.map((d) => {
                const done = set.has(d.day);
                const isToday = d.day === todayDay;
                const weekendBg = (d.weekday === 0 || d.weekday === 6) ? "rgba(31,42,68,0.025)" : "transparent";
                return (
                  <button key={`${h.id}-${d.day}`}
                    onClick={()=>onToggle(h.id, d.day)}
                    title={`${h.name} · ${DAY_SHORT[d.weekday]} ${d.day}`}
                    style={{
                      background: rowBg,
                      backgroundImage: `linear-gradient(${weekendBg}, ${weekendBg})`,
                      border: "none",
                      borderLeft: d.day === 1 ? "none" : "1px solid var(--line)",
                      borderTop: "1px solid var(--line)",
                      padding: 0, cursor: "pointer",
                      display: "grid", placeItems: "center",
                      position: "relative",
                    }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: 4,
                      border: `1.5px solid ${done ? accentColor : "var(--line-strong)"}`,
                      background: done ? accentColor : "transparent",
                      display: "grid", placeItems: "center",
                      transition: "all .12s ease",
                      transform: done ? "scale(1)" : "scale(0.96)",
                    }}>
                      {done && <Icon name="check" size={12} stroke={2.4} style={{ color: "var(--paper)" }}/>}
                    </span>
                    {isToday && (
                      <span style={{
                        position: "absolute", inset: 0, pointerEvents: "none",
                        boxShadow: `inset 0 -2px 0 ${accentColor}`,
                      }}/>
                    )}
                  </button>
                );
              })}

              {/* Total cell */}
              <div style={{
                background: rowBg, borderTop: "1px solid var(--line)", borderLeft: "1px solid var(--line)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <span className="mono" style={{ fontSize: 12, color: stat.pct >= 70 ? accentColor : stat.pct >= 40 ? "var(--ink)" : "var(--ink-mute)", fontWeight: 500 }}>
                  {stat.pct}%
                </span>
              </div>
            </React.Fragment>
          );
        })}

        {/* Footer summary row: Task Completed / % Completion (per-day) */}
        <div style={{ ...stickyLeftCell, background: "var(--cream-2)", borderTop: "1.5px solid var(--line-strong)", paddingLeft: 16,
            display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: "var(--ink-mute)" }}>Day total</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>tasks · % of habits</div>
        </div>
        {days.map((d) => {
          const c = summary.perDayCount[d.day] || 0;
          const total = tracker.habits.length;
          const p = pct(c, total);
          const cap = summary.cap;
          const inFuture = todayDay && d.day > todayDay;
          return (
            <div key={`tot-${d.day}`} style={{
              background: "var(--cream-2)",
              borderTop: "1.5px solid var(--line-strong)",
              borderLeft: d.day === 1 ? "none" : "1px solid var(--line)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "6px 0", opacity: inFuture ? 0.35 : 1,
            }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink)", fontWeight: 500 }}>{inFuture ? "–" : c}</span>
              <span className="mono" style={{ fontSize: 9, color: "var(--ink-mute)" }}>{inFuture ? "" : `${p}%`}</span>
            </div>
          );
        })}
        <div style={{ background: "var(--cream-2)", borderTop: "1.5px solid var(--line-strong)", borderLeft: "1px solid var(--line)",
            display: "grid", placeItems: "center", padding: "8px 0" }}>
          <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{summary.pct}%</span>
        </div>
      </div>
    </div>
  );
}

const stickyLeftHeader = {
  position: "sticky", left: 0, zIndex: 3,
  display: "flex", alignItems: "center",
  padding: "10px 16px",
};
const stickyLeftCell = {
  position: "sticky", left: 0, zIndex: 2,
  borderTop: "1px solid var(--line)",
  minHeight: 40,
};

// ---- Pictorial weekly card ----
function WeekCard({ weekIdx, weekDays, tracker, completions, accent, todayDay }) {
  // overall completion this week
  const slots = weekDays.length * tracker.habits.length;
  let done = 0;
  tracker.habits.forEach((h) => {
    const set = completions[h.id] || new Set();
    weekDays.forEach((d) => { if (set.has(d.day)) done++; });
  });
  const overall = pct(done, slots);

  // sort habits by descending pct this week
  const habitStats = tracker.habits.map((h) => {
    const set = completions[h.id] || new Set();
    let d = 0;
    weekDays.forEach((dd) => { if (set.has(dd.day)) d++; });
    return { h, done: d, total: weekDays.length, pct: pct(d, weekDays.length), set };
  }).sort((a,b)=> b.pct - a.pct);

  const startLabel = `${MONTH_NAMES[tracker.monthIdx].slice(0,3)} ${weekDays[0].day}`;
  const endLabel = `${weekDays[weekDays.length-1].day}`;
  const hasCurrent = todayDay && weekDays.some(d => d.day === todayDay);

  return (
    <article style={{
      background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 14,
      padding: 18, position: "relative",
    }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-mute)" }}>
            Week {weekIdx + 1} {hasCurrent && <span style={{ color: accent, marginLeft: 6 }}>· this week</span>}
          </div>
          <div className="serif" style={{ fontSize: 22, letterSpacing: "-0.01em", marginTop: 2 }}>{startLabel}–{endLabel}</div>
        </div>
        <Ring value={overall} size={52} stroke={5} color={accent}/>
      </header>

      {/* per-day vertical bar mini-chart for the week */}
      <div style={{
        display: "grid", gridTemplateColumns: `repeat(${weekDays.length}, 1fr)`, gap: 6, marginBottom: 14,
      }}>
        {weekDays.map((d) => {
          let dn = 0;
          tracker.habits.forEach((h) => { if (completions[h.id]?.has(d.day)) dn++; });
          const total = tracker.habits.length;
          const ratio = total ? dn/total : 0;
          const inFuture = todayDay && d.day > todayDay;
          return (
            <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ height: 56, width: "100%", border: "1px solid var(--line)", borderRadius: 4, position: "relative", overflow: "hidden", background: "var(--cream)" }}>
                <div style={{
                  position: "absolute", left: 0, right: 0, bottom: 0,
                  height: `${inFuture ? 0 : ratio*100}%`,
                  background: accent, opacity: inFuture ? 0 : 0.85,
                  transition: "height .25s ease",
                }}/>
                {inFuture && <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: "repeating-linear-gradient(45deg, var(--line) 0 4px, transparent 4px 8px)",
                  opacity: 0.4,
                }}/>}
              </div>
              <span className="mono" style={{ fontSize: 9, color: "var(--ink-mute)", letterSpacing: 0.4 }}>{DAY_SHORT[d.weekday][0]}</span>
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-soft)" }}>{d.day}</span>
            </div>
          );
        })}
      </div>

      {/* per-habit dot rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {habitStats.map(({ h, set, pct: p }) => (
          <div key={h.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12.5, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.name}</span>
            <WeekDots days={weekDays} completed={set} color={accent} size={9} gap={3}/>
            <span className="mono" style={{ fontSize: 10.5, color: p >= 70 ? accent : "var(--ink-mute)", minWidth: 28, textAlign: "right" }}>{p}%</span>
          </div>
        ))}
      </div>
    </article>
  );
}

// ---- Modal ----
function Modal({ children, onClose }) {
  useTrkEff(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(27,26,22,0.45)",
      display: "grid", placeItems: "center", zIndex: 50,
      animation: "fadeIn .15s ease",
    }}>
      <div onClick={(e)=>e.stopPropagation()} style={{
        background: "var(--paper)", borderRadius: 16, padding: 28, maxWidth: 480, width: "92%",
        border: "1px solid var(--line)", boxShadow: "0 30px 80px rgba(27,26,22,0.18)",
      }}>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { TrackerScreen, Modal });
