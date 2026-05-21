import { getRiskData } from "../services/financialService.js";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────────────────────── */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function useRevealOnScroll(options = {}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px", ...options }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, revealed];
}

function useCountUp(target, duration = 1600, decimals = 0, trigger = true) {
  const [val, setVal] = useState(0);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!trigger) return;
    if (reduced) { setVal(target); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(+(ease * target).toFixed(decimals));
      if (p < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, decimals, trigger, reduced]);
  return val;
}

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
      background: #05090f;
      color: #f1f5f9;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #05090f; }
    ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #2563eb; }

    .page-bg {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        linear-gradient(rgba(96,165,250,0.028) 1px, transparent 1px),
        linear-gradient(90deg, rgba(96,165,250,0.028) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: radial-gradient(ellipse 100% 100% at 50% 0%, black 40%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 100% 100% at 50% 0%, black 40%, transparent 100%);
    }

    .glass {
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.07);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
    }
    .glass-strong {
      background: rgba(255,255,255,0.055);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.09);
      box-shadow: 0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
    }

    .card-hover {
      transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
      cursor: default;
    }
    .card-hover:hover {
      transform: translateY(-3px) scale(1.003);
      box-shadow: 0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.06);
      border-color: rgba(255,255,255,0.12) !important;
    }

    .reveal-init { opacity: 0; transform: translateY(20px) scale(0.98); }
    .reveal-done {
      opacity: 1; transform: translateY(0) scale(1);
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }

    @keyframes lineDrawRight {
      from { stroke-dashoffset: var(--len, 1000); }
      to   { stroke-dashoffset: 0; }
    }
    @keyframes fadePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes newAlertGlow {
      0%   { background: rgba(239,68,68,0.12); }
      60%  { background: rgba(239,68,68,0.06); }
      100% { background: transparent; }
    }
    @keyframes tooltipIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    @keyframes shimmer { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }

    .new-alert-row { animation: newAlertGlow 3s ease-out forwards; border-radius: 10px; }
    .blink-dot { animation: blink 1.8s ease-in-out infinite; }
    .shimmer { animation: shimmer 2s ease-in-out infinite; }

    .tooltip-wrap { position: relative; }
    .tooltip-box {
      position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%);
      background: rgba(8,14,28,0.97); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; padding: 10px 14px; font-size: 12px; color: #94a3b8;
      line-height: 1.55; pointer-events: none; z-index: 50;
      box-shadow: 0 12px 32px rgba(0,0,0,0.6);
      animation: tooltipIn 0.18s ease-out;
      max-width: 240px; white-space: normal; text-align: center;
    }
    .tooltip-box::after {
      content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
      border: 5px solid transparent; border-top-color: rgba(255,255,255,0.08);
    }

    .seg-control {
      position: relative; display: flex; gap: 2px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px; padding: 3px;
    }
    .seg-btn {
      position: relative; z-index: 1;
      padding: 6px 14px; border-radius: 7px; border: none; background: transparent;
      color: #6b7280; font-size: 13px; font-weight: 600; cursor: pointer;
      transition: color 0.2s ease; font-family: inherit; outline: none;
    }
    .seg-btn.active { color: #fff; }
    .seg-pill {
      position: absolute; top: 3px; border-radius: 7px; height: calc(100% - 6px);
      background: rgba(37,99,235,0.3); border: 1px solid rgba(59,130,246,0.35);
      box-shadow: 0 0 12px rgba(37,99,235,0.2);
      transition: left 0.25s cubic-bezier(0.25,0.46,0.45,0.94),
                  width 0.25s cubic-bezier(0.25,0.46,0.45,0.94);
      z-index: 0;
    }

    .chip {
      padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600;
      border: 1px solid; cursor: pointer; transition: all 0.18s ease; white-space: nowrap;
      font-family: inherit;
    }
    .chip:hover { transform: translateY(-1px); }

    .btn-primary {
      background: #2563eb; color: #fff; border: none; border-radius: 10px;
      padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer;
      transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
      font-family: inherit;
    }
    .btn-primary:hover { background: #1d4ed8; transform: scale(1.02); box-shadow: 0 0 18px rgba(37,99,235,0.45); }
    .btn-primary:active { transform: scale(0.99); }

    .btn-ghost {
      background: rgba(255,255,255,0.04); color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px; padding: 8px 16px; font-size: 13px; font-weight: 500; cursor: pointer;
      transition: all 0.18s ease; font-family: inherit;
    }
    .btn-ghost:hover { background: rgba(255,255,255,0.07); color: #fff; border-color: rgba(255,255,255,0.14); transform: scale(1.01); }
    .btn-ghost:active { transform: scale(0.99); }

    .risk-ring-track { fill: none; stroke: rgba(255,255,255,0.06); }
    .risk-ring-fill {
      fill: none; stroke-linecap: round;
      stroke-dasharray: 251.2;
      transition: stroke-dashoffset 0.05s linear;
    }

    .alert-row {
      border-radius: 10px; padding: 11px 12px;
      transition: background 0.18s ease; cursor: pointer;
    }
    .alert-row:hover { background: rgba(255,255,255,0.04); }
    .alert-row:hover .alert-chevron { opacity: 1; transform: translateX(0); }
    .alert-chevron {
      opacity: 0; transform: translateX(-4px);
      transition: opacity 0.18s ease, transform 0.18s ease;
    }

    .rec-row {
      padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.025);
      transition: all 0.2s ease; cursor: default;
    }
    .rec-row:hover {
      background: rgba(59,130,246,0.06);
      border-color: rgba(59,130,246,0.2);
      transform: translateX(3px);
    }

    .sig-row { transition: background 0.15s ease; }
    .sig-row:hover { background: rgba(255,255,255,0.03); }

    .scroll-bar { transition: width 0.08s linear; }

    /* Skeleton loader */
    .skeleton {
      background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
      background-size: 200% 100%;
      animation: skeletonShimmer 1.5s infinite;
      border-radius: 8px;
    }
    @keyframes skeletonShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .reveal-init { opacity: 0; transform: none; }
      .reveal-done { transition: opacity 0.3s ease; }
      .card-hover:hover { transform: none; }
    }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────────────────────
   SMALL UTILITIES
───────────────────────────────────────────────────────────────────────────── */
function ScrollProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, height: 2, background: "transparent" }}>
      <div className="scroll-bar" style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa)" }} />
    </div>
  );
}

