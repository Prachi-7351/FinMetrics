import { useState, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { getAIRecommendations } from "../services/aiService.js";
import { getFinancialData, getRiskData } from "../services/financialService.js";

/* ─── GLOBAL STYLES ──────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --font-display: "Syne", system-ui, sans-serif;
      --font-body: "DM Sans", system-ui, sans-serif;
      --bg: #05090f;
      --blue: #2563eb;
      --blue-light: #60a5fa;
      --blue-mid: #3b82f6;
    }
    html, body { margin: 0; padding: 0; background: var(--bg); color: #fff; font-family: var(--font-body); }
    #root { margin: 0; padding: 0; }
    .ai-cfo-fullbleed {
      width: 100vw !important; max-width: 100vw !important;
      position: relative; left: 50%; transform: translateX(-50%);
      box-sizing: border-box; overflow-x: hidden;
    }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #05090f; }
    ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }

    @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
    @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
    @keyframes panelIn  { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
    @keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

    .glass-card {
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .glass-hover { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
    .glass-hover:hover { transform: translateY(-3px); box-shadow: 0 18px 44px rgba(0,0,0,0.55), 0 0 0 1px rgba(59,130,246,0.14); border-color: rgba(255,255,255,0.12) !important; }

    .rec-card-enter { animation: panelIn 0.35s ease-out both; }

    input[type=range] { -webkit-appearance:none; width:100%; height:4px; background:rgba(255,255,255,0.08); border-radius:2px; outline:none; cursor:pointer; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:#3b82f6; cursor:pointer; box-shadow:0 0 8px rgba(59,130,246,0.6); }

    .nav-pill { display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#60a5fa; background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.2); padding:5px 14px; border-radius:999px; font-family:var(--font-body); }
    .nav-pill span { width:7px; height:7px; border-radius:50%; background:#60a5fa; animation:blink 2s ease-in-out infinite; }

    .hero-grid {
      background-image: linear-gradient(rgba(96,165,250,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 100%);
    }

    .skeleton-pulse {
      background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
      background-size: 400px 100%;
      animation: shimmer 1.6s ease-in-out infinite;
      border-radius: 8px;
    }

    @media(max-width:900px){ .main-split{ grid-template-columns:1fr!important; } .stats-row{ grid-template-columns:repeat(2,1fr)!important; } }
    @media(max-width:600px){ .stats-row{ grid-template-columns:1fr!important; } .rec-list-detail{ grid-template-columns:1fr!important; } }
  `}</style>
);

/* ─── CONSTANTS ──────────────────────────────────────────────────────────── */
const priorityConfig = {
  critical: { color:"#ef4444", bg:"rgba(239,68,68,0.1)",  border:"rgba(239,68,68,0.25)",  glow:"rgba(239,68,68,0.3)",  label:"Critical" },
  high:     { color:"#fb923c", bg:"rgba(251,146,60,0.1)",  border:"rgba(251,146,60,0.25)",  glow:"rgba(251,146,60,0.3)",  label:"High" },
  medium:   { color:"#facc15", bg:"rgba(250,204,21,0.1)",  border:"rgba(250,204,21,0.25)",  glow:"rgba(250,204,21,0.3)",  label:"Medium" },
  low:      { color:"#34d399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.25)",  glow:"rgba(52,211,153,0.3)",  label:"Low" },
};

const FALLBACK_RECS = [
  {
    id:1, priority:"critical", tag:"Burn Rate",
    title:"Reduce Discretionary Spend to Extend Runway",
    short:"Cut non-essential costs by 10–15% immediately.",
    desc:"Your current burn exceeds revenue. Identifying and eliminating non-critical spending categories can directly extend your cash runway. Focus on vendor contracts, unused subscriptions, and underperforming marketing channels.",
    impact:"+runway", confidence:82, effort:"Low", category:"Cost Optimization",
    metrics:[{l:"Action",v:"Reduce costs",bad:false},{l:"Effort",v:"Low",bad:false}],
    reasoning:"Burn rate analysis suggests expenses outpace income. Tactical cost reduction is the fastest lever available.",
    icon:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  },
  {
    id:2, priority:"high", tag:"Runway",
    title:"Plan Fundraising or Revenue Acceleration",
    short:"Initiate capital planning before runway falls below 6 months.",
    desc:"With limited runway, it's critical to either raise additional capital or accelerate revenue growth. Begin investor conversations now if fundraising is on the roadmap — the process typically takes 3–5 months.",
    impact:"Survival buffer", confidence:78, effort:"Medium", category:"Capital Strategy",
    metrics:[{l:"Action",v:"Start now",bad:false},{l:"Timeline",v:"3-5 mo",bad:false}],
    reasoning:"Runway is the single most critical metric for startup survival. Starting early gives you leverage.",
    icon:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
  },
  {
    id:3, priority:"medium", tag:"Margins",
    title:"Review Revenue Stream Performance",
    short:"Double down on highest-margin revenue channels.",
    desc:"Not all revenue is equal. Reviewing which streams have the best margin and lowest CAC allows you to concentrate resources where returns are strongest. Consider cutting or pausing underperforming channels.",
    impact:"Improved margin", confidence:72, effort:"Medium", category:"Revenue Efficiency",
    metrics:[{l:"Action",v:"Audit streams",bad:false}],
    reasoning:"Revenue quality matters as much as quantity — focusing on margin-positive channels improves sustainability.",
    icon:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
  },
  {
    id:4, priority:"low", tag:"Operations",
    title:"Set Automated Budget Threshold Alerts",
    short:"Implement early-warning systems for budget overruns.",
    desc:"Manual budget tracking delays response time. Setting automated alerts when spend crosses 80% of budget in any category ensures you can intervene before overruns occur, protecting your margins.",
    impact:"Proactive control", confidence:68, effort:"Low", category:"Operations",
    metrics:[{l:"Action",v:"Set alerts",bad:false},{l:"Effort",v:"Low",bad:false}],
    reasoning:"Budget overruns are often caught too late. Automated thresholds are a low-cost operational improvement.",
    icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
  },
];

/* ─── HOOKS ──────────────────────────────────────────────────────────────── */
function useInView(opts = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.1, ...opts }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function CountUp({ target, decimals = 0, duration = 1600, suffix = "" }) {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let s = null;
    const step = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(+(e * target).toFixed(decimals));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration, decimals]);
  return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>;
}

