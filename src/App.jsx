import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAYS_IN_MONTH = (m, y) => new Date(y, m + 1, 0).getDate();

const DEFAULT_HABITS = [
  "Early wake up",
  "Task by lunch",
  "Productive day",
  "Go to gym",
  "Did something 4 self",
  "Applied to job",
  "Nighttime routine",
  "Fall asleep @ good time",
  "Satisfied w/ day?",
];

const SEED = {
  "2026-02-01": [1,0,0,0,0,0,1,1,0.5],
  "2026-02-02": [1,0,1,1,0,1,1,1,1],
  "2026-02-03": [1,1,1,0,0,0,1,0.5,1],
  "2026-02-04": [1,0,0,1,0,0,1,1,1],
  "2026-02-05": [1,0,0,1,0,1,1,1,1],
  "2026-02-06": [1,1,1,0,0,1,1,1,1],
  "2026-02-07": [1,1,1,0,0,0,1,1,1],
  "2026-02-08": [1,1,1,0,0,0,1,0.5,0.5],
  "2026-02-09": [1,1,1,0.5,0,0,1,1,1],
  "2026-02-10": [1,1,1,0,0,0,1,0.5,0.5],
  "2026-02-11": [1,1,1,0,0,0,1,1,1],
  "2026-02-12": [1,1,1,0,0,0,1,0.5,0.5],
  "2026-02-13": [1,1,1,0,0,0.5,1,1,0.5],
  "2026-02-14": [1,1,1,0,0,0,0.5,1,0.5],
  "2026-02-15": [1,1,1,0,0.5,0.5,0,1,0.5],
};

const MOMENTS_SEED = {
  "2026-02-01": "Watched 'Step Brothers' in evening w/ mom",
  "2026-02-02": "Helped Phil winter-proof his windows",
  "2026-02-03": "Practiced coding w/ Raspberry Pi weather project",
  "2026-02-04": "Extremely productive day! Applied to TWO jobs!",
  "2026-02-05": "Got lunch w/ Syd & Mother poe in Ann Arbor!",
  "2026-02-06": "Set up nice accent lights on bookcase",
  "2026-02-07": "Productive day applying for jobs!",
  "2026-02-08": "Pond hockey & watched Super Bowl!",
  "2026-02-09": "Very productive day applying for jobs",
  "2026-02-10": "Locked-in day applying to 3 jobs!",
  "2026-02-11": "Set up Open Claw on pi",
  "2026-02-12": "Worked on openclaw stuff some more",
  "2026-02-13": "Watched olympics & visited mom's new house!",
  "2026-02-14": "Worked on Raspberry Pi project(s)",
  "2026-02-15": "Hung out w/ A in afternoon/evening watching olympics",
};

function buildInitial() {
  const entries = {};
  Object.entries(SEED).forEach(([dk, vals]) => {
    entries[dk] = {
      habits: Object.fromEntries(DEFAULT_HABITS.map((h, i) => [h, vals[i] ?? 0])),
      moment: MOMENTS_SEED[dk] || "",
    };
  });
  return { habits: DEFAULT_HABITS, entries };
}

// ─── Theme ────────────────────────────────────────────────────────────────────

const themes = {
  dark: {
    bg:          "#0b0d10",
    bgSurface:   "#12151a",
    bgCard:      "#181c24",
    bgCardHover: "#1e2330",
    border:      "rgba(138,180,204,0.12)",
    borderLight: "rgba(138,180,204,0.06)",
    accent:      "#6ba3be",
    accentBright:"#8ec5e0",
    accentDeep:  "#4d8ba6",
    accentMuted: "rgba(107,163,190,0.15)",
    accentGlow:  "rgba(107,163,190,0.08)",
    text:        "#e8edf2",
    textSecondary:"#94adc0",
    textMuted:   "#5f7d92",
    done:        "#6ba3be",
    doneText:    "#0b0d10",
    half:        "rgba(107,163,190,0.22)",
    halfBorder:  "rgba(107,163,190,0.35)",
    halfText:    "#6ba3be",
    empty:       "rgba(255,255,255,0.03)",
    emptyHover:  "rgba(107,163,190,0.08)",
    success:     "#5ea87a",
    warning:     "#c4a24e",
    danger:      "#b85c5c",
    shadow:      "0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)",
    shadowLg:    "0 4px 24px rgba(0,0,0,0.5)",
    titlebar:    "#0b0d10",
    titlebarText:"#5f7d92",
  },
  light: {
    bg:          "#f0f2f5",
    bgSurface:   "#f7f8fa",
    bgCard:      "#ffffff",
    bgCardHover: "#f0f4f8",
    border:      "rgba(0,0,0,0.08)",
    borderLight: "rgba(0,0,0,0.04)",
    accent:      "#3d87a8",
    accentBright:"#2d7a9e",
    accentDeep:  "#2b6d8a",
    accentMuted: "rgba(61,135,168,0.1)",
    accentGlow:  "rgba(61,135,168,0.05)",
    text:        "#1a2332",
    textSecondary:"#546a7b",
    textMuted:   "#8e9fae",
    done:        "#3d87a8",
    doneText:    "#ffffff",
    half:        "rgba(61,135,168,0.15)",
    halfBorder:  "rgba(61,135,168,0.3)",
    halfText:    "#3d87a8",
    empty:       "rgba(0,0,0,0.03)",
    emptyHover:  "rgba(61,135,168,0.08)",
    success:     "#3d8a5a",
    warning:     "#b8942e",
    danger:      "#c05050",
    shadow:      "0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
    shadowLg:    "0 4px 24px rgba(0,0,0,0.08)",
    titlebar:    "#e8eaed",
    titlebarText:"#8e9fae",
  },
};

// ─── Score Chart ──────────────────────────────────────────────────────────────

