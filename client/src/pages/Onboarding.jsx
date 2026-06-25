import { saveOnboarding } from "../services/financialService.js";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
// ─── Icons (inline SVG, no emojis) ───────────────────────────────────────────
const Icon = {
  Logo: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="5" fill="url(#lg)"/>
      <path d="M4 12L7 8l3 3 4-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <defs><linearGradient id="lg" x1="0" y1="0" x2="18" y2="18"><stop stopColor="#3B82F6"/><stop offset="1" stopColor="#1D4ED8"/></linearGradient></defs>
    </svg>
  ),
  Lightning: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
  Upload: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Database: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  Skip: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 8 16 12 12 16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  Target: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  TrendUp: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Shield: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  Plane: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 21 4s-2 0-3.5 1.5L14 9 5.8 7.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 3.3c.4.4.9.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  X: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  File: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>
    </svg>
  ),
  DollarSign: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const INDUSTRIES = ["SaaS / Software","Fintech","E-commerce","Healthcare","Manufacturing","Consulting","Real Estate","Other"];
const CURRENCIES = ["USD","EUR","GBP","INR","CAD","AUD","SGD"];
const FISCALS = ["January – December","April – March","July – June","October – September"];
const GOALS = [
  { id:"runway", Icon: Icon.Plane, label:"Track Runway", desc:"Monitor how long your capital lasts at current burn" },
  { id:"risk",   Icon: Icon.Shield, label:"Reduce Risk", desc:"Identify and mitigate financial exposure early" },
  { id:"expenses", Icon: Icon.BarChart, label:"Control Expenses", desc:"Keep spend within budget targets consistently" },
  { id:"growth", Icon: Icon.TrendUp, label:"Plan Growth", desc:"Model expansion scenarios with confidence" },
];
const ADV_NAV = ["Transactions","Budgets","Revenue","Categories"];
const DEMO_TRANSACTIONS = [
  { id:1, date:"2024-01-05", amount:12000, category:"SaaS Revenue",   type:"Income"  },
  { id:2, date:"2024-01-08", amount:3200,  category:"Payroll",        type:"Expense" },
  { id:3, date:"2024-01-12", amount:800,   category:"SaaS Tools",     type:"Expense" },
  { id:4, date:"2024-01-15", amount:8500,  category:"Consulting",     type:"Income"  },
  { id:5, date:"2024-01-20", amount:1200,  category:"Marketing",      type:"Expense" },
  { id:6, date:"2024-01-25", amount:4500,  category:"API Licensing",  type:"Income"  },
];
const DEMO_BUDGETS = [
  { id:1, dept:"Engineering", allocated:15000, spent:12000 },
  { id:2, dept:"Marketing",   allocated:8000,  spent:5500  },
  { id:3, dept:"Operations",  allocated:5000,  spent:3200  },
];
const DEMO_REVENUE = [
  { id:1, stream:"SaaS Subscriptions", amount:42000, growth:12 },
  { id:2, stream:"Consulting Services",amount:18000, growth:8  },
  { id:3, stream:"API Licensing",      amount:6000,  growth:25 },
];
const DEMO_CATS = ["SaaS Revenue","Consulting","Payroll","Marketing","SaaS Tools","Infrastructure","Travel","Legal"];

// ─── Backend-ready stubs ──────────────────────────────────────────────────────


// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  return lines.slice(1).map((line, i) => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    return {
      id: Date.now() + i,
      date:     row.date     || new Date().toISOString().slice(0, 10),
      amount:   Number(row.amount) || 0,
      category: row.category || "Uncategorized",
      type:     row.type     || "Expense",
    };
  }).filter(r => r.amount !== 0);
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function GlassCard({ children, className = "", onClick, selected }) {
  return (
    <div
      onClick={onClick}
      className={[
        "rounded-2xl border backdrop-blur-sm transition-all duration-200",
        "bg-white/[0.03] border-white/[0.07]",
        onClick ? "cursor-pointer" : "",
        selected
          ? "border-blue-500/60 bg-blue-500/[0.07] shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_8px_32px_rgba(0,0,0,0.4)]"
          : onClick
            ? "hover:bg-white/[0.055] hover:border-white/[0.13] hover:shadow-[0_6px_28px_rgba(0,0,0,0.35)] hover:-translate-y-0.5"
            : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function FInput({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-3 text-[14px] text-white placeholder-gray-600
                   outline-none transition-all duration-200
                   focus:border-blue-500/60 focus:ring-[3px] focus:ring-blue-500/10"
      />
    </div>
  );
}

function FSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">{label}</label>
      <select
        value={value} onChange={onChange}
        className="w-full bg-[#0d1420] border border-white/[0.08] rounded-xl px-3.5 py-3 text-[14px] text-white
                   outline-none transition-all duration-200 cursor-pointer appearance-none
                   focus:border-blue-500/60 focus:ring-[3px] focus:ring-blue-500/10"
      >
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o} className="bg-[#0B0F19]">{o}</option>)}
      </select>
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled = false, className = "" }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className={[
        "flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all duration-200",
        "bg-blue-600 border border-transparent",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(59,130,246,0.4)] active:translate-y-0",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium text-gray-400 transition-all duration-200",
        "bg-transparent border border-white/[0.09] hover:bg-white/[0.05] hover:text-gray-300",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SmBtn({ children, onClick, variant = "ghost" }) {
  if (variant === "primary") return (
    <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors duration-150">
      {children}
    </button>
  );
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-400 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:text-gray-300 transition-all duration-150">
      {children}
    </button>
  );
}