function FadeUp({ children, delay = 0, style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
function fmtMoney(n, currency = "USD", compact = false) {
  const sym = currency === "INR" ? "₹" : "$";
  if (n == null) return `${sym}—`;
  const abs = Math.abs(n);
  if (compact) {
    if (abs >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000)     return `${sym}${(n / 1_000).toFixed(1)}K`;
  }
  return `${sym}${Number(n).toLocaleString()}`;
}

function buildChartData(transactions = [], revenueStreams = []) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthly = months.map(m => ({ month: m, revenue: 0, expenses: 0 }));
  transactions.forEach(t => {
    const d = new Date(t.date);
    if (isNaN(d)) return;
    const idx = d.getMonth();
    if (t.type === "Income")  monthly[idx].revenue  += t.amount || 0;
    if (t.type === "Expense") monthly[idx].expenses += t.amount || 0;
  });
  const streamTotal = revenueStreams.reduce((s, r) => s + (r.amount || 0), 0);
  if (streamTotal > 0) {
    const perMonth = streamTotal / 12;
    monthly.forEach(m => { m.revenue += perMonth; });
  }
  return monthly.map(m => ({
    month:    m.month,
    revenue:  Math.round(m.revenue  / 1000),
    expenses: Math.round(m.expenses / 1000),
    margin:   Math.max(0, Math.round((m.revenue - m.expenses) / 1000)),
  }));
}

/* ─── SCROLL BAR ─────────────────────────────────────────────────────────── */
function ScrollBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setP((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100 || 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:9999, height:2 }}>
      <div style={{ height:"100%", width:`${p}%`, background:"linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa)", transition:"width 0.1s linear" }} />
    </div>
  );
}

