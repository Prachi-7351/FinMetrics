import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const DATA_CSS = `
  @keyframes dFadeUp {
    from { opacity:0; transform:translateY(16px) scale(0.984); }
    to   { opacity:1; transform:translateY(0)    scale(1);     }
  }
  @keyframes dPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes dBarFill { from{width:0} }
  @keyframes dToastIn { from{opacity:0;transform:translateX(16px) scale(.96)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes dToastOut { from{opacity:1} to{opacity:0;transform:translateX(16px)} }
  @keyframes dSpin { to{transform:rotate(360deg)} }

  .dr{opacity:0;transform:translateY(16px) scale(.984)}
  .dr.dv{animation:dFadeUp .55s cubic-bezier(.22,1,.36,1) both}
  .dr.d1.dv{animation-delay:0ms}  .dr.d2.dv{animation-delay:55ms}
  .dr.d3.dv{animation-delay:110ms} .dr.d4.dv{animation-delay:165ms}
  .dr.d5.dv{animation-delay:220ms} .dr.d6.dv{animation-delay:275ms}

  /* Glass card */
  .dc{
    background:rgba(255,255,255,.036);
    backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
    border:1px solid rgba(255,255,255,.075);
    box-shadow:0 8px 32px rgba(0,0,0,.42),0 1px 0 rgba(255,255,255,.04) inset;
    border-radius:18px;
    transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s ease,border-color .22s ease;
  }
  .dc:hover{
    transform:translateY(-2px);border-color:rgba(255,255,255,.12);
    box-shadow:0 16px 48px rgba(0,0,0,.52),0 0 0 1px rgba(59,130,246,.08),0 1px 0 rgba(255,255,255,.06) inset;
  }
  .dc-s{
    background:rgba(255,255,255,.036);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
    border:1px solid rgba(255,255,255,.075);border-radius:18px;
    box-shadow:0 8px 32px rgba(0,0,0,.42),0 1px 0 rgba(255,255,255,.04) inset;
  }

  /* Tab */
  .dtab{
    display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:10px;
    border:none;background:transparent;color:rgba(255,255,255,.48);
    font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;white-space:nowrap;
    transition:all .18s ease;
  }
  .dtab:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.85)}
  .dtab.da{
    background:rgba(59,130,246,.18);color:#60a5fa;
    box-shadow:0 0 0 1px rgba(59,130,246,.28);font-weight:600;
  }

  /* Metric card */
  .dmc{
    background:rgba(255,255,255,.036);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
    border:1px solid rgba(255,255,255,.075);border-radius:16px;padding:20px 22px;
    transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;
    box-shadow:0 8px 28px rgba(0,0,0,.38);
  }
  .dmc:hover{
    transform:translateY(-3px);border-color:rgba(255,255,255,.14);
    box-shadow:0 18px 48px rgba(0,0,0,.5),0 0 0 1px rgba(59,130,246,.1);
  }

  /* Buttons */
  .dbp{
    display:inline-flex;align-items:center;justify-content:center;gap:7px;
    background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;
    font-size:13px;font-weight:600;padding:9px 18px;border-radius:10px;border:none;
    cursor:pointer;font-family:inherit;letter-spacing:-.01em;
    box-shadow:0 4px 14px rgba(37,99,235,.38);
    transition:transform .18s,box-shadow .18s,opacity .18s;
  }
  .dbp:hover{transform:scale(1.02);box-shadow:0 6px 22px rgba(37,99,235,.52)}
  .dbp:active{transform:scale(.985)}
  .dbs{
    display:inline-flex;align-items:center;justify-content:center;gap:6px;
    background:rgba(255,255,255,.06);color:rgba(255,255,255,.75);
    font-size:13px;font-weight:500;padding:9px 16px;border-radius:10px;
    border:1px solid rgba(255,255,255,.11);cursor:pointer;font-family:inherit;
    transition:all .18s;
  }
  .dbs:hover{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2);transform:scale(1.01)}
  .dbg{
    display:inline-flex;align-items:center;justify-content:center;gap:6px;
    background:transparent;color:rgba(255,255,255,.45);font-size:12px;font-weight:500;
    padding:7px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.09);
    cursor:pointer;font-family:inherit;transition:all .18s;
  }
  .dbg:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.82);border-color:rgba(255,255,255,.18)}
  .dbd{
    display:inline-flex;align-items:center;justify-content:center;gap:6px;
    background:rgba(239,68,68,.1);color:rgba(252,165,165,.9);font-size:12px;font-weight:500;
    padding:7px 12px;border-radius:8px;border:1px solid rgba(239,68,68,.2);
    cursor:pointer;font-family:inherit;transition:all .18s;
  }
  .dbd:hover{background:rgba(239,68,68,.18);color:#fca5a5;border-color:rgba(239,68,68,.38)}

  /* Input */
  .di{
    background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.11);
    border-radius:9px;color:rgba(255,255,255,.9);font-family:inherit;font-size:13px;
    padding:8px 12px;outline:none;transition:border-color .18s,box-shadow .18s;width:100%;
  }
  .di:focus{border-color:rgba(59,130,246,.55);box-shadow:0 0 0 3px rgba(59,130,246,.12)}
  .di::placeholder{color:rgba(255,255,255,.22)}
  select.di{cursor:pointer;appearance:none;-webkit-appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%236b7280' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:right 10px center;padding-right:30px;}
  select.di option{background:#0d1829;color:rgba(255,255,255,.88)}

  /* Table */
  .dt{width:100%;border-collapse:collapse}
  .dt th{padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:rgba(255,255,255,.3);
    letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.07);white-space:nowrap}
  .dt td{padding:11px 14px;font-size:13px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
  .dtr{transition:background .14s}
  .dtr:hover{background:rgba(255,255,255,.028)}
  .dtr:last-child td{border-bottom:none}

  /* Badge */
  .dbadge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:999px;
    font-size:11px;font-weight:700;letter-spacing:.02em}

  /* Progress */
  .dpbar{height:5px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden}
  .dpfill{height:100%;border-radius:3px;animation:dBarFill 1s cubic-bezier(.25,.46,.45,.94) both}

  /* Toast */
  .dtw{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none}
  .dts{pointer-events:auto;background:rgba(8,14,28,.97);backdrop-filter:blur(20px);
    border:1px solid rgba(255,255,255,.1);border-radius:13px;padding:11px 15px;
    display:flex;align-items:center;gap:9px;min-width:220px;
    box-shadow:0 14px 36px rgba(0,0,0,.65);animation:dToastIn .26s cubic-bezier(.22,1,.36,1) both;cursor:pointer}
  .dts.out{animation:dToastOut .2s ease forwards}

  /* Modal */
  .dmo{animation:dFadeUp .22s ease both}
  .dml{animation:dFadeUp .26s cubic-bezier(.22,1,.36,1) both}

  /* Spin */
  .dspin{animation:dSpin .75s linear infinite}

  /* Search */
  .dsrch{position:relative;flex:1;max-width:260px}
  .dsrch input{padding-left:34px}
  .dsrch-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none}

  /* Upload zone */
  .dup{
    border:2px dashed rgba(59,130,246,.28);border-radius:16px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:48px 32px;cursor:pointer;
    transition:border-color .22s,background .22s;
  }
  .dup:hover,.dup.drag{border-color:rgba(59,130,246,.55);background:rgba(59,130,246,.05)}

  /* Category tag */
  .dctag{
    display:inline-flex;align-items:center;gap:6px;
    padding:5px 12px;border-radius:999px;font-size:12px;font-weight:600;
    border:1px solid;cursor:default;transition:transform .18s,box-shadow .18s;
  }
  .dctag:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.3)}

  /* Scrollbar */
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px}

  @media(prefers-reduced-motion:reduce){
    .dr.dv{animation:none;opacity:1;transform:none}
    .dc:hover,.dmc:hover,.dbp:hover{transform:none}
    .dpfill{animation:none}
  }
  @media(max-width:768px){
    .dmc-grid{grid-template-columns:repeat(2,1fr)!important}
    .dh-right{flex-direction:column!important;align-items:flex-start!important;gap:8px!important}
  }
  @media(max-width:480px){
    .dmc-grid{grid-template-columns:1fr!important}
  }
`;

