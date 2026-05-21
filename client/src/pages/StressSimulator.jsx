// client/src/pages/StressSimulator.jsx
// ============================================================
// FinMetrics — Stress Testing Simulator  (FULLY DYNAMIC)
// Reads real baseline from DB, saves/loads scenarios, persists results
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import api from "../services/api.js";

// ─────────────────────────────────────────────────────────────
// GLOBAL STYLES  (injected once)
// ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  :root {
    --bg:           #050c18;
    --bg-2:         #070f1e;
    --glass:        rgba(255,255,255,0.038);
    --glass-border: rgba(255,255,255,0.075);
    --glass-hover:  rgba(255,255,255,0.062);
    --glow-blue:    rgba(59,130,246,0.18);
    --glow-green:   rgba(34,197,94,0.18);
    --glow-red:     rgba(239,68,68,0.18);
    --glow-yellow:  rgba(245,158,11,0.16);
    --text-1:       #f1f5f9;
    --text-2:       #94a3b8;
    --text-3:       #475569;
    --text-4:       #1e293b;
    --blue:         #3b82f6;
    --blue-dark:    #2563eb;
    --green:        #22c55e;
    --yellow:       #f59e0b;
    --red:          #ef4444;
    --orange:       #f97316;
    --radius-sm:    10px;
    --radius-md:    14px;
    --radius-lg:    20px;
    --radius-xl:    24px;
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
    background: var(--bg);
    color: var(--text-1);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--blue); }

  .sim-page-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(96,165,250,0.022) 1px, transparent 1px),
      linear-gradient(90deg, rgba(96,165,250,0.022) 1px, transparent 1px);
    background-size: 54px 54px;
    mask-image: radial-gradient(ellipse 120% 80% at 50% 0%, black 40%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 120% 80% at 50% 0%, black 40%, transparent 100%);
  }

  .glass {
    background: var(--glass);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
    box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset;
  }
  .glass-strong {
    background: rgba(255,255,255,0.055);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(255,255,255,0.095);
    box-shadow: 0 12px 40px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.06) inset;
  }

  .card-hover {
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  }
  .card-hover:hover {
    transform: translateY(-3px) scale(1.004);
    border-color: rgba(255,255,255,0.13) !important;
    box-shadow: 0 18px 52px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.12), 0 1px 0 rgba(255,255,255,0.07) inset;
  }

  .reveal-hidden { opacity: 0; transform: translateY(22px) scale(0.984); }
  .reveal-visible {
    opacity: 1 !important; transform: translateY(0) scale(1) !important;
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }

  input[type=range] {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 3px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px; outline: none; cursor: pointer;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; border: 2.5px solid var(--blue);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.22), 0 2px 6px rgba(0,0,0,0.5);
    cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  input[type=range]::-webkit-slider-thumb:hover {
    transform: scale(1.3);
    box-shadow: 0 0 0 5px rgba(59,130,246,0.28), 0 2px 6px rgba(0,0,0,0.5);
  }

  .tog-track {
    display: inline-flex; align-items: center; cursor: pointer;
    width: 40px; height: 22px; border-radius: 11px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    padding: 2px; transition: all 0.22s ease; position: relative;
  }
  .tog-track.on { background: rgba(37,99,235,0.65); border-color: rgba(59,130,246,0.55); }
  .tog-knob {
    width: 16px; height: 16px; border-radius: 50%; background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.45);
    transition: transform 0.22s cubic-bezier(0.34,1.1,0.64,1);
  }
  .tog-track.on .tog-knob { transform: translateX(18px); }

  select {
    appearance: none; -webkit-appearance: none;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius-sm);
    color: var(--text-1); font-family: inherit; font-size: 13px;
    padding: 7px 32px 7px 11px; cursor: pointer; outline: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  select:focus { border-color: rgba(59,130,246,0.5); box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
  select option { background: #0d1829; color: var(--text-1); }

  input[type=number] {
    appearance: none; -moz-appearance: textfield;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.11);
    border-radius: 8px; color: var(--text-1);
    font-family: inherit; font-size: 13px; font-weight: 600;
    text-align: center; padding: 6px 6px; width: 66px; outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  input[type=number]:focus { border-color: rgba(59,130,246,0.5); box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    border: none; cursor: pointer; font-family: inherit;
    letter-spacing: -0.01em; transition: all 0.18s ease;
    border-radius: var(--radius-sm);
  }
  .btn:active { transform: scale(0.985) !important; }
  .btn:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

  .btn-primary {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff; font-size: 14px; font-weight: 600; padding: 12px 22px;
    box-shadow: 0 4px 16px rgba(37,99,235,0.38);
  }
  .btn-primary:hover { transform: scale(1.02); box-shadow: 0 0 24px rgba(37,99,235,0.55); opacity: 0.93; }

  .btn-secondary {
    background: rgba(255,255,255,0.06); color: var(--text-2);
    border: 1px solid rgba(255,255,255,0.11);
    font-size: 13px; font-weight: 500; padding: 11px 20px;
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.1); color: var(--text-1); border-color: rgba(255,255,255,0.18); transform: scale(1.01); }

  .btn-ghost {
    background: transparent; color: var(--text-3);
    border: 1px solid rgba(255,255,255,0.09);
    font-size: 13px; font-weight: 500; padding: 11px 18px;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.04); color: var(--text-2); border-color: rgba(255,255,255,0.16); transform: scale(1.01); }

  .chip {
    display: inline-flex; align-items: center;
    padding: 5px 13px; border-radius: 999px;
    font-size: 12px; font-weight: 600; font-family: inherit;
    border: 1px solid; cursor: pointer; white-space: nowrap;
    transition: all 0.2s ease; letter-spacing: 0.01em;
  }
  .chip:hover { transform: translateY(-1px); }
  .chip-idle { background: rgba(255,255,255,0.04); color: var(--text-3); border-color: rgba(255,255,255,0.09); }
  .chip-idle:hover { background: rgba(255,255,255,0.07); color: var(--text-2); border-color: rgba(255,255,255,0.18); }
  .chip-active { background: rgba(37,99,235,0.2); color: #93c5fd; border-color: rgba(59,130,246,0.45); box-shadow: 0 0 14px rgba(37,99,235,0.25); }

  .risk-badge { transition: background 0.5s ease, color 0.5s ease, border-color 0.5s ease; }
  .tip-wrap { position: relative; display: inline-flex; align-items: center; }
  .tip-box {
    display: none; position: absolute; bottom: calc(100% + 8px); left: 50%;
    transform: translateX(-50%);
    background: rgba(7,13,26,0.97); border: 1px solid rgba(255,255,255,0.11);
    border-radius: 9px; padding: 8px 12px; font-size: 11px; color: var(--text-2);
    line-height: 1.55; z-index: 100; pointer-events: none; white-space: nowrap;
    max-width: 210px; white-space: normal; text-align: center;
    box-shadow: 0 10px 28px rgba(0,0,0,0.7);
  }
  .tip-wrap:hover .tip-box { display: block; }
  .trow { transition: background 0.16s ease; }
  .trow:hover { background: rgba(255,255,255,0.035) !important; }

  .saved-card {
    border-radius: 13px; padding: 13px 15px;
    background: rgba(255,255,255,0.026); border: 1px solid rgba(255,255,255,0.065);
    cursor: pointer; transition: all 0.22s ease;
  }
  .saved-card:hover {
    background: rgba(255,255,255,0.05); border-color: rgba(59,130,246,0.24);
    transform: translateX(3px); box-shadow: 0 4px 18px rgba(0,0,0,0.35);
  }

  .progress-fill { animation: progressFill 1.1s cubic-bezier(0.25,0.46,0.45,0.94) both; }
  .result-enter { animation: resultEnter 0.5s cubic-bezier(0.25,0.46,0.45,0.94) both; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes blinkDot { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
  @keyframes shimmer { 0%,100% { opacity:0.45; } 50% { opacity:0.8; } }
  @keyframes progressFill { from { width: 0%; } to { width: 100%; } }
  @keyframes resultEnter { from { opacity:0; transform: scale(0.96) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
  @keyframes lineDrawIn { from { stroke-dashoffset: 3000; } to { stroke-dashoffset: 0; } }
  @keyframes countEnter { 0% { opacity:0; transform:scale(0.85); } 60% { transform:scale(1.05); } 100% { opacity:1; transform:scale(1); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulseRing {
    0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.35); }
    70% { box-shadow: 0 0 0 9px rgba(59,130,246,0); }
    100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
  }

  .blink { animation: blinkDot 1.8s ease-in-out infinite; }
  .shim  { animation: shimmer 2s ease-in-out infinite; }
  .spin  { animation: spin 0.85s linear infinite; }
`;

// ─────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────
function useRevealOnScroll() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -28px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function useCountUp(target, duration = 1400, decimals = 0, trigger = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) { setVal(0); return; }
    let start = null;
    const id = requestAnimationFrame(function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(parseFloat((eased * target).toFixed(decimals)));
      if (p < 1) requestAnimationFrame(step);
      else setVal(target);
    });
    return () => cancelAnimationFrame(id);
  }, [target, trigger, duration, decimals]);
  return val;
}

// ─────────────────────────────────────────────────────────────
// SCENARIO PRESETS
// ─────────────────────────────────────────────────────────────
const PRESETS = {
  "Mild Slowdown":  { revenuePct: -10, expensePct:   0, hiring:  0, marketingPct:  -5, marketShock: "Low",  investPct:  -5 },
  "Recession":      { revenuePct: -30, expensePct:   5, hiring: -2, marketingPct: -20, marketShock: "High", investPct: -20 },
  "Hyper Growth":   { revenuePct:  40, expensePct:  18, hiring:  5, marketingPct:  30, marketShock: "None", investPct:  10 },
  "Cost Reduction": { revenuePct:   0, expensePct: -20, hiring: -3, marketingPct: -30, marketShock: "None", investPct:   0 },
};

const DEFAULT_PARAMS = {
  revenuePct: 0, expensePct: 0, hiring: 0,
  marketingPct: 0, interestPct: 0,
  marketShock: "None", investPct: 0, hasDebt: false,
};

// ─────────────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, style = {}, className = "" }) {
  const [ref, visible] = useRevealOnScroll();
  return (
    <div ref={ref} className={`${visible ? "reveal-visible" : "reveal-hidden"} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms", ...style }}>
      {children}
    </div>
  );
}

function SvgIcon({ d, size = 16, color = "currentColor", sw = 1.8, fill = "none" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill}
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function RiskPill({ level }) {
  const styles = {
    Low:    { bg: "rgba(34,197,94,0.12)",  bd: "rgba(34,197,94,0.28)",  tx: "#86efac", dot: "#22c55e" },
    Medium: { bg: "rgba(245,158,11,0.12)", bd: "rgba(245,158,11,0.28)", tx: "#fcd34d", dot: "#f59e0b" },
    High:   { bg: "rgba(239,68,68,0.14)",  bd: "rgba(239,68,68,0.32)",  tx: "#fca5a5", dot: "#ef4444" },
  };
  const s = styles[level] || styles.Medium;
  return (
    <span className="risk-badge" style={{
      display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700,
      padding: "4px 13px", borderRadius: 999,
      background: s.bg, border: `1px solid ${s.bd}`, color: s.tx,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }} className="blink" />
      {level} Risk
    </span>
  );
}

function Delta({ val, suffix = "" }) {
  if (val === 0 || val == null) return <span style={{ fontSize: 12, color: "#475569" }}>—</span>;
  const pos = val > 0;
  const clr = pos ? "#ef4444" : "#22c55e";
  const arr = pos ? "▲" : "▼";
  const abs = Math.abs(typeof val === "number" && !Number.isInteger(val) ? +val.toFixed(1) : val);
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color: clr, display: "inline-flex", alignItems: "center", gap: 3 }}>
      {arr} {abs}{suffix}
    </span>
  );
}

function RiskRing({ score, size = 92, trigger = true }) {
  const animated = useCountUp(score, 1500, 0, trigger);
  const display = animated;
  const r = 35; const circ = 2 * Math.PI * r;
  const offset = circ - (circ * display) / 100;
  const clr = score >= 70 ? "#ef4444" : score >= 44 ? "#f59e0b" : "#22c55e";
  const glow = score >= 70 ? "rgba(239,68,68,.55)" : score >= 44 ? "rgba(245,158,11,.5)" : "rgba(34,197,94,.45)";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(255,255,255,0.065)" strokeWidth={7} />
        <circle cx={40} cy={40} r={r} fill="none" stroke={clr} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
          style={{ filter: `drop-shadow(0 0 9px ${glow})`, transition: "stroke-dashoffset .06s linear" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: clr, letterSpacing: "-0.03em", lineHeight: 1, animation: trigger ? "countEnter 0.5s ease-out" : "none" }}>
          {display}
        </span>
        <span style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>/100</span>
      </div>
    </div>
  );
}