function Tag({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[12px] font-medium px-3 py-1.5 rounded-lg">
      {children}
      {onRemove && (
        <button onClick={onRemove} className="text-blue-500/50 hover:text-blue-400 transition-colors">
          <Icon.X />
        </button>
      )}
    </span>
  );
}

function StepIndicator({ step, total = 4 }) {
  const labels = ["Company","Mode","Data","Goals"];
  return (
    <div className="flex flex-col items-center gap-3 mb-10">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.1em]">Step {step} of {total}</p>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={[
              "h-[3px] rounded-full transition-all duration-500",
              i + 1 < step  ? "w-8 bg-blue-600" :
              i + 1 === step ? "w-8 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" :
                               "w-4 bg-white/[0.1]",
            ].join(" ")} />
          </div>
        ))}
      </div>
      <div className="flex gap-6">
        {labels.map((l, i) => (
          <span key={l} className={[
            "text-[11px] transition-colors duration-300",
            i + 1 === step ? "text-blue-400 font-semibold" :
            i + 1 < step   ? "text-gray-500" : "text-gray-700",
          ].join(" ")}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Live Metrics Panel ───────────────────────────────────────────────────────
function MetricsPanel({ transactions, revenue, cashBalance }) {
  const monthlyRevenue = transactions.filter(t => t.type === "Income").reduce((s, t) => s + Number(t.amount || 0), 0)
    + revenue.reduce((s, r) => s + Number(r.amount || 0), 0);
  const monthlyExpenses = transactions.filter(t => t.type === "Expense").reduce((s, t) => s + Number(t.amount || 0), 0);
  const netBurn = Math.max(0, monthlyExpenses - monthlyRevenue);
  const runway  = netBurn > 0 ? (Number(cashBalance) / netBurn) : null;

  const fmt = n => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000)      return `$${(n / 1000).toFixed(1)}k`;
    return `$${Math.round(n)}`;
  };

  const metrics = [
    { label:"Cash Balance",  value: fmt(Number(cashBalance) || 0),    color:"text-blue-400" },
    { label:"Monthly Rev",   value: fmt(monthlyRevenue),   color:"text-emerald-400" },
    { label:"Monthly Exp",   value: fmt(monthlyExpenses),  color:"text-red-400" },
    { label:"Net Burn/mo",   value: netBurn > 0 ? fmt(netBurn) : "$0",   color:"text-amber-400" },
    { label:"Runway",        value: runway !== null ? `${Math.round(runway)} mo` : "∞", color:"text-blue-400" },
  ];

  return (
    <GlassCard className="p-4 mb-3">
      <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.1em] mb-3">Live Metrics</p>
      <div className="grid grid-cols-1 gap-2">
        {metrics.map(m => (
          <div key={m.label} className="flex items-center justify-between py-1">
            <span className="text-[11px] text-gray-500">{m.label}</span>
            <span className={`text-[13px] font-bold tabular-nums transition-all duration-300 ${m.color}`}>{m.value}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ─── Step 1 — Company ─────────────────────────────────────────────────────────
function Step1Company({ company, setCompany }) {
  return (
    <div className="max-w-[500px] mx-auto w-full animate-[fadeUp_0.5s_ease-out_both]">
      <GlassCard className="p-9">
        <div className="mb-8">
          <h2 className="text-[22px] font-bold text-white tracking-tight mb-2">Set up your company</h2>
          <p className="text-[14px] text-gray-500 leading-relaxed">This personalizes your financial workspace and reporting format.</p>
        </div>
        <div className="flex flex-col gap-5">
          <FInput label="Company Name" value={company.name} onChange={e => setCompany(p => ({ ...p, name: e.target.value }))} placeholder="Acme Inc." />
          <FSelect label="Industry" value={company.industry} onChange={e => setCompany(p => ({ ...p, industry: e.target.value }))} options={INDUSTRIES} />
          <div className="grid grid-cols-2 gap-4">
            <FSelect label="Currency" value={company.currency} onChange={e => setCompany(p => ({ ...p, currency: e.target.value }))} options={CURRENCIES} />
            <FSelect label="Fiscal Year" value={company.fiscal} onChange={e => setCompany(p => ({ ...p, fiscal: e.target.value }))} options={FISCALS} />
          </div>
          <div className="mt-1">
            <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest block mb-2">Estimated Cash Balance</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"><Icon.DollarSign /></div>
              <input
                type="number"
                value={company.cashBalance || ""}
                onChange={e => setCompany(p => ({ ...p, cashBalance: e.target.value }))}
                placeholder="250000"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-3 text-[14px] text-white placeholder-gray-600
                           outline-none transition-all duration-200
                           focus:border-blue-500/60 focus:ring-[3px] focus:ring-blue-500/10"
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── Step 2 — Mode ────────────────────────────────────────────────────────────
function Step2Mode({ mode, setMode }) {
  return (
    <div className="max-w-[580px] mx-auto w-full">
      <div className="text-center mb-8 animate-[fadeUp_0.45s_ease-out_both]">
        <h2 className="text-[22px] font-bold text-white tracking-tight mb-2">Choose your setup style</h2>
        <p className="text-[14px] text-gray-500">You can always switch or add more data later.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { id:"quick", Icon: Icon.Lightning, label:"Quick Setup", desc:"Get started in minutes using demo data or a CSV upload. Perfect for exploration and fast onboarding.", badge:"Recommended" },
          { id:"advanced", Icon: Icon.Settings, label:"Advanced Setup", desc:"Full control over transactions, budgets, revenue streams, and custom categories. Built for power users.", badge:null },
        ].map((opt, i) => (
          <div key={opt.id} className={`animate-[fadeUp_0.5s_ease-out_both]`} style={{ animationDelay: `${i * 80}ms` }}>
            <GlassCard selected={mode === opt.id} onClick={() => setMode(opt.id)} className="p-7 h-full flex flex-col">
              {opt.badge && (
                <span className="self-start text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/25 rounded-md px-2.5 py-1 mb-4 uppercase tracking-wider">
                  {opt.badge}
                </span>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200 ${mode === opt.id ? "bg-blue-500/20 text-blue-400" : "bg-white/[0.05] text-gray-400"}`}>
                <opt.Icon />
              </div>
              <h3 className="text-[16px] font-bold text-white mb-2">{opt.label}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed flex-1">{opt.desc}</p>
              {mode === opt.id && (
                <div className="flex items-center gap-2 mt-5 text-blue-400 text-[12px] font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                  Selected
                </div>
              )}
            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3 Quick ─────────────────────────────────────────────────────────────
function Step3Quick({ quickChoice, setQuickChoice, setTransactions, setBudgets, setRevenue, setCategories, uploadedFile, setUploadedFile }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file || !file.name.endsWith(".csv")) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = e => {
      const parsed = parseCSV(e.target.result);
      if (parsed.length > 0) setTransactions(parsed);
    };
    reader.readAsText(file);
  }, [setTransactions, setUploadedFile]);

  const handleDrop = e => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSelect = id => {
    setQuickChoice(id);
    if (id === "demo") {
      setTransactions(DEMO_TRANSACTIONS);
      setBudgets(DEMO_BUDGETS);
      setRevenue(DEMO_REVENUE);
      setCategories(DEMO_CATS);
      setDemoLoaded(true);
    }
    if (id === "skip") {
      setTransactions([]);
      setBudgets([]);
      setRevenue([]);
      setCategories([]);
      setDemoLoaded(false);
    }
    if (id === "csv") {
      setTransactions([]);
      setBudgets([]);
      setRevenue([]);
      setCategories([]);
      setDemoLoaded(false);
    }
  };

  const opts = [
    { id:"csv",   Icon: Icon.Upload,   label:"Upload CSV",    desc:"Import your existing transaction data in CSV format" },
    { id:"demo",  Icon: Icon.Database, label:"Use Demo Data",  desc:"Explore FinMetrics with realistic pre-loaded financials" },
    { id:"skip",  Icon: Icon.Skip,     label:"Skip for Now",   desc:"Start with an empty workspace and add data manually later" },
  ];

  return (
    <div className="max-w-[500px] mx-auto w-full">
      <div className="text-center mb-8 animate-[fadeUp_0.45s_ease-out_both]">
        <h2 className="text-[22px] font-bold text-white tracking-tight mb-2">Get your data in</h2>
        <p className="text-[14px] text-gray-500">Choose how to populate your workspace.</p>
      </div>
      <div className="flex flex-col gap-3">
        {opts.map((opt, i) => (
          <div key={opt.id} className="animate-[fadeUp_0.5s_ease-out_both]" style={{ animationDelay: `${i * 70}ms` }}>
            <GlassCard selected={quickChoice === opt.id} onClick={() => handleSelect(opt.id)} className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${quickChoice === opt.id ? "bg-blue-500/15 text-blue-400" : "bg-white/[0.04] text-gray-500"}`}>
                <opt.Icon />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-white mb-0.5">{opt.label}</div>
                <div className="text-[12px] text-gray-500 leading-relaxed">{opt.desc}</div>
              </div>
              {quickChoice === opt.id && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
            </GlassCard>
          </div>
        ))}
      </div>

      {/* CSV upload zone */}
      {quickChoice === "csv" && (
        <div className="mt-4 animate-[fadeUp_0.4s_ease-out_both]">
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={[
              "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200",
              dragOver
                ? "border-blue-500/70 bg-blue-500/[0.08]"
                : uploadedFile
                  ? "border-blue-500/40 bg-blue-500/[0.05]"
                  : "border-white/[0.09] hover:border-white/[0.18] hover:bg-white/[0.03]",
            ].join(" ")}
          >
            {uploadedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="text-blue-400"><Icon.File /></div>
                <p className="text-[14px] font-semibold text-white">{uploadedFile.name}</p>
                <p className="text-[12px] text-blue-400">File uploaded — transactions parsed successfully</p>
              </div>
            ) : (
              <>
                <div className="text-gray-600 mb-3 flex justify-center"><Icon.Upload /></div>
                <p className="text-[14px] font-medium text-gray-400 mb-1">Drop your CSV here or click to browse</p>
                <p className="text-[12px] text-gray-600">Accepts .csv · Columns: date, amount, category, type</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}

      {/* Demo loaded confirmation */}
      {quickChoice === "demo" && demoLoaded && (
        <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-blue-500/[0.07] border border-blue-500/25 animate-[fadeUp_0.35s_ease-out_both]">
          <div className="text-blue-400"><Icon.Check /></div>
          <p className="text-[13px] font-medium text-blue-300">Demo data loaded — {DEMO_TRANSACTIONS.length} transactions, {DEMO_REVENUE.length} revenue streams ready</p>
        </div>
      )}

      {/* Skip confirmation */}
      {quickChoice === "skip" && (
        <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] animate-[fadeUp_0.35s_ease-out_both]">
          <div className="text-gray-500"><Icon.Check /></div>
          <p className="text-[13px] text-gray-500">Workspace cleared — you can add data anytime from your dashboard</p>
        </div>
      )}
    </div>
  );
}

// ─── Transactions Module ──────────────────────────────────────────────────────
function TransactionsModule({ transactions, setTransactions }) {
  const add = () => setTransactions(p => [...p, { id: Date.now(), date: new Date().toISOString().slice(0, 10), amount: 0, category: "Uncategorized", type: "Income" }]);
  const del = id => setTransactions(p => p.filter(t => t.id !== id));
  const upd = (id, field, val) => setTransactions(p => p.map(t => t.id === id ? { ...t, [field]: val } : t));

  const cellCls = "bg-white/[0.03] border border-white/[0.07] rounded-lg px-2.5 py-2 text-[12px] text-white outline-none w-full transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-[14px] font-bold text-white">Transactions</h4>
          <p className="text-[11px] text-gray-600 mt-0.5">{transactions.length} entries</p>
        </div>
        <SmBtn variant="primary" onClick={add}><Icon.Plus /> Add Row</SmBtn>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full min-w-[560px]" style={{ borderCollapse:"separate", borderSpacing:"0 2px" }}>
          <thead>
            <tr className="bg-white/[0.03]">
              {["Date","Amount","Category","Type",""].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-3 py-2.5 first:rounded-tl-xl last:rounded-tr-xl">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="group">
                <td className="px-2 py-1.5"><input className={cellCls} style={{width:108}} type="date" value={tx.date} onChange={e => upd(tx.id,"date",e.target.value)} /></td>
                <td className="px-2 py-1.5"><input className={cellCls} style={{width:88}} type="number" value={tx.amount} onChange={e => upd(tx.id,"amount",e.target.value)} /></td>
                <td className="px-2 py-1.5"><input className={cellCls} style={{width:130}} value={tx.category} onChange={e => upd(tx.id,"category",e.target.value)} /></td>
                <td className="px-2 py-1.5">
                  <select
                    className={`${cellCls} cursor-pointer`}
                    style={{width:90, background:"#0d1420"}}
                    value={tx.type}
                    onChange={e => upd(tx.id,"type",e.target.value)}
                  >
                    <option style={{background:"#0B0F19"}}>Income</option>
                    <option style={{background:"#0B0F19"}}>Expense</option>
                  </select>
                </td>
                <td className="px-2 py-1.5">
                  <button
                    onClick={() => del(tx.id)}
                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-150"
                  >
                    <Icon.Trash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div className="py-10 text-center text-[13px] text-gray-600">No transactions yet — click Add Row to begin</div>
        )}
      </div>
    </div>
  );
}

// ─── Budgets Module ───────────────────────────────────────────────────────────
function BudgetsModule({ budgets, setBudgets }) {
  const upd = (id, f, v) => setBudgets(p => p.map(b => b.id === id ? { ...b, [f]: v } : b));
  const add = () => setBudgets(p => [...p, { id: Date.now(), dept: "New Department", allocated: 10000, spent: 0 }]);
  const del = id => setBudgets(p => p.filter(b => b.id !== id));
  const inp = "bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none w-full transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10";
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-[14px] font-bold text-white">Department Budgets</h4>
          <p className="text-[11px] text-gray-600 mt-0.5">{budgets.length} departments</p>
        </div>
        <SmBtn variant="primary" onClick={add}><Icon.Plus /> Add</SmBtn>
      </div>
      <div className="flex flex-col gap-3">
        {budgets.map(b => {
          const pct = b.allocated > 0 ? Math.min(100, Math.round(b.spent / b.allocated * 100)) : 0;
          const barColor = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-blue-500";
          return (
            <GlassCard key={b.id} className="p-4">
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center mb-3">
                <input className={inp} value={b.dept} onChange={e => upd(b.id,"dept",e.target.value)} placeholder="Department" />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[12px]">$</span>
                  <input className={`${inp} pl-6`} type="number" value={b.allocated} onChange={e => upd(b.id,"allocated",e.target.value)} placeholder="Allocated" />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[12px]">$</span>
                  <input className={`${inp} pl-6`} type="number" value={b.spent} onChange={e => upd(b.id,"spent",e.target.value)} placeholder="Spent" />
                </div>
                <button onClick={() => del(b.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
                  <Icon.Trash />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] text-gray-500 w-9 text-right tabular-nums">{pct}%</span>
              </div>
            </GlassCard>
          );
        })}
        {budgets.length === 0 && <div className="py-8 text-center text-[13px] text-gray-600">No budgets yet</div>}
      </div>
    </div>
  );
}

// ─── Revenue Module ───────────────────────────────────────────────────────────
function RevenueModule({ revenue, setRevenue }) {
  const upd = (id, f, v) => setRevenue(p => p.map(r => r.id === id ? { ...r, [f]: v } : r));
  const add = () => setRevenue(p => [...p, { id: Date.now(), stream: "New Stream", amount: 0, growth: 0 }]);
  const del = id => setRevenue(p => p.filter(r => r.id !== id));
  const inp = "bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none w-full transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10";
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-[14px] font-bold text-white">Revenue Streams</h4>
          <p className="text-[11px] text-gray-600 mt-0.5">{revenue.length} streams</p>
        </div>
        <SmBtn variant="primary" onClick={add}><Icon.Plus /> Add Stream</SmBtn>
      </div>
      <div className="flex flex-col gap-3">
        {revenue.map(r => (
          <GlassCard key={r.id} className="p-4">
            <div className="grid grid-cols-[2fr_1fr_0.8fr_auto] gap-3 items-center">
              <input className={inp} value={r.stream} onChange={e => upd(r.id,"stream",e.target.value)} placeholder="Stream name" />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[12px]">$</span>
                <input className={`${inp} pl-6`} type="number" value={r.amount} onChange={e => upd(r.id,"amount",e.target.value)} />
              </div>
              <div className="relative">
                <input className={`${inp} pr-7`} type="number" value={r.growth} onChange={e => upd(r.id,"growth",e.target.value)} placeholder="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500/70 text-[11px] font-semibold">%</span>
              </div>
              <button onClick={() => del(r.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
                <Icon.Trash />
              </button>
            </div>
          </GlassCard>
        ))}
        {revenue.length === 0 && <div className="py-8 text-center text-[13px] text-gray-600">No revenue streams yet</div>}
      </div>
    </div>
  );
}

// ─── Categories Module ────────────────────────────────────────────────────────
function CategoriesModule({ categories, setCategories }) {
  const [nc, setNc] = useState("");
  const add = () => { if (nc.trim() && !categories.includes(nc.trim())) { setCategories(p => [...p, nc.trim()]); setNc(""); } };
  const del = i => setCategories(p => p.filter((_, idx) => idx !== i));
  return (
    <div>
      <h4 className="text-[14px] font-bold text-white mb-1">Custom Categories</h4>
      <p className="text-[12px] text-gray-600 mb-5">{categories.length} categories defined</p>
      <div className="flex gap-2 mb-5">
        <input
          value={nc} onChange={e => setNc(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Add a category…"
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-gray-600 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
        />
        <SmBtn variant="primary" onClick={add}><Icon.Plus /> Add</SmBtn>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat, i) => <Tag key={i} onRemove={() => del(i)}>{cat}</Tag>)}
        {categories.length === 0 && <p className="text-[13px] text-gray-600">No categories yet</p>}
      </div>
    </div>
  );
}

// ─── Step 3 Advanced ─────────────────────────────────────────────────────────
function Step3Advanced({ transactions, setTransactions, budgets, setBudgets, revenue, setRevenue, categories, setCategories, cashBalance }) {
  const [activeNav, setActiveNav] = useState("Transactions");

  return (
    <div className="w-full max-w-[920px] mx-auto animate-[fadeUp_0.5s_ease-out_both]">
      {/* Mobile nav tabs */}
      <div className="flex lg:hidden overflow-x-auto gap-2 mb-4 pb-1">
        {ADV_NAV.map(n => (
          <button key={n} onClick={() => setActiveNav(n)}
            className={[
              "flex-shrink-0 px-4 py-2 rounded-lg text-[13px] font-medium transition-all",
              activeNav === n ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : "text-gray-500 border border-white/[0.06] hover:text-gray-300",
            ].join(" ")}
          >{n}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5 items-start">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <MetricsPanel transactions={transactions} revenue={revenue} cashBalance={cashBalance} />
          <div className="flex flex-col gap-1">
            {ADV_NAV.map(n => (
              <button key={n} onClick={() => setActiveNav(n)}
                className={[
                  "w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
                  activeNav === n
                    ? "bg-blue-500/[0.1] text-blue-400 border border-blue-500/[0.28]"
                    : "text-gray-500 border border-transparent hover:bg-white/[0.04] hover:text-gray-300",
                ].join(" ")}
              >{n}</button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <GlassCard className="p-7 min-h-[420px]">
          {activeNav === "Transactions" && <TransactionsModule transactions={transactions} setTransactions={setTransactions} />}
          {activeNav === "Budgets"      && <BudgetsModule      budgets={budgets}           setBudgets={setBudgets} />}
          {activeNav === "Revenue"      && <RevenueModule      revenue={revenue}           setRevenue={setRevenue} />}
          {activeNav === "Categories"   && <CategoriesModule   categories={categories}     setCategories={setCategories} />}
        </GlassCard>
      </div>
    </div>
  );
}

// ─── Step 4 — Goals ───────────────────────────────────────────────────────────
function Step4Goals({ goals, setGoals }) {
  const toggle = id => setGoals(p => p.includes(id) ? p.filter(g => g !== id) : [...p, id]);
  return (
    <div className="max-w-[600px] mx-auto w-full">
      <div className="text-center mb-8 animate-[fadeUp_0.45s_ease-out_both]">
        <h2 className="text-[22px] font-bold text-white tracking-tight mb-2">What are your primary goals?</h2>
        <p className="text-[14px] text-gray-500">Select all that apply — we'll tailor your dashboard view.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GOALS.map((g, i) => (
          <div key={g.id} className="animate-[fadeUp_0.5s_ease-out_both]" style={{ animationDelay: `${i * 70}ms` }}>
            <GlassCard selected={goals.includes(g.id)} onClick={() => toggle(g.id)} className="p-6 relative">
              {goals.includes(g.id) && (
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <Icon.Check />
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${goals.includes(g.id) ? "bg-blue-500/20 text-blue-400" : "bg-white/[0.05] text-gray-500"}`}>
                <g.Icon />
              </div>
              <h3 className="text-[15px] font-bold text-white mb-2">{g.label}</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed">{g.desc}</p>
            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Complete Screen ──────────────────────────────────────────────────────────
function CompleteScreen({ company, onNavigate }) {
  return (
    <div className="text-center max-w-[440px] mx-auto px-4 animate-[fadeUp_0.5s_ease-out_both]">
      <div className="w-20 h-20 rounded-full bg-blue-500/[0.08] border border-blue-500/30 flex items-center justify-center mx-auto mb-7 text-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
        <Icon.CheckCircle />
      </div>
      <h2 className="text-[26px] font-bold text-white tracking-tight mb-3">
        {company.name ? `${company.name} is ready` : "Your workspace is ready"}
      </h2>
      <p className="text-[14px] text-gray-500 leading-relaxed mb-8">
        Your FinMetrics workspace has been fully configured. Head to your dashboard to start tracking metrics and managing your financial health in real time.
      </p>
      <PrimaryBtn onClick={onNavigate} className="mx-auto">
        Go to Dashboard <Icon.ArrowRight />
      </PrimaryBtn>
    </div>
  );
}
function ProcessingScreen() {
  return (
    <div className="text-center max-w-[420px] mx-auto animate-[fadeUp_0.5s_ease-out_both]">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-blue-500/30 bg-blue-500/[0.08] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>

      <h2 className="text-[24px] font-bold text-white mb-3">
        Setting up your workspace
      </h2>

      <p className="text-[14px] text-gray-500 leading-relaxed">
        We’re preparing your financial data, metrics, and dashboard.
      </p>
    </div>
  );
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────────
export default function OnboardingPage() {
  // Attempt to use navigate — graceful fallback for standalone use
  let navigate;
  try { navigate = useNavigate(); } catch { navigate = null; }

  const auth = useAuth();
  const { updateUser } = auth || {};
  const isLoggedIn = auth?.user !== null && auth?.user !== undefined;
  const [step, setStep]           = useState(1);
  const [done, setDone]           = useState(false);
  const [transitioning, setTrans] = useState(false);
  const [contentKey, setKey]      = useState(0);

  // State
  const prefill = JSON.parse(localStorage.getItem("fm_signup_company") || "{}");
  const [company, setCompany] = useState({
  name: prefill.name || "",
  industry: prefill.industry || "",
  currency: prefill.currency || "USD",
  fiscal: "January – December",
  cashBalance: 250000,
});
  const [mode, setMode]             = useState("quick");
  const [quickChoice, setQC]        = useState("demo");
  const [uploadedFile, setUpFile]   = useState(null);
  const [transactions, setTx]       = useState(DEMO_TRANSACTIONS);
  const [budgets, setBudgets]       = useState(DEMO_BUDGETS);
  const [revenue, setRevenue]       = useState(DEMO_REVENUE);
  const [categories, setCats]       = useState(DEMO_CATS);
  const [goals, setGoals]           = useState(["runway", "growth"]);
  const [isCompleting, setIsCompleting] = useState(false);

  const go = dir => {
    setTrans(true);
    setTimeout(() => {
      if (dir === 1 && step === 4) { handleComplete(); setTrans(false); return; }
      setStep(s => s + dir);
      setKey(k => k + 1);
      setTrans(false);
    }, 200);
  };

 const handleComplete = async () => {
  setIsCompleting(true);

  const payload = { company, mode, transactions, budgets, revenue, categories, goals };

  try {
    // Save to MongoDB via API (only if authenticated)
    const token = localStorage.getItem("token");
    if (token) {
      await saveOnboarding(payload);
    }
    
    // Only update user if logged in
    if (isLoggedIn && updateUser) {
      await updateUser({ onboardingComplete: true });
    }
    
    // Also keep local copies for instant UI reads before next fetch
    localStorage.setItem("fm_company",      JSON.stringify(company));
    localStorage.setItem("fm_transactions", JSON.stringify(transactions));
    localStorage.setItem("fm_budgets",      JSON.stringify(budgets));
    localStorage.setItem("fm_revenue",      JSON.stringify(revenue));
    localStorage.setItem("fm_categories",   JSON.stringify(categories));
    localStorage.setItem("fm_goals",        JSON.stringify(goals));
    localStorage.setItem("fm_onboarding_complete", "true");

    await new Promise((resolve) => setTimeout(resolve, 900));

    setDone(true);
    setKey((k) => k + 1);
    setTimeout(() => handleNavigate(), 300);
  } catch (err) {
    console.error("Onboarding save failed:", err);
    alert("Failed to save onboarding data. Please try again.");
  } finally {
    setIsCompleting(false);
  }
};

  const handleNavigate = () => {
    // After onboarding complete, redirect to login
    if (navigate) navigate("/dashboard");
    else window.location.href = "/dashboard";
  };

  const stepLabels = ["Company Setup","Setup Mode","Data Setup","Goals"];

  const content = {
    1: <Step1Company company={company} setCompany={setCompany} />,
    2: <Step2Mode mode={mode} setMode={setMode} />,
    3: mode === "quick"
      ? <Step3Quick quickChoice={quickChoice} setQuickChoice={setQC} setTransactions={setTx} setBudgets={setBudgets} setRevenue={setRevenue} setCategories={setCats} uploadedFile={uploadedFile} setUploadedFile={setUpFile} />
      : <Step3Advanced transactions={transactions} setTransactions={setTx} budgets={budgets} setBudgets={setBudgets} revenue={revenue} setRevenue={setRevenue} categories={categories} setCategories={setCats} cashBalance={company.cashBalance} />,
    4: <Step4Goals goals={goals} setGoals={setGoals} />,
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-white relative overflow-hidden">

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,rgba(59,130,246,0.05)_0%,transparent_65%)] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-[radial-gradient(ellipse,rgba(29,78,216,0.04)_0%,transparent_65%)] rounded-full" />
        <div className="absolute top-1/2 left-0 w-[350px] h-[350px] bg-[radial-gradient(ellipse,rgba(59,130,246,0.03)_0%,transparent_65%)] rounded-full" />
      </div>

      {/* Top bar */}
          <nav className="sticky top-0 left-0 right-0 z-50">
  {/* Background Layer */}
  <div className="absolute inset-0 bg-[#05090f]/80 backdrop-blur-xl border-b border-white/5" />

  {/* Content */}
  <div className="relative max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center gap-3 group select-none">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/30 transition-transform duration-200 group-hover:scale-105">
        <span className="text-white font-semibold text-sm">F</span>
      </div>
      <span className="text-white font-semibold text-lg tracking-tight">
        FinMetrics
      </span>

      {/* optional small divider + label */}
      <span className="hidden sm:inline text-white/10 mx-2">|</span>
      <span className="hidden sm:inline text-sm text-white/40">
        Setup
      </span>
    </div>

    {/* Exit setup */}
    <button
      type="button"
      onClick={() => {
        // choose ONE behavior:
        // 1) go to dashboard:
        window.location.href = "/dashboard";

        // OR 2) go to home:
        // window.location.href = "/";
      }}
      className="text-sm text-white/40 hover:text-white transition-all duration-200 hover:translate-x-0.5"
    >
      Exit setup →
    </button>
  </div>
</nav>

      {/* Content */}
      <main className="relative z-10 px-4 sm:px-6 py-10 pb-28 flex flex-col items-center min-h-[calc(100vh-58px)]">
        {!done && <StepIndicator step={step} />}

        <div
          key={contentKey}
          className="w-full flex justify-center"
          style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(10px)" : "translateY(0)", transition:"opacity 0.2s ease, transform 0.2s ease" }}
        >
          {isCompleting ? (
  <ProcessingScreen />
) : done ? (
  <CompleteScreen company={company} onNavigate={handleNavigate} />
) : (
  content[step]
)}
        </div>
      </main>

      {/* Bottom navigation */}
      {!done && (
        <footer className="fixed bottom-0 left-0 right-0 z-20 px-6 py-4 bg-[rgba(8,12,20,0.92)] backdrop-blur-2xl border-t border-white/[0.05]">
          <div className="max-w-[960px] mx-auto flex items-center justify-between">
            <div>
              {step > 1 && (
                <GhostBtn onClick={() => go(-1)}>
                  <Icon.ArrowLeft /> Back
                </GhostBtn>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-[12px] text-gray-700">{stepLabels[step - 1]}</span>
              <PrimaryBtn
                   onClick={step === 4 ? handleComplete : () => go(1)}
                  disabled={isCompleting}
                  >
                {isCompleting
                  ? "Setting up..."
                : step === 4
                 ? "Complete Setup"
                 : "Continue"}
                 </PrimaryBtn>
            </div>
          </div>
        </footer>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0)    scale(1);     }
        }
      `}</style>
    </div>
  );
}