// ─── SVG helper ───────────────────────────────────────────────────────────────
function I({ d, size = 16, sw = 1.8, color = "currentColor", fill = "none" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke={color}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// ─── Reveal ───────────────────────────────────────────────────────────────────
function Rev({ children, d = 1, style = {} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: .06 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`dr d${d}${vis ? " dv" : ""}`} style={style}>{children}</div>;
}

// ─── Toast system ─────────────────────────────────────────────────────────────
let _addToast = null;
function useToasts() {
  const [list, setList] = useState([]);
  _addToast = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setList(t => [...t.slice(-4), { id, msg, type }]);
    setTimeout(() => setList(t => t.map(x => x.id === id ? { ...x, out: true } : x)), 3000);
    setTimeout(() => setList(t => t.filter(x => x.id !== id)), 3300);
  }, []);
  return { list, dismiss: id => setList(t => t.filter(x => x.id !== id)) };
}
function toast(msg, type) { _addToast?.(msg, type); }

const TICON = {
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  error:   "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  info:    "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};
const TCLR = { success:"#34d399", error:"#f87171", info:"#60a5fa" };

function Toasts({ list, dismiss }) {
  return (
    <div className="dtw">
      {list.map(t => (
        <div key={t.id} className={`dts${t.out ? " out" : ""}`} onClick={() => dismiss(t.id)}>
          <I d={TICON[t.type] || TICON.info} size={15} color={TCLR[t.type] || TCLR.info} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.88)", flex: 1 }}>{t.msg}</span>
          <I d="M18 6L6 18M6 6l12 12" size={12} color="#475569" />
        </div>
      ))}
    </div>
  );
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_TX = [
  { id:"t1", date:"2026-04-01", description:"AWS Infrastructure", amount:4200,  category:"Tech",      type:"Expense" },
  { id:"t2", date:"2026-04-02", description:"SaaS Revenue - Tier A", amount:18500, category:"Revenue",   type:"Income"  },
  { id:"t3", date:"2026-04-03", description:"Payroll - Engineering", amount:32000, category:"Payroll",   type:"Expense" },
  { id:"t4", date:"2026-04-04", description:"Office Rent",           amount:8500,  category:"Admin",     type:"Expense" },
  { id:"t5", date:"2026-04-05", description:"SaaS Revenue - Tier B", amount:11200, category:"Revenue",   type:"Income"  },
  { id:"t6", date:"2026-04-06", description:"Marketing Campaign",    amount:5800,  category:"Marketing", type:"Expense" },
  { id:"t7", date:"2026-04-07", description:"Google Cloud",          amount:1900,  category:"Tech",      type:"Expense" },
  { id:"t8", date:"2026-04-08", description:"Consulting Revenue",    amount:6500,  category:"Revenue",   type:"Income"  },
  { id:"t9", date:"2026-04-09", description:"Legal Fees",            amount:3200,  category:"Admin",     type:"Expense" },
  { id:"t10",date:"2026-04-10", description:"Product Revenue",       amount:9800,  category:"Revenue",   type:"Income"  },
];

const DEMO_BUDGETS = [
  { id:"b1", department:"Engineering", allocated:60000, spent:42000 },
  { id:"b2", department:"Marketing",   allocated:25000, spent:18500 },
  { id:"b3", department:"Operations",  allocated:20000, spent:14200 },
  { id:"b4", department:"Sales",       allocated:18000, spent:9800  },
  { id:"b5", department:"Admin",       allocated:12000, spent:11700 },
];

const DEMO_REVENUE = [
  { id:"r1", name:"Tier A — Pro",        amount:18500, growth:12.4  },
  { id:"r2", name:"Tier B — Starter",    amount:11200, growth:8.1   },
  { id:"r3", name:"Consulting",          amount:6500,  growth:-2.3  },
  { id:"r4", name:"Product Sales",       amount:9800,  growth:21.7  },
  { id:"r5", name:"Partner Commissions", amount:3200,  growth:5.6   },
];