function RevealWrapper({ children, delay = 0, className = "" }) {
  const [ref, revealed] = useRevealOnScroll();
  return (
    <div
      ref={ref}
      className={`${revealed ? "reveal-done" : "reveal-init"} ${className}`}
      style={revealed ? { transitionDelay: `${delay}ms` } : {}}
    >
      {children}
    </div>
  );
}

function StatusDot({ status, size = 8 }) {
  const colors = { critical: "#ef4444", high: "#f97316", medium: "#eab308", stable: "#22c55e", watch: "#f59e0b" };
  const glows = { critical: "rgba(239,68,68,0.5)", high: "rgba(249,115,22,0.5)", medium: "rgba(234,179,8,0.5)", stable: "rgba(34,197,94,0.5)", watch: "rgba(245,158,11,0.5)" };
  const key = status?.toLowerCase() || "stable";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colors[key] || "#6b7280", flexShrink: 0, boxShadow: `0 0 ${size}px ${glows[key] || "transparent"}`, animation: key !== "stable" ? "blink 2s ease-in-out infinite" : "none" }} />
  );
}

function RiskBadge({ status }) {
  const map = {
    Critical: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.28)", text: "#fca5a5" },
    Watch:    { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.28)",  text: "#fcd34d" },
    High:     { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   text: "#f87171" },
    Stable:   { bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.22)",   text: "#86efac" },
    Medium:   { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  text: "#fcd34d" },
    Low:      { bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.22)",   text: "#86efac" },
  };
  const s = map[status] || map.Stable;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: s.bg, border: `1px solid ${s.border}`, color: s.text, letterSpacing: "0.04em", textTransform: "uppercase" }}>{status}</span>
  );
}

