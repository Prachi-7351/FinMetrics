

import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, ReferenceLine
} from "recharts";

// ─── Data ────────────────────────────────────────────────────────────────────
const monthlyData = [
  { period: "Jan", revenue: 420, expenses: 310 },
  { period: "Feb", revenue: 380, expenses: 290 },
  { period: "Mar", revenue: 510, expenses: 340 },
  { period: "Apr", revenue: 490, expenses: 360 },
  { period: "May", revenue: 620, expenses: 400 },
  { period: "Jun", revenue: 580, expenses: 380 },
  { period: "Jul", revenue: 710, expenses: 430 },
  { period: "Aug", revenue: 680, expenses: 410 },
  { period: "Sep", revenue: 790, expenses: 460 },
  { period: "Oct", revenue: 750, expenses: 440 },
  { period: "Nov", revenue: 870, expenses: 490 },
  { period: "Dec", revenue: 920, expenses: 510 },
];

const quarterlyData = [
  { period: "Q1", revenue: 1310, expenses: 940 },
  { period: "Q2", revenue: 1690, expenses: 1140 },
  { period: "Q3", revenue: 2180, expenses: 1300 },
  { period: "Q4", revenue: 2540, expenses: 1440 },
];

const riskItems = [
  { label: "Liquidity Risk", value: 42, color: "#3B82F6" },
  { label: "Revenue Risk",   value: 61, color: "#F59E0B" },
  { label: "Debt Risk",      value: 28, color: "#22C55E" },
  { label: "Expense Risk",   value: 74, color: "#EF4444" },
];

// ─── Animated Number ─────────────────────────────────────────────────────────
function AnimatedNumber({ target, prefix = "", suffix = "", decimals = 0, duration = 1400 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(+(target * ease).toFixed(decimals));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return <>{prefix}{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}

// ─── Animated Risk Bar ────────────────────────────────────────────────────────
function RiskBar({ label, value, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const riskLabel = value < 40 ? "Low" : value < 65 ? "Moderate" : "High";
  const textColor  = value < 40 ? "#22C55E" : value < 65 ? "#F59E0B" : "#EF4444";

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span style={{ color: "#9CA3AF", fontSize: 13, fontFamily: "DM Sans, sans-serif", letterSpacing: "0.01em" }}>{label}</span>
        <div className="flex items-center gap-2">
          <span style={{ color: textColor, fontSize: 12, fontWeight: 600 }}>{riskLabel}</span>
          <span style={{ color: "#FFFFFF", fontSize: 13, fontWeight: 700 }}>{value}%</span>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, height: 6, overflow: "hidden" }}>
        <div
          style={{
            width: `${width}%`,
            background: color,
            height: "100%",
            borderRadius: 8,
            transition: "width 1s cubic-bezier(0.25, 1, 0.5, 1)",
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ title, value, prefix = "", suffix = "", subtext, change, positive, decimals = 0 }) {
  return (
    <div
      className="group"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        borderRadius: 16,
        padding: "24px 28px",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        cursor: "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 18px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
      }}
    >
      <p style={{ color: "#9CA3AF", fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, fontFamily: "DM Sans, sans-serif" }}>{title}</p>
      <p style={{ color: "#FFFFFF", fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, fontFamily: "DM Sans, sans-serif" }}>
        {prefix}<AnimatedNumber target={value} decimals={decimals} />{suffix}
      </p>
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
        {change !== undefined && (
          <span style={{
            background: positive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
            color: positive ? "#22C55E" : "#EF4444",
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 6,
            letterSpacing: "0.02em",
          }}>
            {positive ? "+" : "-"}{change}
          </span>
        )}
        <span style={{ color: "#94A3B8", fontSize: 12 }}>{subtext}</span>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(15,23,42,0.92)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    }}>
      <p style={{ color: "#9CA3AF", fontSize: 11, marginBottom: 6, letterSpacing: "0.05em" }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>
          {p.name}: <span style={{ color: "#fff" }}>${p.value.toLocaleString()}K</span>
        </p>
      ))}
    </div>
  );
}