const DEMO_CATS = [
  { id:"c1", name:"Revenue",   color:"#34d399", bg:"rgba(52,211,153,.12)",  bd:"rgba(52,211,153,.28)"  },
  { id:"c2", name:"Payroll",   color:"#f87171", bg:"rgba(239,68,68,.12)",   bd:"rgba(239,68,68,.28)"   },
  { id:"c3", name:"Tech",      color:"#60a5fa", bg:"rgba(59,130,246,.12)",  bd:"rgba(59,130,246,.28)"  },
  { id:"c4", name:"Marketing", color:"#fbbf24", bg:"rgba(251,191,36,.12)",  bd:"rgba(251,191,36,.28)"  },
  { id:"c5", name:"Admin",     color:"#a78bfa", bg:"rgba(139,92,246,.12)",  bd:"rgba(139,92,246,.28)"  },
  { id:"c6", name:"Legal",     color:"#fb923c", bg:"rgba(251,146,60,.12)",  bd:"rgba(251,146,60,.28)"  },
];

const COLORS = [
  { color:"#34d399",bg:"rgba(52,211,153,.12)",bd:"rgba(52,211,153,.28)"  },
  { color:"#60a5fa",bg:"rgba(59,130,246,.12)", bd:"rgba(59,130,246,.28)" },
  { color:"#f87171",bg:"rgba(239,68,68,.12)",  bd:"rgba(239,68,68,.28)"  },
  { color:"#fbbf24",bg:"rgba(251,191,36,.12)", bd:"rgba(251,191,36,.28)" },
  { color:"#a78bfa",bg:"rgba(139,92,246,.12)", bd:"rgba(139,92,246,.28)" },
  { color:"#fb923c",bg:"rgba(251,146,60,.12)", bd:"rgba(251,146,60,.28)" },
  { color:"#e879f9",bg:"rgba(232,121,249,.12)",bd:"rgba(232,121,249,.28)"},
];

const DEFAULT_COMPANY = {
  name: "Acme Inc.",
  industry: "SaaS / Software",
  currency: "USD",
  fiscal: "January – December",
  cashBalance: 250000,
};

// ─── LS helpers ───────────────────────────────────────────────────────────────
function lsGet(key, fallback) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmtK = v => {
  const abs = Math.abs(v);
  if (abs >= 1000000) return `${(v/1000000).toFixed(1)}M`;
  if (abs >= 1000)    return `${(v/1000).toFixed(1)}K`;
  return v.toFixed(0);
};
const fmtCur = v => `$${Math.abs(v).toLocaleString()}`;

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ onClose, children, title, sub }) {
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div className="dmo" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position:"fixed",inset:0,zIndex:999,background:"rgba(3,7,18,.78)",
      backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:20,
    }}>
      <div className="dml dc-s" style={{
        width:"100%",maxWidth:480,padding:28,
        background:"rgba(9,15,30,.97)",border:"1px solid rgba(255,255,255,.1)",
        boxShadow:"0 32px 80px rgba(0,0,0,.75)",borderRadius:22,
      }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
          <div>
            <h2 style={{fontSize:17,fontWeight:700,color:"rgba(255,255,255,.94)",letterSpacing:"-.025em"}}>{title}</h2>
            {sub && <p style={{fontSize:12,color:"rgba(255,255,255,.35)",marginTop:3}}>{sub}</p>}
          </div>
          <button onClick={onClose} className="dbg" style={{padding:"6px",borderRadius:8}}>
            <I d="M18 6L6 18M6 6l12 12" size={14} color="#94a3b8"/>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Label({ children }) {
  return <label style={{fontSize:11.5,fontWeight:600,color:"rgba(255,255,255,.38)",letterSpacing:".06em",display:"block",marginBottom:6}}>{children}</label>;
}

// ─── METRICS ROW ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color="#60a5fa", icon, delta, delay }) {
  const [shown, setShown] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } }, { threshold:.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`dmc dr d${delay}${shown?" dv":""}`}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
        <div style={{width:34,height:34,borderRadius:10,background:`${color}18`,border:`1px solid ${color}28`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <I d={icon} size={14} color={color}/>
        </div>
        {delta !== undefined && (
          <span style={{fontSize:11,fontWeight:700,color:delta>=0?"#34d399":"#f87171",padding:"2px 8px",borderRadius:999,background:delta>=0?"rgba(52,211,153,.1)":"rgba(239,68,68,.1)"}}>
            {delta>=0?"+":""}{delta}%
          </span>
        )}
      </div>
      <p style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.38)",letterSpacing:".07em",textTransform:"uppercase",marginBottom:7}}>{label}</p>
      <p style={{fontSize:26,fontWeight:800,color,letterSpacing:"-.04em",lineHeight:1}}>{typeof value === "number" ? `$${fmtK(value)}` : value}</p>
      {sub && <p style={{fontSize:11.5,color:"rgba(255,255,255,.35)",marginTop:6}}>{sub}</p>}
    </div>
  );
}

