// App root — auth, navigation, state owner.
const { useState: useAppState, useEffect: useAppEff, useMemo: useAppMemo } = React;

const ACCENT_OPTIONS = [
  { id: "sage", color: "#5F7E50", label: "Sage" },
  { id: "coral", color: "#C97C5D", label: "Coral" },
  { id: "navy", color: "#2A3556", label: "Navy" },
];
const EMOJI_OPTIONS = ["☼", "◐", "✦", "❀", "♕", "✿", "△", "◇", "♥", "✱"];

function App() {
  const [user, setUser] = useAppState(null);
  const [route, setRoute] = useAppState({ name: "dashboard" }); // dashboard | tracker:{id}
  const [trackers, setTrackers] = useAppState(() => SEED_TRACKERS.map(t => ({ ...t })));
  // completions: { [trackerId]: { [habitId]: Set<dayNum> } }
  const [completions, setCompletions] = useAppState(() => {
    const out = {};
    SEED_TRACKERS.forEach((t) => {
      const days = buildMonthDays(t.year, t.monthIdx);
      out[t.id] = buildInitialCompletions(t, days);
    });
    return out;
  });
  const [showCreate, setShowCreate] = useAppState(false);

  // Auto-login flag (persist locally so demo lands fast)
  useAppEff(() => {
    try {
      const saved = localStorage.getItem("streak.user");
      if (saved) setUser(JSON.parse(saved));
    } catch {}
  }, []);
  useAppEff(() => {
    try {
      if (user) localStorage.setItem("streak.user", JSON.stringify(user));
      else localStorage.removeItem("streak.user");
    } catch {}
  }, [user]);

  if (!user) {
    return <LoginScreen onLogin={(u) => setUser(u)} />;
  }

  // ---- Handlers ----
  const handleToggle = (trackerId, habitId, day) => {
    setCompletions(prev => {
      const tr = { ...(prev[trackerId] || {}) };
      const set = new Set(tr[habitId] || []);
      if (set.has(day)) set.delete(day); else set.add(day);
      tr[habitId] = set;
      return { ...prev, [trackerId]: tr };
    });
  };

  const handleAddHabit = (trackerId, name) => {
    const newId = `h-${Date.now()}`;
    setTrackers(prev => prev.map(t => t.id === trackerId
      ? { ...t, habits: [...t.habits, { id: newId, name, bias: 0 }] }
      : t));
    setCompletions(prev => ({
      ...prev,
      [trackerId]: { ...(prev[trackerId] || {}), [newId]: new Set() },
    }));
  };

  const handleRemoveHabit = (trackerId, habitId) => {
    setTrackers(prev => prev.map(t => t.id === trackerId
      ? { ...t, habits: t.habits.filter(h => h.id !== habitId) }
      : t));
    setCompletions(prev => {
      const tr = { ...(prev[trackerId] || {}) };
      delete tr[habitId];
      return { ...prev, [trackerId]: tr };
    });
  };

  const handleRenameHabit = (trackerId, habitId, name) => {
    setTrackers(prev => prev.map(t => t.id === trackerId
      ? { ...t, habits: t.habits.map(h => h.id === habitId ? { ...h, name } : h) }
      : t));
  };

  const handleUpdateTracker = (next) => {
    setTrackers(prev => prev.map(t => t.id === next.id ? next : t));
  };

  const handleChangeMonth = (trackerId, monthIdx, year) => {
    setTrackers(prev => prev.map(t => t.id === trackerId ? { ...t, monthIdx, year } : t));
    // Seed plausible completions for any newly-visited month so charts have life.
    setCompletions(prev => {
      const t = trackers.find(x => x.id === trackerId);
      if (!t) return prev;
      const next = { ...t, monthIdx, year };
      // Only seed if completions for current habits look empty for this view.
      const days = buildMonthDays(year, monthIdx);
      const existing = prev[trackerId] || {};
      const fresh = { ...existing };
      next.habits.forEach((h) => {
        if (!fresh[h.id] || fresh[h.id].size === 0) {
          // Build a one-off seed using a salted hash so months differ.
          const set = new Set();
          const today = new Date();
          const sameMonth = today.getFullYear() === year && today.getMonth() === monthIdx;
          const cap = sameMonth ? today.getDate() : days.length;
          for (let d = 1; d <= cap; d++) {
            if (hashFill(`${trackerId}-${monthIdx}-${year}`, h.id, d, h.bias ?? 0.6)) set.add(d);
          }
          fresh[h.id] = set;
        }
      });
      return { ...prev, [trackerId]: fresh };
    });
  };

  const handleCreateTracker = (data) => {
    const id = `t-${Date.now()}`;
    const t = {
      id, name: data.name, emoji: data.emoji, accent: data.accent,
      monthIdx: M, year: Y,
      habits: data.habits.map((n, i) => ({ id: `h-${id}-${i}`, name: n, bias: 0 })),
    };
    setTrackers(prev => [t, ...prev]);
    const initial = {};
    t.habits.forEach(h => initial[h.id] = new Set());
    setCompletions(prev => ({ ...prev, [id]: initial }));
    setShowCreate(false);
    setRoute({ name: "tracker", id });
  };

  const handleDeleteTracker = (id) => {
    setTrackers(prev => prev.filter(t => t.id !== id));
    setCompletions(prev => { const next = { ...prev }; delete next[id]; return next; });
  };

  const handleLogout = () => { setUser(null); setRoute({ name: "dashboard" }); };

  // ---- Render ----
  if (route.name === "tracker") {
    const tracker = trackers.find(t => t.id === route.id);
    if (!tracker) {
      return <Dashboard user={user} trackers={trackers} completionsByTracker={completions}
        onOpen={(id)=>setRoute({ name: "tracker", id })}
        onCreate={()=>setShowCreate(true)}
        onDelete={handleDeleteTracker}
        onLogout={handleLogout}/>;
    }
    return (
      <>
        <TrackerScreen
          tracker={tracker}
          completions={completions[tracker.id] || {}}
          onBack={() => setRoute({ name: "dashboard" })}
          onToggle={(habitId, day) => handleToggle(tracker.id, habitId, day)}
          onUpdateTracker={handleUpdateTracker}
          onAddHabit={(name) => handleAddHabit(tracker.id, name)}
          onRemoveHabit={(hid) => handleRemoveHabit(tracker.id, hid)}
          onRenameHabit={(hid, name) => handleRenameHabit(tracker.id, hid, name)}
          onChangeMonth={(m, y) => handleChangeMonth(tracker.id, m, y)}
        />
      </>
    );
  }

  return (
    <>
      <Dashboard
        user={user}
        trackers={trackers}
        completionsByTracker={completions}
        onOpen={(id) => setRoute({ name: "tracker", id })}
        onCreate={() => setShowCreate(true)}
        onDelete={handleDeleteTracker}
        onLogout={handleLogout}
      />
      {showCreate && (
        <CreateTrackerModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreateTracker}
        />
      )}
    </>
  );
}