function ScoreChart({ scores, days, maxScore, theme: T }) {
  const filled = scores.filter(s => s !== null);
  if (!filled.length) return <div style={{textAlign:"center",padding:36,color:T.textMuted,fontSize:"0.85rem"}}>No data for this month yet</div>;
  const H = 140, PY = 14;
  const step = maxScore > 6 ? 2 : 1;
  const yLabels = Array.from({length: maxScore + 1}, (_, v) => v).filter(v => v % step === 0);
  return (
    <div style={{display:"flex", gap:0, alignItems:"stretch"}}>
      <div style={{width:32, flexShrink:0, position:"relative", height:H}}>
        {yLabels.map(v => {
          const pct = 1 - (v / maxScore);
          const top = PY + pct * (H - 2 * PY);
          return (
            <div key={v} style={{
              position:"absolute", right:6, top, transform:"translateY(-50%)",
              fontSize:"0.6rem", color:T.textMuted, fontFamily:"'SF Mono',Consolas,monospace",
              lineHeight:1, userSelect:"none"
            }}>{v}</div>
          );
        })}
      </div>
      <div style={{flex:1, height:H}}>
        <svg width="100%" height="100%" viewBox={`0 0 400 ${H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={T.accent} stopOpacity="0.25"/>
              <stop offset="100%" stopColor={T.accent} stopOpacity="0"/>
            </linearGradient>
          </defs>
          {Array.from({length: maxScore + 1}, (_, v) => {
            const y = H - PY - (v / maxScore) * (H - 2 * PY);
            return <line key={v} x1={0} y1={y} x2={400} y2={y} stroke={T.borderLight} strokeWidth="1"/>;
          })}
          {(() => {
            const pts = scores.map((s, i) => s === null ? null : {
              x: (i / Math.max(days - 1, 1)) * 400,
              y: H - PY - (s / maxScore) * (H - 2 * PY)
            });
            const valid = pts.filter(Boolean);
            if (!valid.length) return null;
            const line = valid.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
            const area = line + ` L ${valid[valid.length-1].x} ${H} L ${valid[0].x} ${H} Z`;
            return (
              <>
                <path d={area} fill="url(#scoreGrad)"/>
                <path d={line} fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                {valid.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3" fill={T.bgCard} stroke={T.accent} strokeWidth="1.5"/>
                ))}
              </>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────

function Heatmap({ data, habits, year, theme: T }) {
  const maxScore = habits.length;
  const cells = [];
  const startDate = new Date(year, 0, 1);
  const startDay = startDate.getDay();
  const endDate = new Date(year, 11, 31);
  const totalDays = Math.floor((endDate - startDate) / 86400000) + 1;

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(year, 0, 1 + i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const e = data.entries[key];
    const score = e ? Object.values(e.habits).reduce((a,v)=> a + (Number(v)||0), 0) : 0;
    const intensity = maxScore > 0 ? score / maxScore : 0;
    cells.push({ key, date: d, score, intensity, dayOfWeek: d.getDay(), weekIdx: Math.floor((i + startDay) / 7) });
  }

  const weeks = cells[cells.length - 1]?.weekIdx + 1 || 53;
  const cellSize = 11;
  const gap = 2;

  return (
    <div style={{overflowX:"auto", paddingBottom:8}}>
      <svg width={(cellSize + gap) * weeks + 30} height={(cellSize + gap) * 7 + 20} style={{display:"block"}}>
        {["","Mon","","Wed","","Fri",""].map((label, i) => (
          <text key={i} x={0} y={20 + i * (cellSize + gap) + cellSize / 2} fontSize="8" fill={T.textMuted}
            dominantBaseline="central" fontFamily="'SF Mono',Consolas,monospace">{label}</text>
        ))}
        {cells.map((c, i) => {
          let fill = T.empty;
          if (c.score > 0) {
            const alpha = 0.2 + c.intensity * 0.8;
            fill = c.intensity >= 0.9 ? T.accent :
                   c.intensity >= 0.5 ? T.accentDeep :
                   T.accentMuted;
            if (c.intensity >= 0.9) fill = T.accent;
            else if (c.intensity >= 0.7) fill = T.accentDeep;
            else if (c.intensity >= 0.3) fill = `rgba(107,163,190,${alpha * 0.5})`;
            else fill = `rgba(107,163,190,${alpha * 0.3})`;
          }
          return (
            <rect key={i} x={26 + c.weekIdx * (cellSize + gap)} y={16 + c.dayOfWeek * (cellSize + gap)}
              width={cellSize} height={cellSize} rx={2} fill={fill}/>
          );
        })}
        {Array.from({length: 12}, (_, m) => {
          const firstOfMonth = new Date(year, m, 1);
          const dayOfYear = Math.floor((firstOfMonth - startDate) / 86400000);
          const weekIdx = Math.floor((dayOfYear + startDay) / 7);
          return (
            <text key={m} x={26 + weekIdx * (cellSize + gap)} y={10} fontSize="8" fill={T.textMuted}
              fontFamily="'SF Mono',Consolas,monospace">{MONTH_SHORT[m]}</text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Day Detail Panel ─────────────────────────────────────────────────────────

function DayDetail({ dateKey, data, habits, theme: T, onCycle, onMomentChange }) {
  if (!dateKey) return null;
  const [y, m, d] = dateKey.split("-").map(Number);
  const dayName = DAY_NAMES[new Date(y, m-1, d).getDay()];
  const entry = data.entries[dateKey];

  return (
    <div style={{
      background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: "20px 22px", marginBottom: 14,
      boxShadow: T.shadow,
    }}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16}}>
        <div>
          <div style={{fontSize:"0.62rem", textTransform:"uppercase", letterSpacing:"0.1em", color:T.textMuted, marginBottom:4, fontWeight:600}}>
            {dayName}
          </div>
          <div style={{fontSize:"1.15rem", fontWeight:700, color:T.text}}>
            {MONTHS[m-1]} {d}, {y}
          </div>
        </div>
        {entry && (
          <div style={{
            background: T.accentMuted, borderRadius: 10, padding:"8px 14px",
            fontFamily:"'SF Mono',Consolas,monospace", fontSize:"0.85rem", fontWeight:700, color:T.accent
          }}>
            {Object.values(entry.habits).reduce((a,v) => a + (Number(v)||0), 0).toFixed(1)}/{habits.length}
          </div>
        )}
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:6, marginBottom:16}}>
        {habits.map(h => {
          const val = entry?.habits?.[h] ?? 0;
          return (
            <div key={h} style={{display:"flex", alignItems:"center", gap:10, cursor:"pointer"}}
              onClick={() => onCycle(dateKey, h)}>
              <div style={{
                width:24, height:24, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center",
                background: val === 1 ? T.done : val === 0.5 ? T.half : T.empty,
                border: val === 0.5 ? `1px solid ${T.halfBorder}` : val === 0 ? `1px solid ${T.border}` : "none",
                transition: "all 0.15s",
              }}>
                {val === 1 && <CheckIcon color={T.doneText} size={13}/>}
                {val === 0.5 && <HalfIcon color={T.halfText} size={11}/>}
              </div>
              <span style={{fontSize:"0.82rem", color: val === 1 ? T.text : val === 0.5 ? T.textSecondary : T.textMuted}}>
                {h}
              </span>
            </div>
          );
        })}
      </div>
      <div>
        <div style={{fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:"0.1em", color:T.textMuted, marginBottom:6, fontWeight:600}}>
          Moment
        </div>
        <textarea
          rows={2}
          placeholder="What made today memorable?"
          value={entry?.moment || ""}
          onChange={e => onMomentChange(dateKey, e.target.value)}
          style={{
            background:T.empty, border:`1px solid ${T.border}`, borderRadius:8,
            padding:"10px 12px", color:T.text, fontSize:"0.82rem", width:"100%",
            fontFamily:"inherit", resize:"none", outline:"none",
            transition:"border-color 0.15s",
          }}
          onFocus={e => e.target.style.borderColor = T.accent}
          onBlur={e => e.target.style.borderColor = T.border}
        />
      </div>
    </div>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function CheckIcon({color = "#fff", size = 12}) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <polyline points="2.5,6 5.5,9 9.5,3"/>
    </svg>
  );
}

function HalfIcon({color = "#fff", size = 11}) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} strokeWidth="2.2" stroke={color} strokeLinecap="round" fill="none">
      <line x1="7.5" y1="1" x2="2.5" y2="9"/>
    </svg>
  );
}

function XIcon({color = "#fff", size = 12}) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="3" x2="9" y2="9"/><line x1="9" y1="3" x2="3" y2="9"/>
    </svg>
  );
}

// ─── Streaks Display ──────────────────────────────────────────────────────────

function StreakDisplay({ data, habits, today, theme: T }) {
  const { y: ty, m: tm, d: td } = today;
  const dk = (date) => {
    const dd = new Date(date);
    return `${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,"0")}-${String(dd.getDate()).padStart(2,"0")}`;
  };

  // Current streak
  let currentStreak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(ty, tm, td - i);
    const key = dk(d);
    const e = data.entries[key];
    const s = e ? Object.values(e.habits).reduce((a,v)=>a+(Number(v)||0),0) : 0;
    if (s > 0) currentStreak++; else break;
  }

  // Longest streak
  let longestStreak = 0, tempStreak = 0;
  const sortedKeys = Object.keys(data.entries).sort();
  let prevDate = null;
  for (const key of sortedKeys) {
    const e = data.entries[key];
    const s = Object.values(e.habits).reduce((a,v)=>a+(Number(v)||0),0);
    const [yy, mm, dd] = key.split("-").map(Number);
    const thisDate = new Date(yy, mm-1, dd);
    if (s > 0) {
      if (prevDate && (thisDate - prevDate) === 86400000) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      prevDate = thisDate;
    } else {
      tempStreak = 0;
      prevDate = null;
    }
  }

  // Per-habit streaks
  const habitStreaks = habits.map(h => {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(ty, tm, td - i);
      const key = dk(d);
      const e = data.entries[key];
      const val = e?.habits?.[h] ?? 0;
      if (val > 0) streak++; else break;
    }
    return { name: h, streak };
  }).sort((a,b) => b.streak - a.streak);

  return (
    <div style={{display:"flex", flexDirection:"column", gap:14}}>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
        <div style={{
          background:T.accentMuted, borderRadius:12, padding:"18px 16px", textAlign:"center",
          border:`1px solid ${T.border}`,
        }}>
          <div style={{fontSize:"1.8rem", fontWeight:800, color:T.accent, fontFamily:"'SF Mono',Consolas,monospace"}}>{currentStreak}</div>
          <div style={{fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:"0.1em", color:T.textMuted, fontWeight:600, marginTop:4}}>Current Streak</div>
        </div>
        <div style={{
          background:T.accentMuted, borderRadius:12, padding:"18px 16px", textAlign:"center",
          border:`1px solid ${T.border}`,
        }}>
          <div style={{fontSize:"1.8rem", fontWeight:800, color:T.accent, fontFamily:"'SF Mono',Consolas,monospace"}}>{longestStreak}</div>
          <div style={{fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:"0.1em", color:T.textMuted, fontWeight:600, marginTop:4}}>Longest Streak</div>
        </div>
      </div>
      <div style={{fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:"0.1em", color:T.textMuted, fontWeight:600}}>Per-Habit Streaks</div>
      {habitStreaks.map(h => (
        <div key={h.name} style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{width:140, fontSize:"0.78rem", color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flexShrink:0}}>{h.name}</div>
          <div style={{flex:1, height:5, background:T.empty, borderRadius:99, overflow:"hidden"}}>
            <div style={{
              height:"100%", borderRadius:99,
              background: h.streak > 0 ? `linear-gradient(90deg, ${T.accentDeep}, ${T.accent})` : "transparent",
              width: `${Math.min((h.streak / Math.max(longestStreak,1)) * 100, 100)}%`,
              transition:"width 0.5s cubic-bezier(.4,0,.2,1)",
            }}/>
          </div>
          <div style={{
            fontFamily:"'SF Mono',Consolas,monospace", fontSize:"0.7rem", color: h.streak > 0 ? T.accent : T.textMuted,
            width:36, textAlign:"right", flexShrink:0, fontWeight:600,
          }}>{h.streak}d</div>
        </div>
      ))}
    </div>
  );
}

// ─── Weekly View ──────────────────────────────────────────────────────────────

function WeeklyView({ data, habits, today, theme: T, onCycle }) {
  const { y, m, d } = today;
  const todayDate = new Date(y, m, d);
  const dayOfWeek = todayDate.getDay();
  const weekStart = new Date(y, m, d - dayOfWeek);

  const weekDays = Array.from({length: 7}, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return {
      date,
      key: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`,
      isToday: date.getFullYear() === y && date.getMonth() === m && date.getDate() === d,
      isFuture: date > todayDate,
    };
  });

  return (
    <div>
      <div style={{display:"grid", gridTemplateColumns:`140px repeat(7, 1fr)`, gap:3, marginBottom:2}}>
        <div/>
        {weekDays.map(wd => (
          <div key={wd.key} style={{
            textAlign:"center", padding:"8px 0",
            borderRadius:8,
            background: wd.isToday ? T.accentMuted : "transparent",
          }}>
            <div style={{fontSize:"0.58rem", textTransform:"uppercase", letterSpacing:"0.08em",
              color: wd.isToday ? T.accent : T.textMuted, fontWeight:600}}>
              {DAY_NAMES[wd.date.getDay()]}
            </div>
            <div style={{fontSize:"0.95rem", fontWeight:700, color: wd.isToday ? T.accent : T.text, marginTop:2}}>
              {wd.date.getDate()}
            </div>
          </div>
        ))}
      </div>
      {habits.map(h => (
        <div key={h} style={{display:"grid", gridTemplateColumns:`140px repeat(7, 1fr)`, gap:3, marginBottom:2}}>
          <div style={{
            fontSize:"0.75rem", color:T.text, display:"flex", alignItems:"center",
            paddingRight:8, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
          }}>{h}</div>
          {weekDays.map(wd => {
            if (wd.isFuture) return <div key={wd.key} style={{display:"flex",alignItems:"center",justifyContent:"center",height:36}}>
              <div style={{width:28,height:28,borderRadius:7,border:`1px solid ${T.borderLight}`}}/>
            </div>;
            const val = data.entries[wd.key]?.habits?.[h] ?? 0;
            return (
              <div key={wd.key} style={{display:"flex",alignItems:"center",justifyContent:"center",height:36}}>
                <div
                  onClick={() => onCycle(wd.key, h)}
                  style={{
                    width:28, height:28, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center",
                    cursor:"pointer", transition:"all 0.12s", userSelect:"none",
                    background: val === 1 ? T.done : val === 0.5 ? T.half : T.empty,
                    border: val === 0.5 ? `1px solid ${T.halfBorder}` : val === 0 ? `1px solid ${T.border}` : "1px solid transparent",
                  }}
                >
                  {val === 1 && <CheckIcon color={T.doneText} size={14}/>}
                  {val === 0.5 && <HalfIcon color={T.halfText} size={11}/>}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Titlebar ─────────────────────────────────────────────────────────────────

function TitleBar({ theme: T, isMaximized, onThemeToggle, isDark }) {
  const hasElectron = typeof window !== 'undefined' && window.electronAPI;
  return (
    <div style={{
      height: 38, background: T.titlebar, display:"flex", alignItems:"center",
      justifyContent:"space-between", padding:"0 8px 0 16px",
      WebkitAppRegion: "drag", userSelect:"none",
      borderBottom: `1px solid ${T.borderLight}`,
    }}>
      <div style={{display:"flex", alignItems:"center", gap:8}}>
        <span style={{fontSize:"0.78rem", fontWeight:700, color:T.textSecondary, letterSpacing:"-0.02em"}}>
          habit<span style={{color:T.accent}}>.</span>log
        </span>
      </div>
      <div style={{display:"flex", alignItems:"center", gap:2, WebkitAppRegion:"no-drag"}}>
        <button onClick={onThemeToggle} style={{
          background:"transparent", border:"none", color:T.titlebarText,
          width:36, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          borderRadius:4, fontSize:"0.85rem",
        }} title="Toggle theme">
          {isDark ? "☀" : "☾"}
        </button>
        {hasElectron && (
          <>
            <button onClick={() => window.electronAPI.minimizeWindow()} style={{
              background:"transparent", border:"none", color:T.titlebarText,
              width:36, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              borderRadius:4,
            }}>
              <svg width="11" height="1"><rect width="11" height="1" fill="currentColor"/></svg>
            </button>
            <button onClick={() => window.electronAPI.maximizeWindow()} style={{
              background:"transparent", border:"none", color:T.titlebarText,
              width:36, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              borderRadius:4,
            }}>
              {isMaximized ? (
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="2" y="0" width="9" height="9" rx="1"/><rect x="0" y="2" width="9" height="9" rx="1" fill={T.titlebar}/>
                  <rect x="0" y="2" width="9" height="9" rx="1"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="0.5" y="0.5" width="9" height="9" rx="1"/>
                </svg>
              )}
            </button>
            <button onClick={() => window.electronAPI.closeWindow()} style={{
              background:"transparent", border:"none", color:T.titlebarText,
              width:36, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              borderRadius:4,
            }} onMouseEnter={e => e.target.closest("button").style.background = T.danger}
               onMouseLeave={e => e.target.closest("button").style.background = "transparent"}>
              <XIcon color="currentColor" size={10}/>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const now = new Date();
  const TODAY_Y = now.getFullYear(), TODAY_M = now.getMonth(), TODAY_D = now.getDate();

  const [data, setData] = useState(buildInitial);
  const [vm, setVm] = useState(TODAY_M);
  const [vy, setVy] = useState(TODAY_Y);
  const [tab, setTab] = useState("grid");
  const [newH, setNewH] = useState("");
  const [editingH, setEditingH] = useState({});
  const [dragIdx, setDragIdx] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const saveTimer = useRef(null);

  const T = isDark ? themes.dark : themes.light;

  // Load persisted data
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.loadData().then(saved => {
        if (saved) {
          if (saved.habits && saved.entries) setData(saved);
          if (saved._theme !== undefined) setIsDark(saved._theme === 'dark');
        }
      });
      window.electronAPI.onWindowStateChange(setIsMaximized);
      window.electronAPI.isMaximized().then(setIsMaximized);
    }
  }, []);

  // Auto-save
  const persistData = useCallback((newData) => {
    setData(newData);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (window.electronAPI) {
        window.electronAPI.saveData({ ...newData, _theme: isDark ? 'dark' : 'light' });
      }
    }, 500);
  }, [isDark]);

  // Save theme pref
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.saveData({ ...data, _theme: isDark ? 'dark' : 'light' });
    }
  }, [isDark]);

  const days = DAYS_IN_MONTH(vm, vy);
  const mk = `${vy}-${String(vm + 1).padStart(2, "0")}`;
  const isCur = vm === TODAY_M && vy === TODAY_Y;

  const dk = (d) => `${mk}-${String(d).padStart(2, "0")}`;
  const getVal = (d, h) => data.entries[dk(d)]?.habits?.[h] ?? 0;

  const cycle = useCallback((d, h) => {
    const key = typeof d === 'string' ? d : dk(d);
    setData(prev => {
      const e = prev.entries[key] || { habits: Object.fromEntries(prev.habits.map(x => [x, 0])), moment: "" };
      const cur = e.habits[h] ?? 0;
      const nxt = cur === 0 ? 1 : cur === 1 ? 0.5 : 0;
      const newData = { ...prev, entries: { ...prev.entries, [key]: { ...e, habits: { ...e.habits, [h]: nxt } } } };
      if (window.electronAPI) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          window.electronAPI.saveData({ ...newData, _theme: isDark ? 'dark' : 'light' });
        }, 500);
      }
      return newData;
    });
  }, [vm, vy, isDark]);

  const setMoment = useCallback((d, txt) => {
    const key = typeof d === 'string' ? d : dk(d);
    setData(prev => {
      const e = prev.entries[key] || { habits: Object.fromEntries(prev.habits.map(x => [x, 0])), moment: "" };
      const newData = { ...prev, entries: { ...prev.entries, [key]: { ...e, moment: txt } } };
      if (window.electronAPI) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          window.electronAPI.saveData({ ...newData, _theme: isDark ? 'dark' : 'light' });
        }, 500);
      }
      return newData;
    });
  }, [vm, vy, isDark]);

  const scores = useMemo(() => Array.from({ length: days }, (_, i) => {
    const e = data.entries[dk(i + 1)];
    return e ? Object.values(e.habits).reduce((a, v) => a + (Number(v) || 0), 0) : null;
  }), [data, days, vm, vy]);

  const ms = data.habits.length;
  const filled = scores.filter(s => s !== null);
  const avg = filled.length ? (filled.reduce((a,b)=>a+b,0)/filled.length).toFixed(1) : "\u2013";
  const best = filled.length ? Math.max(...filled) : "\u2013";
  const perfect = filled.filter(s => s === ms).length;
  const totalScore = filled.length ? filled.reduce((a,b)=>a+b,0) : 0;

  let streak = 0;
  if (isCur) {
    for (let d = TODAY_D; d >= 1; d--) {
      const e = data.entries[dk(d)];
      const s = e ? Object.values(e.habits).reduce((a,v)=>a+(Number(v)||0),0) : 0;
      if (s > 0) streak++; else break;
    }
  }

  const hStats = useMemo(() => data.habits.map(h => {
    let tot = 0, sum = 0;
    for (let d = 1; d <= days; d++) {
      const e = data.entries[dk(d)];
      if (!e) continue;
      tot++; sum += Number(e.habits[h]) || 0;
    }
    return { name: h, pct: tot ? Math.round((sum/tot)*100) : 0 };
  }).sort((a,b) => b.pct - a.pct), [data, days, vm, vy]);

  const addHabit = () => {
    const h = newH.trim();
    if (!h || data.habits.includes(h)) return;
    const newData = {
      habits: [...data.habits, h],
      entries: Object.fromEntries(Object.entries(data.entries).map(([k,e]) => [k, { ...e, habits: { ...e.habits, [h]: 0 } }]))
    };
    persistData(newData);
    setNewH("");
  };

  const removeHabit = (h) => {
    const newData = {
      habits: data.habits.filter(x => x !== h),
      entries: Object.fromEntries(Object.entries(data.entries).map(([k,e]) => {
        const { [h]: _, ...rest } = e.habits;
        return [k, { ...e, habits: rest }];
      }))
    };
    persistData(newData);
  };

  const renameHabit = (oldName, newName) => {
    const n = newName.trim();
    if (!n || n === oldName || data.habits.includes(n)) return;
    const newData = {
      habits: data.habits.map(h => h === oldName ? n : h),
      entries: Object.fromEntries(Object.entries(data.entries).map(([k, e]) => {
        const val = e.habits[oldName] ?? 0;
        const { [oldName]: _, ...rest } = e.habits;
        return [k, { ...e, habits: { ...rest, [n]: val } }];
      }))
    };
    persistData(newData);
    setEditingH(p => { const { [oldName]: _, ...rest } = p; return rest; });
  };

  const moveHabit = (idx, dir) => {
    const to = idx + dir;
    if (to < 0 || to >= data.habits.length) return;
    const h = [...data.habits];
    [h[idx], h[to]] = [h[to], h[idx]];
    persistData({ ...data, habits: h });
  };

  const onDragStart = (idx) => setDragIdx(idx);
  const onDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const h = [...data.habits];
    const [moved] = h.splice(dragIdx, 1);
    h.splice(idx, 0, moved);
    setData(prev => ({ ...prev, habits: h }));
    setDragIdx(idx);
  };
  const onDragEnd = () => setDragIdx(null);

  const prevMonth = () => { let m=vm-1,y=vy; if(m<0){m=11;y--;} setVm(m);setVy(y); setSelectedDay(null); };
  const nextMonth = () => { let m=vm+1,y=vy; if(m>11){m=0;y++;} setVm(m);setVy(y); setSelectedDay(null); };

  const handleExport = () => {
    if (window.electronAPI) window.electronAPI.exportData(data);
  };
  const handleImport = async () => {
    if (!window.electronAPI) return;
    const imported = await window.electronAPI.importData();
    if (imported && imported.habits && imported.entries) {
      persistData(imported);
    }
  };

  const TABS = [
    {id:"grid", label:"Grid", icon:"▦"},
    {id:"week", label:"Week", icon:"▤"},
    {id:"scores", label:"Scores", icon:"◈"},
    {id:"health", label:"Health", icon:"◉"},
    {id:"streaks", label:"Streaks", icon:"⚡"},
    {id:"heatmap", label:"Year", icon:"▥"},
    {id:"moments", label:"Moments", icon:"✦"},
    {id:"manage", label:"Manage", icon:"⚙"},
  ];

  // Day of week for month start (for grid offset)
  const monthStartDow = new Date(vy, vm, 1).getDay();

  // Compute completion pct for today
  const todayKey = dk(TODAY_D);
  const todayEntry = isCur ? data.entries[todayKey] : null;
  const todayDone = todayEntry ? Object.values(todayEntry.habits).reduce((a,v)=>a+(Number(v)||0),0) : 0;
  const todayPct = ms > 0 ? Math.round((todayDone / ms) * 100) : 0;

  return (
    <div style={{background:T.bg, minHeight:"100vh", color:T.text, fontFamily:"'Segoe UI','SF Pro Display',system-ui,sans-serif", WebkitFontSmoothing:"antialiased"}}>
      <TitleBar theme={T} isMaximized={isMaximized} onThemeToggle={() => setIsDark(d => !d)} isDark={isDark}/>

      <div style={{display:"flex", height:"calc(100vh - 38px)"}}>
        {/* Sidebar */}
        <div style={{
          width: sidebarOpen ? 220 : 54, flexShrink:0, background:T.bgSurface,
          borderRight:`1px solid ${T.borderLight}`, display:"flex", flexDirection:"column",
          transition:"width 0.2s ease", overflow:"hidden",
        }}>
          {/* Sidebar toggle */}
          <div style={{padding:"14px 14px 10px", display:"flex", alignItems:"center", gap:8}}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{
              background:"transparent", border:"none", color:T.textMuted, cursor:"pointer",
              width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center",
              borderRadius:6, fontSize:"1rem", flexShrink:0,
            }}>
              {sidebarOpen ? "◁" : "▷"}
            </button>
            {sidebarOpen && <span style={{fontSize:"0.72rem", fontWeight:700, color:T.textSecondary, textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap"}}>Navigation</span>}
          </div>

          {/* Nav items */}
          <div style={{flex:1, padding:"0 8px", display:"flex", flexDirection:"column", gap:2}}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display:"flex", alignItems:"center", gap:10, padding: sidebarOpen ? "9px 12px" : "9px 0",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                background: tab === t.id ? T.accentMuted : "transparent",
                border: `1px solid ${tab === t.id ? T.border : "transparent"}`,
                borderRadius:8, cursor:"pointer", transition:"all 0.12s",
                color: tab === t.id ? T.accent : T.textSecondary,
                fontSize:"0.78rem", fontWeight: tab === t.id ? 600 : 400,
                fontFamily:"inherit", width:"100%", textAlign:"left", whiteSpace:"nowrap",
              }}>
                <span style={{fontSize:"0.9rem", width:20, textAlign:"center", flexShrink:0}}>{t.icon}</span>
                {sidebarOpen && t.label}
              </button>
            ))}
          </div>

          {/* Today's progress */}
          {sidebarOpen && isCur && (
            <div style={{padding:"14px 16px 18px", borderTop:`1px solid ${T.borderLight}`}}>
              <div style={{fontSize:"0.58rem", textTransform:"uppercase", letterSpacing:"0.1em", color:T.textMuted, marginBottom:8, fontWeight:600}}>Today</div>
              <div style={{position:"relative", width:56, height:56, margin:"0 auto 8px"}}>
                <svg viewBox="0 0 36 36" width={56} height={56}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke={T.empty} strokeWidth="3"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke={T.accent} strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${todayPct}, 100`}
                    style={{transition:"stroke-dasharray 0.5s ease"}}/>
                </svg>
                <div style={{
                  position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"0.72rem", fontWeight:700, color:T.accent, fontFamily:"'SF Mono',Consolas,monospace",
                }}>{todayPct}%</div>
              </div>
              <div style={{textAlign:"center", fontSize:"0.65rem", color:T.textMuted}}>
                {todayDone}/{ms} completed
              </div>
            </div>
          )}

          {/* Export/Import */}
          {sidebarOpen && (
            <div style={{padding:"0 12px 14px", display:"flex", gap:4}}>
              <button onClick={handleExport} style={{
                flex:1, padding:"7px 0", borderRadius:6, border:`1px solid ${T.border}`,
                background:"transparent", color:T.textMuted, fontSize:"0.6rem", fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.06em", cursor:"pointer", fontFamily:"inherit",
              }}>Export</button>
              <button onClick={handleImport} style={{
                flex:1, padding:"7px 0", borderRadius:6, border:`1px solid ${T.border}`,
                background:"transparent", color:T.textMuted, fontSize:"0.6rem", fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.06em", cursor:"pointer", fontFamily:"inherit",
              }}>Import</button>
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{flex:1, overflow:"auto", padding:"0 28px 40px"}}>
          {/* Header */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"20px 0 16px", position:"sticky", top:0, background:T.bg, zIndex:10,
            borderBottom:`1px solid ${T.borderLight}`, marginBottom:20,
          }}>
            <div>
              <h1 style={{fontSize:"1.35rem", fontWeight:700, letterSpacing:"-0.03em", margin:0}}>
                habit<span style={{color:T.accent}}>.</span>log
              </h1>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <button onClick={prevMonth} style={{
                background:T.bgCard, border:`1px solid ${T.border}`, color:T.accent, borderRadius:8,
                width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"1rem", transition:"all 0.12s",
              }}>&#8249;</button>
              <span style={{
                fontFamily:"'SF Mono',Consolas,monospace", fontSize:"0.82rem", color:T.accent,
                minWidth:140, textAlign:"center", letterSpacing:"0.02em", fontWeight:600,
              }}>{MONTHS[vm]} {vy}</span>
              <button onClick={nextMonth} style={{
                background:T.bgCard, border:`1px solid ${T.border}`, color:T.accent, borderRadius:8,
                width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"1rem", transition:"all 0.12s",
              }}>&#8250;</button>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:8, marginBottom:20}}>
            {[
              {v: isCur ? streak : "\u2013", l:"Streak", c: streak >= 7 ? T.success : T.accent},
              {v: avg, l:"Avg Score"},
              {v: best, l:"Best Day"},
              {v: perfect, l:"Perfect Days", c: perfect > 0 ? T.success : T.accent},
              {v: filled.length, l:"Days Logged"},
              {v: ms, l:"Habits"},
            ].map(s => (
              <div key={s.l} style={{
                background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:10,
                padding:"14px 10px", textAlign:"center", display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:5, boxShadow:T.shadow,
              }}>
                <div style={{
                  fontSize:"1.2rem", fontWeight:700, color:s.c || T.accent, lineHeight:1,
                  fontFamily:"'SF Mono',Consolas,monospace", letterSpacing:"-0.02em",
                }}>{s.v}</div>
                <div style={{
                  fontSize:"0.55rem", color:T.textMuted, textTransform:"uppercase", letterSpacing:".1em", fontWeight:600,
                }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Grid View */}
          {tab === "grid" && (
            <div style={{display:"flex", gap:16}}>
              <div style={{flex:1, minWidth:0}}>
                <div style={{
                  background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:14,
                  padding:20, boxShadow:T.shadow,
                }}>
                  <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14}}>
                    <div style={{fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:".1em", color:T.textMuted, fontWeight:700}}>
                      Monthly Grid
                    </div>
                    <div style={{display:"flex", gap:12, alignItems:"center"}}>
                      <div style={{display:"flex", alignItems:"center", gap:5}}>
                        <div style={{width:14,height:14,borderRadius:3,background:T.done,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <CheckIcon color={T.doneText} size={9}/>
                        </div>
                        <span style={{fontSize:"0.6rem",color:T.textMuted}}>Done</span>
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:5}}>
                        <div style={{width:14,height:14,borderRadius:3,background:T.half,border:`1px solid ${T.halfBorder}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <HalfIcon color={T.halfText} size={8}/>
                        </div>
                        <span style={{fontSize:"0.6rem",color:T.textMuted}}>Half</span>
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:5}}>
                        <div style={{width:14,height:14,borderRadius:3,background:T.empty,border:`1px solid ${T.border}`}}/>
                        <span style={{fontSize:"0.6rem",color:T.textMuted}}>None</span>
                      </div>
                    </div>
                  </div>
                  {data.habits.length === 0 ? (
                    <div style={{textAlign:"center",padding:36,color:T.textMuted,fontSize:"0.82rem"}}>No habits yet — add some in Manage</div>
                  ) : (
                    <div style={{overflowX:"auto", paddingBottom:4}}>
                      <div style={{display:"grid", minWidth:"max-content", rowGap:2, columnGap:2,
                        gridTemplateColumns:`148px repeat(${days},28px)`}}>
                        <div style={{width:148}}/>
                        {Array.from({length:days},(_,i) => {
                          const isToday = isCur && i+1===TODAY_D;
                          return (
                            <div key={i} style={{
                              fontFamily:"'SF Mono',Consolas,monospace", fontSize:"0.55rem",
                              color: isToday ? T.accent : T.textMuted,
                              fontWeight: isToday ? 700 : 400,
                              display:"flex", alignItems:"center", justifyContent:"center", height:22, width:28,
                              cursor:"pointer",
                            }} onClick={() => setSelectedDay(selectedDay === dk(i+1) ? null : dk(i+1))}>
                              {i+1}
                            </div>
                          );
                        })}
                        {data.habits.map(h => (
                          <div key={h} style={{display:"contents"}}>
                            <div style={{
                              fontSize:"0.72rem", color:T.text, display:"flex", alignItems:"center",
                              justifyContent:"flex-end", paddingRight:10, height:28, whiteSpace:"nowrap",
                              overflow:"hidden", textOverflow:"ellipsis", width:148,
                            }}>{h}</div>
                            {Array.from({length:days},(_,i) => {
                              const d = i+1;
                              const isFut = isCur && d > TODAY_D;
                              if (isFut) return <div key={i} style={{
                                width:28,height:28,borderRadius:5,border:`1px solid ${T.borderLight}`,
                              }}/>;
                              const v = getVal(d, h);
                              const isToday = isCur && d===TODAY_D;
                              return (
                                <div key={i} onClick={()=>cycle(d,h)} style={{
                                  width:28, height:28, borderRadius:5, display:"flex", alignItems:"center",
                                  justifyContent:"center", cursor:"pointer", transition:"all 0.1s",
                                  userSelect:"none",
                                  background: v===1?T.done:v===0.5?T.half:T.empty,
                                  border: isToday ? `1.5px solid ${T.accentDeep}` :
                                          v===0.5 ? `1px solid ${T.halfBorder}` :
                                          v===0 ? `1px solid transparent` : `1px solid transparent`,
                                }}>
                                  {v===1 && <CheckIcon color={T.doneText} size={13}/>}
                                  {v===0.5 && <HalfIcon color={T.halfText} size={11}/>}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {selectedDay && (
                <div style={{width:280, flexShrink:0}}>
                  <DayDetail
                    dateKey={selectedDay}
                    data={data}
                    habits={data.habits}
                    theme={T}
                    onCycle={cycle}
                    onMomentChange={setMoment}
                  />
                </div>
              )}
            </div>
          )}

          {/* Weekly View */}
          {tab === "week" && (
            <div style={{
              background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:14,
              padding:20, boxShadow:T.shadow,
            }}>
              <div style={{fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:".1em", color:T.textMuted, fontWeight:700, marginBottom:14}}>
                This Week
              </div>
              {data.habits.length === 0 ? (
                <div style={{textAlign:"center",padding:36,color:T.textMuted,fontSize:"0.82rem"}}>No habits yet</div>
              ) : (
                <WeeklyView data={data} habits={data.habits} today={{y:TODAY_Y,m:TODAY_M,d:TODAY_D}} theme={T} onCycle={cycle}/>
              )}
            </div>
          )}

          {/* Scores */}
          {tab === "scores" && (
            <div style={{
              background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:14,
              padding:20, boxShadow:T.shadow,
            }}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14}}>
                <div style={{fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:".1em", color:T.textMuted, fontWeight:700}}>
                  Daily Scores — {MONTHS[vm]} {vy}
                </div>
                <div style={{fontSize:"0.7rem", color:T.textMuted, fontFamily:"'SF Mono',Consolas,monospace"}}>
                  max {ms}
                </div>
              </div>
              <ScoreChart scores={scores} days={days} maxScore={ms} theme={T}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:10,padding:"0 4px"}}>
                <span style={{fontSize:"0.6rem",color:T.textMuted}}>Day 1</span>
                <span style={{fontSize:"0.6rem",color:T.textMuted}}>Day {days}</span>
              </div>
            </div>
          )}

          {/* Health */}
          {tab === "health" && (
            <div style={{
              background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:14,
              padding:20, boxShadow:T.shadow,
            }}>
              <div style={{fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:".1em", color:T.textMuted, fontWeight:700, marginBottom:16}}>
                Completion Rate — {MONTHS[vm]} {vy}
              </div>
              {hStats.length === 0 ? (
                <div style={{textAlign:"center",padding:36,color:T.textMuted,fontSize:"0.82rem"}}>No data</div>
              ) : hStats.map(h => (
                <div key={h.name} style={{display:"flex", alignItems:"center", gap:12, marginBottom:10}}>
                  <div style={{width:148, fontSize:"0.75rem", color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flexShrink:0}}>{h.name}</div>
                  <div style={{flex:1, height:6, background:T.empty, borderRadius:99, overflow:"hidden"}}>
                    <div style={{
                      height:"100%", borderRadius:99,
                      background: h.pct >= 80 ? `linear-gradient(90deg, ${T.accentDeep}, ${T.accent})` :
                                  h.pct >= 50 ? T.accentDeep : T.warning,
                      width:`${h.pct}%`,
                      transition:"width 0.5s cubic-bezier(.4,0,.2,1)",
                    }}/>
                  </div>
                  <div style={{
                    fontFamily:"'SF Mono',Consolas,monospace", fontSize:"0.68rem",
                    color: h.pct >= 80 ? T.accent : h.pct >= 50 ? T.textSecondary : T.warning,
                    width:40, textAlign:"right", flexShrink:0, fontWeight:600,
                  }}>{h.pct}%</div>
                </div>
              ))}
            </div>
          )}

          {/* Streaks */}
          {tab === "streaks" && (
            <div style={{
              background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:14,
              padding:20, boxShadow:T.shadow,
            }}>
              <div style={{fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:".1em", color:T.textMuted, fontWeight:700, marginBottom:16}}>
                Streak Analysis
              </div>
              <StreakDisplay data={data} habits={data.habits} today={{y:TODAY_Y,m:TODAY_M,d:TODAY_D}} theme={T}/>
            </div>
          )}

          {/* Heatmap */}
          {tab === "heatmap" && (
            <div style={{
              background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:14,
              padding:20, boxShadow:T.shadow,
            }}>
              <div style={{fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:".1em", color:T.textMuted, fontWeight:700, marginBottom:16}}>
                Year Overview — {vy}
              </div>
              <Heatmap data={data} habits={data.habits} year={vy} theme={T}/>
              <div style={{display:"flex", alignItems:"center", gap:4, marginTop:8, justifyContent:"flex-end"}}>
                <span style={{fontSize:"0.58rem", color:T.textMuted}}>Less</span>
                {[T.empty, `rgba(107,163,190,0.15)`, `rgba(107,163,190,0.3)`, T.accentDeep, T.accent].map((c,i) => (
                  <div key={i} style={{width:11, height:11, borderRadius:2, background:c}}/>
                ))}
                <span style={{fontSize:"0.58rem", color:T.textMuted}}>More</span>
              </div>
            </div>
          )}

          {/* Moments */}
          {tab === "moments" && (
            <div style={{
              background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:14,
              padding:20, boxShadow:T.shadow,
            }}>
              <div style={{fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:".1em", color:T.textMuted, fontWeight:700, marginBottom:16}}>
                Memorable Moments — {MONTHS[vm]} {vy}
              </div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:10}}>
                {Array.from({length: isCur ? TODAY_D : days}, (_,i) => {
                  const d = (isCur ? TODAY_D : days) - i;
                  const key = dk(d);
                  const txt = data.entries[key]?.moment || "";
                  const dayScore = data.entries[key] ? Object.values(data.entries[key].habits).reduce((a,v)=>a+(Number(v)||0),0) : 0;
                  return (
                    <div key={key} style={{
                      background:T.empty, border:`1px solid ${T.border}`, borderRadius:12, padding:14,
                      transition:"border-color 0.12s",
                    }}>
                      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8}}>
                        <div style={{fontFamily:"'SF Mono',Consolas,monospace", fontSize:"0.6rem", color:T.accentDeep, textTransform:"uppercase", letterSpacing:".07em"}}>
                          {MONTH_SHORT[vm]} {d}
                        </div>
                        {dayScore > 0 && (
                          <div style={{fontSize:"0.58rem", color:T.textMuted, fontFamily:"'SF Mono',Consolas,monospace"}}>
                            {dayScore}/{ms}
                          </div>
                        )}
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Write a moment..."
                        value={txt}
                        onChange={e => setMoment(d, e.target.value)}
                        style={{
                          background:"transparent", border:"none", outline:"none",
                          fontSize:"0.8rem", color:T.text, lineHeight:1.55, width:"100%",
                          fontFamily:"inherit", resize:"none",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Manage */}
          {tab === "manage" && (
            <div style={{
              background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:14,
              padding:20, boxShadow:T.shadow,
            }}>
              <div style={{fontSize:"0.6rem", textTransform:"uppercase", letterSpacing:".1em", color:T.textMuted, fontWeight:700, marginBottom:16}}>
                Manage Habits
              </div>
              <div style={{fontSize:"0.7rem", color:T.textMuted, marginBottom:14}}>
                Drag to reorder, click name to rename, use arrows to move
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:6}}>
                {data.habits.map((h, idx) => {
                  const draft = editingH[h] ?? null;
                  const isEditing = draft !== null;
                  return (
                    <div key={h}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={e => onDragOver(e, idx)}
                      onDragEnd={onDragEnd}
                      style={{
                        display:"flex", alignItems:"center", gap:8,
                        opacity: dragIdx === idx ? 0.4 : 1,
                        padding:"4px 0",
                      }}>
                      <span style={{cursor:"grab", color:T.textMuted, fontSize:"1rem", padding:"0 4px", userSelect:"none", flexShrink:0}}>⠿</span>
                      <div style={{display:"flex", gap:3, flexShrink:0}}>
                        <button disabled={idx===0} onClick={()=>moveHabit(idx,-1)} style={{
                          background:T.bgCard, border:`1px solid ${T.border}`, color:T.textSecondary,
                          borderRadius:6, width:26, height:26, cursor:"pointer", display:"flex", alignItems:"center",
                          justifyContent:"center", fontSize:"0.75rem", flexShrink:0, transition:"all 0.12s",
                          opacity: idx===0 ? 0.2 : 1,
                        }}>↑</button>
                        <button disabled={idx===data.habits.length-1} onClick={()=>moveHabit(idx,1)} style={{
                          background:T.bgCard, border:`1px solid ${T.border}`, color:T.textSecondary,
                          borderRadius:6, width:26, height:26, cursor:"pointer", display:"flex", alignItems:"center",
                          justifyContent:"center", fontSize:"0.75rem", flexShrink:0, transition:"all 0.12s",
                          opacity: idx===data.habits.length-1 ? 0.2 : 1,
                        }}>↓</button>
                      </div>
                      {isEditing ? (
                        <input autoFocus value={draft}
                          onChange={e => setEditingH(p => ({...p, [h]: e.target.value}))}
                          onKeyDown={e => {
                            if (e.key === "Enter") renameHabit(h, draft);
                            if (e.key === "Escape") setEditingH(p => { const {[h]:_,...r}=p; return r; });
                          }}
                          style={{
                            flex:1, background:T.empty, border:`1px solid ${T.accent}`, borderRadius:8,
                            padding:"8px 12px", color:T.text, fontSize:"0.8rem", fontFamily:"inherit", outline:"none",
                          }}
                        />
                      ) : (
                        <div onClick={() => setEditingH(p => ({...p, [h]: h}))} style={{
                          flex:1, background:T.empty, border:`1px solid ${T.border}`, borderRadius:8,
                          padding:"8px 12px", color:T.text, fontSize:"0.8rem", cursor:"text",
                          display:"flex", alignItems:"center",
                        }}>{h}</div>
                      )}
                      <div style={{display:"flex", gap:4, flexShrink:0}}>
                        {isEditing ? (
                          <>
                            <button onClick={() => renameHabit(h, draft)} style={{
                              padding:"8px 12px", borderRadius:8, fontSize:"0.68rem", fontWeight:700,
                              cursor:"pointer", border:"none", fontFamily:"inherit", textTransform:"uppercase",
                              letterSpacing:".04em", background:T.accentDeep, color:T.bg,
                            }}>Save</button>
                            <button onClick={() => setEditingH(p => { const {[h]:_,...r}=p; return r; })} style={{
                              padding:"8px 12px", borderRadius:8, fontSize:"0.68rem", fontWeight:700,
                              cursor:"pointer", border:`1px solid ${T.border}`, fontFamily:"inherit",
                              textTransform:"uppercase", letterSpacing:".04em", background:"transparent", color:T.textSecondary,
                            }}>Cancel</button>
                          </>
                        ) : (
                          <button onClick={() => removeHabit(h)} style={{
                            padding:"8px 12px", borderRadius:8, fontSize:"0.68rem", fontWeight:700,
                            cursor:"pointer", border:`1px solid ${T.border}`, fontFamily:"inherit",
                            textTransform:"uppercase", letterSpacing:".04em", background:"transparent", color:T.textMuted,
                            transition:"all 0.12s",
                          }}
                            onMouseEnter={e => { e.target.style.borderColor = T.danger; e.target.style.color = T.danger; }}
                            onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.color = T.textMuted; }}
                          >Remove</button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div style={{display:"flex", alignItems:"center", gap:8, marginTop:12, paddingTop:12, borderTop:`1px solid ${T.borderLight}`}}>
                  <input placeholder="New habit..." value={newH} onChange={e=>setNewH(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&addHabit()}
                    style={{
                      flex:1, background:T.empty, border:`1px solid ${T.border}`, borderRadius:8,
                      padding:"10px 14px", color:T.text, fontSize:"0.82rem", fontFamily:"inherit", outline:"none",
                    }}
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                  <button onClick={addHabit} style={{
                    padding:"10px 18px", borderRadius:8, fontSize:"0.72rem", fontWeight:700,
                    cursor:"pointer", border:"none", fontFamily:"inherit", textTransform:"uppercase",
                    letterSpacing:".05em", background:T.accentDeep, color:T.bg,
                  }}>Add</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