// ─── TRANSACTIONS TAB ─────────────────────────────────────────────────────────
function TransactionsTab({ transactions, setTransactions, categories, requestDelete, }) {
  const [search, setSearch]       = useState("");
  const [filterType, setFilter]   = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const [sort, setSort]           = useState({ key:"date", dir:"desc" });
  const [modal, setModal]         = useState(null); // null | "add" | {editing tx}
  const [form, setForm]           = useState({ date:"", description:"", amount:"", category:"", type:"Expense" });
  const [editId, setEditId]       = useState(null);

  const catNames = ["All", ...categories.map((c) => c.name)];

  const filtered = useMemo(() => {
    let r = transactions;
    if (search.trim()) r = r.filter(t => t.description.toLowerCase().includes(search.toLowerCase()));
    if (filterType !== "All") r = r.filter(t => t.type === filterType);
    if (filterCat !== "All")  r = r.filter(t => t.category === filterCat);
    r = [...r].sort((a,b) => {
      let av = a[sort.key], bv = b[sort.key];
      if (sort.key === "amount") { av = +av; bv = +bv; }
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ?  1 : -1;
      return 0;
    });
    return r;
  }, [transactions, search, filterType, filterCat, sort]);

  const openAdd  = () => { setForm({ date:new Date().toISOString().split("T")[0], description:"", amount:"", category:categories[0]?.name||"", type:"Expense" }); setEditId(null); setModal("open"); };
  const openEdit = tx => { setForm({ ...tx, amount:String(tx.amount) }); setEditId(tx.id); setModal("open"); };

  const saveForm = () => {
    if (!form.description.trim() || !form.amount || isNaN(+form.amount)) { toast("Fill all fields correctly","error"); return; }
    if (editId) {
      setTransactions(p => p.map(t => t.id===editId ? { ...form, id:editId, amount:+form.amount } : t));
      toast("Transaction updated");
    } else {
      setTransactions(p => [...p, { ...form, id:"t"+Date.now(), amount:+form.amount }]);
      toast("Transaction added");
    }
    setModal(null);
  };

  const del = (id) => {
  requestDelete("Transaction", id, () => {
    setTransactions((p) => p.filter((t) => t.id !== id));
  });
};

  const toggleSort = key => setSort(s => ({ key, dir: s.key===key && s.dir==="asc" ? "desc" : "asc" }));

  const catColor = name => categories.find(c=>c.name===name) || { color:"#94a3b8", bg:"rgba(148,163,184,.1)", bd:"rgba(148,163,184,.2)" };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Toolbar */}
      <Rev d={1}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",flex:1}}>
            <div className="dsrch">
              <span className="dsrch-icon"><I d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" size={14} color="#475569"/></span>
              <input className="di" placeholder="Search transactions…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="di" style={{width:130}} value={filterType} onChange={e=>setFilter(e.target.value)}>
              {["All","Income","Expense"].map(o=><option key={o}>{o}</option>)}
            </select>
            <select className="di" style={{width:140}} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
              {catNames.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <button className="dbp" onClick={openAdd}>
            <I d="M12 5v14M5 12h14" size={14} color="white"/>Add Transaction
          </button>
        </div>
      </Rev>

      {/* Table */}
      <Rev d={2}>
        <div className="dc" style={{overflow:"hidden",padding:0}}>
          <div style={{overflowX:"auto"}}>
            <table className="dt">
              <thead>
                <tr>
                  {[["date","Date"],["description","Description"],["category","Category"],["type","Type"],["amount","Amount"]].map(([k,l])=>(
                    <th key={k} onClick={()=>toggleSort(k)} style={{cursor:"pointer",userSelect:"none"}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
                        {l}
                        <I d={sort.key===k&&sort.dir==="asc"?"M5 15l7-7 7 7":"M19 9l-7 7-7-7"} size={10} color={sort.key===k?"#60a5fa":"#334155"}/>
                      </span>
                    </th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 && (
                  <tr><td colSpan={6} style={{textAlign:"center",padding:"32px",color:"rgba(255,255,255,.3)",fontSize:13}}>
                    No transactions found
                  </td></tr>
                )}
                {filtered.map(tx => {
                  const cc = catColor(tx.category);
                  return (
                    <tr key={tx.id} className="dtr">
                      <td style={{color:"rgba(255,255,255,.45)",fontFamily:"monospace",fontSize:12}}>{tx.date}</td>
                      <td style={{color:"rgba(255,255,255,.82)",fontWeight:500,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.description}</td>
                      <td>
                        <span className="dbadge" style={{background:cc.bg,border:`1px solid ${cc.bd}`,color:cc.color}}>
                          {tx.category}
                        </span>
                      </td>
                      <td>
                        <span className="dbadge" style={{
                          background: tx.type==="Income"?"rgba(52,211,153,.1)":"rgba(239,68,68,.1)",
                          border:`1px solid ${tx.type==="Income"?"rgba(52,211,153,.25)":"rgba(239,68,68,.22)"}`,
                          color: tx.type==="Income"?"#34d399":"#f87171",
                        }}>{tx.type}</span>
                      </td>
                      <td style={{fontWeight:700,color:tx.type==="Income"?"#34d399":"#f87171",fontSize:13.5}}>
                        {tx.type==="Income"?"+":"-"}{fmtCur(tx.amount)}
                      </td>
                      <td>
                        <div style={{display:"flex",gap:6}}>
                          <button className="dbg" style={{padding:"5px 10px",fontSize:11}} onClick={()=>openEdit(tx)}>Edit</button>
                          <button className="dbd" style={{padding:"5px 10px",fontSize:11}} onClick={()=>del(tx.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>{filtered.length} transaction{filtered.length!==1?"s":""} shown</span>
            <span style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>
              Total: <span style={{color:filtered.reduce((a,t)=>a+(t.type==="Income"?t.amount:-t.amount),0)>=0?"#34d399":"#f87171",fontWeight:700}}>
                {fmtCur(Math.abs(filtered.reduce((a,t)=>a+(t.type==="Income"?t.amount:-t.amount),0)))}
              </span>
            </span>
          </div>
        </div>
      </Rev>

      {/* Modal */}
      {modal && (
        <Modal onClose={()=>setModal(null)} title={editId?"Edit Transaction":"Add Transaction"} sub="Fill in the transaction details below">
          <div style={{display:"flex",flexDirection:"column",gap:13,marginBottom:20}}>
            <div>
              <Label>DESCRIPTION</Label>
              <input className="di" placeholder="e.g. AWS Infrastructure" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <Label>AMOUNT (USD)</Label>
                <input className="di" type="number" min="0" placeholder="0.00" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))}/>
              </div>
              <div>
                <Label>DATE</Label>
                <input className="di" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <Label>TYPE</Label>
                <select className="di" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                  <option>Income</option><option>Expense</option>
                </select>
              </div>
              <div>
                <Label>CATEGORY</Label>
                <select className="di" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                  {categories.map(c=><option key={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button className="dbg" onClick={()=>setModal(null)}>Cancel</button>
            <button className="dbp" onClick={saveForm}>
              <I d="M20 6L9 17l-5-5" size={13} color="white"/>{editId?"Save Changes":"Add Transaction"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── BUDGETS TAB ─────────────────────────────────────────────────────────────
function BudgetsTab({ budgets, setBudgets }) {
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ department:"", allocated:"", spent:"" });
  const [editId, setEditId] = useState(null);

  const openAdd  = () => { setForm({department:"",allocated:"",spent:"0"}); setEditId(null); setModal(true); };
  const openEdit = b  => { setForm({...b,allocated:String(b.allocated),spent:String(b.spent)}); setEditId(b.id); setModal(true); };

  const save = () => {
    if (!form.department.trim()||!form.allocated||isNaN(+form.allocated)) { toast("Fill all fields","error"); return; }
    if (editId) {
      setBudgets(p=>p.map(b=>b.id===editId?{...form,id:editId,allocated:+form.allocated,spent:+form.spent}:b));
      toast("Budget updated");
    } else {
      setBudgets(p=>[...p,{...form,id:"b"+Date.now(),allocated:+form.allocated,spent:+form.spent}]);
      toast("Budget added");
    }
    setModal(false);
  };

  const del = id => { setBudgets(p=>p.filter(b=>b.id!==id)); toast("Budget removed","info"); };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Rev d={1}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,.75)"}}>Department Budgets</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,.35)",marginTop:2}}>Track allocated vs actual spend per team</p>
          </div>
          <button className="dbp" onClick={openAdd}><I d="M12 5v14M5 12h14" size={14} color="white"/>Add Budget</button>
        </div>
      </Rev>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {budgets.map((b,i) => {
          const pct = Math.round((b.spent/b.allocated)*100);
          const clr = pct>90?"#f87171":pct>70?"#fbbf24":"#34d399";
          const over = pct > 100;
          return (
            <Rev key={b.id} d={Math.min(i+2,6)}>
              <div className="dc" style={{padding:"20px 24px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:clr,boxShadow:`0 0 8px ${clr}88`}}/>
                    <span style={{fontSize:14.5,fontWeight:700,color:"rgba(255,255,255,.88)"}}>{b.department}</span>
                    {over && <span className="dbadge" style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",color:"#f87171"}}>Over Budget</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:13,color:"rgba(255,255,255,.45)"}}>
                      <span style={{color:clr,fontWeight:700}}>${b.spent.toLocaleString()}</span> / ${b.allocated.toLocaleString()}
                    </span>
                    <span className="dbadge" style={{background:`${clr}18`,border:`1px solid ${clr}30`,color:clr}}>{pct}%</span>
                    <button className="dbg" style={{padding:"4px 10px",fontSize:11}} onClick={()=>openEdit(b)}>Edit</button>
                    <button className="dbd" style={{padding:"4px 10px",fontSize:11}} onClick={()=>del(b.id)}>Remove</button>
                  </div>
                </div>
                <div className="dpbar">
                  <div className="dpfill" style={{width:`${Math.min(pct,100)}%`,background:`linear-gradient(90deg,${clr},${clr}88)`,boxShadow:`0 0 8px ${clr}44`}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                  <span style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>Remaining: ${Math.max(0,b.allocated-b.spent).toLocaleString()}</span>
                  <span style={{fontSize:11,color:"rgba(255,255,255,.25)"}}>{b.department}</span>
                </div>
              </div>
            </Rev>
          );
        })}
      </div>

      {modal && (
        <Modal onClose={()=>setModal(false)} title={editId?"Edit Budget":"Add Department Budget"}>
          <div style={{display:"flex",flexDirection:"column",gap:13,marginBottom:20}}>
            <div><Label>DEPARTMENT NAME</Label><input className="di" placeholder="Engineering" value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><Label>ALLOCATED ($)</Label><input className="di" type="number" min="0" placeholder="50000" value={form.allocated} onChange={e=>setForm(p=>({...p,allocated:e.target.value}))}/></div>
              <div><Label>SPENT ($)</Label><input className="di" type="number" min="0" placeholder="0" value={form.spent} onChange={e=>setForm(p=>({...p,spent:e.target.value}))}/></div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button className="dbg" onClick={()=>setModal(false)}>Cancel</button>
            <button className="dbp" onClick={save}><I d="M20 6L9 17l-5-5" size={13} color="white"/>{editId?"Save":"Add Budget"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── REVENUE TAB ──────────────────────────────────────────────────────────────
function RevenueTab({ revenue, setRevenue }) {
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ name:"", amount:"", growth:"" });
  const [editId, setEditId] = useState(null);

  const total = revenue.reduce((s,r)=>s+r.amount,0);

  const openAdd  = () => { setForm({name:"",amount:"",growth:"0"}); setEditId(null); setModal(true); };
  const openEdit = r  => { setForm({name:r.name,amount:String(r.amount),growth:String(r.growth)}); setEditId(r.id); setModal(true); };

  const save = () => {
    if (!form.name.trim()||!form.amount||isNaN(+form.amount)) { toast("Fill required fields","error"); return; }
    if (editId) {
      setRevenue(p=>p.map(r=>r.id===editId?{...form,id:editId,amount:+form.amount,growth:+form.growth}:r));
      toast("Revenue stream updated");
    } else {
      setRevenue(p=>[...p,{...form,id:"r"+Date.now(),amount:+form.amount,growth:+form.growth}]);
      toast("Revenue stream added");
    }
    setModal(false);
  };

  const del = id => { setRevenue(p=>p.filter(r=>r.id!==id)); toast("Removed","info"); };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Rev d={1}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <p style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,.75)"}}>Revenue Streams</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,.35)",marginTop:2}}>Total: <span style={{color:"#34d399",fontWeight:700}}>${total.toLocaleString()}</span></p>
          </div>
          <button className="dbp" onClick={openAdd}><I d="M12 5v14M5 12h14" size={14} color="white"/>Add Stream</button>
        </div>
      </Rev>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {revenue.map((r,i) => {
          const pct = Math.round((r.amount/total)*100);
          const pos = r.growth >= 0;
          return (
            <Rev key={r.id} d={Math.min(i+2,6)}>
              <div className="dc" style={{padding:"20px 22px"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
                  <div>
                    <p style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,.88)",marginBottom:4}}>{r.name}</p>
                    <span style={{fontSize:11.5,fontWeight:600,color:pos?"#34d399":"#f87171",padding:"2px 8px",borderRadius:999,background:pos?"rgba(52,211,153,.1)":"rgba(239,68,68,.1)"}}>
                      {pos?"+":""}{r.growth}% MoM
                    </span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button className="dbg" style={{padding:"4px 10px",fontSize:11}} onClick={()=>openEdit(r)}>Edit</button>
                    <button className="dbd" style={{padding:"4px 10px",fontSize:11}} onClick={()=>del(r.id)}>✕</button>
                  </div>
                </div>
                <p style={{fontSize:22,fontWeight:800,color:"#34d399",letterSpacing:"-.03em",marginBottom:12}}>${r.amount.toLocaleString()}</p>
                <div className="dpbar">
                  <div className="dpfill" style={{width:`${pct}%`,background:"linear-gradient(90deg,#34d399,#059669)"}}/>
                </div>
                <p style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:6}}>{pct}% of total revenue</p>
              </div>
            </Rev>
          );
        })}
      </div>

      {modal && (
        <Modal onClose={()=>setModal(false)} title={editId?"Edit Revenue Stream":"Add Revenue Stream"}>
          <div style={{display:"flex",flexDirection:"column",gap:13,marginBottom:20}}>
            <div><Label>STREAM NAME</Label><input className="di" placeholder="SaaS Subscriptions" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><Label>MONTHLY AMOUNT ($)</Label><input className="di" type="number" min="0" placeholder="10000" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))}/></div>
              <div><Label>GROWTH % (MoM)</Label><input className="di" type="number" step="0.1" placeholder="5.0" value={form.growth} onChange={e=>setForm(p=>({...p,growth:e.target.value}))}/></div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button className="dbg" onClick={()=>setModal(false)}>Cancel</button>
            <button className="dbp" onClick={save}><I d="M20 6L9 17l-5-5" size={13} color="white"/>{editId?"Save":"Add"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CATEGORIES TAB ──────────────────────────────────────────────────────────
function CategoriesTab({ categories, setCategories }) {
  const [modal, setModal] = useState(false);
  const [name, setName]   = useState("");
  const [color, setColor] = useState(0);

  const add = () => {
    if (!name.trim()) { toast("Enter a name","error"); return; }
    if (categories.find(c=>c.name.toLowerCase()===name.toLowerCase())) { toast("Category already exists","error"); return; }
    const c = COLORS[color];
    setCategories(p=>[...p,{id:"c"+Date.now(),name:name.trim(),...c}]);
    toast("Category added"); setModal(false); setName("");
  };
  const del = id => { setCategories(p=>p.filter(c=>c.id!==id)); toast("Category removed","info"); };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <Rev d={1}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <p style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,.75)"}}>Transaction Categories</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,.35)",marginTop:2}}>{categories.length} categories configured</p>
          </div>
          <button className="dbp" onClick={()=>{setName("");setColor(0);setModal(true);}}>
            <I d="M12 5v14M5 12h14" size={14} color="white"/>Add Category
          </button>
        </div>
      </Rev>

      <Rev d={2}>
        <div className="dc" style={{padding:"24px 26px"}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {categories.map(c => (
              <div key={c.id} className="dctag" style={{background:c.bg,border:`1px solid ${c.bd}`,color:c.color}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:c.color,flexShrink:0}}/>
                {c.name}
                <button onClick={()=>del(c.id)} style={{marginLeft:6,background:"none",border:"none",cursor:"pointer",color:`${c.color}aa`,fontSize:14,lineHeight:1,padding:0,display:"flex",alignItems:"center"}}>×</button>
              </div>
            ))}
            {categories.length===0 && <p style={{fontSize:13,color:"rgba(255,255,255,.3)"}}>No categories yet</p>}
          </div>
        </div>
      </Rev>

      <Rev d={3}>
        <div className="dc" style={{padding:"24px 26px"}}>
          <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.55)",marginBottom:16,letterSpacing:".04em"}}>CATEGORIES OVERVIEW</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
            {categories.map(c => (
              <div key={c.id} style={{padding:"13px 16px",borderRadius:12,background:c.bg,border:`1px solid ${c.bd}`,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:c.color,boxShadow:`0 0 8px ${c.color}88`,flexShrink:0}}/>
                <span style={{fontSize:13,fontWeight:600,color:c.color}}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Rev>

      {modal && (
        <Modal onClose={()=>setModal(false)} title="New Category" sub="Add a custom spending or income category">
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:20}}>
            <div><Label>CATEGORY NAME</Label><input className="di" autoFocus placeholder="e.g. Operations" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}/></div>
            <div>
              <Label>COLOR</Label>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {COLORS.map((c,i)=>(
                  <button key={i} onClick={()=>setColor(i)} style={{
                    width:28,height:28,borderRadius:"50%",background:c.color,border:"none",cursor:"pointer",
                    boxShadow:color===i?`0 0 0 3px rgba(255,255,255,.3),0 0 12px ${c.color}88`:"none",
                    transform:color===i?"scale(1.15)":"scale(1)",transition:"all .18s",
                  }}/>
                ))}
              </div>
              {name && <div style={{marginTop:12,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>Preview:</span>
                <span className="dctag" style={{background:COLORS[color].bg,border:`1px solid ${COLORS[color].bd}`,color:COLORS[color].color}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:COLORS[color].color}}/>
                  {name}
                </span>
              </div>}
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button className="dbg" onClick={()=>setModal(false)}>Cancel</button>
            <button className="dbp" onClick={add}><I d="M20 6L9 17l-5-5" size={13} color="white"/>Add Category</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── UPLOADS TAB ─────────────────────────────────────────────────────────────
function UploadsTab({ setTransactions, categories }) {
  const [uploads, setUploads]   = useState(() => lsGet("fm_uploads", []));
  const [dragging, setDragging] = useState(false);
  const [parsing,  setParsing]  = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { lsSet("fm_uploads", uploads); }, [uploads]);

  const parseCSV = useCallback((text, filename) => {
    const lines  = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) { toast("CSV must have a header + data rows","error"); return; }
    const headers = lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/['"]/g,""));
    const txs = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",").map(v=>v.trim().replace(/['"]/g,""));
      const row  = Object.fromEntries(headers.map((h,j)=>[h,vals[j]||""]));
      const amount = parseFloat(row.amount||row.value||row.sum||"0");
      if (!isNaN(amount) && amount !== 0) {
        txs.push({
          id: "csv"+Date.now()+i,
          date:        row.date || new Date().toISOString().split("T")[0],
          description: row.description || row.name || row.memo || `Import ${i}`,
          amount:      Math.abs(amount),
          category:    row.category || categories[0]?.name || "Uncategorized",
          type:        amount >= 0 ? "Income" : "Expense",
        });
      }
    }
    if (txs.length === 0) { toast("No valid rows found in CSV","error"); return; }
    setTransactions(p=>[...p,...txs]);
    setUploads(p=>[{id:"u"+Date.now(),filename,rows:txs.length,date:new Date().toLocaleDateString(),status:"success"},...p]);
    toast(`Imported ${txs.length} transactions from ${filename}`);
    setParsing(false);
  }, [categories, setTransactions]);

  const handleFile = useCallback(file => {
    if (!file || !file.name.endsWith(".csv")) { toast("Please upload a .csv file","error"); return; }
    setParsing(true);
    const reader = new FileReader();
    reader.onload = e => parseCSV(e.target.result, file.name);
    reader.readAsText(file);
  }, [parseCSV]);

  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const removeUpload = id => { setUploads(p=>p.filter(u=>u.id!==id)); };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <Rev d={1}>
        <div className="dup" style={dragging?{borderColor:"rgba(59,130,246,.6)",background:"rgba(59,130,246,.06)"}:{}}
          onDragOver={e=>{e.preventDefault();setDragging(true)}}
          onDragLeave={()=>setDragging(false)}
          onDrop={onDrop}
          onClick={()=>!parsing&&fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
          <div style={{width:52,height:52,borderRadius:14,background:"rgba(59,130,246,.1)",border:"1px solid rgba(59,130,246,.22)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
            {parsing
              ? <I d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" size={22} color="#60a5fa" className="dspin"/>
              : <I d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" size={22} color="#60a5fa"/>
            }
          </div>
          <p style={{fontSize:15,fontWeight:700,color:"rgba(255,255,255,.75)",marginBottom:6}}>
            {parsing?"Parsing CSV…":"Drop your CSV file here"}
          </p>
          <p style={{fontSize:13,color:"rgba(255,255,255,.35)",marginBottom:16}}>or click to browse files</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
            {["date","description","amount","category","type"].map(c=>(
              <span key={c} style={{fontSize:11,padding:"3px 9px",borderRadius:999,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.45)",fontFamily:"monospace"}}>{c}</span>
            ))}
          </div>
          <p style={{fontSize:11,color:"rgba(255,255,255,.25)",marginTop:10}}>Expected columns (in any order)</p>
        </div>
      </Rev>

      {uploads.length > 0 && (
        <Rev d={2}>
          <div className="dc" style={{padding:"20px 24px"}}>
            <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.55)",marginBottom:16,letterSpacing:".05em"}}>UPLOAD HISTORY</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {uploads.map(u=>(
                <div key={u.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"rgba(255,255,255,.028)",borderRadius:11,border:"1px solid rgba(255,255,255,.06)"}}>
                  <div style={{width:34,height:34,borderRadius:9,background:"rgba(52,211,153,.1)",border:"1px solid rgba(52,211,153,.22)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <I d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" size={14} color="#34d399"/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13.5,fontWeight:600,color:"rgba(255,255,255,.88)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.filename}</p>
                    <p style={{fontSize:11.5,color:"rgba(255,255,255,.35)"}}>{u.rows} rows imported · {u.date}</p>
                  </div>
                  <span className="dbadge" style={{background:"rgba(52,211,153,.1)",border:"1px solid rgba(52,211,153,.22)",color:"#34d399"}}>✓ Success</span>
                  <button className="dbg" style={{padding:"5px 10px",fontSize:11}} onClick={()=>removeUpload(u.id)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        </Rev>
      )}

      <Rev d={3}>
        <div className="dc" style={{padding:"20px 24px"}}>
          <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.55)",marginBottom:12,letterSpacing:".05em"}}>CSV FORMAT GUIDE</p>
          <div style={{background:"rgba(0,0,0,.3)",borderRadius:11,padding:"14px 16px",fontFamily:"monospace",fontSize:12,color:"rgba(255,255,255,.6)",lineHeight:2,overflowX:"auto"}}>
            <div style={{color:"rgba(255,255,255,.35)"}}>date,description,amount,category,type</div>
            <div>2026-04-01,"AWS Infrastructure",4200,Tech,Expense</div>
            <div>2026-04-02,"SaaS Revenue - Tier A",18500,Revenue,Income</div>
            <div>2026-04-03,"Payroll - Engineering",32000,Payroll,Expense</div>
          </div>
          <p style={{fontSize:11.5,color:"rgba(255,255,255,.3)",marginTop:12}}>
            Negative amounts are auto-classified as Expense. Amount column required.
          </p>
        </div>
      </Rev>
    </div>
  );
}

// ─── MAIN DATA PAGE ───────────────────────────────────────────────────────────
const TABS = [
  { id:"transactions", label:"Transactions", icon:"M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { id:"budgets",      label:"Budgets",      icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { id:"revenue",      label:"Revenue",      icon:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
  { id:"categories",   label:"Categories",   icon:"M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" },
  { id:"uploads",      label:"Uploads",      icon:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" },
];

export default function DataPage() {
  const [activeTab,    setActiveTab]    = useState("transactions");
  const [transactions, setTransactions] = useState(()=>lsGet("fm_transactions",  DEMO_TX));
  const [budgets,      setBudgets]      = useState(()=>lsGet("fm_budgets",       DEMO_BUDGETS));
  const [revenue,      setRevenue]      = useState(()=>lsGet("fm_revenue",       DEMO_REVENUE));
  const [categories,   setCategories]   = useState(()=>lsGet("fm_categories",    DEMO_CATS));

  const [company, setCompany] = useState(() =>
  lsGet("fm_company", DEFAULT_COMPANY)
   );
    const [confirmDelete, setConfirmDelete] = useState(null);

      const requestDelete = (type, id, action) => {
      setConfirmDelete({ type, id, action });
     };

         const confirmDeleteNow = () => {
        if (confirmDelete?.action) {
       confirmDelete.action();
       toast(`${confirmDelete.type} deleted`, "info");
      }
     setConfirmDelete(null);
    };



  const { list: toasts, dismiss } = useToasts();

  // LS sync
  useEffect(() => { lsSet("fm_transactions", transactions); }, [transactions]);
  useEffect(() => { lsSet("fm_budgets",      budgets);      }, [budgets]);
  useEffect(() => { lsSet("fm_revenue",      revenue);      }, [revenue]);
  useEffect(() => { lsSet("fm_categories",   categories);   }, [categories]);

  // Inject CSS once
  useEffect(() => {
    const id = "data-page-css";
    if (document.getElementById(id)) return;
    const el = document.createElement("style"); el.id = id; el.textContent = DATA_CSS;
    document.head.appendChild(el);
    return () => { try { document.head.removeChild(el); } catch {} };
  }, []);

  
useEffect(() => {
  lsSet("fm_company", company);
}, [company]);

  // Live calculations
 const metrics = useMemo(() => {
  const transactionIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const revenueStreams = revenue.reduce(
    (s, r) => s + Number(r.amount || 0),
    0
  );

  const totalRev = transactionIncome + revenueStreams;

  const totalExp = transactions
    .filter((t) => t.type === "Expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const netBurn = totalExp - totalRev;
  const cashBal = Number(company.cashBalance || 0);
  const runway = netBurn > 0 ? cashBal / netBurn : null;

  return { totalRev, totalExp, netBurn, cashBal, runway };
}, [transactions, revenue, company.cashBalance]);

  const METRIC_CARDS = [
    { label:"Cash Balance", value:Math.abs(metrics.cashBal), color: metrics.cashBal>=0?"#60a5fa":"#f87171", icon:"M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", sub:`${metrics.cashBal>=0?"Positive":"Negative"} balance` },
    { label:"Total Revenue", value:metrics.totalRev, color:"#34d399", icon:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", sub:`${transactions.filter(t=>t.type==="Income").length} income txns` },
    { label:"Total Expenses", value:metrics.totalExp, color:"#f87171", icon:"M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z", sub:`${transactions.filter(t=>t.type==="Expense").length} expense txns` },
    { label:"Net Burn / Mo", value:metrics.netBurn, color:"#fbbf24", icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", sub:"Monthly net outflow" },
    { label:"Runway", 
        value:metrics.runway === null ? "Profitable" : `${metrics.runway.toFixed(1)} mo`,
         color:"#a78bfa", icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10", 
        sub: metrics.runway === null
    ? "Revenue covers expenses"
    : "Based on current net burn", unit:"mo" },
  ];

  const fileRef = useRef(null);

  const CONTENT = {
    transactions: <TransactionsTab transactions={transactions} setTransactions={setTransactions} categories={categories} requestDelete={requestDelete}/>,
    budgets:      <BudgetsTab      budgets={budgets}           setBudgets={setBudgets}/>,
    revenue:      <RevenueTab      revenue={revenue}           setRevenue={setRevenue}/>,
    categories:   <CategoriesTab   categories={categories}     setCategories={setCategories}/>,
    uploads:      <UploadsTab      setTransactions={setTransactions} categories={categories}/>,
  };

      
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#080d1a 0%,#0b0f1e 50%,#060b16 100%)",
      color:"rgba(255,255,255,.88)",
      fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
    }}>
      {/* Ambient */}
      <div style={{position:"fixed",top:"10%",left:"20%",width:560,height:560,background:"radial-gradient(circle,rgba(37,99,235,.055) 0%,transparent 70%)",pointerEvents:"none",borderRadius:"50%",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"15%",right:"15%",width:440,height:440,background:"radial-gradient(circle,rgba(52,211,153,.04) 0%,transparent 70%)",pointerEvents:"none",borderRadius:"50%",zIndex:0}}/>

      <div style={{position:"relative",zIndex:1,maxWidth:1380,margin:"0 auto",padding:"28px 28px 72px"}}>

        {/* ── Header ── */}
        <Rev d={1}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:28}} className="dh-right">
            <div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                {/* <span style={{fontSize:12,color:"rgba(255,255,255,.28)",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,.6)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.28)"}></span>
                <span style={{fontSize:12,color:"rgba(255,255,255,.18)"}}> </span>
                <span style={{fontSize:12,color:"rgba(255,255,255,.5)",fontWeight:500}}></span> */}
              </div>
              <h1 style={{fontSize:25,fontWeight:800,color:"rgba(255,255,255,.96)",letterSpacing:"-.04em",lineHeight:1,marginBottom:5}}>Financial Data</h1>
              <p style={{fontSize:13.5,color:"rgba(255,255,255,.38)"}}>Manage and control all your financial inputs in real-time</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button className="dbs" onClick={()=>setActiveTab("uploads")}>
                <I d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" size={14} color="#94a3b8"/>Upload CSV
              </button>
              <button className="dbp" onClick={()=>{setActiveTab("transactions");setTimeout(()=>document.querySelector(".dbp")?.click(),50)}}>
                <I d="M12 5v14M5 12h14" size={14} color="white"/>Add Transaction
              </button>
            </div>
          </div>
        </Rev>

        {/* ── Metrics Row ── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:26}} className="dmc-grid">
          {METRIC_CARDS.map((m,i) => (
            <MetricCard key={m.label} {...m} delay={i+1}
              value={m.unit ? metrics.runway : m.value}
            />
          ))}
        </div>

        {/* ── Tabs ── */}
        <Rev d={1}>
          <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:13,flexShrink:0}}>
              {TABS.map(tab => (
                <button key={tab.id} className={`dtab${activeTab===tab.id?" da":""}`} onClick={()=>setActiveTab(tab.id)}>
                  <I d={tab.icon} size={14} color={activeTab===tab.id?"#60a5fa":"currentColor"}/>
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
              <span style={{fontSize:12,color:"rgba(255,255,255,.28)"}}>
                {transactions.length} transactions · {budgets.length} budgets · {revenue.length} streams
              </span>
            </div>
          </div>
        </Rev>

        {/* ── Tab content ── */}
        <div key={activeTab}>
          {CONTENT[activeTab]}
        </div>
      </div>

      <Toasts list={toasts} dismiss={dismiss}/>

      {/* Responsive */}
      <style>{`
        @media(max-width:1100px){
          .dmc-grid{grid-template-columns:repeat(3,1fr)!important}
        }
        @media(max-width:768px){
          .dmc-grid{grid-template-columns:repeat(2,1fr)!important}
          main,[style*="maxWidth:1380"]{padding:16px 14px 56px!important}
        }
        @media(max-width:480px){
          .dmc-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {confirmDelete && (
       <Modal
         title="Confirm deletion"
        sub="This action cannot be undone."
         onClose={() => setConfirmDelete(null)}
         >
       <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
      <button className="dbg" onClick={() => setConfirmDelete(null)}>
        Cancel
      </button>
      <button className="dbd" onClick={confirmDeleteNow}>
        Delete
      </button>
        </div>
       </Modal>
       )}
    </div>
  );
}