// ----- Create Tracker Modal -----
function CreateTrackerModal({ onClose, onCreate }) {
  const [name, setName] = useAppState("");
  const [emoji, setEmoji] = useAppState(EMOJI_OPTIONS[0]);
  const [accent, setAccent] = useAppState("sage");
  const [habits, setHabits] = useAppState(["", "", ""]);
  const [draft, setDraft] = useAppState("");

  const addHabit = () => {
    const v = draft.trim();
    if (!v) return;
    setHabits(prev => {
      // fill first empty slot, else append
      const idx = prev.findIndex(x => !x.trim());
      if (idx >= 0) { const next = [...prev]; next[idx] = v; return next; }
      return [...prev, v];
    });
    setDraft("");
  };

  const removeHabit = (i) => setHabits(prev => prev.filter((_, j) => j !== i));
  const editHabit = (i, v) => setHabits(prev => prev.map((x, j) => j === i ? v : x));

  const filled = habits.map(h => h.trim()).filter(Boolean);
  const canCreate = name.trim() && filled.length >= 1;

  const submit = () => {
    if (!canCreate) return;
    onCreate({ name: name.trim(), emoji, accent, habits: filled });
  };

  const presets = [
    { name: "Morning Routine", emoji: "☼", accent: "sage", habits: ["Make Bed", "Drink Water", "Daily Exercise", "Read 10+ Pages"] },
    { name: "Fitness", emoji: "◐", accent: "coral", habits: ["Strength Training", "10k Steps", "Stretch", "8 Glasses Water"] },
    { name: "Mindfulness", emoji: "✦", accent: "navy", habits: ["Meditate 10 min", "Journal", "No phone before bed"] },
  ];

  const usePreset = (p) => {
    setName(p.name); setEmoji(p.emoji); setAccent(p.accent);
    setHabits([...p.habits, "", ""]);
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
        }}><Icon name="x" size={20}/></button>
      </div>

      <p style={{ color: "var(--ink-soft)", margin: "6px 0 18px", fontSize: 14 }}>
        A tracker is a small group of habits you check off each day. Start fresh or pick a preset.
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {presets.map(p => (
          <button key={p.name} onClick={()=>usePreset(p)} style={{
            background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 999,
            padding: "5px 12px", fontSize: 12, color: "var(--ink-soft)", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <span>{p.emoji}</span>{p.name}
          </button>
        ))}
      </div>

      {/* Name + appearance */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 16 }}>
        <input autoFocus value={name} onChange={(e)=>setName(e.target.value)}
          placeholder="Name your tracker"
          style={{ padding: "12px 14px", fontSize: 15, background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 10, outline: "none" }}/>
        <select value={emoji} onChange={(e)=>setEmoji(e.target.value)}
          style={{ padding: "0 12px", fontSize: 18, background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 10, outline: "none", cursor: "pointer" }}>
          {EMOJI_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Accent */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {ACCENT_OPTIONS.map(a => (
          <button key={a.id} onClick={()=>setAccent(a.id)}
            style={{
              flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer",
              background: accent === a.id ? a.color : "var(--cream)",
              color: accent === a.id ? "#fff" : "var(--ink-soft)",
              border: `1px solid ${accent === a.id ? a.color : "var(--line)"}`,
              fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: accent === a.id ? "#fff" : a.color }}/>
            {a.label}
          </button>
        ))}
      </div>

      {/* Habits */}
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 8 }}>
        Habits ({filled.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
        {habits.map((h, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-mute)", width: 18 }}>{String(i+1).padStart(2,"0")}</span>
            <input value={h} onChange={(e)=>editHabit(i, e.target.value)}
              placeholder={i === 0 ? "e.g. Daily Exercise" : i === 1 ? "e.g. Read 10 pages" : "Another habit"}
              style={{ flex: 1, padding: "9px 12px", fontSize: 14, background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 8, outline: "none" }}/>
            <button onClick={()=>removeHabit(i)} aria-label="Remove"
              style={{ background: "transparent", border: "none", color: "var(--ink-mute)", padding: 4, cursor: "pointer", display: "grid", placeItems: "center" }}>
              <Icon name="x" size={14}/>
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input value={draft} onChange={(e)=>setDraft(e.target.value)}
          placeholder="Add another habit"
          onKeyDown={(e)=>{ if (e.key === "Enter") addHabit(); }}
          style={{ flex: 1, padding: "9px 12px", fontSize: 14, background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 8, outline: "none" }}/>
        <Button kind="ghost" size="sm" icon="plus" onClick={addHabit}>Add</Button>
      </div>

      <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button kind="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button kind="primary" size="sm" onClick={submit} disabled={!canCreate} style={!canCreate ? { opacity: 0.4, cursor: "not-allowed" } : null}>
          Create tracker <Icon name="chev" size={14}/>
        </Button>
      </div>
    </Modal>
  );
}

// Mount
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