// ─── Sparkline (inline SVG) ───────────────────────────────────────────────────
function Sparkline() {
  const points = [30, 28, 35, 33, 40, 38, 45, 48, 44, 52, 50, 58];
  const max = Math.max(...points), min = Math.min(...points);
  const w = 120, h = 36;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / (max - min)) * h;
    return `${x},${y}`;
  });
  const polyline = coords.join(" ");
  const area = `0,${h} ${polyline} ${w},${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#spark)" />
      <polyline points={polyline} stroke="#3B82F6" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState("Monthly");
  const [dateFilter, setDateFilter] = useState("Month");
  const [visible, setVisible] = useState(false);
  const overallRisk = 58;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const chartData = chartPeriod === "Monthly" ? monthlyData : quarterlyData;

  const cardStyle = {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    borderRadius: 16,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 30% 20%, #111827 0%, #0B0F19 60%)",
      fontFamily: "'DM Sans', sans-serif",
      color: "#FFFFFF",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.5s ease",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 48px" }}>

        {/* ── Header ── */}
        <div style={{ paddingTop: 28, paddingBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Left */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #2563EB, #3B82F6)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>F</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", color: "#FFFFFF" }}>FinMetrics</span>
            </div>
            <p style={{ color: "#94A3B8", fontSize: 11, marginTop: 4, letterSpacing: "0.04em" }}>
              Last updated: Feb 26, 2026 · 09:41 AM UTC
            </p>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Date filter */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 3, gap: 2 }}>
              {["Month", "Quarter", "Year"].map(f => (
                <button
                  key={f}
                  onClick={() => setDateFilter(f)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 7,
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: dateFilter === f ? "#2563EB" : "transparent",
                    color: dateFilter === f ? "#fff" : "#9CA3AF",
                    boxShadow: dateFilter === f ? "0 0 12px rgba(59,130,246,0.4)" : "none",
                    transition: "all 0.18s ease",
                  }}
                >{f}</button>
              ))}
            </div>

            {/* Risk badge */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: 10,
              padding: "7px 14px",
              boxShadow: "0 0 16px rgba(59,130,246,0.2)",
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3B82F6", boxShadow: "0 0 8px #3B82F6" }} />
              <span style={{ color: "#9CA3AF", fontSize: 11, letterSpacing: "0.04em" }}>RISK SCORE</span>
              <span style={{ color: "#FFFFFF", fontSize: 13, fontWeight: 700 }}>{overallRisk}/100</span>
            </div>

            {/* Bell */}
            <button style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, rgba(255,255,255,0) 100%)", marginBottom: 28 }} />

        {/* ── Revenue Growth Highlight ── */}
        <div style={{
          ...cardStyle,
          padding: "28px 36px",
          marginBottom: 20,
          background: "linear-gradient(105deg, rgba(37,99,235,0.12) 0%, rgba(255,255,255,0.04) 60%)",
          border: "1px solid rgba(59,130,246,0.2)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4), 0 0 40px rgba(37,99,235,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <p style={{ color: "#94A3B8", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Revenue Growth</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.04em", color: "#FFFFFF" }}>
                +<AnimatedNumber target={12.4} decimals={1} />%
              </span>
              <span style={{
                background: "rgba(34,197,94,0.12)",
                color: "#22C55E",
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 7,
                letterSpacing: "0.03em",
              }}>Month-over-Month</span>
            </div>
            <p style={{ color: "#94A3B8", fontSize: 13, marginTop: 8 }}>Up from <span style={{ color: "#3B82F6", fontWeight: 600 }}>9.0%</span> last month — consistent upward trajectory</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <Sparkline />
            <span style={{ color: "#94A3B8", fontSize: 11, letterSpacing: "0.04em" }}>12-month trend</span>
          </div>
        </div>

        {/* ── Stability Metrics 2×2 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <MetricCard title="Cash Reserve"   value={4.82}   prefix="$" suffix="M" decimals={2} subtext="vs. $4.1M prior quarter" change="17.6%" positive={true} />
          <MetricCard title="Burn Rate"      value={380}    prefix="$" suffix="K/mo" subtext="slightly elevated"              change="5.2%"  positive={false} />
          <MetricCard title="Runway"         value={12.7}   suffix=" months" decimals={1} subtext="at current burn rate"     change="1.3mo" positive={false} />
          <MetricCard title="Profit Margin"  value={18.4}   suffix="%" decimals={1} subtext="operating margin"               change="2.1%"  positive={true} />
        </div>

        {/* ── Cashflow Chart ── */}
        <div style={{ ...cardStyle, padding: "28px 32px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: "#FFFFFF" }}>Revenue vs Expenses</p>
              <p style={{ color: "#94A3B8", fontSize: 12, marginTop: 2 }}>Financial performance overview</p>
            </div>
            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 3, gap: 2 }}>
              {["Monthly", "Quarterly"].map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 7,
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: chartPeriod === p ? "#1D4ED8" : "transparent",
                    color: chartPeriod === p ? "#fff" : "#9CA3AF",
                    boxShadow: chartPeriod === p ? "0 0 12px rgba(37,99,235,0.35)" : "none",
                    transition: "all 0.18s ease",
                  }}
                >{p}</button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#94A3B8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="0" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#rev)" dot={false} activeDot={{ r: 4, fill: "#3B82F6" }} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#94A3B8" strokeWidth={1.5} fill="url(#exp)" dot={false} activeDot={{ r: 4, fill: "#94A3B8" }} />
            </AreaChart>
          </ResponsiveContainer>

          <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
            {[{ color: "#3B82F6", label: "Revenue" }, { color: "#94A3B8", label: "Expenses" }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 2, background: l.color, borderRadius: 2 }} />
                <span style={{ color: "#94A3B8", fontSize: 11 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Key Insight ── */}
        <div style={{
          ...cardStyle,
          padding: "16px 28px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}>
          <div style={{ width: 28, height: 28, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
            </svg>
          </div>
          <p style={{ color: "#94A3B8", fontSize: 13, lineHeight: 1.5 }}>
            <span style={{ color: "#FFFFFF", fontWeight: 600 }}>AI Insight: </span>
            Runway decreased by 1.3 months due to rising burn rate and slower-than-projected revenue growth in Q4. Expense Risk elevated to 74 — recommend reviewing recurring infrastructure costs.
          </p>
        </div>

        {/* ── Bottom Row: Risk + Market ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>

          {/* Risk Summary */}
          <div style={{ ...cardStyle, padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <p style={{ color: "#94A3B8", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Overall Risk Score</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.04em", color: "#FFFFFF" }}>{overallRisk}</span>
                  <span style={{ color: "#94A3B8", fontSize: 16 }}>/100</span>
                  <span style={{
                    background: "rgba(245,158,11,0.12)",
                    color: "#F59E0B",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 6,
                    marginLeft: 4,
                  }}>MODERATE</span>
                </div>
              </div>
            </div>

            {riskItems.map((r, i) => (
              <RiskBar key={r.label} {...r} delay={i * 120} />
            ))}

            <button
              style={{
                marginTop: 12,
                background: "rgba(37,99,235,0.12)",
                border: "1px solid rgba(59,130,246,0.25)",
                color: "#3B82F6",
                fontSize: 12,
                fontWeight: 600,
                padding: "9px 18px",
                borderRadius: 9,
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "all 0.18s ease",
                width: "100%",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.2)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(59,130,246,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(37,99,235,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              View Full Risk Radar →
            </button>
          </div>

          {/* Market Pulse */}
          <div style={{ ...cardStyle, padding: "28px 28px" }}>
            <p style={{ color: "#94A3B8", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>Market Pulse</p>

            {[
              { label: "S&P 500",           value: "+0.84%",  subtext: "5,218.19",  positive: true },
              { label: "USD / INR",          value: "83.42",   subtext: "−0.12 today", positive: false },
              { label: "Market Volatility",  value: "Moderate",subtext: "VIX 18.3",   positive: null },
            ].map(m => (
              <div key={m.label} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div>
                  <p style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 3 }}>{m.label}</p>
                  <p style={{ color: "#94A3B8", fontSize: 11 }}>{m.subtext}</p>
                </div>
                <span style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: m.positive === true ? "#22C55E" : m.positive === false ? "#EF4444" : "#F59E0B",
                }}>
                  {m.value}
                </span>
              </div>
            ))}

            <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ color: "#94A3B8", fontSize: 11, lineHeight: 1.6 }}>
                Global markets remain cautious ahead of Fed rate commentary. Exposure review recommended for USD-linked liabilities.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}























