import { getFinancialData, getRiskData } from "../services/financialService.js";
import { getAIInsights } from "../services/aiService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

// ─── Injected CSS ─────────────────────────────────────────────────────────────
const DASH_CSS = `
  @keyframes dashFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dashFadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.85); }
  }

  .dr  { animation: dashFadeUp 0.52s cubic-bezier(0.22,1,0.36,1) both; }
  .dr1 { animation-delay:   0ms; }
  .dr2 { animation-delay:  55ms; }
  .dr3 { animation-delay: 110ms; }
  .dr4 { animation-delay: 165ms; }
  .dr5 { animation-delay: 220ms; }
  .dr6 { animation-delay: 275ms; }
  .dr7 { animation-delay: 330ms; }
  .dr8 { animation-delay: 385ms; }

  .gc {
    background: rgba(255,255,255,0.038);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset;
    border-radius: 18px;
    transition: transform 0.22s cubic-bezier(0.22,1,0.36,1),
                box-shadow 0.22s cubic-bezier(0.22,1,0.36,1),
                border-color 0.22s ease,
                background 0.22s ease;
  }
  .gc:hover {
    transform: translateY(-2px);
    background: rgba(255,255,255,0.054);
    border-color: rgba(255,255,255,0.14);
    box-shadow: 0 18px 48px rgba(0,0,0,0.55),
                0 0 0 1px rgba(59,130,246,0.1),
                0 1px 0 rgba(255,255,255,0.06) inset;
  }

  .hc {
    background: linear-gradient(110deg, rgba(37,99,235,0.13) 0%, rgba(255,255,255,0.032) 55%);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(59,130,246,0.2);
    box-shadow: 0 10px 36px rgba(0,0,0,0.45),
                0 0 52px rgba(37,99,235,0.07),
                0 1px 0 rgba(255,255,255,0.05) inset;
    border-radius: 18px;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  }
  .hc:hover {
    transform: translateY(-2px);
    border-color: rgba(59,130,246,0.34);
    box-shadow: 0 22px 54px rgba(0,0,0,0.55),
                0 0 64px rgba(37,99,235,0.12),
                0 1px 0 rgba(255,255,255,0.07) inset;
  }

  .seg-wrap {
    display: flex;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 3px;
    gap: 2px;
  }
  .seg-btn {
    padding: 5px 14px;
    border-radius: 7px;
    border: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.01em;
    transition: all 0.18s ease;
  }
  .seg-on  { background: #2563EB; color: #fff; box-shadow: 0 0 14px rgba(37,99,235,0.4); }
  .seg-off { background: transparent; color: #9CA3AF; }
  .seg-off:hover { color: #e2e8f0; background: rgba(255,255,255,0.05); }

  .badge-pos { background: rgba(34,197,94,0.12);  color: #22C55E; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.02em; }
  .badge-neg { background: rgba(239,68,68,0.12);  color: #EF4444; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.02em; }
  .badge-warn { background: rgba(245,158,11,0.12); color: #F59E0B; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.02em; }

  .risk-cta {
    margin-top: 16px; width: 100%;
    background: rgba(37,99,235,0.1);
    border: 1px solid rgba(59,130,246,0.22);
    color: #60a5fa;
    font-size: 12px; font-weight: 600;
    padding: 9px 18px; border-radius: 10px;
    cursor: pointer; letter-spacing: 0.02em;
    font-family: inherit;
    transition: background 0.18s, box-shadow 0.18s, border-color 0.18s;
  }
  .risk-cta:hover {
    background: rgba(37,99,235,0.2);
    border-color: rgba(59,130,246,0.4);
    box-shadow: 0 0 18px rgba(37,99,235,0.22);
  }

  .dash-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 25%,
      rgba(255,255,255,0.07) 75%, transparent 100%);
    margin: 2px 0 24px;
  }

  .skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #22C55E;
    animation: pulse-dot 2s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .dr  { animation: dashFadeIn 0.3s ease both; }
    .gc:hover, .hc:hover { transform: none; }
    .skeleton { animation: none; background: rgba(255,255,255,0.06); }
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n, decimals = 0) {
  if (n === undefined || n === null) return "—";
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtCurrency(n, currency = "USD", compact = false) {
  if (n === undefined || n === null) return "—";
  const abs = Math.abs(n);
  if (compact) {
    if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  }
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Build monthly chart data from transactions
function buildChartData(transactions = [], revenueStreams = []) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthly = months.map(m => ({ period: m, revenue: 0, expenses: 0 }));

  transactions.forEach(t => {
    if (!t.date) return;
    const d = new Date(t.date);
    if (isNaN(d)) return;
    const idx = d.getMonth();
    if (t.type === "Income")   monthly[idx].revenue  += t.amount || 0;
    if (t.type === "Expense")  monthly[idx].expenses += t.amount || 0;
  });

  // Spread revenue streams evenly across all months
  const streamTotal = revenueStreams.reduce((s, r) => s + (r.amount || 0), 0);
  if (streamTotal > 0) {
    const perMonth = streamTotal / 12;
    monthly.forEach(m => { m.revenue += perMonth; });
  }

  // Scale to K
  return monthly.map(m => ({
    period: m.period,
    revenue:  Math.round(m.revenue / 1000),
    expenses: Math.round(m.expenses / 1000),
  }));
}

// Build quarterly from monthly
function buildQuarterlyData(monthly) {
  const quarters = [
    { period: "Q1", months: [0,1,2] },
    { period: "Q2", months: [3,4,5] },
    { period: "Q3", months: [6,7,8] },
    { period: "Q4", months: [9,10,11] },
  ];
  return quarters.map(q => ({
    period: q.period,
    revenue:  q.months.reduce((s, i) => s + (monthly[i]?.revenue  || 0), 0),
    expenses: q.months.reduce((s, i) => s + (monthly[i]?.expenses || 0), 0),
  }));
}

// Revenue growth: compare last 2 months with data
function calcRevenueGrowth(monthly) {
  const withData = monthly.filter(m => m.revenue > 0 || m.expenses > 0);
  if (withData.length < 2) return { pct: 0, prev: 0, positive: true };
  const last  = withData[withData.length - 1].revenue;
  const prev  = withData[withData.length - 2].revenue;
  if (prev === 0) return { pct: 0, prev: 0, positive: true };
  const pct = ((last - prev) / prev) * 100;
  return { pct: Math.abs(pct).toFixed(1), prevPct: (prev / (prev || 1) * 0).toFixed(1), positive: pct >= 0 };
}

// Profit margin
function calcProfitMargin(totalRevenue, totalExpenses) {
  if (!totalRevenue || totalRevenue === 0) return 0;
  return ((totalRevenue - totalExpenses) / totalRevenue) * 100;
}

// Risk color + label
function riskMeta(score) {
  if (score >= 70) return { label: "HIGH",     color: "#EF4444", bg: "rgba(239,68,68,0.12)" };
  if (score >= 40) return { label: "MODERATE", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" };
  return              { label: "LOW",      color: "#22C55E", bg: "rgba(34,197,94,0.12)" };
}

// ─── Animated Number ──────────────────────────────────────────────────────────
function AnimatedNumber({ target, decimals = 0, duration = 1400 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(+(target * ease).toFixed(decimals));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setVal(target);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, decimals]);
  return <>{val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}

// ─── Risk Bar ────────────────────────────────────────────────────────────────
function RiskBar({ label, value, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 320 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  const riskLabel = value < 40 ? "Low" : value < 65 ? "Moderate" : "High";
  const textColor = value < 40 ? "#22C55E" : value < 65 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
        <span style={{ color:"#9CA3AF", fontSize:13 }}>{label}</span>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color:textColor, fontSize:11, fontWeight:600 }}>{riskLabel}</span>
          <span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>{value}%</span>
        </div>
      </div>
      <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:8, height:5, overflow:"hidden" }}>
        <div style={{
          width:`${w}%`, background:color, height:"100%", borderRadius:8,
          boxShadow:`0 0 8px ${color}55`,
          transition:"width 1s cubic-bezier(0.25,1,0.5,1)",
        }} />
      </div>
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ title, value, prefix="", suffix="", subtext, change, positive, decimals=0, dn=1, loading }) {
  if (loading) return (
    <div className={`gc dr dr${dn}`} style={{ padding:"22px 26px" }}>
      <div className="skeleton" style={{ height:12, width:"40%", marginBottom:14 }} />
      <div className="skeleton" style={{ height:30, width:"60%", marginBottom:12 }} />
      <div className="skeleton" style={{ height:10, width:"70%" }} />
    </div>
  );
  return (
    <div className={`gc dr dr${dn}`} style={{ padding:"22px 26px" }}>
      <p style={{ color:"#6B7280", fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>
        {title}
      </p>
      <p style={{ color:"#fff", fontSize:30, fontWeight:700, letterSpacing:"-0.035em", lineHeight:1 }}>
        {prefix}<AnimatedNumber target={value} decimals={decimals} />{suffix}
      </p>
      <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        {change !== undefined && (
          <span className={positive ? "badge-pos" : "badge-neg"}>
            {positive ? "+" : "−"}{change}
          </span>
        )}
        <span style={{ color:"#6B7280", fontSize:12 }}>{subtext}</span>
      </div>
    </div>
  );
}

// ─── Chart Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  const sym = currency === "INR" ? "₹" : "$";
  return (
    <div style={{
      background:"rgba(10,17,34,0.96)", border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:11, padding:"10px 14px", boxShadow:"0 8px 28px rgba(0,0,0,0.55)",
    }}>
      <p style={{ color:"#6B7280", fontSize:11, marginBottom:7, letterSpacing:"0.05em" }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color:p.color, fontSize:13, fontWeight:700, marginBottom:2 }}>
          {p.name}: <span style={{ color:"#fff" }}>{sym}{p.value.toLocaleString()}K</span>
        </p>
      ))}
    </div>
  );
}

// ─── Dynamic Sparkline ───────────────────────────────────────────────────────
function Sparkline({ data }) {
  const pts = data?.length >= 2 ? data.map(d => d.revenue) : [30,28,35,33,40,38,45,48,44,52,50,58];
  const max = Math.max(...pts), min = Math.min(...pts);
  const W = 120, H = 36;
  const range = max - min || 1;
  const coords = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - ((p - min) / range) * H;
    return `${x},${y}`;
  });
  const poly = coords.join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <defs>
        <linearGradient id="spk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3B82F6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${poly} ${W},${H}`} fill="url(#spk)" />
      <polyline points={poly} stroke="#3B82F6" strokeWidth="1.8"
        fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Segmented Control ───────────────────────────────────────────────────────