function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100 || 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, height: 2 }}>
      <div style={{
        height: "100%", background: "linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa)",
        width: `${pct}%`, transition: "width .08s linear",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 24, br = 8 }) {
  return (
    <div style={{ width: w, height: h, borderRadius: br, background: "rgba(255,255,255,0.06)", animation: "shimmer 1.6s ease-in-out infinite" }} />
  );
}

// ─────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────
function AppHeader({ hasUnsaved, lastSimTime, companyName, loading }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 80,
      background: "rgba(5,12,24,0.92)",
      backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
      borderBottom: "1px solid rgba(255,255,255,0.065)",
      boxShadow: "0 4px 28px rgba(0,0,0,0.5)",
    }}>
      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(37,99,235,.55)" }}>
              <SvgIcon d="M3 17l4-8 4 4 4-6 4 10" size={15} color="white" sw={2} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.03em" }}>FinMetrics</span>
          </div>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <SvgIcon d="M13 10V3L4 14h7v7l9-11h-7z" size={14} color="#3b82f6" sw={2} />
              <h1 style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.025em" }}>Stress Testing Simulator</h1>
              {hasUnsaved && (
                <div className="tip-wrap" style={{ marginLeft: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", display: "block" }} className="blink" />
                  <div className="tip-box">Unsaved scenario changes</div>
                </div>
              )}
            </div>
            <p style={{ fontSize: 11, color: "#334155", marginTop: 1 }}>
              {loading ? "Loading your financial baseline…" : `Simulating on ${companyName || "your company"}'s live data`}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {lastSimTime && (
            <span style={{ fontSize: 12, color: "#334155", display: "flex", alignItems: "center", gap: 5 }}>
              <SvgIcon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={12} color="#334155" />
              Last simulated: {lastSimTime}
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: loading ? "#f59e0b" : "#22c55e" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: loading ? "#f59e0b" : "#22c55e" }} className="blink" />
            {loading ? "Loading…" : "Live DB data"}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// BASELINE KPI ROW  (real DB data)
// ─────────────────────────────────────────────────────────────
const KPI_CONFIG = [
  { id: "cash",    label: "Cash Balance",    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", color: "#60a5fa", format: v => `$${(v/1000).toFixed(0)}K` },
  { id: "revenue", label: "Monthly Revenue", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",  color: "#34d399",  format: v => `$${(v/1000).toFixed(0)}K/mo` },
  { id: "expenses",label: "Monthly Expenses",icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "#f97316", format: v => `$${(v/1000).toFixed(0)}K/mo` },
  { id: "netBurn", label: "Net Burn Rate",   icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z", color: "#fbbf24", format: v => v === 0 ? "$0/mo" : `$${(v/1000).toFixed(1)}K/mo` },
  { id: "runway",  label: "Current Runway",  icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "#a78bfa", format: v => `${v} mo` },
];

function BaselineKpiRow({ baseline, loading }) {
  const [ref, vis] = useRevealOnScroll();
  const netBurn = Math.max((baseline?.expenses || 0) - (baseline?.revenue || 0), 0);
  const values = {
    cash: baseline?.cash || 0,
    revenue: baseline?.revenue || 0,
    expenses: baseline?.expenses || 0,
    netBurn,
    runway: baseline?.runway || 0,
  };

  return (
    <div ref={ref}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
        {KPI_CONFIG.map((k, i) => (
          <Reveal key={k.id} delay={i * 75}>
            <div className="glass card-hover" style={{ borderRadius: 18, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${k.color}66,transparent)`, borderRadius: "18px 18px 0 0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${k.color}1a`, border: `1px solid ${k.color}2e`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SvgIcon d={k.icon} size={15} color={k.color} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: "0.07em", textTransform: "uppercase" }}>{k.label}</span>
              </div>
              {loading ? (
                <Skeleton h={34} />
              ) : (
                <div style={{ fontSize: 27, fontWeight: 800, color: k.color, letterSpacing: "-0.035em", lineHeight: 1 }}>
                  {k.format(values[k.id])}
                </div>
              )}
              <div style={{ marginTop: 10, height: 2, borderRadius: 1, background: `${k.color}1a` }}>
                <div style={{ height: "100%", width: "100%", background: `linear-gradient(90deg,${k.color}55,${k.color}18)`, borderRadius: 1 }} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <p style={{ marginTop: 10, fontSize: 11, color: "#1e293b", textAlign: "right" }}>
        {loading ? "Fetching your live financial baseline from database…" : "Baseline reflects your most recent financial snapshot from the database."}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTROL ROW
// ─────────────────────────────────────────────────────────────
function ControlRow({ label, hint, min, max, step = 1, value, onChange, unit = "%", tipText = "" }) {
  const basePct = ((0 - min) / (max - min)) * 100;
  const valPct  = ((value - min) / (max - min)) * 100;
  const clr     = value > 0 ? "#60a5fa" : value < 0 ? "#f87171" : "#94a3b8";
  const low  = Math.min(basePct, valPct);
  const wide = Math.abs(valPct - basePct);

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{label}</span>
          {tipText && (
            <div className="tip-wrap">
              <div style={{ width: 15, height: 15, borderRadius: "50%", background: "rgba(255,255,255,0.065)", border: "1px solid rgba(255,255,255,0.11)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>
                <span style={{ fontSize: 8, color: "#475569", fontWeight: 700 }}>?</span>
              </div>
              <div className="tip-box">{tipText}</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: clr, minWidth: 50, textAlign: "right" }}>
            {value > 0 ? "+" : ""}{value}{unit}
          </span>
          <input type="number" min={min} max={max} step={step} value={value}
            onChange={e => onChange(Math.min(max, Math.max(min, +e.target.value)))} />
        </div>
      </div>
      <div style={{ position: "relative", paddingTop: 3 }}>
        <div style={{ position: "absolute", left: `${basePct}%`, top: -3, width: 2, height: 10, background: "rgba(255,255,255,0.3)", borderRadius: 1, transform: "translateX(-50%)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: `${low}%`, width: `${wide}%`, height: 3, background: `${clr}55`, borderRadius: 2, zIndex: 1, pointerEvents: "none", transition: "all 0.18s ease" }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(+e.target.value)} />
      </div>
      {hint && <p style={{ fontSize: 11, color: "#334155", marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCENARIO CONTROLS
// ─────────────────────────────────────────────────────────────
function ScenarioControls({ params, setParams, onRun, onReset, onSave, running, activePreset, setActivePreset, baseline }) {
  const isChanged = JSON.stringify(params) !== JSON.stringify(DEFAULT_PARAMS);
  const set = key => val => { setParams(p => ({ ...p, [key]: val })); setActivePreset(null); };

  const applyPreset = name => {
    setActivePreset(name);
    setParams(p => ({ ...DEFAULT_PARAMS, hasDebt: p.hasDebt, ...PRESETS[name] }));
  };

  const hcpm = baseline?.headCostPerMonth || 6000;

  return (
    <Reveal>
      <div className="glass" style={{ borderRadius: 22, padding: "26px 24px", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.025em" }}>Scenario Controls</h2>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Adjust variables to model your scenario</p>
          </div>
          {isChanged && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#f59e0b", padding: "3px 10px", borderRadius: 999, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.22)" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b" }} className="blink" />
              Modified
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>Quick Presets</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {Object.keys(PRESETS).map(name => (
              <button key={name} className={`chip ${activePreset === name ? "chip-active" : "chip-idle"}`}
                onClick={() => applyPreset(name)}>{name}</button>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.065)", marginBottom: 20 }} />

        <div style={{ flex: 1, overflowY: "auto", paddingRight: 2 }}>
          <ControlRow label="Revenue Change" unit="%" min={-60} max={80}
            value={params.revenuePct} onChange={set("revenuePct")}
            hint={baseline ? `Baseline: $${(baseline.revenue/1000).toFixed(0)}K/mo` : "Change in monthly recurring revenue"}
            tipText="Positive = growth. Negative = decline. Market shock compounds this." />

          <ControlRow label="Expense Change" unit="%" min={-40} max={60}
            value={params.expensePct} onChange={set("expensePct")}
            hint={baseline ? `Baseline: $${(baseline.expenses/1000).toFixed(0)}K/mo` : "Applied to core operating costs"} />

          <ControlRow label="Hiring Change" unit=" FTE" min={-10} max={15}
            value={params.hiring} onChange={set("hiring")}
            hint={`~$${(hcpm/1000).toFixed(0)}K/mo per FTE based on your expense data`}
            tipText="Each FTE adds to monthly burn. Negative = layoffs or attrition." />

          <ControlRow label="Marketing Spend" unit="%" min={-80} max={100}
            value={params.marketingPct} onChange={set("marketingPct")}
            hint="Relative to current marketing allocation (15% of expenses)" />

          <ControlRow label="Investment / Cash Injection" unit="%" min={-50} max={50}
            value={params.investPct} onChange={set("investPct")}
            hint={baseline ? `Applied to your $${(baseline.cash/1000).toFixed(0)}K cash balance` : "Applied to cash reserve at period start"}
            tipText="Positive = new investment or cash injected into the business." />

          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>Market Shock</span>
                <div className="tip-wrap">
                  <div style={{ width: 15, height: 15, borderRadius: "50%", background: "rgba(255,255,255,0.065)", border: "1px solid rgba(255,255,255,0.11)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>
                    <span style={{ fontSize: 8, color: "#475569", fontWeight: 700 }}>?</span>
                  </div>
                  <div className="tip-box">Applies a macro shock multiplier to revenue: Low −4%, Med −10%, High −20%.</div>
                </div>
              </div>
              <select value={params.marketShock} onChange={e => set("marketShock")(e.target.value)} style={{ width: 115 }}>
                {["None", "Low", "Med", "High"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <p style={{ fontSize: 11, color: "#334155" }}>External market disruption affecting revenue</p>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: params.hasDebt ? 12 : 0 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>Has Debt?</span>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div className={`tog-track ${params.hasDebt ? "on" : ""}`}
                  onClick={() => setParams(p => ({ ...p, hasDebt: !p.hasDebt }))}>
                  <div className="tog-knob" />
                </div>
                <span style={{ fontSize: 12, color: params.hasDebt ? "#93c5fd" : "#475569" }}>
                  {params.hasDebt ? "Enabled" : "Off"}
                </span>
              </label>
            </div>
            {params.hasDebt && (
              <ControlRow label="Interest Rate Δ" unit="%" min={-5} max={15} step={0.5}
                value={params.interestPct} onChange={set("interestPct")}
                hint="Applied to monthly debt payment" />
            )}
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.065)", margin: "16px 0" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <button className="btn btn-primary" onClick={onRun} disabled={running}
            style={{ width: "100%", padding: "13px 22px", fontSize: 14, borderRadius: 12 }}>
            {running ? (
              <>
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="white" strokeWidth={2} className="spin">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Simulating…
              </>
            ) : (
              <>
                <SvgIcon d="M13 10V3L4 14h7v7l9-11h-7z" size={15} color="white" sw={2} />
                Run Simulation
              </>
            )}
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button className="btn btn-secondary" onClick={onReset} style={{ borderRadius: 11 }}>
              <SvgIcon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" size={13} color="#94a3b8" />
              Reset
            </button>
            <button className="btn btn-ghost" onClick={onSave} style={{ borderRadius: 11 }}>
              <SvgIcon d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" size={13} color="#64748b" />
              Save
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────
// SIMULATION RESULTS
// ─────────────────────────────────────────────────────────────
function SimulationResults({ result, hasRun, onGenerate, baseline }) {
  const [ref, vis] = useRevealOnScroll();
  const runwayAnim   = useCountUp(result?.runway  || 0, 1400, 1, hasRun && vis);
  const survivalAnim = useCountUp(result?.survivalPct || 0, 1300, 0, hasRun && vis);

  if (!hasRun) {
    return (
      <Reveal delay={80}>
        <div className="glass" style={{ borderRadius: 22, padding: "32px 28px", minHeight: 540, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
          <div style={{ width: "100%", maxWidth: 380, opacity: 0.1 }}>
            <svg viewBox="0 0 380 130" width="100%" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="ghostGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,105 C55,85 110,55 175,65 C240,75 305,45 380,35 L380,130 L0,130 Z" fill="url(#ghostGrad)" />
              <path d="M0,105 C55,85 110,55 175,65 C240,75 305,45 380,35" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <SvgIcon d="M13 10V3L4 14h7v7l9-11h-7z" size={22} color="#3b82f6" sw={1.8} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>No simulation yet</p>
            <p style={{ fontSize: 13, color: "#334155", maxWidth: 290, lineHeight: 1.65, margin: "0 auto" }}>
              Adjust scenario inputs and run a simulation to see projected runway and risk based on your live data.
            </p>
          </div>
        </div>
      </Reveal>
    );
  }

  const r = result;
  const baselineRunway = baseline?.runway || 0;
  const baselineRisk   = baseline?.riskScore || 50;
  const baselineRiskLevel = baseline?.riskLevel || "Medium";

  return (
    <div ref={ref} className="result-enter" style={{ height: "100%" }}>
      <div className="glass-strong" style={{ borderRadius: 22, padding: "26px 24px", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.025em" }}>Simulation Results</h2>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Projected outcomes for this scenario</p>
          </div>
          <RiskPill level={r.riskLevel} />
        </div>

        <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginBottom: 22, overflow: "hidden" }}>
          <div className="progress-fill" style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#2563eb,#60a5fa)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {/* Runway */}
          <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.075)", padding: "16px 18px" }}>
            <p style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginBottom: 7, letterSpacing: "0.06em", textTransform: "uppercase" }}>Runway</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{
                fontSize: 38, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1,
                color: r.runway < 3 ? "#ef4444" : r.runway < 6 ? "#f59e0b" : "#22c55e",
                animation: "countEnter 0.55s ease-out",
              }}>
                {runwayAnim.toFixed(1)}
              </span>
              <span style={{ fontSize: 15, color: "#64748b" }}>mo</span>
            </div>
            <div style={{ marginTop: 5 }}><Delta val={r.runwayDelta} suffix=" mo" /></div>
          </div>

          {/* Risk score */}
          <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.075)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <RiskRing score={r.riskScore} size={84} trigger={vis} />
            <div>
              <p style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginBottom: 7, letterSpacing: "0.06em", textTransform: "uppercase" }}>Risk Score</p>
              <Delta val={r.scoreDelta} suffix=" pts" />
              <p style={{ fontSize: 11, color: "#334155", marginTop: 5 }}>vs {baselineRisk} baseline</p>
            </div>
          </div>

          {/* Survival */}
          <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.075)", padding: "16px 18px" }}>
            <p style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginBottom: 7, letterSpacing: "0.06em", textTransform: "uppercase" }}>Survival (12 mo)</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
              <span style={{
                fontSize: 38, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1,
                color: r.survivalPct >= 70 ? "#22c55e" : r.survivalPct >= 45 ? "#f59e0b" : "#ef4444",
                animation: "countEnter 0.55s ease-out",
              }}>
                {survivalAnim}
              </span>
              <span style={{ fontSize: 15, color: "#64748b" }}>%</span>
            </div>
          </div>

          {/* Net Burn */}
          <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.075)", padding: "16px 18px" }}>
            <p style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginBottom: 7, letterSpacing: "0.06em", textTransform: "uppercase" }}>Net Burn/mo</p>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#f97316", letterSpacing: "-0.03em" }}>
              ${(r.netBurn / 1000).toFixed(1)}K
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 400 }}>/mo</span>
            </div>
            {r.burnChangePct !== 0 && <div style={{ marginTop: 5 }}><Delta val={r.burnChangePct} suffix="%" /></div>}
          </div>
        </div>

        {/* Baseline vs Simulated */}
        <div style={{ borderRadius: 13, background: "rgba(255,255,255,0.026)", border: "1px solid rgba(255,255,255,0.065)", padding: "14px 16px", marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>Baseline vs Simulated</p>
          {[
            { label: "Runway",     base: `${baselineRunway.toFixed(1)} mo`, sim: `${r.runway.toFixed(1)} mo`, delta: r.runwayDelta, suf: " mo" },
            { label: "Risk Score", base: String(baselineRisk),              sim: String(r.riskScore),          delta: r.scoreDelta,  suf: " pts" },
            { label: "Risk Level", base: baselineRiskLevel,                 sim: r.riskLevel,                  delta: null },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 9, marginBottom: 9, borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.046)" : "none" }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{row.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#475569" }}>{row.base}</span>
                <SvgIcon d="M14 5l7 7m0 0l-7 7m7-7H3" size={10} color="#1e293b" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{row.sim}</span>
                {row.delta !== null && <Delta val={row.delta} suffix={row.suf} />}
              </div>
            </div>
          ))}
        </div>

        {/* Why this changed */}
        <div style={{ borderRadius: 12, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(59,130,246,0.18)", padding: "13px 15px", marginBottom: 14, flex: 1 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(59,130,246,0.16)", border: "1px solid rgba(59,130,246,0.26)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <SvgIcon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={13} color="#60a5fa" />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#60a5fa", marginBottom: 5 }}>Why this changed</p>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.65 }}>
                Revenue {r.revDelta > 0 ? "+" : ""}{r.revDelta}%
                {r.burnChangePct !== 0 ? ` ${r.burnChangePct > 0 ? "increased" : "decreased"} burn rate by ${Math.abs(r.burnChangePct).toFixed(0)}%,` : ""}
                {" "}
                {r.runwayDelta < 0
                  ? `reducing runway by ${Math.abs(r.runwayDelta).toFixed(1)} months.`
                  : `extending runway by ${r.runwayDelta.toFixed(1)} months.`}
              </p>
              <p style={{ fontSize: 12, color: "#60a5fa", marginTop: 7, fontWeight: 500 }}>
                With revenue {r.revDelta > 0 ? "+" : ""}{r.revDelta}%, runway{" "}
                {r.runway < baselineRunway
                  ? `drops from ${baselineRunway.toFixed(1)} to ${r.runway.toFixed(1)} months.`
                  : `extends from ${baselineRunway.toFixed(1)} to ${r.runway.toFixed(1)} months.`}
              </p>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onGenerate} style={{ width: "100%", fontSize: 13, borderRadius: 12 }}>
          <SvgIcon d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" size={14} color="white" />
          Generate Recommendations
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CASH PROJECTION CHART
// ─────────────────────────────────────────────────────────────
function CashProjectionChart({ result, hasRun, baseline }) {
  const [ref, vis] = useRevealOnScroll();
  const [tooltip, setTooltip] = useState(null);
  const [showSim, setShowSim] = useState(true);

  const W = 820, H = 220;
  const P = { t: 22, r: 28, b: 46, l: 70 };
  const cW = W - P.l - P.r, cH = H - P.t - P.b;
  const X_TICKS = [0, 1, 2, 3, 6, 9, 12];

  // Build baseline projection from real DB data
  const baselineBurn = Math.max((baseline?.expenses || 0) - (baseline?.revenue || 0), 0);
  const baseCash     = baseline?.cash || 0;

  const baseData = result?.simLine || Array.from({ length: 13 }, (_, m) => ({
    month: m,
    baseCash: Math.max(0, baseCash - baselineBurn * m),
    simCash: Math.max(0, baseCash - baselineBurn * m),
  }));

  const maxCash = Math.max(...baseData.map(d => Math.max(d.baseCash, d.simCash)), 1);
  const fmtK = v => `$${(v / 1000).toFixed(0)}K`;

  const sx = m => P.l + (m / 12) * cW;
  const sy = c => P.t + ((maxCash - c) / maxCash) * cH;

  const mkPath = key => baseData.map((d, i) => `${i === 0 ? "M" : "L"}${sx(d.month)},${sy(d[key])}`).join(" ");
  const basePath = mkPath("baseCash");
  const simPath  = hasRun ? mkPath("simCash") : "";
  const baseFill = basePath + ` L${sx(12)},${P.t + cH} L${P.l},${P.t + cH} Z`;
  const simFill  = simPath + ` L${sx(12)},${P.t + cH} L${P.l},${P.t + cH} Z`;

  return (
    <Reveal>
      <div className="glass" style={{ borderRadius: 22, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.025em" }}>Cash Projection</h2>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              12-month cash balance forecast · Starting from ${(baseCash/1000).toFixed(0)}K cash balance
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 20, height: 2, background: "#3b82f6", borderRadius: 1, opacity: 0.5 }} />
                <span style={{ fontSize: 11, color: "#64748b" }}>Baseline</span>
              </div>
              {hasRun && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 20, height: 2, background: "#ef4444", borderRadius: 1 }} />
                  <span style={{ fontSize: 11, color: "#64748b" }}>Simulated</span>
                </div>
              )}
            </div>
            {hasRun && (
              <button className="btn btn-ghost" style={{ padding: "4px 12px", fontSize: 11, borderRadius: 8 }}
                onClick={() => setShowSim(v => !v)}>
                {showSim ? "Hide" : "Show"} Simulated
              </button>
            )}
          </div>
        </div>

        <div ref={ref} style={{ position: "relative" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}
            onMouseLeave={() => setTooltip(null)}>
            <defs>
              <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map(f => {
              const y = P.t + f * cH;
              return (
                <g key={f}>
                  <line x1={P.l} x2={W - P.r} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                  <text x={P.l - 8} y={y + 4} fill="#1e293b" fontSize={10} textAnchor="end">{fmtK(maxCash * (1 - f))}</text>
                </g>
              );
            })}

            <path d={baseFill} fill="url(#baseGrad)" />
            <path d={basePath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" strokeLinecap="round" opacity={0.5} />

            {hasRun && showSim && (
              <>
                <path d={simFill} fill="url(#simGrad)" />
                <path d={simPath} fill="none" stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                  style={vis ? { strokeDasharray: 3000, strokeDashoffset: 0, animation: "lineDrawIn 1.5s ease-out" } : {}} />
              </>
            )}

            {X_TICKS.map(m => (
              <text key={m} x={sx(m)} y={H - 10} fill="#1e293b" fontSize={10} textAnchor="middle">Mo {m}</text>
            ))}

            {result?.cashoutMonth && (
              <g>
                <line x1={sx(result.cashoutMonth)} x2={sx(result.cashoutMonth)} y1={P.t} y2={P.t + cH}
                  stroke="rgba(239,68,68,0.5)" strokeWidth={1.5} strokeDasharray="4 3" />
                <rect x={sx(result.cashoutMonth) - 50} y={P.t} width={100} height={20} rx={6} fill="rgba(239,68,68,0.14)" />
                <text x={sx(result.cashoutMonth)} y={P.t + 14} fill="#fca5a5" fontSize={10} textAnchor="middle" fontWeight="700">
                  Cash-out Mo {result.cashoutMonth}
                </text>
              </g>
            )}

            {X_TICKS.map((m) => {
              const d = baseData.find(x => x.month === m);
              return (
                <rect key={m} x={sx(m) - cW / 18} y={P.t} width={cW / 9} height={cH}
                  fill="transparent" style={{ cursor: "crosshair" }}
                  onMouseEnter={() => d && setTooltip({ m, base: d.baseCash, sim: d.simCash, xp: (sx(m) / W) * 100, yp: (sy(d.simCash) / H) * 100 })}
                />
              );
            })}
          </svg>

          {tooltip && (
            <div style={{
              position: "absolute", left: `${tooltip.xp}%`, top: `${tooltip.yp}%`,
              transform: "translate(-50%,-130%)", pointerEvents: "none", zIndex: 20,
              background: "rgba(7,13,26,0.97)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12, padding: "10px 14px",
              boxShadow: "0 12px 32px rgba(0,0,0,.75)", animation: "fadeUp 0.16s ease-out",
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 7 }}>Month {tooltip.m}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 14, fontSize: 11 }}>
                  <span style={{ color: "#64748b" }}>Baseline</span>
                  <span style={{ color: "#60a5fa", fontWeight: 600 }}>{fmtK(tooltip.base)}</span>
                </div>
                {hasRun && (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 14, fontSize: 11 }}>
                    <span style={{ color: "#64748b" }}>Simulated</span>
                    <span style={{ color: "#f87171", fontWeight: 600 }}>{fmtK(tooltip.sim)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPARISON TABLE
// ─────────────────────────────────────────────────────────────
function ComparisonTable({ result, hasRun, baseline }) {
  const baselineRunway   = baseline?.runway || 0;
  const baselineRisk     = baseline?.riskScore || 50;
  const baselineRevenue  = baseline?.revenue || 0;
  const baselineExpenses = baseline?.expenses || 0;

  const rows = hasRun && result ? [
    { metric: "Monthly Revenue",      curr: `$${(baselineRevenue/1000).toFixed(0)}K`,  sim: `$${(result.newRevenue/1000).toFixed(0)}K`,  delta: parseFloat(((result.newRevenue-baselineRevenue)/Math.max(baselineRevenue,1)*100).toFixed(1)), suf: "%" },
    { metric: "Monthly Expenses",     curr: `$${(baselineExpenses/1000).toFixed(0)}K`, sim: `$${(result.newExpenses/1000).toFixed(0)}K`, delta: parseFloat(((result.newExpenses-baselineExpenses)/Math.max(baselineExpenses,1)*100).toFixed(1)), suf: "%" },
    { metric: "Net Burn Rate",        curr: `$${(Math.max(baselineExpenses-baselineRevenue,0)/1000).toFixed(1)}K/mo`, sim: `$${(result.netBurn/1000).toFixed(1)}K/mo`, delta: result.burnChangePct, suf: "%" },
    { metric: "Runway",               curr: `${baselineRunway.toFixed(1)} mo`,         sim: `${result.runway.toFixed(1)} mo`,            delta: result.runwayDelta, suf: " mo" },
    { metric: "Risk Score",           curr: String(baselineRisk),                      sim: String(result.riskScore),                    delta: result.scoreDelta, suf: " pts" },
    { metric: "Survival Probability", curr: "~95%",                                    sim: `${result.survivalPct}%`,                    delta: result.survivalPct - 95, suf: "%" },
  ] : [];

  return (
    <Reveal delay={60}>
      <div className="glass" style={{ borderRadius: 22, padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.025em" }}>Scenario Comparison</h2>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {hasRun ? "Live DB baseline vs simulated metrics" : "Run a simulation to compare metrics"}
            </p>
          </div>
          {hasRun && (
            <div style={{ display: "flex", gap: 14 }}>
              {[{ c: "#3b82f6", l: "Baseline (DB)" }, { c: "#ef4444", l: "Simulated" }].map(x => (
                <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: x.c }} /> {x.l}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Metric", "Current (DB)", "Simulated", "Δ Change"].map(h => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.065)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hasRun ? rows.map((row, i) => (
                <tr key={i} className="trow" style={{ borderRadius: 9 }}>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#e2e8f0", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{row.metric}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#475569", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{row.curr}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#f1f5f9", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{row.sim}</td>
                  <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}><Delta val={row.delta} suffix={row.suf} /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ padding: "36px 14px", textAlign: "center", color: "#334155", fontSize: 13 }}>
                    Run a simulation to populate comparison data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────
// SAVED SCENARIOS  (real DB persistence)
// ─────────────────────────────────────────────────────────────
function SavedScenarios({ scenarios, onLoad, onDelete, onSaveNew, currentParams, saving, loading }) {
  return (
    <Reveal delay={80}>
      <div className="glass" style={{ borderRadius: 22, padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.025em" }}>Saved Scenarios</h2>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {loading ? "Loading…" : `${scenarios.length} scenario${scenarios.length !== 1 ? "s" : ""} saved in DB`}
            </p>
          </div>
          <SvgIcon d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" size={15} color="#334155" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {loading ? (
            [1,2].map(i => <Skeleton key={i} h={72} br={13} />)
          ) : scenarios.length === 0 ? (
            <p style={{ padding: "24px 0", textAlign: "center", color: "#334155", fontSize: 13 }}>
              No saved scenarios yet — use Save after running a simulation
            </p>
          ) : (
            scenarios.map(sc => (
              <div key={sc.id} className="saved-card">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{sc.name}</span>
                    </div>
                    {sc.tags && sc.tags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 5 }}>
                        {sc.tags.map((t, ti) => (
                          <span key={ti} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.22)", color: "#93c5fd", fontWeight: 600 }}>{t}</span>
                        ))}
                      </div>
                    )}
                    {sc.savedAt && (
                      <p style={{ fontSize: 10, color: "#334155" }}>Saved {new Date(sc.savedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 11, borderRadius: 8 }}
                      onClick={() => onLoad(sc.params)}>Load</button>
                    <button className="btn btn-ghost" style={{ padding: "5px 9px", fontSize: 11, borderRadius: 8 }}
                      onClick={() => onDelete(sc.id)}>
                      <SvgIcon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={12} color="#475569" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────
// SAVE MODAL
// ─────────────────────────────────────────────────────────────
function SaveModal({ onConfirm, onCancel, params }) {
  const [name, setName] = useState("");
  const suggestions = Object.entries(PRESETS).find(([, v]) =>
    JSON.stringify(v) === JSON.stringify({ ...params, hasDebt: undefined, interestPct: undefined })
  )?.[0];

  const autoTags = [
    params.revenuePct !== 0 && `Revenue ${params.revenuePct > 0 ? "+" : ""}${params.revenuePct}%`,
    params.hiring !== 0 && `Hiring ${params.hiring > 0 ? "+" : ""}${params.hiring}`,
    params.marketShock !== "None" && `Shock ${params.marketShock}`,
    params.expensePct !== 0 && `Expenses ${params.expensePct > 0 ? "+" : ""}${params.expensePct}%`,
  ].filter(Boolean);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div className="glass-strong" style={{ borderRadius: 22, padding: "28px", width: 380, animation: "resultEnter 0.3s ease-out" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>Save Scenario</h2>
        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>This scenario will be saved to your account in the database.</p>
        <input
          type="text"
          placeholder={suggestions || "My Scenario Name"}
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            width: "100%", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
            color: "#f1f5f9", fontFamily: "inherit", fontSize: 14,
            padding: "11px 14px", outline: "none", marginBottom: 16,
          }}
        />
        {autoTags.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>Auto-tags:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {autoTags.map((t, i) => (
                <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd", fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1, borderRadius: 11 }} onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1, borderRadius: 11 }} disabled={!name.trim()}
            onClick={() => onConfirm(name.trim(), autoTags)}>
            Save to DB
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function StressSimulator() {
  const [params, setParams]           = useState({ ...DEFAULT_PARAMS });
  const [result, setResult]           = useState(null);
  const [hasRun, setHasRun]           = useState(false);
  const [running, setRunning]         = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [lastSimTime, setLastSimTime] = useState(null);

  // DB state
  const [baseline, setBaseline]       = useState(null);
  const [scenarios, setScenarios]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving]           = useState(false);

  const isChanged = JSON.stringify(params) !== JSON.stringify(DEFAULT_PARAMS);

  // Inject global styles once
  useEffect(() => {
    const id = "sim-global-style";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => { try { document.head.removeChild(el); } catch {} };
  }, []);

  // ── Fetch baseline + saved scenarios from DB on mount ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [baselineRes, scenariosRes] = await Promise.all([
          api.get("/stress/baseline"),
          api.get("/stress/scenarios"),
        ]);
        setBaseline(baselineRes.data.baseline);
        setScenarios(scenariosRes.data.scenarios || []);
      } catch (err) {
        console.error("[StressSimulator] fetch error:", err);
        setError("Failed to load financial data. Make sure you've completed onboarding.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Run simulation against backend ──
  const handleRun = useCallback(async () => {
    if (!baseline) return;
    setRunning(true);
    try {
      const res = await api.post("/stress/simulate", { params });
      setResult(res.data.result);
      setHasRun(true);
      const now = new Date();
      setLastSimTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`);
    } catch (err) {
      console.error("[StressSimulator] simulate error:", err);
      alert("Simulation failed. Please try again.");
    } finally {
      setRunning(false);
    }
  }, [params, baseline]);

  const handleReset = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS });
    setResult(null);
    setHasRun(false);
    setActivePreset(null);
    setLastSimTime(null);
  }, []);

  // ── Save scenario to DB ──
  const handleSave = () => setShowSaveModal(true);

  const handleConfirmSave = async (name, tags) => {
    setSaving(true);
    try {
      const res = await api.post("/stress/scenarios", { name, params, tags });
      setScenarios(res.data.scenarios || []);
      setShowSaveModal(false);
    } catch (err) {
      console.error("[StressSimulator] save error:", err);
      alert("Failed to save scenario. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete scenario from DB ──
  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/stress/scenarios/${id}`);
      setScenarios(res.data.scenarios || []);
    } catch (err) {
      console.error("[StressSimulator] delete error:", err);
      alert("Failed to delete scenario.");
    }
  };

  const handleLoadSaved = useCallback((savedParams) => {
    setParams({ ...DEFAULT_PARAMS, ...savedParams });
    setActivePreset(null);
  }, []);

  const handleGenerate = useCallback(() => {
    // Navigate to AI Recommendations with the current scenario context
    window.location.href = "/ai-recommendations";
  }, []);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div className="sim-page-bg" />
      <div style={{ position: "fixed", top: "12%", left: "18%", width: 650, height: 650, background: "radial-gradient(circle,rgba(37,99,235,0.06) 0%,transparent 70%)", pointerEvents: "none", borderRadius: "50%", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "22%", right: "12%", width: 520, height: 520, background: "radial-gradient(circle,rgba(239,68,68,0.04) 0%,transparent 70%)", pointerEvents: "none", borderRadius: "50%", zIndex: 0 }} />

      <ScrollProgress />

      {showSaveModal && (
        <SaveModal
          params={params}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowSaveModal(false)}
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        <AppHeader
          hasUnsaved={isChanged}
          lastSimTime={lastSimTime}
          companyName={baseline?.companyName}
          loading={loading}
        />

        <main style={{ maxWidth: 1380, margin: "0 auto", padding: "32px 28px 80px", display: "flex", flexDirection: "column", gap: 26 }}>

          {/* Error state */}
          {error && (
            <div style={{ borderRadius: 14, padding: "16px 20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", gap: 12 }}>
              <SvgIcon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={18} color="#ef4444" />
              <p style={{ fontSize: 13, color: "#fca5a5" }}>{error}</p>
            </div>
          )}

          {/* Baseline KPI row */}
          <BaselineKpiRow baseline={baseline} loading={loading} />

          {/* Output banner */}
          {hasRun && result && baseline && (
            <div style={{ animation: "fadeUp 0.45s ease-out both", borderRadius: 14, padding: "14px 18px", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <SvgIcon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={16} color="#60a5fa" />
              <p style={{ fontSize: 13, color: "#93c5fd", fontWeight: 500, lineHeight: 1.6 }}>
                With revenue {result.revDelta > 0 ? "+" : ""}{result.revDelta}%,{" "}
                runway {result.runway < baseline.runway
                  ? `drops from ${baseline.runway.toFixed(1)} to ${result.runway.toFixed(1)} months.`
                  : `extends to ${result.runway.toFixed(1)} months.`}{" "}
                Risk goes from {baseline.riskLevel} → {result.riskLevel}.
              </p>
            </div>
          )}

          {/* Two-column workspace */}
          <div id="sim-workspace" style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 18, alignItems: "start" }}>
            <ScenarioControls
              params={params} setParams={setParams}
              onRun={handleRun} onReset={handleReset} onSave={handleSave}
              running={running} activePreset={activePreset} setActivePreset={setActivePreset}
              baseline={baseline}
            />
            <SimulationResults
              result={result} hasRun={hasRun} onGenerate={handleGenerate}
              baseline={baseline}
            />
          </div>

          {/* Cash projection chart */}
          <CashProjectionChart result={result} hasRun={hasRun} baseline={baseline} />

          {/* Comparison + Saved */}
          <div id="sim-analytics" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18 }}>
            <ComparisonTable result={result} hasRun={hasRun} baseline={baseline} />
            <SavedScenarios
              scenarios={scenarios}
              onLoad={handleLoadSaved}
              onDelete={handleDelete}
              onSaveNew={handleSave}
              currentParams={params}
              saving={saving}
              loading={loading}
            />
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "#0f172a" }}>
            Simulation outcomes are computed from your live database financials. · FinMetrics © 2026
          </p>
        </main>
      </div>

      <style>{`
        @media (max-width: 1140px) {
          #sim-workspace  { grid-template-columns: 1fr !important; }
          #sim-analytics  { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          main > div:first-child > div { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 600px) {
          main > div:first-child > div { grid-template-columns: 1fr !important; }
          main { padding: 16px 14px 60px !important; gap: 18px !important; }
          header > div { padding: 0 14px !important; }
        }
      `}</style>
    </div>
  );
}