/* ─── CUSTOM CHART TOOLTIP ──────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"rgba(8,14,30,0.97)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"14px 18px", boxShadow:"0 16px 40px rgba(0,0,0,0.6)", fontFamily:"var(--font-body)", minWidth:150 }}>
      <p style={{ color:"rgba(255,255,255,0.4)", fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display:"flex", justifyContent:"space-between", gap:24, marginBottom:5 }}>
          <span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>{p.name || p.dataKey}</span>
          <span style={{ color:p.color, fontSize:13, fontWeight:700 }}>${p.value}K</span>
        </div>
      ))}
    </div>
  );
};

/* ─── PROMPT PANEL ───────────────────────────────────────────────────────── */
function PromptPanel({ onGenerate, isLoading }) {
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(true);

  return (
    <FadeUp delay={0} style={{ marginBottom: 28 }}>
      <div className="glass-card" style={{ borderRadius:22, overflow:"hidden", border:"1px solid rgba(59,130,246,0.2)" }}>
        <div onClick={() => setExpanded(!expanded)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px", cursor:"pointer", background:"rgba(37,99,235,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#2563eb,#1d4ed8)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 0 18px rgba(37,99,235,0.4)" }}>
              <svg viewBox="0 0 24 24" fill="none" width={16} height={16} stroke="#fff" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div>
              <p style={{ color:"#93c5fd", fontSize:13, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>AI Recommendation Engine</p>
              <p style={{ color:"#6B7280", fontSize:13 }}>Powered by your real financial data · GPT-4.1 Mini</p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {isLoading && (
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:999, padding:"4px 12px" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", border:"2px solid #60a5fa", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }}/>
                <span style={{ color:"#60a5fa", fontSize:13, fontWeight:600 }}>Analyzing data...</span>
              </div>
            )}
            <svg viewBox="0 0 24 24" fill="none" width={18} height={18} stroke="#6B7280" strokeWidth={2} style={{ transform:expanded?"rotate(180deg)":"none", transition:"transform 0.3s" }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>

        {expanded && (
          <div style={{ padding:"20px 24px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ color:"#9CA3AF", fontSize:13, fontWeight:600, display:"block", marginBottom:8 }}>
                Additional Context <span style={{ color:"#4B5563", fontWeight:400 }}>(optional — your financial data is loaded automatically)</span>
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. We're preparing for a Series A. Focus on unit economics and cost efficiency..."
                rows={3}
                style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 14px", color:"#fff", fontSize:14, fontFamily:"var(--font-body)", outline:"none", resize:"vertical" }}
              />
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
              <p style={{ color:"#4B5563", fontSize:12 }}>
                💡 AI reads your live revenue, expenses, burn rate, transactions, and budgets from the database.
              </p>
              <button
                onClick={() => onGenerate(prompt)}
                disabled={isLoading}
                style={{
                  padding:"10px 24px", borderRadius:12, border:"none",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  background: isLoading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#2563eb,#1d4ed8)",
                  color: isLoading ? "#4B5563" : "#fff",
                  fontSize:14, fontWeight:600, fontFamily:"var(--font-body)",
                  display:"flex", alignItems:"center", gap:10,
                  transition:"all 0.3s",
                  boxShadow: isLoading ? "none" : "0 0 20px rgba(37,99,235,0.4)",
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin 0.8s linear infinite" }}/>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" width={14} height={14} stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    Generate Recommendations
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </FadeUp>
  );
}

/* ─── PAGE HERO ──────────────────────────────────────────────────────────── */
function PageHero({ recs, snapshot, aiPowered }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);
  const t = (d) => ({ opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(20px)", transition:`all 0.65s ease ${d}ms` });

  const activeCount  = recs.length;
  const highPriority = recs.filter(r => r.priority === "critical" || r.priority === "high").length;
  const avgConf      = recs.length ? Math.round(recs.reduce((s, r) => s + (r.confidence || 75), 0) / recs.length) : 0;
  const runway       = snapshot?.runwayMonths ?? 0;

  const currSym = snapshot?.currency === "INR" ? "₹" : "$";

  return (
    <section style={{ position:"relative", padding:"80px 0 60px", overflow:"hidden" }}>
      <div className="hero-grid" style={{ position:"absolute", inset:0, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"10%", left:"20%", width:600, height:600, background:"radial-gradient(circle,rgba(37,99,235,0.07) 0%,transparent 70%)", pointerEvents:"none", borderRadius:"50%" }}/>

      <div style={{ position:"relative", maxWidth:"100%", padding:"0 5%" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:40, alignItems:"flex-start" }}>
          <div>
            <div style={t(0)}>
              <span className="nav-pill" style={{ marginBottom:24, display:"inline-flex" }}>
                <span/>{aiPowered ? "AI-Powered Analysis" : "Financial Intelligence"}
              </span>
            </div>
            <h1 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"clamp(36px,5vw,64px)", lineHeight:1.04, letterSpacing:"-0.03em", color:"#fff", marginTop:20, marginBottom:20, ...t(80) }}>
              Your AI CFO,<br/>
              <span style={{ background:"linear-gradient(135deg,#60a5fa,#3b82f6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Always On.</span>
            </h1>
            <p style={{ color:"#9CA3AF", fontSize:18, lineHeight:1.7, maxWidth:520, marginBottom:40, ...t(160) }}>
              {aiPowered
                ? `Recommendations generated from your live data — ${snapshot?.companyName || "your company"}'s revenue, burn, and risk profile.`
                : "Real-time recommendations based on your financial data. Click Generate to get started."}
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap", ...t(240) }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", borderRadius:999, padding:"7px 16px" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"#34d399", animation:"blink 1.5s ease-in-out infinite", display:"inline-block" }}/>
                <span style={{ color:"#34d399", fontSize:13, fontWeight:600 }}>Live Data Connected</span>
              </div>
              {snapshot && (
                <span style={{ color:"rgba(255,255,255,0.3)", fontSize:14 }}>
                  {currSym}{(snapshot.totalRevenue / 1000).toFixed(0)}K revenue · {currSym}{(snapshot.totalExpenses / 1000).toFixed(0)}K expenses
                </span>
              )}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, minWidth:300, ...t(120) }}>
            {[
              { label:"Active Recs",    val:activeCount,  suffix:"",     color:"#60a5fa",  icon:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3" },
              { label:"Critical Flags", val:highPriority, suffix:"",     color:"#ef4444",  icon:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
              { label:"Avg Confidence", val:avgConf,      suffix:"%",    color:"#34d399",  icon:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label:"Runway",         val:runway,       suffix:" mo",  color:"#facc15",  decimals:1, icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((k, i) => (
              <div key={i} className="glass-card" style={{ borderRadius:16, padding:"20px 18px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, right:0, width:60, height:60, background:`radial-gradient(circle at top right,${k.color}15,transparent 70%)`, pointerEvents:"none" }}/>
                <svg viewBox="0 0 24 24" fill="none" width={20} height={20} stroke={k.color} strokeWidth={1.8} style={{ marginBottom:12 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={k.icon}/>
                </svg>
                <p style={{ color:"#6B7280", fontSize:11, fontWeight:500, marginBottom:5, letterSpacing:"0.08em", textTransform:"uppercase" }}>{k.label}</p>
                <p style={{ color:k.color, fontSize:24, fontWeight:800, letterSpacing:"-0.02em", lineHeight:1, fontFamily:"var(--font-display)" }}>
                  <CountUp target={k.val} decimals={k.decimals || 0} duration={1400} suffix={k.suffix}/>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CHART STRIP (live data) ────────────────────────────────────────────── */
function ChartStrip({ chartData, snapshot }) {
  const [view, setView] = useState("area");
  const currSym = snapshot?.currency === "INR" ? "₹" : "$";
  const totalRev  = snapshot?.totalRevenue  || 0;
  const totalExp  = snapshot?.totalExpenses || 0;
  const netMargin = totalRev > 0 ? (((totalRev - totalExp) / totalRev) * 100).toFixed(1) : "0.0";

  return (
    <FadeUp delay={0}>
      <div className="glass-card" style={{ borderRadius:22, padding:"26px 26px 18px", marginBottom:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22, flexWrap:"wrap", gap:12 }}>
          <div>
            <p style={{ color:"#6B7280", fontSize:12, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:5 }}>Financial Trend</p>
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:20, color:"#fff", letterSpacing:"-0.02em" }}>Revenue vs Expenses</h3>
          </div>
          <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.03)", borderRadius:10, border:"1px solid rgba(255,255,255,0.06)", padding:3 }}>
            {[{id:"area",label:"Area"},{id:"bar",label:"Bar"}].map(v => (
              <button key={v.id} onClick={() => setView(v.id)}
                style={{ padding:"6px 16px", borderRadius:8, border:`1px solid ${view===v.id?"rgba(59,130,246,0.4)":"transparent"}`, background:view===v.id?"rgba(37,99,235,0.2)":"transparent", color:view===v.id?"#93c5fd":"#6B7280", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)", transition:"all 0.2s" }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary pills */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:22 }}>
          {[
            { l:"Total Revenue",  v:`${currSym}${(totalRev/1000).toFixed(0)}K`,  c:"#34d399", arrow:"↑" },
            { l:"Total Expenses", v:`${currSym}${(totalExp/1000).toFixed(0)}K`,  c:"#f87171", arrow:totalExp > totalRev ? "↑" : "↓" },
            { l:"Net Margin",     v:`${netMargin}%`,                              c:"#60a5fa", arrow:parseFloat(netMargin) >= 0 ? "↑" : "↓" },
          ].map(s => (
            <div key={s.l} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"12px 16px" }}>
              <p style={{ color:"#6B7280", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>{s.l}</p>
              <p style={{ color:s.c, fontSize:16, fontWeight:800, fontFamily:"var(--font-display)" }}>{s.arrow} {s.v}</p>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:18, marginBottom:12, alignItems:"center" }}>
          {[{c:"#34d399",l:"Revenue"},{c:"#f87171",l:"Expenses"}].map(l => (
            <div key={l.l} style={{ display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ width:20, height:3, borderRadius:99, background:l.c, boxShadow:`0 0 5px ${l.c}` }}/>
              <span style={{ color:"#6B7280", fontSize:12 }}>{l.l}</span>
            </div>
          ))}
        </div>

        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)", borderRadius:14, padding:"14px 4px 4px", overflow:"hidden" }}>
          <ResponsiveContainer width="100%" height={190}>
            {view === "area" ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.18}/><stop offset="95%" stopColor="#34d399" stopOpacity={0}/></linearGradient>
                  <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f87171" stopOpacity={0.14}/><stop offset="95%" stopColor="#f87171" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <XAxis dataKey="month" tick={{ fill:"rgba(255,255,255,0.25)", fontSize:11 }} axisLine={false} tickLine={false} dy={6}/>
                <YAxis tick={{ fill:"rgba(255,255,255,0.18)", fontSize:10 }} axisLine={false} tickLine={false} width={34} tickFormatter={v => `${v}K`}/>
                <Tooltip content={<ChartTooltip/>} cursor={{ stroke:"rgba(255,255,255,0.06)", strokeWidth:1 }}/>
                <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#34d399" strokeWidth={2.5} fill="url(#revG)" dot={false} activeDot={{ r:4, fill:"#34d399",  strokeWidth:0 }}/>
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f87171" strokeWidth={2.5} fill="url(#expG)" dot={false} activeDot={{ r:4, fill:"#f87171",  strokeWidth:0 }}/>
              </AreaChart>
            ) : (
              <BarChart data={chartData} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <XAxis dataKey="month" tick={{ fill:"rgba(255,255,255,0.25)", fontSize:11 }} axisLine={false} tickLine={false} dy={6}/>
                <YAxis tick={{ fill:"rgba(255,255,255,0.18)", fontSize:10 }} axisLine={false} tickLine={false} width={34} tickFormatter={v => `${v}K`}/>
                <Tooltip content={<ChartTooltip/>} cursor={{ fill:"rgba(255,255,255,0.03)" }}/>
                <Bar dataKey="revenue"  name="Revenue"  fill="#34d399" fillOpacity={0.7} radius={[3,3,0,0]}/>
                <Bar dataKey="expenses" name="Expenses" fill="#f87171" fillOpacity={0.7} radius={[3,3,0,0]}/>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </FadeUp>
  );
}

/* ─── CONFIDENCE RING (dynamic) ──────────────────────────────────────────── */
function ConfidenceRing({ score = 0, riskScore = 50 }) {
  const [animated, setAnimated] = useState(false);
  const [display, setDisplay] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (!animated) return;
    let s = null;
    const step = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 1400, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(e * score));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [animated, score]);

  const c = score >= 80
    ? { main:"#34d399", glow:"rgba(52,211,153,0.3)",  label:"High Confidence" }
    : score >= 60
    ? { main:"#facc15", glow:"rgba(250,204,21,0.3)",  label:"Moderate" }
    : { main:"#f87171", glow:"rgba(248,113,113,0.3)", label:"Low" };

  const R = 40; const circ = 2 * Math.PI * R;
  const dataQuality   = Math.min(100, Math.round(score * 0.92));
  const patternMatch  = Math.min(100, Math.round(score * 1.04));
  const modelCertainty = Math.round(score * 0.87);

  return (
    <FadeUp delay={80}>
      <div className="glass-card" style={{ borderRadius:22, padding:"26px", position:"relative", overflow:"hidden", boxShadow:`0 0 40px ${c.glow}` }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:140, height:140, borderRadius:"50%", background:`radial-gradient(circle,${c.glow} 0%,transparent 70%)`, pointerEvents:"none" }}/>
        <p style={{ color:"#6B7280", fontSize:12, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:5 }}>Analysis Reliability</p>
        <h3 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:18, color:"#fff", marginBottom:22, letterSpacing:"-0.01em" }}>AI Confidence Score</h3>

        <div style={{ display:"flex", alignItems:"center", gap:22, marginBottom:22 }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <svg viewBox="0 0 100 100" width={100} height={100}>
              <defs><linearGradient id="cring" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={c.main}/><stop offset="100%" stopColor={c.main} stopOpacity="0.5"/></linearGradient></defs>
              <circle cx={50} cy={50} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8}/>
              <circle cx={50} cy={50} r={R} fill="none" stroke="url(#cring)" strokeWidth={8} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={animated ? circ * (1 - score / 100) : circ}
                transform="rotate(-90 50 50)" style={{ transition:"stroke-dashoffset 1.4s cubic-bezier(0.23,1,0.32,1)", filter:`drop-shadow(0 0 5px ${c.main})` }}/>
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontFamily:"var(--font-display)", fontSize:24, fontWeight:800, color:"#fff", lineHeight:1 }}>{display}</span>
              <span style={{ color:"#6B7280", fontSize:10 }}>/100</span>
            </div>
          </div>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:`${c.main}18`, border:`1px solid ${c.main}40`, borderRadius:999, padding:"4px 12px", marginBottom:10 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:c.main, display:"inline-block" }}/>
              <span style={{ color:c.main, fontSize:12, fontWeight:600 }}>{c.label}</span>
            </div>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, lineHeight:1.7 }}>
              Based on data completeness, AI pattern matching & model certainty.
            </p>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12, borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:18 }}>
          {[
            { l:"Data Quality",    v:dataQuality },
            { l:"Pattern Match",   v:patternMatch },
            { l:"Model Certainty", v:modelCertainty },
          ].map((seg, i) => (
            <div key={seg.l}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ color:"#9CA3AF", fontSize:13 }}>{seg.l}</span>
                <span style={{ color:c.main, fontSize:13, fontWeight:600 }}>{seg.v}%</span>
              </div>
              <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:animated ? `${seg.v}%` : "0%", background:`linear-gradient(90deg,${c.main}80,${c.main})`, borderRadius:99, transition:`width 1.2s ease-out ${i * 150 + 500}ms` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FadeUp>
  );
}

/* ─── RISK RADAR (live) ──────────────────────────────────────────────────── */
function RiskRadarWidget({ riskData }) {
  const [tf, setTf] = useState("30D");
  const [tooltip, setTooltip] = useState(null);
  const [barRef, barInView] = useInView();
  const R = 38; const circ = 2 * Math.PI * R;

  const riskScore = riskData?.riskScore || 0;
  const drivers   = riskData?.drivers   || [];

  const cells = drivers.length > 0
    ? drivers.flatMap(d => [
        { l:d.label, v:Math.min(1, d.score / 100), c:`rgba(${d.score > 65 ? "239,68,68" : d.score > 40 ? "245,158,11" : "34,197,94"},0.75)` },
        { l:d.label+" (alt)", v:Math.min(1, d.score * 0.85 / 100), c:`rgba(${d.score > 65 ? "248,113,113" : d.score > 40 ? "251,191,36" : "52,211,153"},0.5)` },
      ])
    : [
        { l:"Liquidity", v:0.68, c:"rgba(251,146,60,0.75)" },
        { l:"Revenue",   v:0.74, c:"rgba(59,130,246,0.75)" },
        { l:"Expenses",  v:0.61, c:"rgba(248,113,113,0.75)" },
        { l:"Debt",      v:0.82, c:"rgba(52,211,153,0.75)" },
        { l:"Margins",   v:0.55, c:"rgba(251,146,60,0.65)" },
        { l:"Capital",   v:0.78, c:"rgba(96,165,250,0.65)" },
        { l:"Cash",      v:0.65, c:"rgba(248,113,113,0.65)" },
        { l:"Overall",   v:riskScore / 100, c:"rgba(59,130,246,0.85)" },
      ];

  return (
    <FadeUp delay={240}>
      <div className="glass-card" style={{ borderRadius:22, padding:"26px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div>
            <p style={{ color:"#6B7280", fontSize:12, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:5 }}>Live Monitor</p>
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:18, color:"#fff", letterSpacing:"-0.01em" }}>Risk Radar</h3>
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {["7D","30D"].map(t => (
              <button key={t} onClick={() => setTf(t)} style={{ fontSize:12, fontWeight:600, padding:"5px 13px", borderRadius:8, cursor:"pointer", border:`1px solid ${tf===t?"rgba(59,130,246,0.4)":"rgba(255,255,255,0.07)"}`, background:tf===t?"rgba(37,99,235,0.2)":"rgba(255,255,255,0.03)", color:tf===t?"#60a5fa":"#6B7280", fontFamily:"var(--font-body)", transition:"all 0.2s" }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:16, marginBottom:18, alignItems:"center" }}>
          <div style={{ position:"relative", width:90, height:90 }}>
            <svg viewBox="0 0 100 100" width={90} height={90}>
              <circle cx={50} cy={50} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={7}/>
              <circle cx={50} cy={50} r={R} fill="none"
                stroke={riskScore >= 70 ? "#ef4444" : riskScore >= 40 ? "#f59e0b" : "#22c55e"}
                strokeWidth={7} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - riskScore / 100)}
                transform="rotate(-90 50 50)"
                style={{ transition:"stroke-dashoffset 1.4s ease-out", filter:`drop-shadow(0 0 6px ${riskScore >= 70 ? "rgba(239,68,68,0.6)" : "rgba(59,130,246,0.6)"})` }}/>
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:20, fontWeight:800, color:"#fff", lineHeight:1, fontFamily:"var(--font-display)" }}>{riskScore}</span>
              <span style={{ color:"#6B7280", fontSize:10 }}>/100</span>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4 }}>
            {cells.slice(0, 8).map((c, i) => (
              <div key={i} style={{ position:"relative" }} onMouseEnter={() => setTooltip(i)} onMouseLeave={() => setTooltip(null)}>
                <div style={{ height:24, borderRadius:5, background:c.c, cursor:"pointer", animation:`heatPulse ${1.4 + i * 0.18}s ease-in-out infinite`, transition:"transform 0.15s", transform:tooltip===i?"scale(1.08)":"scale(1)" }}/>
                {tooltip===i && <div style={{ position:"absolute", bottom:"120%", left:"50%", transform:"translateX(-50%)", background:"rgba(8,14,30,0.96)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"5px 12px", whiteSpace:"nowrap", zIndex:20, fontSize:12, color:"#fff", pointerEvents:"none" }}>{c.l}: {Math.round(c.v * 100)}</div>}
              </div>
            ))}
          </div>
        </div>

        <div ref={barRef} style={{ display:"flex", flexDirection:"column", gap:10, borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:16 }}>
          {(drivers.length > 0 ? drivers : [
            { label:"Liquidity Risk",    score:68 },
            { label:"Revenue Stability", score:74 },
            { label:"Expense Control",   score:61 },
          ]).slice(0, 3).map((d, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ color:"#9CA3AF", fontSize:13, width:120, flexShrink:0 }}>{d.label}</span>
              <div style={{ flex:1, height:3, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
                <div style={{ height:"100%", width:barInView ? `${d.score}%` : "0%", background:"linear-gradient(90deg,#1d4ed8,#60a5fa)", borderRadius:2, transition:`width 1.2s ease-out ${i * 0.15}s` }}/>
              </div>
              <span style={{ color:"#fff", fontSize:13, fontWeight:600, width:26, textAlign:"right" }}>{d.score}</span>
            </div>
          ))}
        </div>
      </div>
    </FadeUp>
  );
}

/* ─── SKELETON LOADER ────────────────────────────────────────────────────── */
function RecSkeleton() {
  return (
    <div className="glass-card" style={{ borderRadius:18, padding:"22px", border:"1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display:"flex", gap:12, marginBottom:16 }}>
        <div className="skeleton-pulse" style={{ width:38, height:38, borderRadius:11, flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div className="skeleton-pulse" style={{ height:10, width:"30%", marginBottom:8 }} />
          <div className="skeleton-pulse" style={{ height:16, width:"75%", marginBottom:8 }} />
          <div className="skeleton-pulse" style={{ height:12, width:"90%" }} />
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        {[0,1,2].map(i => <div key={i} className="skeleton-pulse" style={{ height:28, width:90, borderRadius:8 }} />)}
      </div>
    </div>
  );
}

/* ─── REC CARD ───────────────────────────────────────────────────────────── */
function RecCard({ rec, index, isSelected, onSelect }) {
  const p = priorityConfig[rec.priority] || priorityConfig.low;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect(isSelected ? null : rec)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius:18, padding:"22px", cursor:"pointer", position:"relative", overflow:"hidden",
        border:`1px solid ${isSelected ? p.border : hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)"}`,
        background: isSelected ? `linear-gradient(135deg,${p.bg},rgba(255,255,255,0.02))` : hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        boxShadow: isSelected ? `0 0 30px ${p.glow}` : hovered ? "0 8px 32px rgba(0,0,0,0.4)" : "none",
        transition:"all 0.3s ease",
        animation:`fadeUp 0.5s ease-out ${index * 80}ms both`,
      }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, borderRadius:"3px 0 0 3px", background:isSelected||hovered ? p.color : "transparent", transition:"background 0.3s" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:14 }}>
        <div style={{ display:"flex", gap:12, alignItems:"flex-start", flex:1 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:p.bg, border:`1px solid ${p.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.3s", transform:hovered||isSelected ? "scale(1.08) rotate(-4deg)" : "none" }}>
            <svg viewBox="0 0 24 24" fill="none" width={15} height={15} stroke={p.color} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={rec.icon}/></svg>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7, flexWrap:"wrap" }}>
              <span style={{ background:p.bg, border:`1px solid ${p.border}`, color:p.color, fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:99, letterSpacing:"0.08em", textTransform:"uppercase" }}>{p.label}</span>
              <span style={{ color:"#4B5563", fontSize:11, background:"rgba(255,255,255,0.04)", padding:"2px 9px", borderRadius:99, border:"1px solid rgba(255,255,255,0.06)" }}>{rec.tag}</span>
              {rec.category && <span style={{ color:"#374151", fontSize:11 }}>{rec.category}</span>}
            </div>
            <h4 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:16, color:isSelected?"#fff":"#e2e8f0", lineHeight:1.35, marginBottom:6 }}>{rec.title}</h4>
            <p style={{ color:"#6B7280", fontSize:14, lineHeight:1.6 }}>{rec.short}</p>
          </div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <p style={{ color:"#6B7280", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>Impact</p>
          <p style={{ color:p.color, fontSize:15, fontWeight:800, fontFamily:"var(--font-display)" }}>{rec.impact}</p>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {(rec.metrics || []).map((m, i) => (
          <div key={i} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:"5px 12px", display:"flex", gap:7, alignItems:"center" }}>
            <span style={{ color:"#6B7280", fontSize:11 }}>{m.l}:</span>
            <span style={{ color:m.bad ? "#fca5a5" : "#6ee7b7", fontSize:11, fontWeight:600 }}>{m.v}</span>
          </div>
        ))}
      </div>
      <div style={{ position:"absolute", right:18, bottom:18, color:"#374151", transition:"all 0.3s", transform:isSelected?"rotate(90deg)":"none" }}>
        <svg viewBox="0 0 24 24" fill="none" width={15} height={15} stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
      </div>
    </div>
  );
}

/* ─── REC DETAIL PANEL ───────────────────────────────────────────────────── */
function RecDetail({ rec, onDismiss, onMarkReviewed }) {
  const p = priorityConfig[rec.priority] || priorityConfig.low;
  const [reviewed, setReviewed] = useState(false);

  return (
    <div className="glass-card" style={{ borderRadius:22, padding:"30px", position:"sticky", top:20, animation:"panelIn 0.35s ease-out both", boxShadow:`0 0 50px ${p.glow}` }}>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:22, paddingBottom:22, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ width:46, height:46, borderRadius:13, background:p.bg, border:`1px solid ${p.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 0 20px ${p.glow}` }}>
          <svg viewBox="0 0 24 24" fill="none" width={17} height={17} stroke={p.color} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={rec.icon}/></svg>
        </div>
        <div>
          <div style={{ display:"flex", gap:7, marginBottom:8, flexWrap:"wrap" }}>
            <span style={{ background:p.bg, border:`1px solid ${p.border}`, color:p.color, fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:99, textTransform:"uppercase", letterSpacing:"0.08em" }}>{p.label} Priority</span>
            <span style={{ color:"#6B7280", fontSize:11, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", padding:"3px 12px", borderRadius:99 }}>{rec.category}</span>
          </div>
          <h3 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:18, color:"#fff", letterSpacing:"-0.02em", lineHeight:1.3 }}>{rec.title}</h3>
        </div>
      </div>

      <p style={{ color:"#9CA3AF", fontSize:15, lineHeight:1.8, marginBottom:22 }}>{rec.desc}</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:22 }}>
        {[
          { l:"Impact", v:rec.impact, c:p.color },
          { l:"Effort", v:rec.effort, c:"#facc15" },
          { l:"Confidence", v:`${rec.confidence}%`, c:"#60a5fa" },
        ].map(m => (
          <div key={m.l} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px", textAlign:"center" }}>
            <p style={{ color:"#6B7280", fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>{m.l}</p>
            <p style={{ color:m.c, fontSize:16, fontWeight:800, fontFamily:"var(--font-display)" }}>{m.v}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:22 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
          <span style={{ color:"#6B7280", fontSize:13 }}>AI Confidence</span>
          <span style={{ color:"#60a5fa", fontSize:13, fontWeight:600 }}>{rec.confidence}%</span>
        </div>
        <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:99 }}>
          <div style={{ height:"100%", width:`${rec.confidence}%`, background:"linear-gradient(90deg,#1d4ed8,#60a5fa)", borderRadius:99, boxShadow:"0 0 8px rgba(96,165,250,0.5)" }}/>
        </div>
      </div>

      {rec.reasoning && (
        <div style={{ background:"linear-gradient(135deg,rgba(37,99,235,0.08),rgba(29,78,216,0.04))", border:"1px solid rgba(59,130,246,0.18)", borderRadius:14, padding:"18px", marginBottom:22 }}>
          <div style={{ display:"flex", gap:9, alignItems:"center", marginBottom:12 }}>
            <div style={{ width:24, height:24, borderRadius:7, background:"rgba(59,130,246,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg viewBox="0 0 24 24" fill="none" width={12} height={12} stroke="#60a5fa" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            </div>
            <span style={{ color:"#93c5fd", fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>AI Reasoning</span>
          </div>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:14, lineHeight:1.8 }}>{rec.reasoning}</p>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:10 }}>
        <button
          onClick={() => { setReviewed(true); onMarkReviewed && onMarkReviewed(rec.id); }}
          disabled={reviewed}
          style={{
            background: reviewed ? "rgba(52,211,153,0.12)" : "linear-gradient(135deg,#2563eb,#1d4ed8)",
            border: reviewed ? "1px solid rgba(52,211,153,0.25)" : "none",
            borderRadius:12, padding:"13px 0", color: reviewed ? "#34d399" : "#fff",
            fontSize:14, fontWeight:600, cursor: reviewed ? "default" : "pointer",
            fontFamily:"var(--font-body)", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            transition:"all 0.2s", boxShadow: reviewed ? "none" : "0 0 20px rgba(37,99,235,0.4)",
          }}>
          <svg viewBox="0 0 24 24" fill="none" width={14} height={14} stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          {reviewed ? "Marked as Reviewed" : "Mark as Reviewed"}
        </button>
        <button
          onClick={() => onDismiss && onDismiss(rec.id)}
          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:12, padding:"13px 16px", color:"#6B7280", fontSize:14, cursor:"pointer", fontFamily:"var(--font-body)", transition:"all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor="rgba(255,255,255,0.18)"; }}
          onMouseLeave={e => { e.currentTarget.style.color="#6B7280"; e.currentTarget.style.borderColor="rgba(255,255,255,0.09)"; }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="glass-card" style={{ borderRadius:22, padding:"52px 30px", textAlign:"center", position:"sticky", top:20 }}>
      <div style={{ width:60, height:60, borderRadius:18, background:"rgba(37,99,235,0.1)", border:"1px solid rgba(59,130,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", animation:"float 4s ease-in-out infinite" }}>
        <svg viewBox="0 0 24 24" fill="none" width={24} height={24} stroke="#60a5fa" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
      </div>
      <h4 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:18, color:"#fff", marginBottom:10 }}>Select a Recommendation</h4>
      <p style={{ color:"#6B7280", fontSize:14, lineHeight:1.7, maxWidth:230, margin:"0 auto" }}>Click any card on the left to view detailed AI analysis and reasoning.</p>
      <div style={{ display:"flex", gap:7, justifyContent:"center", marginTop:26 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"rgba(59,130,246,0.3)", animation:`blink 1.8s ease-in-out ${i * 0.3}s infinite` }}/>)}
      </div>
    </div>
  );
}

/* ─── HEALTH SUMMARY (dynamic) ───────────────────────────────────────────── */
function HealthSummary({ snapshot }) {
  if (!snapshot) return null;

  const { totalRevenue, totalExpenses, netBurn, runwayMonths, riskScore, cashBalance, profitMargin, currency, budgetOverruns } = snapshot;
  const currSym  = currency === "INR" ? "₹" : "$";
  const burnMonthly = netBurn > 0 ? Math.round(netBurn / 12) : 0;

  const items = [
    {
      l:   "Cash Runway",
      v:   runwayMonths > 0 ? `${runwayMonths.toFixed(1)} months` : "Cash-flow positive",
      status: runwayMonths > 0 && runwayMonths < 3 ? "danger" : runwayMonths >= 3 && runwayMonths < 8 ? "warning" : "good",
      desc: runwayMonths > 0
        ? runwayMonths < 3  ? "Critical — below minimum safety buffer"
        : runwayMonths < 8  ? "Below 8-month recommended threshold"
        :                     "Healthy runway buffer"
        : "Revenue covers all expenses",
    },
    {
      l:   "Monthly Burn Rate",
      v:   burnMonthly > 0 ? `${currSym}${(burnMonthly / 1000).toFixed(1)}K/mo` : "Profitable",
      status: burnMonthly > 100000 ? "danger" : burnMonthly > 50000 ? "warning" : "good",
      desc: burnMonthly > 0 ? `Net cash consumed per month` : "Revenue exceeds expenses",
    },
    {
      l:   "Total Revenue",
      v:   `${currSym}${(totalRevenue / 1000).toFixed(0)}K`,
      status: totalRevenue > totalExpenses ? "good" : "warning",
      desc: totalRevenue > totalExpenses ? "Revenue covers operating costs" : "Revenue below expenses",
    },
    {
      l:   "Profit Margin",
      v:   `${profitMargin?.toFixed(1) || "0.0"}%`,
      status: (profitMargin || 0) >= 20 ? "good" : (profitMargin || 0) >= 5 ? "warning" : "danger",
      desc: (profitMargin || 0) >= 20 ? "Strong operating efficiency"
          : (profitMargin || 0) >= 5  ? "Slim margin — review cost structure"
          :                              "Operating at a loss",
    },
    {
      l:   "Budget Overruns",
      v:   budgetOverruns > 0 ? `${budgetOverruns} dept${budgetOverruns > 1 ? "s" : ""}` : "None",
      status: budgetOverruns > 1 ? "danger" : budgetOverruns === 1 ? "warning" : "good",
      desc: budgetOverruns > 0 ? "Departments spending above plan" : "All departments on budget",
    },
    {
      l:   "Overall Risk Score",
      v:   `${riskScore}/100`,
      status: riskScore >= 70 ? "danger" : riskScore >= 40 ? "warning" : "good",
      desc: riskScore >= 70 ? "High risk — immediate action needed"
          : riskScore >= 40  ? "Moderate risk — monitor closely"
          :                    "Low risk — financial indicators stable",
    },
  ];

  return (
    <div style={{ marginTop:52 }}>
      <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(59,130,246,0.18),transparent)", marginBottom:48 }}/>
      <FadeUp delay={100}>
        <div className="glass-card" style={{ borderRadius:22, padding:"28px" }}>
          <p style={{ color:"#6B7280", fontSize:12, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:5 }}>Live Data Summary</p>
          <h3 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:18, color:"#fff", marginBottom:22, letterSpacing:"-0.01em" }}>Financial Health Overview</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {items.map((item, i) => {
              const sc = item.status === "good" ? "#34d399" : item.status === "warning" ? "#facc15" : "#f87171";
              return (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12 }}>
                  <div>
                    <p style={{ color:"#9CA3AF", fontSize:13, marginBottom:3 }}>{item.l}</p>
                    <p style={{ color:"#6B7280", fontSize:12 }}>{item.desc}</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <span style={{ color:sc, fontWeight:700, fontSize:15, fontFamily:"var(--font-display)" }}>{item.v}</span>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:sc, margin:"4px auto 0", animation: item.status !== "good" ? "blink 2s ease-in-out infinite" : "none" }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </FadeUp>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
export default function AIRecommendations() {
  const [selected,   setSelected]   = useState(null);
  const [filter,     setFilter]     = useState("all");
  const [recs,       setRecs]       = useState(FALLBACK_RECS);
  const [isLoading,  setIsLoading]  = useState(false);
  const [aiPowered,  setAiPowered]  = useState(false);
  const [error,      setError]      = useState(null);
  const [snapshot,   setSnapshot]   = useState(null);
  const [riskData,   setRiskData]   = useState(null);
  const [chartData,  setChartData]  = useState([]);
  const [dismissed,  setDismissed]  = useState(new Set());

  // Load financial + risk data on mount
  useEffect(() => {
    getFinancialData()
      .then(data => {
        if (data) {
          const txns    = data.transactions   || [];
          const streams = data.revenueStreams  || [];
          setChartData(buildChartData(txns, streams));
          // Build a snapshot from finData for the health summary
          setSnapshot({
            totalRevenue:  data.metrics?.totalRevenue  || 0,
            totalExpenses: data.metrics?.totalExpenses || 0,
            netBurn:       data.metrics?.netBurn       || 0,
            runwayMonths:  data.metrics?.runwayMonths  || 0,
            riskScore:     data.metrics?.riskScore     || 0,
            cashBalance:   data.company?.cashBalance   || 0,
            profitMargin:  data.metrics?.totalRevenue > 0
              ? ((data.metrics.totalRevenue - data.metrics.totalExpenses) / data.metrics.totalRevenue) * 100
              : 0,
            companyName:   data.company?.name     || "Your Company",
            currency:      data.company?.currency || "USD",
            burnRate:      data.metrics?.netBurn  > 0 ? `$${Math.round(data.metrics.netBurn / 12).toLocaleString()}/mo` : "cash-flow positive",
            budgetOverruns:(data.budgets || []).filter(b => b.spent > b.allocated).length,
          });
        }
      })
      .catch(console.error);

    getRiskData()
      .then(data => { if (data) setRiskData(data); })
      .catch(console.error);
  }, []);

  const handleGenerate = useCallback(async (customPrompt = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAIRecommendations(customPrompt);
      if (result?.recommendations?.length) {
        setRecs(result.recommendations);
        setAiPowered(true);
        setSelected(null);
        setDismissed(new Set());
        if (result.snapshot) setSnapshot(result.snapshot);
      } else {
        setError("AI returned no recommendations. Please try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to generate recommendations.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDismiss = useCallback((id) => {
    setDismissed(prev => new Set([...prev, id]));
    if (selected?.id === id) setSelected(null);
  }, [selected]);

  const visibleRecs = recs.filter(r => !dismissed.has(r.id));
  const filtered    = filter === "all" ? visibleRecs : visibleRecs.filter(r => r.priority === filter || r.category?.toLowerCase().includes(filter));
  const avgConf     = recs.length ? Math.round(recs.reduce((s, r) => s + (r.confidence || 75), 0) / recs.length) : 0;

  return (
    <div className="ai-cfo-fullbleed" style={{ minHeight:"100vh", background:"#05090f", fontFamily:"var(--font-body)", overflowX:"hidden" }}>
      <GlobalStyles/>
      <ScrollBar/>

      <PageHero recs={visibleRecs} snapshot={snapshot} aiPowered={aiPowered}/>

      <div style={{ padding:"0 5% 100px", width:"100%", boxSizing:"border-box" }}>

        {/* Error banner */}
        {error && (
          <div style={{ marginBottom:20, padding:"16px 20px", borderRadius:14, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", color:"#fca5a5", fontSize:14 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
              <svg viewBox="0 0 24 24" fill="none" width={18} height={18} stroke="#f87171" strokeWidth={2} style={{ flexShrink:0, marginTop:1 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <div>
                <p style={{ fontWeight:700, marginBottom:4, color:"#f87171" }}>Generation Failed</p>
                <p style={{ color:"#fca5a5", lineHeight:1.6 }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Prompt Panel */}
        <PromptPanel onGenerate={handleGenerate} isLoading={isLoading}/>

        {/* 3-widget row: Chart + Confidence + Risk */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24, marginBottom:44 }}>
          <ChartStrip chartData={chartData} snapshot={snapshot}/>
          <ConfidenceRing score={avgConf} riskScore={snapshot?.riskScore || 0}/>
          <RiskRadarWidget riskData={riskData}/>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(59,130,246,0.18),transparent)", marginBottom:52 }}/>

        {/* Section header + filters */}
        <FadeUp delay={0} style={{ marginBottom:36 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:16 }}>
            <div>
              <span className="nav-pill" style={{ marginBottom:14, display:"inline-flex" }}>
                <span/>{aiPowered ? "AI-Generated · Live Data" : "Default Recommendations"}
              </span>
              <h2 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"clamp(28px,3.5vw,42px)", color:"#fff", marginTop:18, letterSpacing:"-0.03em", lineHeight:1.1 }}>
                {visibleRecs.length} Actions Identified.<br/>
                <span style={{ background:"linear-gradient(135deg,#60a5fa,#3b82f6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Prioritized by Impact.</span>
              </h2>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[
                { id:"all",      l:"All" },
                { id:"critical", l:"Critical", c:"#ef4444" },
                { id:"high",     l:"High",     c:"#fb923c" },
                { id:"medium",   l:"Medium",   c:"#facc15" },
                { id:"low",      l:"Low",      c:"#34d399" },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  style={{ padding:"7px 18px", borderRadius:14, border:`1px solid ${filter===f.id?(f.c||"rgba(59,130,246,0.4)"):"rgba(255,255,255,0.08)"}`, background:filter===f.id?`${f.c||"#2563eb"}20`:"rgba(255,255,255,0.03)", color:filter===f.id?(f.c||"#60a5fa"):"#6B7280", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)", transition:"all 0.2s" }}>
                  {f.l}
                </button>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* Rec list + detail split */}
        <div className="rec-list-detail" style={{ display:"grid", gridTemplateColumns:"1fr 440px", gap:28, alignItems:"start" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {isLoading
              ? [0,1,2,3].map(i => <RecSkeleton key={i}/>)
              : filtered.length > 0
              ? filtered.map((rec, i) => (
                  <RecCard
                    key={rec.id} rec={rec} index={i}
                    isSelected={selected?.id === rec.id}
                    onSelect={setSelected}
                  />
                ))
              : (
                <div style={{ textAlign:"center", padding:"60px 0", color:"#4B5563", fontSize:15 }}>
                  {dismissed.size > 0 && filter === "all"
                    ? "All recommendations dismissed."
                    : "No recommendations match this filter."}
                </div>
              )
            }
          </div>
          <div>
            {selected
              ? <RecDetail rec={selected} onDismiss={handleDismiss} onMarkReviewed={() => {}}/>
              : <EmptyDetail/>
            }
          </div>
        </div>

        {/* Health summary driven by live DB snapshot */}
        <HealthSummary snapshot={snapshot}/>
      </div>
    </div>
  );
}