function Seg({ options, value, onChange }) {
  return (
    <div className="seg-wrap">
      {options.map(o => (
        <button key={o} className={`seg-btn ${value === o ? "seg-on" : "seg-off"}`}
          onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

// ─── Budget Bar Chart ────────────────────────────────────────────────────────
function BudgetTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:"rgba(10,17,34,0.96)", border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:11, padding:"10px 14px",
    }}>
      <p style={{ color:"#6B7280", fontSize:11, marginBottom:6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color:p.color, fontSize:12, fontWeight:700, marginBottom:2 }}>
          {p.name}: <span style={{ color:"#fff" }}>${p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Revenue Stream Card ─────────────────────────────────────────────────────
function RevenueStreamRow({ stream, amount, growth, currency }) {
  const sym = currency === "INR" ? "₹" : "$";
  const pos = growth >= 0;
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0",
      borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
      <div>
        <p style={{ color:"#E2E8F0", fontSize:13, fontWeight:600, marginBottom:3 }}>{stream}</p>
        <p style={{ color:"#4B5563", fontSize:11 }}>Revenue stream</p>
      </div>
      <div style={{ textAlign:"right" }}>
        <p style={{ color:"#fff", fontSize:14, fontWeight:700, marginBottom:3 }}>
          {sym}{fmtCurrency(amount, currency, true)}
        </p>
        <span style={{
          fontSize:11, fontWeight:700, padding:"2px 7px", borderRadius:5,
          background: pos ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
          color: pos ? "#22C55E" : "#EF4444",
        }}>
          {pos ? "+" : ""}{fmt(growth, 1)}%
        </span>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [chartPeriod, setChartPeriod] = useState("Monthly");
  const [visible,     setVisible]     = useState(false);

  // Data state
  const [finData,    setFinData]    = useState(null);
  const [riskData,   setRiskData]   = useState(null);
  const [aiInsight,  setAiInsight]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [riskLoad,   setRiskLoad]   = useState(true);

  // Fetch financial data
  useEffect(() => {
    getFinancialData()
      .then(data => setFinData(data))
      .catch(err => console.error("Dashboard fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch risk data
  useEffect(() => {
    getRiskData()
      .then(data => setRiskData(data))
      .catch(err => console.error("Risk fetch failed:", err))
      .finally(() => setRiskLoad(false));
  }, []);

  // Fetch AI insight
  useEffect(() => {
    getAIInsights()
      .then(insights => {
        if (Array.isArray(insights) && insights.length > 0) {
          setAiInsight(insights[0]);
        } else if (insights?.summary) {
          setAiInsight({ title: "AI Insight", description: insights.summary });
        }
      })
      .catch(() => {}); // non-critical
  }, []);

  // Inject CSS
  useEffect(() => {
    const id = "dash-v4";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = DASH_CSS;
    document.head.appendChild(el);
    return () => { try { document.head.removeChild(el); } catch {} };
  }, []);

  // Fade in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────
  const company       = finData?.company || {};
  const metrics       = finData?.metrics || {};
  const transactions  = finData?.transactions || [];
  const budgets       = finData?.budgets || [];
  const revenueStreams = finData?.revenueStreams || [];

  const currency      = company.currency || "USD";
  const currSym       = currency === "INR" ? "₹" : "$";

  const totalRevenue  = metrics.totalRevenue  || 0;
  const totalExpenses = metrics.totalExpenses || 0;
  const netBurn       = metrics.netBurn       || 0;
  const runwayMonths  = metrics.runwayMonths  || 0;
  const riskScore     = metrics.riskScore     || 0;
  const cashBalance   = company.cashBalance   || 0;

  const profitMargin  = calcProfitMargin(totalRevenue, totalExpenses);
  const companyName   = company.name || user?.companyName || "Your Company";

  // Chart data from real transactions
  const monthlyData   = buildChartData(transactions, revenueStreams);
  const quarterlyData = buildQuarterlyData(monthlyData);
  const chartData     = chartPeriod === "Monthly" ? monthlyData : quarterlyData;

  // Revenue growth
  const { pct: growthPct, positive: growthPos } = calcRevenueGrowth(monthlyData);

  // Burn rate (monthly avg)
  const burnRateMonthly = Math.round(netBurn / 12) || Math.round(totalExpenses / 12);

  // Risk items from riskData drivers, or fallback from metrics
  const riskDrivers = riskData?.drivers?.length
    ? riskData.drivers.map((d, i) => ({
        label: d.label,
        value: Math.min(100, Math.round(d.score)),
        color: ["#3B82F6","#F59E0B","#22C55E","#EF4444"][i % 4],
      }))
    : [
        { label: "Liquidity Risk", value: runwayMonths < 3 ? 78 : runwayMonths < 6 ? 52 : 28, color: "#3B82F6" },
        { label: "Revenue Risk",   value: growthPos ? 35 : 61,  color: "#F59E0B" },
        { label: "Debt Risk",      value: 28,                    color: "#22C55E" },
        { label: "Expense Risk",   value: profitMargin < 5 ? 74 : profitMargin < 15 ? 52 : 30, color: "#EF4444" },
      ];

  const overallRisk   = riskData?.riskScore || riskScore;
  const rm            = riskMeta(overallRisk);

  // Budget chart data
  const budgetChartData = budgets.slice(0, 6).map(b => ({
    dept:      b.dept,
    Allocated: Math.round(b.allocated / 1000),
    Spent:     Math.round(b.spent     / 1000),
  }));

  // AI insight text
  const aiText = aiInsight
    ? (aiInsight.description || aiInsight.title || "")
    : runwayMonths > 0
      ? `Runway is ${fmt(runwayMonths, 1)} months at current burn rate of ${currSym}${fmtCurrency(burnRateMonthly, currency, true)}/mo. ${profitMargin < 10 ? "Profit margin is below 10% — review operating costs." : "Financial indicators look stable."}`
      : "Connect your financial data to get real-time AI-powered insights on your runway, burn, and risk profile.";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 30% 20%, #111827 0%, #0B0F19 60%)",
      color: "#fff",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.45s ease",
    }}>
      <div style={{ width:"100%", maxWidth:"none", padding:"10px clamp(24px, 4vw, 72px) 56px" }}>

        {/* ── Header ── */}
        <div className="dr dr1" style={{
          marginTop:8, marginBottom:20,
          display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:16,
        }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
              <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.03em", color:"#fff", lineHeight:1 }}>
                Dashboard
              </h1>
              {!loading && (
                <span style={{ color:"#4B5563", fontSize:13, fontWeight:500 }}>— {companyName}</span>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <div className="live-dot" />
              <p style={{ color:"#6B7280", fontSize:13 }}>
                Overview of runway, burn, and performance.
              </p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Seg options={["Monthly","Quarterly"]} value={chartPeriod} onChange={setChartPeriod} />
          </div>
        </div>

        {/* Divider */}
        <div className="dash-divider dr dr2" />

        {/* ── Hero: Revenue Growth ── */}
        <div className="hc dr dr2" style={{
          padding:"26px 36px", marginBottom:16,
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:24,
        }}>
          {loading ? (
            <>
              <div style={{ flex:1 }}>
                <div className="skeleton" style={{ height:12, width:"30%", marginBottom:14 }} />
                <div className="skeleton" style={{ height:46, width:"50%", marginBottom:12 }} />
                <div className="skeleton" style={{ height:12, width:"60%" }} />
              </div>
              <div className="skeleton" style={{ width:120, height:36, borderRadius:6 }} />
            </>
          ) : (
            <>
              <div>
                <p style={{ color:"#6B7280", fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
                  Revenue Growth
                </p>
                <div style={{ display:"flex", alignItems:"baseline", gap:14 }}>
                  <span style={{ fontSize:46, fontWeight:800, letterSpacing:"-0.04em", color:"#fff", lineHeight:1 }}>
                    {growthPos ? "+" : "−"}<AnimatedNumber target={parseFloat(growthPct)} decimals={1} />%
                  </span>
                  <span className={growthPos ? "badge-pos" : "badge-neg"} style={{ fontSize:12 }}>
                    Month-over-Month
                  </span>
                </div>
                <p style={{ color:"#6B7280", fontSize:13, marginTop:10, lineHeight:1.5 }}>
                  {totalRevenue > 0
                    ? <>Total revenue: <span style={{ color:"#3B82F6", fontWeight:600 }}>{currSym}{fmtCurrency(totalRevenue, currency, true)}</span> across all streams</>
                    : "Add transactions or revenue streams to see growth metrics."
                  }
                </p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0 }}>
                <Sparkline data={monthlyData} />
                <span style={{ color:"#4B5563", fontSize:11, letterSpacing:"0.04em" }}>12-month trend</span>
              </div>
            </>
          )}
        </div>

        {/* ── KPI Cards 2×2 ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
          <MetricCard
            loading={loading}
            title="Cash Reserve"
            value={parseFloat((cashBalance / 1_000_000).toFixed(2))}
            prefix={currSym}
            suffix="M"
            decimals={2}
            subtext={`${currency} balance on record`}
            change={cashBalance > 0 ? fmtCurrency(cashBalance, currency, true) : undefined}
            positive={true}
            dn={3}
          />
          <MetricCard
            loading={loading}
            title="Burn Rate"
            value={Math.round(burnRateMonthly / 1000 * 10) / 10}
            prefix={currSym}
            suffix="K/mo"
            decimals={1}
            subtext={netBurn > 0 ? "net monthly burn" : "currently cash-flow positive"}
            change={netBurn > 0 ? fmtCurrency(burnRateMonthly, currency, true) : undefined}
            positive={false}
            dn={4}
          />
          <MetricCard
            loading={loading}
            title="Runway"
            value={parseFloat(runwayMonths.toFixed(1))}
            suffix=" months"
            decimals={1}
            subtext="at current burn rate"
            change={runwayMonths > 0 ? `${fmt(runwayMonths, 1)}mo` : undefined}
            positive={runwayMonths >= 12}
            dn={5}
          />
          <MetricCard
            loading={loading}
            title="Profit Margin"
            value={parseFloat(Math.max(0, profitMargin).toFixed(1))}
            suffix="%"
            decimals={1}
            subtext="operating margin"
            change={`${fmt(Math.abs(profitMargin), 1)}%`}
            positive={profitMargin >= 10}
            dn={6}
          />
        </div>

        {/* ── Revenue vs Expenses Chart ── */}
        <div className="gc dr dr5" style={{ padding:"26px 30px", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:12 }}>
            <div>
              <p style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.02em", color:"#fff" }}>
                Revenue vs Expenses
              </p>
              <p style={{ color:"#6B7280", fontSize:12, marginTop:3 }}>
                {chartPeriod} financial performance — {currency}
              </p>
            </div>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <div style={{ textAlign:"right" }}>
                <p style={{ color:"#6B7280", fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase" }}>Total Revenue</p>
                <p style={{ color:"#3B82F6", fontSize:14, fontWeight:700 }}>{currSym}{fmtCurrency(totalRevenue, currency, true)}</p>
              </div>
              <div style={{ width:1, height:28, background:"rgba(255,255,255,0.07)" }} />
              <div style={{ textAlign:"right" }}>
                <p style={{ color:"#6B7280", fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase" }}>Total Expenses</p>
                <p style={{ color:"#94A3B8", fontSize:14, fontWeight:700 }}>{currSym}{fmtCurrency(totalExpenses, currency, true)}</p>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={236}>
            <AreaChart data={chartData} margin={{ top:4, right:4, left:-16, bottom:0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#94A3B8" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#94A3B8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="0" vertical={false} />
              <XAxis dataKey="period" tick={{ fill:"#6B7280", fontSize:11, fontFamily:"inherit" }}
                axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#6B7280", fontSize:11, fontFamily:"inherit" }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `${currSym}${v}K`} />
              <Tooltip content={<ChartTooltip currency={currency} />} />
              <Area type="monotone" dataKey="revenue" name="Revenue"
                stroke="#3B82F6" strokeWidth={2} fill="url(#gRev)" dot={false}
                activeDot={{ r:4, fill:"#3B82F6", stroke:"rgba(5,12,24,.8)", strokeWidth:2 }} />
              <Area type="monotone" dataKey="expenses" name="Expenses"
                stroke="#94A3B8" strokeWidth={1.5} fill="url(#gExp)" dot={false}
                activeDot={{ r:4, fill:"#94A3B8", stroke:"rgba(5,12,24,.8)", strokeWidth:2 }} />
            </AreaChart>
          </ResponsiveContainer>

          <div style={{ display:"flex", gap:20, marginTop:14 }}>
            {[{ color:"#3B82F6", label:"Revenue" }, { color:"#94A3B8", label:"Expenses" }].map(l => (
              <div key={l.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:20, height:2, background:l.color, borderRadius:2 }} />
                <span style={{ color:"#6B7280", fontSize:11 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Budget Overview (shown only if budgets exist) ── */}
        {budgets.length > 0 && (
          <div className="gc dr dr5" style={{ padding:"26px 30px", marginBottom:18 }}>
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.02em", color:"#fff" }}>
                Budget Overview
              </p>
              <p style={{ color:"#6B7280", fontSize:12, marginTop:3 }}>
                Allocated vs. spent by department
              </p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={budgetChartData} margin={{ top:4, right:4, left:-16, bottom:0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="dept" tick={{ fill:"#6B7280", fontSize:11, fontFamily:"inherit" }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#6B7280", fontSize:11, fontFamily:"inherit" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${currSym}${v}K`} />
                <Tooltip content={<BudgetTooltip />} />
                <Bar dataKey="Allocated" fill="rgba(59,130,246,0.25)" radius={[4,4,0,0]} />
                <Bar dataKey="Spent"     fill="#3B82F6"               radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", gap:16, marginTop:12 }}>
              {[{ color:"rgba(59,130,246,0.25)", label:"Allocated" }, { color:"#3B82F6", label:"Spent" }].map(l => (
                <div key={l.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:12, height:12, background:l.color, borderRadius:3 }} />
                  <span style={{ color:"#6B7280", fontSize:11 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Revenue Streams (shown if data exists) ── */}
        {revenueStreams.length > 0 && (
          <div className="gc dr dr6" style={{ padding:"22px 26px", marginBottom:18 }}>
            <p style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.02em", color:"#fff", marginBottom:16 }}>
              Revenue Streams
            </p>
            {revenueStreams.map((r, i) => (
              <RevenueStreamRow key={i} {...r} currency={currency} />
            ))}
          </div>
        )}

        {/* ── AI Insight ── */}
        <div className="gc dr dr6" style={{ padding:"15px 24px", marginBottom:18, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:30, height:30, flexShrink:0,
            background:"rgba(59,130,246,0.12)",
            border:"1px solid rgba(59,130,246,0.22)",
            borderRadius:9,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
          </div>
          <p style={{ color:"#94A3B8", fontSize:13, lineHeight:1.55 }}>
            <span style={{ color:"#fff", fontWeight:600 }}>AI Insight: </span>
            {aiText}
          </p>
        </div>

        {/* ── Bottom Row: Risk + Transactions ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:14 }}>

          {/* Risk Summary */}
          <div className="gc dr dr7" style={{ padding:"26px 30px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <p style={{ color:"#6B7280", fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>
                  Overall Risk Score
                </p>
                <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
                  <span style={{ fontSize:42, fontWeight:800, letterSpacing:"-0.04em", color:"#fff" }}>
                    {riskLoad ? "—" : overallRisk}
                  </span>
                  <span style={{ color:"#6B7280", fontSize:16 }}>/100</span>
                  {!riskLoad && (
                    <span style={{ background:rm.bg, color:rm.color, fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:6, marginLeft:4 }}>
                      {rm.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {riskLoad ? (
              [0,1,2,3].map(i => (
                <div key={i} style={{ marginBottom:16 }}>
                  <div className="skeleton" style={{ height:10, width:"60%", marginBottom:8 }} />
                  <div className="skeleton" style={{ height:5, width:"100%" }} />
                </div>
              ))
            ) : (
              riskDrivers.map((r, i) => (
                <RiskBar key={r.label} {...r} delay={i * 110} />
              ))
            )}

            <button className="risk-cta" onClick={() => navigate("/risk-radar")}>
              View Full Risk Radar →
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="gc dr dr8" style={{ padding:"26px 26px" }}>
            <p style={{ color:"#6B7280", fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:20 }}>
              Recent Transactions
            </p>

            {loading ? (
              [0,1,2,3].map(i => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"11px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <div className="skeleton" style={{ height:11, width:"45%" }} />
                  <div className="skeleton" style={{ height:11, width:"20%" }} />
                </div>
              ))
            ) : transactions.length === 0 ? (
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                <p style={{ color:"#4B5563", fontSize:13 }}>No transactions yet.</p>
                <p style={{ color:"#374151", fontSize:12, marginTop:6 }}>
                  Add data in the Data page.
                </p>
              </div>
            ) : (
              transactions
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
                .map((t, i, arr) => {
                  const isIncome = t.type === "Income";
                  return (
                    <div key={t._id || i} style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"11px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}>
                      <div>
                        <p style={{ color:"#9CA3AF", fontSize:12, marginBottom:3 }}>{t.category}</p>
                        <p style={{ color:"#4B5563", fontSize:11 }}>
                          {t.date ? new Date(t.date).toLocaleDateString(undefined, { month:"short", day:"numeric" }) : "—"}
                        </p>
                      </div>
                      <span style={{
                        fontSize:14, fontWeight:700,
                        color: isIncome ? "#22C55E" : "#EF4444",
                      }}>
                        {isIncome ? "+" : "−"}{currSym}{fmtCurrency(t.amount, currency, true)}
                      </span>
                    </div>
                  );
                })
            )}

            {!loading && transactions.length > 0 && (
              <div style={{ marginTop:16, padding:"12px 15px", background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.055)", borderRadius:11 }}>
                <p style={{ color:"#6B7280", fontSize:11, lineHeight:1.6 }}>
                  Showing {Math.min(5, transactions.length)} of {transactions.length} transactions. {" "}
                  <span
                    onClick={() => navigate("/data")}
                    style={{ color:"#3B82F6", cursor:"pointer", textDecoration:"underline" }}
                  >
                    View all →
                  </span>
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