function CategoryChip({ label, active, onClick }) {
  return (
    <button className="chip" onClick={onClick} style={{
      background: active ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${active ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.07)"}`,
      color: active ? "#93c5fd" : "#6b7280",
      boxShadow: active ? "0 0 10px rgba(37,99,235,0.2)" : "none",
    }}>
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SKELETON LOADING STATE
───────────────────────────────────────────────────────────────────────────── */
function SkeletonCard({ height = 120 }) {
  return (
    <div className="glass" style={{ borderRadius: 18, padding: "20px 22px", height }}>
      <div className="skeleton" style={{ height: 11, width: "40%", marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 36, width: "60%", marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 11, width: "80%" }} />
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: "36px 28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[1,2,3,4].map(i => <SkeletonCard key={i} height={140} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SkeletonCard height={260} />
        <SkeletonCard height={260} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[1,2,3,4].map(i => <SkeletonCard key={i} height={160} />)}
      </div>
      <SkeletonCard height={280} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ERROR STATE
───────────────────────────────────────────────────────────────────────────── */
function ErrorState({ message, onRetry }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
      <div className="glass" style={{ borderRadius: 20, padding: "40px 48px", textAlign: "center", maxWidth: 440 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg viewBox="0 0 24 24" fill="none" width={24} height={24} stroke="#ef4444" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Unable to load risk data</h3>
        <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 24 }}>{message || "Could not connect to the server. Please check your connection and try again."}</p>
        <button className="btn-primary" onClick={onRetry}>Try Again</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NO DATA STATE
───────────────────────────────────────────────────────────────────────────── */
function NoDataState() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
      <div className="glass" style={{ borderRadius: 20, padding: "40px 48px", textAlign: "center", maxWidth: 460 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg viewBox="0 0 24 24" fill="none" width={24} height={24} stroke="#3b82f6" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>No financial data yet</h3>
        <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 24 }}>
          Add your revenue, expenses, and cash balance via the <strong style={{ color: "#93c5fd" }}>Data</strong> page to see live risk analysis here.
        </p>
        <a href="/data" className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>Go to Data Page</a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SEGMENTED CONTROL
───────────────────────────────────────────────────────────────────────────── */
function SegmentedControl({ options, value, onChange }) {
  const containerRef = useRef(null);
  const [pillStyle, setPillStyle] = useState({ left: 3, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const btns = containerRef.current.querySelectorAll(".seg-btn");
    const idx = options.indexOf(value);
    if (btns[idx]) {
      const btn = btns[idx];
      setPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
    }
  }, [value, options]);

  return (
    <div ref={containerRef} className="seg-control" role="group" aria-label="Date range">
      <div className="seg-pill" style={{ left: pillStyle.left, width: pillStyle.width }} />
      {options.map((opt) => (
        <button
          key={opt}
          className={`seg-btn ${value === opt ? "active" : ""}`}
          onClick={() => onChange(opt)}
          onKeyDown={(e) => {
            const idx = options.indexOf(value);
            if (e.key === "ArrowRight") onChange(options[Math.min(idx + 1, options.length - 1)]);
            if (e.key === "ArrowLeft") onChange(options[Math.max(idx - 1, 0)]);
          }}
          role="radio"
          aria-checked={value === opt}
          tabIndex={value === opt ? 0 : -1}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HEADER
───────────────────────────────────────────────────────────────────────────── */
function AppHeader({ range, setRange, onRefresh, refreshing, lastUpdated }) {
  const timeAgo = lastUpdated
    ? (() => {
        const diff = Math.floor((Date.now() - new Date(lastUpdated)) / 1000);
        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        return `${Math.floor(diff / 3600)}h ago`;
      })()
    : "—";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 80,
      background: "rgba(5,9,15,0.88)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>

        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(37,99,235,0.5)" }}>
              <svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                <path d="M3 17l4-8 4 4 4-6 4 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.03em" }}>FinMetrics</span>
          </div>

          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.1)" }} />

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" width={16} height={16} stroke="#3b82f6" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Risk Radar</h1>
            </div>
            <p style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>Live financial risk monitoring</p>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SegmentedControl options={["7D", "30D", "90D"]} value={range} onChange={setRange} />

          <div aria-live="polite" style={{ fontSize: 12, color: "#4b5563", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }} className="blink-dot" />
            Updated: {timeAgo}
          </div>

          <button className="btn-ghost" style={{ padding: "6px 10px", display: "flex", alignItems: "center", gap: 6 }} onClick={onRefresh} title="Refresh data">
            <svg viewBox="0 0 24 24" fill="none" width={14} height={14} stroke="currentColor" strokeWidth={2} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   KPI CARDS
───────────────────────────────────────────────────────────────────────────── */
function RiskScoreRing({ score, size = 88 }) {
  const [ref, revealed] = useRevealOnScroll();
  const reduced = usePrefersReducedMotion();
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const animScore = useCountUp(score, 1600, 0, revealed);
  const offset = circumference - (circumference * animScore) / 100;
  const strokeColor = score >= 70 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#22c55e";
  const glowColor = score >= 70 ? "rgba(239,68,68,0.5)" : score >= 40 ? "rgba(245,158,11,0.5)" : "rgba(34,197,94,0.5)";

  return (
    <div ref={ref} style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle className="risk-ring-track" cx={50} cy={50} r={radius} strokeWidth={7} />
        <circle
          className="risk-ring-fill"
          cx={50} cy={50} r={radius} strokeWidth={7}
          stroke={strokeColor}
          strokeDashoffset={reduced ? circumference - (circumference * score) / 100 : offset}
          transform="rotate(-90 50 50)"
          style={{ filter: `drop-shadow(0 0 8px ${glowColor})`, transition: reduced ? "none" : "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: strokeColor, letterSpacing: "-0.03em", lineHeight: 1 }}>{animScore}</span>
        <span style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>/100</span>
      </div>
    </div>
  );
}

function SparklineChart({ data = [], color = "#3b82f6", width = 80, height = 32 }) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sparkGrad_${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${height} ${pts} ${width},${height}`} fill={`url(#sparkGrad_${color.replace("#", "")})`} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KpiCards({ data, range }) {
  const runwayVal = useCountUp(data.runwayMonths || 0, 1400, 1, true);
  const trendSet = data.trendData?.[range] || [];
  const trendBurnData = trendSet.map(d => d.burn);
  const trendRunwayData = trendSet.map(d => d.runway);

  const riskColor = data.riskScore >= 70 ? "#ef4444" : data.riskScore >= 40 ? "#f59e0b" : "#22c55e";
  const riskLabel = data.riskStatus === "High" ? "High Risk"
                  : data.riskStatus === "Medium" ? "Medium Risk" : "Low Risk";
  const riskSubLabel = data.riskStatus === "High" ? "Immediate action advised"
                     : data.riskStatus === "Medium" ? "Monitor closely"
                     : "Financial health stable";

  const activeIssues = (data.top_reasons || []).filter(r => r.severity !== "stable").length;
  const newAlerts = (data.alerts || []).filter(a => a.isNew).length;
  const burnChangePct = data.burnRateChangePct || 0;
  const burnColor = burnChangePct > 0 ? "#f97316" : "#22c55e";

  const cards = [
    {
      id: "status",
      label: "Risk Status",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `rgba(${data.riskScore >= 70 ? "239,68,68" : data.riskScore >= 40 ? "245,158,11" : "34,197,94"},0.12)`, border: `1px solid rgba(${data.riskScore >= 70 ? "239,68,68" : data.riskScore >= 40 ? "245,158,11" : "34,197,94"},0.2)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" fill="none" width={20} height={20} stroke={riskColor} strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: riskColor, letterSpacing: "-0.03em", lineHeight: 1 }}>{riskLabel}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{riskSubLabel}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            {activeIssues > 0 && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", color: "#fca5a5" }}>{activeIssues} active issue{activeIssues !== 1 ? "s" : ""}</span>}
            {newAlerts > 0 && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#fcd34d" }}>{newAlerts} new alert{newAlerts !== 1 ? "s" : ""}</span>}
          </div>
        </div>
      ),
    },
    {
      id: "score",
      label: "Risk Score",
      content: (
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingTop: 4 }}>
          <RiskScoreRing score={data.riskScore || 0} />
          <div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 6 }}>Composite score</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg viewBox="0 0 24 24" fill="none" width={14} height={14} stroke={riskColor} strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={data.riskScore >= 50 ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
              <span style={{ fontSize: 18, fontWeight: 700, color: riskColor }}>{data.riskScore >= 70 ? "High" : data.riskScore >= 40 ? "Moderate" : "Low"}</span>
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              {data.riskScore >= 70 ? "Needs attention" : data.riskScore >= 40 ? "Monitor trends" : "Looks healthy"}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "runway",
      label: "Runway",
      content: (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingTop: 4 }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 38, fontWeight: 900, color: data.runwayMonths > 0 && data.runwayMonths < 3 ? "#ef4444" : data.runwayMonths < 6 ? "#f59e0b" : "#22c55e", letterSpacing: "-0.04em", lineHeight: 1 }}>
                {data.runwayMonths > 0 ? runwayVal.toFixed(1) : "∞"}
              </span>
              <span style={{ fontSize: 15, color: "#6b7280", fontWeight: 500 }}>{data.runwayMonths > 0 ? "months" : ""}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              {data.runwayMonths > 0 && data.runwayMonths < 3 && (
                <><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} className="blink-dot" />
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Below 3-month threshold</span></>
              )}
              {data.runwayMonths >= 3 && data.runwayMonths < 6 && <span style={{ fontSize: 12, color: "#9ca3af" }}>Watch: &lt;6 months</span>}
              {data.runwayMonths >= 6 && <span style={{ fontSize: 12, color: "#86efac" }}>Healthy runway</span>}
              {data.runwayMonths === 0 && <span style={{ fontSize: 12, color: "#86efac" }}>No burn detected</span>}
            </div>
          </div>
          <SparklineChart data={trendRunwayData} color={data.runwayMonths < 3 ? "#ef4444" : "#22c55e"} />
        </div>
      ),
    },
    {
      id: "burn",
      label: "Burn Rate",
      content: (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingTop: 4 }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 38, fontWeight: 900, color: burnColor, letterSpacing: "-0.04em", lineHeight: 1 }}>
                ${data.netBurn ? (data.netBurn / 1000).toFixed(1) + "K" : "0"}
              </span>
              <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>/mo</span>
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
              {burnChangePct !== 0 ? `${burnChangePct > 0 ? "+" : ""}${burnChangePct}% vs prior period` : "Stable this period"}
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
              Cash: ${data.cashBalance ? (data.cashBalance / 1000).toFixed(1) + "K" : "0"}
            </div>
          </div>
          <SparklineChart data={trendBurnData} color={burnColor} />
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {cards.map((card, i) => (
        <RevealWrapper key={card.id} delay={i * 80}>
          <div className="glass card-hover" style={{ borderRadius: 18, padding: "20px 22px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>{card.label}</div>
            {card.content}
          </div>
        </RevealWrapper>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   REASONS LIST
───────────────────────────────────────────────────────────────────────────── */
function ReasonsList({ reasons = [] }) {
  const [expanded, setExpanded] = useState(null);
  const activeCount = reasons.filter(r => r.severity !== "stable").length;

  return (
    <RevealWrapper>
      <div className="glass" style={{ borderRadius: 18, padding: "24px", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Top Risk Reasons</h2>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Why your risk score is elevated</p>
          </div>
          {activeCount > 0 && (
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontWeight: 600 }}>
              {activeCount} Issue{activeCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reasons.map((r) => (
            <div
              key={r.id}
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              style={{
                padding: "14px 16px", borderRadius: 12,
                background: expanded === r.id ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
                border: `1px solid ${expanded === r.id ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
                cursor: "pointer", transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { if (expanded !== r.id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (expanded !== r.id) e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ paddingTop: 2 }}>
                  <StatusDot status={r.severity} size={9} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", letterSpacing: "-0.01em" }}>{r.title}</span>
                    <svg viewBox="0 0 24 24" fill="none" width={14} height={14} stroke="#4b5563" strokeWidth={2}
                      style={{ flexShrink: 0, transition: "transform 0.2s ease", transform: expanded === r.id ? "rotate(180deg)" : "rotate(0)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {expanded === r.id && (
                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8, lineHeight: 1.6, animation: "tooltipIn 0.2s ease-out" }}>{r.detail}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, padding: "10px 12px", borderRadius: 10, background: "rgba(37,99,235,0.07)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <p style={{ fontSize: 11, color: "#60a5fa", lineHeight: 1.5 }}>
            💡 Risk insights are computed from your actual financial data in real time.
          </p>
        </div>
      </div>
    </RevealWrapper>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ALERTS PANEL
───────────────────────────────────────────────────────────────────────────── */
function AlertsPanel({ alerts = [] }) {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Liquidity", "Burn", "Budget", "Market"];
  const filtered = filter === "All" ? alerts : alerts.filter((a) => a.category === filter);

  const catColors = {
    Liquidity: { bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.22)", text: "#93c5fd" },
    Burn:      { bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.22)", text: "#fdba74" },
    Budget:    { bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.22)",  text: "#fde68a" },
    Market:    { bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.22)", text: "#c4b5fd" },
  };

  const newCount = alerts.filter(a => a.isNew).length;

  return (
    <RevealWrapper delay={80}>
      <div className="glass" style={{ borderRadius: 18, padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Active Alerts</h2>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Real-time monitoring feed</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {newCount > 0 && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} className="blink-dot" />}
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{newCount} new</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {categories.map((cat) => (
            <CategoryChip key={cat} label={cat} active={filter === cat} onClick={() => setFilter(cat)} />
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#4b5563", fontSize: 13 }}>
              No {filter !== "All" ? filter.toLowerCase() + " " : ""}alerts
            </div>
          ) : (
            filtered.map((alert) => {
              const c = catColors[alert.category] || catColors.Burn;
              return (
                <div key={alert.id} className={`alert-row ${alert.isNew ? "new-alert-row" : ""}`}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg viewBox="0 0 24 24" fill="none" width={14} height={14} stroke={c.text} strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <p style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500, lineHeight: 1.4 }}>{alert.message}</p>
                        <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="#4b5563" strokeWidth={2} className="alert-chevron" style={{ flexShrink: 0, marginTop: 2 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                        <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 999, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontWeight: 600 }}>{alert.category}</span>
                        <span style={{ fontSize: 11, color: "#4b5563" }}>{alert.timestamp}</span>
                        {alert.isNew && <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 999, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.22)", color: "#fca5a5", fontWeight: 700 }}>NEW</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </RevealWrapper>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   RISK DRIVERS
───────────────────────────────────────────────────────────────────────────── */
function DriverCard({ driver }) {
  const [hovered, setHovered] = useState(false);
  const [barRef, barRevealed] = useRevealOnScroll();

  const statusStyles = {
    Critical: { bar: "#ef4444", glow: "rgba(239,68,68,0.3)", badge: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", text: "#fca5a5" } },
    Watch:    { bar: "#f59e0b", glow: "rgba(245,158,11,0.25)", badge: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", text: "#fcd34d" } },
    Stable:   { bar: "#22c55e", glow: "rgba(34,197,94,0.2)", badge: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.22)", text: "#86efac" } },
  };
  const s = statusStyles[driver.status] || statusStyles.Stable;
  const barWidth = `${Math.min(100, driver.score)}%`;

  return (
    <div
      className="glass card-hover tooltip-wrap"
      style={{ borderRadius: 16, padding: "20px 22px", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && <div className="tooltip-box">{driver.detail}</div>}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{driver.label}</span>
        <RiskBadge status={driver.status} />
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: s.bar, letterSpacing: "-0.03em" }}>{driver.score}</span>
        <span style={{ fontSize: 13, color: "#6b7280" }}>/100</span>
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: driver.trend > 0 ? "#ef4444" : "#22c55e", display: "flex", alignItems: "center", gap: 3 }}>
          {driver.trend > 0 ? "↑" : "↓"} {Math.abs(driver.trend)}
          <span style={{ color: "#4b5563", fontWeight: 400 }}>vs last</span>
        </span>
      </div>

      <div ref={barRef} style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3,
          width: barRevealed ? barWidth : "0%",
          background: `linear-gradient(90deg, ${s.bar}cc, ${s.bar})`,
          boxShadow: `0 0 12px ${s.glow}`,
          transition: "width 1.1s cubic-bezier(0.25,0.46,0.45,0.94)",
        }} />
      </div>
    </div>
  );
}

function DriversGrid({ drivers = [] }) {
  return (
    <section>
      <RevealWrapper>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.025em" }}>Risk Drivers</h2>
          <span style={{ fontSize: 12, color: "#4b5563" }}>Hover each card for context</span>
        </div>
      </RevealWrapper>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {drivers.map((d, i) => (
          <RevealWrapper key={d.id} delay={i * 70}>
            <DriverCard driver={d} />
          </RevealWrapper>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TREND CHART (uses real trendData from backend)
───────────────────────────────────────────────────────────────────────────── */
function TrendChart({ range, trendData }) {
  const [ref, revealed] = useRevealOnScroll();
  const [tooltip, setTooltip] = useState(null);
  const [showRunway, setShowRunway] = useState(false);
  const reduced = usePrefersReducedMotion();
  const data = trendData?.[range] || [];

  if (!data.length) return (
    <RevealWrapper>
      <div className="glass" style={{ borderRadius: 20, padding: "24px 28px", textAlign: "center", color: "#4b5563", fontSize: 13 }}>
        No trend data available for this period
      </div>
    </RevealWrapper>
  );

  const W = 800, H = 200, PAD = { t: 20, r: 20, b: 40, l: 48 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const scores = data.map(d => d.score);
  const minS = Math.max(0, Math.min(...scores) - 5);
  const maxS = Math.min(100, Math.max(...scores) + 5);
  const runways = data.map(d => d.runway);
  const minR = Math.max(0, Math.min(...runways) - 0.3);
  const maxR = Math.max(...runways) + 0.3;

  const sx = (i) => PAD.l + (i / (data.length - 1)) * chartW;
  const sy = (v) => PAD.t + ((maxS - v) / (maxS - minS)) * chartH;
  const ry = (v) => PAD.t + ((maxR - v) / (maxR - minR)) * chartH;

  const scorePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(d.score)}`).join(" ");
  const runwayPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${ry(d.runway)}`).join(" ");
  const fillPath = scorePath + ` L${sx(data.length - 1)},${PAD.t + chartH} L${PAD.l},${PAD.t + chartH} Z`;
  const pathLen = 1000;

  return (
    <RevealWrapper>
      <div className="glass" style={{ borderRadius: 20, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Risk Score Trend</h2>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Score over {range === "7D" ? "the last 7 days" : range === "30D" ? "30 days" : "90 days"} — derived from your actual data</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 20, height: 2, background: "#ef4444", borderRadius: 1 }} />
                <span style={{ fontSize: 12, color: "#6b7280" }}>Risk Score</span>
              </div>
              {showRunway && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 20, height: 2, background: "#3b82f6", borderRadius: 1 }} />
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Runway (mo)</span>
                </div>
              )}
            </div>
            <button className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setShowRunway(v => !v)}>
              {showRunway ? "Hide" : "Show"} Runway
            </button>
          </div>
        </div>

        <div ref={ref} style={{ position: "relative", width: "100%" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}
            onMouseLeave={() => setTooltip(null)}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="runwayGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 25, 50, 75, 100].map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={W - PAD.r} y1={sy(v)} y2={sy(v)} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                <text x={PAD.l - 8} y={sy(v) + 4} fill="#374151" fontSize={10} textAnchor="end">{v}</text>
              </g>
            ))}

            <path d={fillPath} fill="url(#scoreGrad)" />

            {showRunway && (
              <>
                <path d={data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${ry(d.runway)}`).join(" ") + ` L${sx(data.length - 1)},${PAD.t + chartH} L${PAD.l},${PAD.t + chartH} Z`} fill="url(#runwayGrad)" />
                <path d={runwayPath} fill="none" stroke="#3b82f6" strokeWidth={1.8} strokeDasharray="5 3" strokeLinecap="round" />
              </>
            )}

            <path
              d={scorePath} fill="none"
              stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
              style={revealed && !reduced ? {
                strokeDasharray: pathLen, strokeDashoffset: 0,
                animation: `lineDrawRight 1.4s ease-out`,
                "--len": pathLen,
              } : {}}
            />

            {data.map((d, i) => (
              <text key={i} x={sx(i)} y={H - 6} fill="#374151" fontSize={10} textAnchor="middle">{d.day}</text>
            ))}

            {data.map((d, i) => d.alert && (
              <g key={`alert-${i}`}>
                <circle cx={sx(i)} cy={sy(d.score)} r={5} fill="#ef4444" opacity={0.9} />
                <circle cx={sx(i)} cy={sy(d.score)} r={9} fill="rgba(239,68,68,0.2)" />
              </g>
            ))}

            {data.map((d, i) => (
              <rect
                key={`hover-${i}`}
                x={sx(i) - chartW / data.length / 2}
                y={PAD.t}
                width={chartW / data.length}
                height={chartH}
                fill="transparent"
                style={{ cursor: "crosshair" }}
                onMouseEnter={() => setTooltip({ data: d, x: (sx(i) / W) * 100, y: (sy(d.score) / H) * 100 })}
              />
            ))}
          </svg>

          {tooltip && (
            <div style={{
              position: "absolute",
              left: `${tooltip.x}%`, top: `${tooltip.y}%`,
              transform: "translate(-50%, -120%)",
              background: "rgba(8,14,28,0.97)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, padding: "10px 14px", pointerEvents: "none", zIndex: 20,
              animation: "tooltipIn 0.15s ease-out",
              boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>{tooltip.data.day}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>Risk Score</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444" }}>{tooltip.data.score}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>Runway</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#f1f5f9" }}>{tooltip.data.runway} mo</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>Burn Index</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#f97316" }}>{tooltip.data.burn}</span>
                </div>
                {tooltip.data.alert && (
                  <div style={{ marginTop: 4, fontSize: 10, color: "#fca5a5", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 5 }}>⚠ Alert triggered</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </RevealWrapper>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   RECOMMENDED ACTIONS
───────────────────────────────────────────────────────────────────────────── */
function RecommendedActions({ actions = [] }) {
  const priorityMap = {
    immediate: { label: "Immediate", color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.22)" },
    soon:      { label: "Soon",      color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.22)" },
    plan:      { label: "Plan",      color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.22)" },
  };

  return (
    <RevealWrapper>
      <div className="glass" style={{ borderRadius: 18, padding: "24px", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>What to Do Next</h2>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Actions based on your real risk state</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {actions.map((a, i) => {
            const p = priorityMap[a.priority] || priorityMap.plan;
            return (
              <div key={a.id} className="rec-row">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: p.bg, border: `1px solid ${p.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{i + 1}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{a.action}</p>
                    <p style={{ fontSize: 11, color: "#6b7280" }}>{a.impact}</p>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 999, background: p.bg, border: `1px solid ${p.border}`, color: p.color, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>{p.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <a href="/ai-recommendations" className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}>
          <svg viewBox="0 0 24 24" fill="none" width={14} height={14} stroke="white" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Open AI CFO Recommendations
        </a>
      </div>
    </RevealWrapper>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SIGNALS TABLE
───────────────────────────────────────────────────────────────────────────── */
function SignalsTable({ signals = [] }) {
  const statusStyle = {
    Critical: { color: "#fca5a5", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.22)",  dot: "#ef4444" },
    Watch:    { color: "#fcd34d", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.22)", dot: "#f59e0b" },
    Stable:   { color: "#86efac", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.22)",  dot: "#22c55e" },
  };

  return (
    <RevealWrapper delay={80}>
      <div className="glass" style={{ borderRadius: 18, padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Signals Monitor</h2>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Live metric vs threshold comparison</p>
          </div>
          <span style={{ fontSize: 11, color: "#4b5563" }}>{signals.length} metrics tracked</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Metric", "Current", "Threshold", "Status"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#4b5563", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {signals.map((s, i) => {
                const st = statusStyle[s.status] || statusStyle.Stable;
                return (
                  <tr key={i} className="sig-row">
                    <td style={{ padding: "12px 12px", fontSize: 13, fontWeight: 500, color: "#e2e8f0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot, flexShrink: 0 }} />
                        {s.metric}
                      </div>
                    </td>
                    <td style={{ padding: "12px 12px", fontSize: 13, fontWeight: 700, color: st.color, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{s.current}</td>
                    <td style={{ padding: "12px 12px", fontSize: 13, color: "#6b7280", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{s.threshold}</td>
                    <td style={{ padding: "12px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: st.bg, border: `1px solid ${st.border}`, color: st.color, fontWeight: 700 }}>{s.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </RevealWrapper>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function RiskRadar() {
  const [range, setRange] = useState("30D");
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await getRiskData();
      setRiskData(data);
    } catch (err) {
      console.error("[RiskRadar] fetch error:", err);
      setError(err?.response?.data?.error || err.message || "Failed to load risk data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Styles />
      <ScrollProgressBar />

      <div className="page-bg" />

      {/* Ambient glows */}
      <div style={{ position: "fixed", top: "10%", left: "20%", width: 600, height: 600, background: "radial-gradient(circle,rgba(239,68,68,0.04) 0%,transparent 70%)", pointerEvents: "none", borderRadius: "50%", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "40%", right: "10%", width: 500, height: 500, background: "radial-gradient(circle,rgba(37,99,235,0.05) 0%,transparent 70%)", pointerEvents: "none", borderRadius: "50%", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <AppHeader
          range={range}
          setRange={setRange}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          lastUpdated={riskData?.last_updated}
        />

        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 28px 80px", display: "flex", flexDirection: "column", gap: 32 }}>

          {/* ── Loading State ── */}
          {loading && <LoadingState />}

          {/* ── Error State ── */}
          {!loading && error && <ErrorState message={error} onRetry={handleRefresh} />}

          {/* ── No Data State ── */}
          {!loading && !error && !riskData && <NoDataState />}

          {/* ── Main Content (only when data is ready) ── */}
          {!loading && !error && riskData && (
            <>
              {/* ── Section 1: KPI Row ── */}
              <KpiCards data={riskData} range={range} />

              {/* ── Section 2: Reasons + Alerts ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <ReasonsList reasons={riskData.top_reasons} />
                <AlertsPanel alerts={riskData.alerts} />
              </div>

              {/* ── Section 3: Risk Drivers ── */}
              <DriversGrid drivers={riskData.drivers} />

              {/* ── Section 4: Trend Chart ── */}
              <TrendChart range={range} trendData={riskData.trendData} />

              {/* ── Section 5: Actions + Signals ── */}
              <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
                <RecommendedActions actions={riskData.recommended_actions} />
                <SignalsTable signals={riskData.signals_table} />
              </div>

              {/* Footer */}
              <div style={{ textAlign: "center", paddingTop: 8 }}>
                <p style={{ fontSize: 11, color: "#1f2937" }}>
                  Risk insights are computed from your live financial data · FinMetrics © 2026
                  {riskData.company_name && ` · ${riskData.company_name}`}
                </p>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 1100px) {
          .kpi-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 900px) {
          .reasons-alerts-grid, .actions-signals-grid { grid-template-columns: 1fr !important; }
          .drivers-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 640px) {
          .kpi-grid, .drivers-grid { grid-template-columns: 1fr !important; }
          .actions-signals-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
