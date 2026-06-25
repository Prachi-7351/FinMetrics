
import { updateProfile, changePassword as apiChangePassword } from "../services/authService.js";
import { useAuth } from "../context/AuthContext";
import { updateCompany } from "../services/financialService.js";

import { useState, useEffect, useRef, useCallback } from "react";
 // adjust path if needed
import { setAvatar } from "../utils/avatarDB";
import { getAvatar } from "../utils/avatarDB";
import { useNavigate } from "react-router-dom";



// ─── Injected CSS ─────────────────────────────────────────────────────────────
const SETTINGS_CSS = `
  @keyframes sfadeUp {
    from { opacity:0; transform:translateY(18px) scale(0.984); }
    to   { opacity:1; transform:translateY(0)    scale(1);     }
  }
  @keyframes sModalIn {
    from { opacity:0; transform:scale(0.95) translateY(10px); }
    to   { opacity:1; transform:scale(1)    translateY(0);    }
  }
  @keyframes sOverlayIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes sPulse {
    0%,100% { opacity:1; } 50% { opacity:.45; }
  }
  @keyframes sBarFill {
    from { width:0; }
  }

  .s-reveal { opacity:0; transform:translateY(18px) scale(0.984); }
  .s-reveal.s-visible {
    animation: sfadeUp 0.58s cubic-bezier(0.22,1,0.36,1) both;
  }
  .s-d1.s-visible { animation-delay:  0ms; }
  .s-d2.s-visible { animation-delay: 70ms; }
  .s-d3.s-visible { animation-delay:140ms; }
  .s-d4.s-visible { animation-delay:210ms; }
  .s-d5.s-visible { animation-delay:280ms; }
  .s-d6.s-visible { animation-delay:350ms; }

  .s-modal-overlay {
    animation: sOverlayIn 0.22s ease both;
  }
  .s-modal-box {
    animation: sModalIn 0.26s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* Glass card */
  .s-card {
    background: rgba(255,255,255,0.036);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.075);
    box-shadow: 0 8px 32px rgba(0,0,0,0.42), 0 1px 0 rgba(255,255,255,0.04) inset;
    border-radius: 18px;
    transition: transform 0.22s cubic-bezier(0.22,1,0.36,1),
                box-shadow 0.22s ease, border-color 0.22s ease;
  }
  .s-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255,255,255,0.12);
    box-shadow: 0 16px 48px rgba(0,0,0,0.52), 0 0 0 1px rgba(59,130,246,0.08),
                0 1px 0 rgba(255,255,255,0.06) inset;
  }
  .s-card-static {
    background: rgba(255,255,255,0.036);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.075);
    box-shadow: 0 8px 32px rgba(0,0,0,0.42), 0 1px 0 rgba(255,255,255,0.04) inset;
    border-radius: 18px;
  }

  /* Sidebar tab */
  .s-tab {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 10px 14px; border-radius: 12px;
    border: none; background: transparent;
    color: rgba(255,255,255,0.52);
    font-size: 13.5px; font-weight: 500; font-family: inherit;
    text-align: left; cursor: pointer;
    transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  }
  .s-tab:hover {
    background: rgba(255,255,255,0.055);
    color: rgba(255,255,255,0.88);
  }
  .s-tab.s-tab-active {
    background: rgba(52,211,153,0.1);
    color: #34d399;
    box-shadow: inset 3px 0 0 #34d399, 0 0 0 1px rgba(52,211,153,0.18);
    font-weight: 600;
  }
  .s-tab-icon { flex-shrink:0; opacity:.6; transition:opacity 0.18s; }
  .s-tab:hover .s-tab-icon { opacity:.85; }
  .s-tab.s-tab-active .s-tab-icon { opacity:1; }

  /* Toggle */
  .s-tog-track {
    width:40px; height:22px; border-radius:11px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.14);
    padding:2px; cursor:pointer;
    transition: background 0.22s, border-color 0.22s;
    position:relative; flex-shrink:0;
  }
  .s-tog-track.on { background:rgba(52,211,153,0.7); border-color:rgba(52,211,153,0.5); }
  .s-tog-knob {
    width:16px; height:16px; border-radius:50%; background:#fff;
    box-shadow:0 1px 4px rgba(0,0,0,0.4);
    transition: transform 0.22s cubic-bezier(0.34,1.1,0.64,1);
  }
  .s-tog-track.on .s-tog-knob { transform:translateX(18px); }

  /* Progress bar */
  .s-bar-fill { animation: sBarFill 1.1s cubic-bezier(0.25,.46,.45,.94) both; }

  /* Input */
  .s-input {
    width:100%; background:rgba(255,255,255,0.055);
    border:1px solid rgba(255,255,255,0.11);
    border-radius:10px; color:rgba(255,255,255,0.9);
    font-family:inherit; font-size:13.5px;
    padding:10px 14px; outline:none;
    transition:border-color 0.18s, box-shadow 0.18s;
  }
  .s-input:focus {
    border-color:rgba(59,130,246,0.55);
    box-shadow:0 0 0 3px rgba(59,130,246,0.12);
  }
  .s-input::placeholder { color:rgba(255,255,255,0.25); }

  /* Btn primary */
  .s-btn-p {
    display:inline-flex; align-items:center; justify-content:center; gap:7px;
    background:linear-gradient(135deg,#2563eb,#1d4ed8);
    color:#fff; font-size:13px; font-weight:600;
    padding:10px 20px; border-radius:10px; border:none;
    cursor:pointer; font-family:inherit; letter-spacing:-0.01em;
    box-shadow:0 4px 14px rgba(37,99,235,0.38);
    transition:transform 0.18s,box-shadow 0.18s,opacity 0.18s;
  }
  .s-btn-p:hover { transform:scale(1.02); box-shadow:0 6px 22px rgba(37,99,235,0.5); }
  .s-btn-p:active { transform:scale(0.985); }

  /* Btn secondary */
  .s-btn-s {
    display:inline-flex; align-items:center; justify-content:center; gap:7px;
    background:rgba(255,255,255,0.06);
    color:rgba(255,255,255,0.75); font-size:13px; font-weight:500;
    padding:10px 20px; border-radius:10px;
    border:1px solid rgba(255,255,255,0.11);
    cursor:pointer; font-family:inherit; letter-spacing:-0.01em;
    transition:all 0.18s;
  }
  .s-btn-s:hover { background:rgba(255,255,255,0.1); color:#fff; border-color:rgba(255,255,255,0.2); transform:scale(1.01); }
  .s-btn-s:active { transform:scale(0.985); }

  /* Btn ghost */
  .s-btn-g {
    display:inline-flex; align-items:center; justify-content:center; gap:7px;
    background:transparent; color:rgba(255,255,255,0.45);
    font-size:13px; font-weight:500;
    padding:10px 18px; border-radius:10px;
    border:1px solid rgba(255,255,255,0.09);
    cursor:pointer; font-family:inherit;
    transition:all 0.18s;
  }
  .s-btn-g:hover { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.82); border-color:rgba(255,255,255,0.18); }

  /* Btn danger */
  .s-btn-d {
    display:inline-flex; align-items:center; justify-content:center; gap:7px;
    background:rgba(239,68,68,0.1); color:rgba(252,165,165,0.9);
    font-size:13px; font-weight:500;
    padding:10px 20px; border-radius:10px;
    border:1px solid rgba(239,68,68,0.22);
    cursor:pointer; font-family:inherit;
    transition:all 0.18s;
  }
  .s-btn-d:hover { background:rgba(239,68,68,0.18); color:#fca5a5; border-color:rgba(239,68,68,0.38); }

  /* Row divider */
  .s-row { border-bottom:1px solid rgba(255,255,255,0.05); }
  .s-row:last-child { border-bottom:none; }

  /* Badge */
  .s-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 10px; border-radius:999px;
    font-size:11px; font-weight:700; letter-spacing:0.02em;
  }

  /* Activity item hover */
  .s-act-item { transition:background 0.16s; border-radius:12px; }
  .s-act-item:hover { background:rgba(255,255,255,0.03); }

  /* Theme option */
  .s-theme-opt {
    border-radius:12px; border:2px solid rgba(255,255,255,0.1);
    padding:14px 18px; cursor:pointer;
    transition:border-color 0.18s,background 0.18s,box-shadow 0.18s;
    display:flex; align-items:center; gap:10px;
  }
  .s-theme-opt:hover { border-color:rgba(255,255,255,0.25); background:rgba(255,255,255,0.04); }
  .s-theme-opt.s-theme-sel {
    border-color:rgba(52,211,153,0.55);
    background:rgba(52,211,153,0.07);
    box-shadow:0 0 0 3px rgba(52,211,153,0.12);
  }

  /* Table row */
  .s-trow { border-bottom:1px solid rgba(255,255,255,0.045); transition:background 0.16s; }
  .s-trow:hover { background:rgba(255,255,255,0.025); }
  .s-trow:last-child { border-bottom:none; }

  /* Scroll */
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#1e3a5f; border-radius:3px; }

  @media (prefers-reduced-motion:reduce) {
    .s-reveal { transform:none!important; }
    .s-reveal.s-visible { animation:none; opacity:1; }
    .s-card:hover,.s-btn-p:hover,.s-btn-s:hover { transform:none; }
    .s-bar-fill { animation:none; }
  }
`;

// ─── Dummy data ───────────────────────────────────────────────────────────────
const ACTIVITY = [
  { icon:"📊", title:"Uploaded financial data",    desc:"Q4 2025 balance sheet imported",    time:"2h ago",   color:"rgba(59,130,246,0.18)",  dot:"#60a5fa" },
  { icon:"⚡", title:"Ran stress simulation",       desc:"Recession scenario — 30% rev drop", time:"5h ago",   color:"rgba(245,158,11,0.16)",  dot:"#f59e0b" },
  { icon:"🤖", title:"AI recommendation generated", desc:"Reduce burn by $18K/mo",            time:"1d ago",   color:"rgba(52,211,153,0.16)",  dot:"#34d399" },
  { icon:"🛡", title:"Risk score updated",          desc:"Score moved from 58 → 64 (Medium)", time:"2d ago",   color:"rgba(239,68,68,0.14)",   dot:"#f87171" },
  { icon:"🖥", title:"Logged in from new device",   desc:"Chrome · MacOS · Bangalore, IN",    time:"3d ago",   color:"rgba(139,92,246,0.16)",  dot:"#a78bfa" },
  { icon:"📄", title:"Exported report",             desc:"Monthly Finance Report — PDF",      time:"4d ago",   color:"rgba(52,211,153,0.16)",  dot:"#34d399" },
];

const TEAM = [
  { name:"Priya Sharma",  email:"priya@finmetrics.io",  role:"Admin",  status:"Active"  },
  { name:"Rahul Verma",   email:"rahul@finmetrics.io",  role:"Member", status:"Active"  },
  { name:"Neha Kapoor",   email:"neha@finmetrics.io",   role:"Viewer", status:"Pending" },
];

const SESSIONS = [
  { device:"Chrome on Windows", location:"Bangalore, IN",  last:"Active now",   icon:"🖥" },
  { device:"Safari on iPhone",  location:"Mumbai, IN",     last:"2h ago",        icon:"📱" },
  { device:"Firefox on Mac",    location:"Delhi, IN",      last:"3d ago",        icon:"💻" },
];

const BILLING_HIST = [
  { inv:"INV-2026-04", date:"Apr 1, 2026", amount:"$49.00", status:"Paid"    },
  { inv:"INV-2026-03", date:"Mar 1, 2026", amount:"$49.00", status:"Paid"    },
  { inv:"INV-2026-02", date:"Feb 1, 2026", amount:"$49.00", status:"Paid"    },
  { inv:"INV-2026-01", date:"Jan 1, 2026", amount:"$49.00", status:"Paid"    },
];

const USAGE_ITEMS = [
  { label:"Data Uploads",         used:7,  max:20  },
  { label:"Reports Generated",    used:8,  max:15  },
  { label:"AI Recommendations",   used:5,  max:10  },
  { label:"Simulation Runs",      used:12, max:30  },
];

const NAV_TABS = [
  { id:"account",       label:"Account",       icon:<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round"/> },
  { id:"company",       label:"Company",       icon:<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/> },
  { id:"security",      label:"Security",      icon:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/> },
  { id:"billing",       label:"Billing",       icon:<path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeLinecap="round" strokeLinejoin="round"/> },
  { id:"notifications", label:"Notifications", icon:<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round"/> },
  { id:"preferences",   label:"Preferences",   icon:<path d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round"/> },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Svg({ children, size=16, sw=1.8, color="currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke={color} strokeWidth={sw}>
      {children}
    </svg>
  );
}

function Badge({ color, bg, border, dot, children }) {
  return (
    <span className="s-badge" style={{ background:bg, border:`1px solid ${border}`, color }}>
      {dot && <span style={{ width:5, height:5, borderRadius:"50%", background:dot, flexShrink:0 }}/>}
      {children}
    </span>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div className={`s-tog-track${checked?" on":""}`} onClick={() => onChange(!checked)}
      role="switch" aria-checked={checked} tabIndex={0}
      onKeyDown={e => { if(e.key===" "||e.key==="Enter") onChange(!checked); }}>
      <div className="s-tog-knob"/>
    </div>
  );
}

function UsageBar({ label, used, max }) {
  const pct = Math.round((used/max)*100);
  const clr = pct>80?"#f59e0b":pct>60?"#60a5fa":"#34d399";
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:13, color:"rgba(255,255,255,0.65)" }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:700, color:clr }}>{used}/{max}</span>
      </div>
      <div style={{ height:5, background:"rgba(255,255,255,0.07)", borderRadius:4, overflow:"hidden" }}>
        <div className="s-bar-fill" style={{
          height:"100%", width:`${pct}%`, borderRadius:4,
          background:clr, boxShadow:`0 0 8px ${clr}55`,
        }}/>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono=false }) {
  return (
    <div className="s-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0" }}>
      <span style={{ fontSize:12.5, fontWeight:500, color:"rgba(255,255,255,0.4)", letterSpacing:".04em" }}>{label}</span>
      <span style={{ fontSize:13.5, fontWeight:600, color:"rgba(255,255,255,0.88)", fontFamily:mono?"monospace":"inherit" }}>{value}</span>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:16 }}>
      {children}
    </p>
  );
}

function CardTitle({ children, sub }) {
  return (
    <div style={{ marginBottom:20 }}>
      <h3 style={{ fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.92)", letterSpacing:"-.02em", marginBottom:sub?4:0 }}>{children}</h3>
      {sub && <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)" }}>{sub}</p>}
    </div>
  );
}

// ─── Reveal wrapper ───────────────────────────────────────────────────────────
function Reveal({ children, delay=1, style={} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if(!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if(e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold:.07 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`s-reveal s-d${delay}${vis?" s-visible":""}`} style={style}>
      {children}
    </div>
  );
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({ profile, onClose, onSave={handleSaveProfile} }) {
  const handleSaveProfile = async (form) => {
  try {
    // 1. Save to DB
    await updateProfile({
      fullName: form.name,
      email:    form.email,
      phone:    form.phone,
      role:     form.role,
    });

    // 2. Update local profile state
    setProfile((p) => ({ ...p, ...form }));

    // 3. Update AuthContext user (so Navbar reflects changes)
    await updateUser({
      fullName: form.name,
      email:    form.email,
      role:     form.role,
      phone:    form.phone,
    });

    // 4. Persist locally
    localStorage.setItem("fm_profile", JSON.stringify({ ...profile, ...form }));

  } catch (err) {
    console.error("Profile update failed:", err);
    alert("Failed to save profile. Please try again.");
  }
};
  const [form, setForm] = useState({ ...profile });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  useEffect(() => {
    const fn = e => { if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const FIELDS = [
    { key:"name",  label:"Full Name",  type:"text",  ph:"Your full name"   },
    { key:"email", label:"Email",      type:"email", ph:"you@example.com"  },
    { key:"phone", label:"Phone",      type:"tel",   ph:"+91 98765 43210"  },
    { key:"role",  label:"Role",       type:"text",  ph:"Founder, CFO..."  },
  ];

  return (
    <div className="s-modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()} style={{
      position:"fixed", inset:0, zIndex:999,
      background:"rgba(3,7,18,0.78)",
      backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div className="s-modal-box s-card-static" style={{
        width:"100%", maxWidth:480, padding:28,
        background:"rgba(9,15,30,0.97)",
        border:"1px solid rgba(255,255,255,0.1)",
        boxShadow:"0 32px 80px rgba(0,0,0,0.75)",
        borderRadius:22,
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <h2 style={{ fontSize:17, fontWeight:700, color:"rgba(255,255,255,0.94)", letterSpacing:"-.025em" }}>Edit Profile</h2>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Update your personal information</p>
          </div>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:9, background:"rgba(255,255,255,0.07)",
            border:"1px solid rgba(255,255,255,0.11)", color:"rgba(255,255,255,0.55)",
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.18s",
          }}>
            <Svg size={14}><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></Svg>
          </button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
          {FIELDS.map(f => (
            <div key={f.key}>
              <label style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.45)", letterSpacing:".04em", display:"block", marginBottom:7 }}>
                {f.label.toUpperCase()}
              </label>
              <input className="s-input" type={f.type} value={form[f.key]||""} placeholder={f.ph} onChange={set(f.key)}/>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button className="s-btn-g" onClick={onClose}>Cancel</button>
          <button className="s-btn-p" onClick={() => { onSave(form); onClose(); }}>
            <Svg size={13} color="white"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></Svg>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════════

// ─── Account Tab ─────────────────────────────────────────────────────────────
function AccountTab({ profile, onEditOpen, onAvatarUpload, onDeleteOpen }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* A. Profile Hero */}
      <Reveal delay={1}>
        <div className="s-card" style={{ padding:"28px 28px 24px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:20 }}>
              {/* Avatar */}
              <div style={{ position:"relative", flexShrink:0 }}>
                  <div
                 style={{
                         width: 76,
    height: 76,
    borderRadius: "50%",
    background: (profile.avatarUrl || profile.avatar)
  ? `url(${profile.avatarUrl || profile.avatar}) center/cover no-repeat`
  : "linear-gradient(135deg,#2563eb,#7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    fontWeight: 800,
    color: "#fff",
    boxShadow:
      "0 0 0 3px rgba(59,130,246,0.28), 0 0 24px rgba(59,130,246,0.22)",
    overflow: "hidden",
  }}
>
  {!profile.avatar &&
    (profile.name || "U")
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()}
</div>            
                 <input
  id="avatar-upload"
  type="file"
  accept="image/*"
  style={{ display: "none" }}
  onChange={(e) => onAvatarUpload(e.target.files?.[0])}
/>               
                 
                <button 
                onClick={() => document.getElementById("avatar-upload")?.click()}
                style={{
                    
                  position:"absolute", bottom:-2, right:-2,
                  width:24, height:24, borderRadius:"50%",
                  background:"rgba(37,99,235,0.9)", border:"2px solid rgba(9,15,30,.9)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", transition:"transform 0.18s",
                }}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.12)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                  title="Change photo">
                  <Svg size={11} color="white" sw={2.2}>
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </button>
              </div>

              {/* Info */}
              <div>
                <h2 style={{ fontSize:20, fontWeight:700, color:"rgba(255,255,255,0.94)", letterSpacing:"-.03em", marginBottom:5 }}>
                  {profile.name}
                </h2>
                <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:7, marginBottom:4 }}>
                  <Badge color="#93c5fd" bg="rgba(59,130,246,0.12)" border="rgba(59,130,246,0.22)" dot="#60a5fa">{profile.role}</Badge>
                  <Badge color="#86efac" bg="rgba(34,197,94,0.1)"  border="rgba(34,197,94,0.22)"  dot="#22c55e">Active</Badge>
                  <Badge color="#a5b4fc" bg="rgba(99,102,241,0.12)" border="rgba(99,102,241,0.22)">Pro Plan</Badge>
                </div>
                <p style={{ fontSize:12.5, color:"rgba(255,255,255,0.38)" }}>{profile.company}</p>
              </div>
            </div>

            <button className="s-btn-p" onClick={onEditOpen}>
              <Svg size={13} color="white"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/></Svg>
              Edit Profile
            </button>
          </div>
        </div>
      </Reveal>

      {/* B. Account Info */}
      <Reveal delay={2}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <CardTitle>Account Information</CardTitle>
          <InfoRow label="Full Name"     value={profile.name}     />
          <InfoRow label="Email Address" value={profile.email}    />
          <InfoRow label="Phone Number"  value={profile.phone}    />
          <InfoRow label="Role"          value={profile.role}     />
          <InfoRow label="Account Status" value={
            <Badge color="#86efac" bg="rgba(34,197,94,0.1)" border="rgba(34,197,94,0.2)" dot="#22c55e">Active</Badge>
          }/>
          <InfoRow label="Member Since"  value="January 12, 2025" />
        </div>
      </Reveal>

      {/* C. Quick Insights */}
      <Reveal delay={3}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {[
            {
              title:"Data Summary",
              color:"#60a5fa", bg:"rgba(59,130,246,0.1)", bd:"rgba(59,130,246,0.2)",
              iconD:"M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V9c0-2-1-3-3-3H7C5 6 4 7 4 7zM8 12h8M8 16h4",
              rows:[["Total Transactions","1,284"],["Last Upload","2 days ago"],["Data Health","Good ✓"]],
              btn:"Manage Data",
            },
            {
              title:"Reports",
              color:"#a78bfa", bg:"rgba(99,102,241,0.1)", bd:"rgba(99,102,241,0.2)",
              iconD:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
              rows:[["Generated","8 reports"],["Last Report","Monthly Finance"],["Format","PDF / CSV"]],
              btn:"View Reports",
            },
            {
              title:"AI Insights",
              color:"#34d399", bg:"rgba(52,211,153,0.1)", bd:"rgba(52,211,153,0.2)",
              iconD:"M12 2a10 10 0 110 20 10 10 0 010-20zM12 16v-4M12 8h.01",
              rows:[["Recommendations","5 total"],["High Priority","2 items"],["Last Generated","1d ago"]],
              btn:"View AI CFO",
            },
          ].map(card => (
            <div key={card.title} className="s-card" style={{ padding:"20px 22px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:16 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:card.bg, border:`1px solid ${card.bd}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Svg size={14} color={card.color}><path d={card.iconD} strokeLinecap="round" strokeLinejoin="round"/></Svg>
                </div>
                <span style={{ fontSize:13.5, fontWeight:700, color:"rgba(255,255,255,0.88)", letterSpacing:"-.02em" }}>{card.title}</span>
              </div>
              {card.rows.map(([l,v]) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                  <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.38)" }}>{l}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.75)" }}>{v}</span>
                </div>
              ))}
              <button className="s-btn-s" style={{ width:"100%", marginTop:14, fontSize:12, padding:"8px" }}>{card.btn}</button>
            </div>
          ))}
        </div>
      </Reveal>

      {/* D. Recent Activity */}
      <Reveal delay={4}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <CardTitle sub="Your latest actions and events">Recent Activity</CardTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {ACTIVITY.map((a,i) => (
              <div key={i} className="s-act-item" style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"11px 10px" }}>
                <div style={{ width:36, height:36, borderRadius:10, background:a.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                  {a.icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.88)", marginBottom:2 }}>{a.title}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{a.desc}</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:a.dot }}/>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

// ─── Company Tab ──────────────────────────────────────────────────────────────

function CompanyTab() {
  const companyData = JSON.parse(localStorage.getItem("fm_company") || "{}");
  const PROFILE_FIELDS = [
  ["Company Name",   companyData.name     || "—"],
  ["Industry",       companyData.industry || "—"],
  ["Currency",       companyData.currency || "USD"],
  ["Fiscal Year",    companyData.fiscal   || "—"],
  ["Company Type",   user?.companyType    || "—"],
  ["Country",        user?.country        || "—"],
];
  const WORKSPACE_FIELDS = [
    ["Workspace ID",      "FM-2025-0042"],
    ["Default Currency",  "INR (₹)"],
    ["Reporting Period",  "Monthly"],
    ["Data Retention",    "24 months"],
  ];
  const statusClr = { Active:{ color:"#86efac", bg:"rgba(34,197,94,0.1)", bd:"rgba(34,197,94,0.2)" }, Pending:{ color:"#fcd34d", bg:"rgba(245,158,11,0.1)", bd:"rgba(245,158,11,0.2)" } };
  const roleClr = { Admin:"#93c5fd", Member:"#6ee7b7", Viewer:"#a78bfa" };
  const [team, setTeam] = useState(TEAM);
const [inviteOpen, setInviteOpen] = useState(false);
const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "Member" });
const [inviteStatus, setInviteStatus] = useState({ state: "idle", msg: "" });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      <Reveal delay={1}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <CardTitle sub="Your organization's core details">Company Profile</CardTitle>
          {PROFILE_FIELDS.map(([l,v]) => <InfoRow key={l} label={l} value={v}/>)}
        </div>
      </Reveal>

      <Reveal delay={2}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <CardTitle sub="Workspace-level configuration">Workspace Settings</CardTitle>
          {WORKSPACE_FIELDS.map(([l,v]) => <InfoRow key={l} label={l} value={v} mono={l==="Workspace ID"}/>)}
        </div>
      </Reveal>

      <Reveal delay={3}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <CardTitle sub="People with workspace access">Team Members</CardTitle>
            <button
            className="s-btn-p"
            style={{ fontSize:12, padding:"8px 16px" }}
            onClick={() => {
             setInviteForm({ name: "", email: "", role: "Member" });
             setInviteStatus({ state: "idle", msg: "" });
             setInviteOpen(true);
            }}
             >
           <Svg size={13} color="white">
             <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
             Invite Member
            </button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {team.map((m,i) => {
              const sc = statusClr[m.status]||statusClr.Pending;
              return (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:14, padding:"13px 16px",
                  background:"rgba(255,255,255,0.028)", borderRadius:12,
                  border:"1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#3b82f6,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", flexShrink:0 }}>
                    {m.name.split(" ").map(w=>w[0]).join("")}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13.5, fontWeight:600, color:"rgba(255,255,255,0.88)", marginBottom:2 }}>{m.name}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)" }}>{m.email}</p>
                  </div>
                  <Badge color={roleClr[m.role]||"#94a3b8"} bg="rgba(255,255,255,0.07)" border="rgba(255,255,255,0.1)">{m.role}</Badge>
                  <Badge color={sc.color} bg={sc.bg} border={sc.bd} dot={sc.color}>{m.status}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
      {inviteOpen && (
  <div style={{
    position:"fixed", inset:0, zIndex:9999,
    background:"rgba(0,0,0,0.55)",
    display:"flex", alignItems:"center", justifyContent:"center",
    padding: 18,
  }}
  onMouseDown={(e) => {
    if (e.target === e.currentTarget) setInviteOpen(false);
  }}
  >
    <div className="s-card" style={{
      width:"100%", maxWidth:520,
      padding:"22px 22px",
      borderRadius:18,
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <p style={{ fontSize:14, fontWeight:700, color:"rgba(255,255,255,0.9)" }}>Invite Member</p>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.42)", marginTop:3 }}>
            Add someone to your workspace (frontend demo)
          </p>
        </div>
        <button className="s-btn-g" onClick={() => setInviteOpen(false)}>Close</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <div>
          <label style={{ fontSize:11.5, fontWeight:600, color:"rgba(255,255,255,0.4)", letterSpacing:".06em", display:"block", marginBottom:6 }}>
            NAME
          </label>
          <input
            className="s-input"
            value={inviteForm.name}
            onChange={(e) => setInviteForm(v => ({ ...v, name: e.target.value }))}
            placeholder="Full name"
          />
        </div>

        <div>
          <label style={{ fontSize:11.5, fontWeight:600, color:"rgba(255,255,255,0.4)", letterSpacing:".06em", display:"block", marginBottom:6 }}>
            ROLE
          </label>
          <select
  value={inviteForm.role}
  onChange={(e) => setInviteForm(v => ({ ...v, role: e.target.value }))}
  className="s-input"
  style={{ width: "100%", background: "#0d1420", color: "#fff", cursor: "pointer" }}
>
  <option value="Admin" style={{ background: "#0B0F19", color: "#fff" }}>Admin</option>
  <option value="Member" style={{ background: "#0B0F19", color: "#fff" }}>Member</option>
  <option value="Viewer" style={{ background: "#0B0F19", color: "#fff" }}>Viewer</option>
</select>
        </div>
      </div>

      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:11.5, fontWeight:600, color:"rgba(255,255,255,0.4)", letterSpacing:".06em", display:"block", marginBottom:6 }}>
          EMAIL
        </label>
        <input
          className="s-input"
          type="email"
          value={inviteForm.email}
          onChange={(e) => setInviteForm(v => ({ ...v, email: e.target.value }))}
          placeholder="name@company.com"
        />
      </div>

      {inviteStatus.state !== "idle" && (
        <p style={{
          fontSize: 12,
          marginBottom: 12,
          color: inviteStatus.state === "success" ? "#22c55e" :
                 inviteStatus.state === "error" ? "#ef4444" :
                 "rgba(255,255,255,0.55)"
        }}>
          {inviteStatus.msg}
        </p>
      )}

      <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
        <button className="s-btn-g" onClick={() => setInviteOpen(false)}>Cancel</button>
        <button
          className="s-btn-p"
          onClick={() => {
            // basic validation
            if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
              setInviteStatus({ state:"error", msg:"Please enter name and email." });
              return;
            }
            if (!inviteForm.email.includes("@")) {
              setInviteStatus({ state:"error", msg:"Please enter a valid email." });
              return;
            }

            // simulate invite send + add to list as Pending
            setInviteStatus({ state:"loading", msg:"Sending invite…" });

            setTimeout(() => {
              setTeam(prev => [
                ...prev,
                {
                  name: inviteForm.name.trim(),
                  email: inviteForm.email.trim(),
                  role: inviteForm.role,
                  status: "Pending",
                }
              ]);
              setInviteStatus({ state:"success", msg:"Invite sent. Member added as Pending." });

              setTimeout(() => {
                setInviteOpen(false);
              }, 700);
            }, 700);
          }}
        >
          Invite
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const [pwForm, setPwForm] = useState({ current:"", next:"", confirm:"" });
 const set = k => e => setPwForm(p => ({ ...p, [k]: e.target.value }));
 const [pwStatus, setPwStatus] = useState({ state: "idle", msg: "" });

const handleUpdatePassword = async (e) => {
  e?.preventDefault?.();

  if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
    setPwStatus({ state: "error", msg: "Please fill all password fields." });
    return;
  }
  if (pwForm.next.length < 8) {
    setPwStatus({ state: "error", msg: "New password must be at least 8 characters." });
    return;
  }
  if (pwForm.next !== pwForm.confirm) {
    setPwStatus({ state: "error", msg: "Passwords do not match." });
    return;
  }

  setPwStatus({ state: "loading", msg: "Updating password…" });
  try {
    await apiChangePassword({
      currentPassword: pwForm.current,
      newPassword:     pwForm.next,
    });
    setPwStatus({ state: "success", msg: "Password updated successfully." });
    setPwForm({ current: "", next: "", confirm: "" });
  } catch (err) {
    const msg = err.response?.data?.error || "Password update failed.";
    setPwStatus({ state: "error", msg });
  }
};

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      <Reveal delay={1}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <CardTitle sub="It's a good idea to use a strong password">Change Password</CardTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:13, maxWidth:400 }}>
            {[["current","Current Password"],["next","New Password"],["confirm","Confirm New Password"]].map(([k,l])=>(
              <div key={k}>
                <label style={{ fontSize:11.5, fontWeight:600, color:"rgba(255,255,255,0.4)", letterSpacing:".06em", display:"block", marginBottom:6 }}>{l.toUpperCase()}</label>
                <input className="s-input" type="password" value={pwForm[k]} onChange={set(k)} placeholder="••••••••"/>
              </div>
            ))}
          </div>
           <button
             onClick={handleUpdatePassword}
             className="s-btn-p"
             style={{ marginTop:18 }}
            >
              Update Password
            </button>
            {pwStatus.state !== "idle" && (
             <p style={{
             marginTop: 10,
              fontSize: 12,
              color:
               pwStatus.state === "success" ? "#22c55e" :
              pwStatus.state === "error" ? "#ef4444" :
            "rgba(255,255,255,0.55)"
             }}>
             {pwStatus.msg}
             </p>
             )}
        </div>
      </Reveal>

      <Reveal delay={2}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
            <div>
              <CardTitle sub="Add an extra layer of security to your account">Two-Factor Authentication</CardTitle>
              <Badge color="#fcd34d" bg="rgba(245,158,11,0.1)" border="rgba(245,158,11,0.22)" dot="#f59e0b">Not Enabled</Badge>
            </div>
            <button className="s-btn-p">Enable 2FA</button>
          </div>
          <p style={{ fontSize:12.5, color:"rgba(255,255,255,0.4)", marginTop:16, lineHeight:1.6, maxWidth:480 }}>
            Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.
          </p>
        </div>
      </Reveal>

      <Reveal delay={3}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:12 }}>
            <CardTitle sub="Devices currently signed in to your account">Active Sessions</CardTitle>
            <button className="s-btn-d">Sign out all devices</button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {SESSIONS.map((s,i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:14, padding:"13px 16px",
                background:"rgba(255,255,255,0.028)", borderRadius:12,
                border:"1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                  {s.icon}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13.5, fontWeight:600, color:"rgba(255,255,255,0.88)", marginBottom:2 }}>{s.device}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)" }}>{s.location}</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  {i===0
                    ? <Badge color="#86efac" bg="rgba(34,197,94,0.1)" border="rgba(34,197,94,0.2)" dot="#22c55e">Current</Badge>
                    : <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{s.last}</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

// ─── Billing Tab ──────────────────────────────────────────────────────────────
function BillingTab() {
  const stClr = { Paid:{ color:"#86efac", bg:"rgba(34,197,94,0.1)", bd:"rgba(34,197,94,0.2)" } };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      <Reveal delay={1}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div>
              <CardTitle sub="Your current subscription">Current Plan</CardTitle>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <span style={{ fontSize:28, fontWeight:800, color:"#fff", letterSpacing:"-.04em" }}>$49</span>
                <span style={{ fontSize:14, color:"rgba(255,255,255,0.38)" }}>/month</span>
                <Badge color="#a5b4fc" bg="rgba(99,102,241,0.12)" border="rgba(99,102,241,0.22)">Pro Plan</Badge>
              </div>
              <p style={{ fontSize:12.5, color:"rgba(255,255,255,0.4)", lineHeight:1.55 }}>
                Unlimited simulations · AI CFO access · Priority support · 24-month data retention
              </p>
            </div>
            <button className="s-btn-p">Manage Plan</button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={2}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <CardTitle sub="This billing period usage">Usage</CardTitle>
          {USAGE_ITEMS.map(u => <UsageBar key={u.label} {...u}/>)}
        </div>
      </Reveal>

      <Reveal delay={3}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:12 }}>
            <CardTitle sub="Your saved payment method">Payment Method</CardTitle>
            <button className="s-btn-s">Update</button>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"rgba(255,255,255,0.04)", borderRadius:12, border:"1px solid rgba(255,255,255,0.09)" }}>
            <div style={{ width:42, height:28, borderRadius:6, background:"linear-gradient(135deg,#1d4ed8,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Svg size={16} color="white" sw={1.5}><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeLinecap="round" strokeLinejoin="round"/></Svg>
            </div>
            <div>
              <p style={{ fontSize:13.5, fontWeight:600, color:"rgba(255,255,255,0.88)" }}>•••• •••• •••• 4242</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>Expires 04 / 2028</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={4}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <CardTitle sub="Past invoices and receipts">Billing History</CardTitle>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Invoice","Date","Amount","Status"].map(h=>(
                  <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.3)", letterSpacing:".07em", textTransform:"uppercase", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BILLING_HIST.map((r,i)=>{
                const sc = stClr[r.status]||{color:"#94a3b8",bg:"rgba(255,255,255,0.07)",bd:"rgba(255,255,255,0.1)"};
                return (
                  <tr key={i} className="s-trow">
                    <td style={{ padding:"12px 12px", fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.75)", fontFamily:"monospace" }}>{r.inv}</td>
                    <td style={{ padding:"12px 12px", fontSize:13, color:"rgba(255,255,255,0.5)" }}>{r.date}</td>
                    <td style={{ padding:"12px 12px", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.88)" }}>{r.amount}</td>
                    <td style={{ padding:"12px 12px" }}><Badge color={sc.color} bg={sc.bg} border={sc.bd}>{r.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
const DEFAULT_NOTIFS = {
  runway:true, burn:true, budget:false,
  weekly:true, monthly:true, export:false,
  aiNew:true, aiHigh:true, aiInsight:false,
};

function NotificationsTab() {
  const [state, setState] = useState({ ...DEFAULT_NOTIFS });
  const tog = k => v => setState(p=>({...p,[k]:v}));

  const SECTIONS = [
    {
      title:"Risk Alerts", sub:"Get notified about financial risk thresholds",
      icon:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
      items:[
        { key:"runway", label:"Runway drops below threshold", desc:"Alert when runway is under 3 months" },
        { key:"burn",   label:"High burn rate detected",       desc:"Alert when burn exceeds baseline by 20%" },
        { key:"budget", label:"Budget overspending",           desc:"Alert on budget category overruns" },
      ],
    },
    {
      title:"Reports", sub:"Automated report delivery preferences",
      icon:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
      items:[
        { key:"weekly",   label:"Weekly summary email",       desc:"Every Monday at 9:00 AM" },
        { key:"monthly",  label:"Monthly finance report",     desc:"Auto-generated on the 1st" },
        { key:"export",   label:"Export completion alert",    desc:"Notify when exports are ready" },
      ],
    },
    {
      title:"AI CFO", sub:"Intelligent insight and recommendation alerts",
      icon:"M12 2a10 10 0 110 20 10 10 0 010-20z M12 16v-4 M12 8h.01",
      items:[
        { key:"aiNew",     label:"New recommendation generated",    desc:"When AI creates a new action item" },
        { key:"aiHigh",    label:"High-priority action required",   desc:"Urgent recommendations that need review" },
        { key:"aiInsight", label:"Scenario insight available",      desc:"After every simulation run" },
      ],
    },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {SECTIONS.map((sec,si) => (
        <Reveal key={sec.title} delay={si+1}>
          <div className="s-card" style={{ padding:"24px 26px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Svg size={14} color="#34d399"><path d={sec.icon} strokeLinecap="round" strokeLinejoin="round"/></Svg>
              </div>
              <div>
                <h3 style={{ fontSize:14, fontWeight:700, color:"rgba(255,255,255,0.9)", letterSpacing:"-.02em" }}>{sec.title}</h3>
                <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.35)" }}>{sec.sub}</p>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {sec.items.map((item,ii) => (
                <div key={item.key} className="s-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, padding:"14px 0" }}>
                  <div>
                    <p style={{ fontSize:13.5, fontWeight:500, color:"rgba(255,255,255,0.82)", marginBottom:2 }}>{item.label}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{item.desc}</p>
                  </div>
                  <Toggle checked={state[item.key]} onChange={tog(item.key)}/>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

// ─── Preferences Tab ──────────────────────────────────────────────────────────
function PreferencesTab({ onDeleteOpen }) {
  const [theme,    setTheme]    = useState("dark");
  const [currency, setCurrency] = useState("INR");
  const [dateF,    setDateF]    = useState("DD/MM/YYYY");
  const [compact,  setCompact]  = useState(false);
  const [landing,  setLanding]  = useState("dashboard");

  const THEMES = [
    { id:"dark",   label:"Dark",   icon:"🌙", desc:"Dark mode — default" },
    { id:"light",  label:"Light",  icon:"☀️", desc:"Light mode" },
    { id:"system", label:"System", icon:"🖥",  desc:"Match OS setting" },
  ];

  const selStyle = { fontSize:12.5, padding:"9px 12px", color:"rgba(255,255,255,0.8)", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.11)", borderRadius:10, outline:"none", fontFamily:"inherit", cursor:"pointer", transition:"border-color 0.18s" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      <Reveal delay={1}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <CardTitle sub="Choose your preferred interface theme">Appearance</CardTitle>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {THEMES.map(t => (
              <div key={t.id} className={`s-theme-opt${theme===t.id?" s-theme-sel":""}`} onClick={()=>setTheme(t.id)}>
                <span style={{ fontSize:20 }}>{t.icon}</span>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:theme===t.id?"#34d399":"rgba(255,255,255,0.82)", marginBottom:2 }}>{t.label}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={2}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <CardTitle sub="Default values used across the platform">Financial Defaults</CardTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[
              { label:"Currency", value:currency, onChange:setCurrency, options:["INR","USD","EUR","GBP","SGD"] },
              { label:"Date Format", value:dateF, onChange:setDateF, options:["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"] },
              { label:"Fiscal Year Start", value:"April", onChange:()=>{}, options:["January","April","July","October"] },
            ].map(s => (
              <div key={s.label}>
                <label style={{ fontSize:11.5, fontWeight:600, color:"rgba(255,255,255,0.38)", letterSpacing:".06em", display:"block", marginBottom:7 }}>{s.label.toUpperCase()}</label>
                <select value={s.value} onChange={e=>s.onChange(e.target.value)} style={selStyle}>
                  {s.options.map(o=><option key={o} style={{ background:"#0d1829" }}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={3}>
        <div className="s-card" style={{ padding:"24px 26px" }}>
          <CardTitle sub="Personalise your dashboard experience">Dashboard Preferences</CardTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            <div className="s-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 0" }}>
              <div>
                <p style={{ fontSize:13.5, fontWeight:500, color:"rgba(255,255,255,0.82)", marginBottom:2 }}>Default Landing Page</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>Where you land after login</p>
              </div>
              <select value={landing} onChange={e=>setLanding(e.target.value)} style={{ ...selStyle, width:150 }}>
                {["dashboard","risk-radar","simulator","ai-cfo"].map(o=><option key={o} style={{ background:"#0d1829" }}>{o}</option>)}
              </select>
            </div>
            <div className="s-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 0" }}>
              <div>
                <p style={{ fontSize:13.5, fontWeight:500, color:"rgba(255,255,255,0.82)", marginBottom:2 }}>Preferred Chart Range</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>Default time range in charts</p>
              </div>
              <select style={{ ...selStyle, width:120 }}>
                {["3 months","6 months","12 months"].map(o=><option key={o} style={{ background:"#0d1829" }}>{o}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 0" }}>
              <div>
                <p style={{ fontSize:13.5, fontWeight:500, color:"rgba(255,255,255,0.82)", marginBottom:2 }}>Compact Mode</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>Reduce spacing in the dashboard</p>
              </div>
              <Toggle checked={compact} onChange={setCompact}/>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Danger Zone */}
      <Reveal delay={4}>
        <div style={{
          borderRadius:18, padding:"24px 26px",
          background:"rgba(239,68,68,0.04)",
          border:"1px solid rgba(239,68,68,0.16)",
          boxShadow:"0 8px 32px rgba(0,0,0,0.3)",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <Svg size={15} color="#f87171"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01" strokeLinecap="round" strokeLinejoin="round"/></Svg>
            <h3 style={{ fontSize:14, fontWeight:700, color:"rgba(239,68,68,0.85)", letterSpacing:"-.02em" }}>Danger Zone</h3>
          </div>
          <p style={{ fontSize:12.5, color:"rgba(255,255,255,0.35)", marginBottom:18, lineHeight:1.6 }}>
            These actions are permanent and cannot be undone. Please proceed carefully.
          </p>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <button className="s-btn-s">
              <Svg size={13} color="rgba(255,255,255,0.65)"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3" strokeLinecap="round" strokeLinejoin="round"/></Svg>
              Export Account Data
            </button>
            <button className="s-btn-d" onClick={onDeleteOpen}>
              <Svg size={13} color="#f87171"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/></Svg>
              Delete Account
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const [modalOpen, setModalOpen] = useState(false);
  const { user, updateUser } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
const [deleteText, setDeleteText] = useState("");
const navigate = useNavigate();
const { logout } = useAuth();

const handleDeleteAccount = () => {
  // wipe local app storage (frontend demo)
  localStorage.removeItem("fm_user");
  localStorage.removeItem("fm_profile");
  localStorage.removeItem("token");
  localStorage.removeItem("fm_signup_company");
  localStorage.removeItem("fm_onboarding"); // if you used it

  logout();          // clears context user
  navigate("/login"); // or "/" depending on your app
};
  

  const [profile, setProfile] = useState(() => {
  // Hydrate from DB user first, then localStorage fallback
  if (user) {
    return {
      name:    user.fullName || "User",
      email:   user.email    || "",
      phone:   user.phone    || "",
      role:    user.role     || "Member",
      company: user.companyName || "FinMetrics",
      avatar:  user.avatar   || "",
    };
  }
  const stored = localStorage.getItem("fm_profile");
  if (stored) return JSON.parse(stored);
  return { name: "User", email: "", phone: "", role: "Member", company: "", avatar: "" };
});

useEffect(() => {
  // only hydrate profile from user if profile isn't set yet
  const stored = localStorage.getItem("fm_profile");
  if (stored) return;
  if (!user) return;

  setProfile({
    name: user.fullName || "User",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "Member",
    company: user.companyName || "FinMetrics",
    avatar: user.avatar || "",
  });
}, [user]);


useEffect(() => {
  const AVATAR_KEY = user?.avatarKey;
  if (!AVATAR_KEY) return;

  let url;

  (async () => {
    const blob = await getAvatar(AVATAR_KEY);
    if (!blob) return;

    url = URL.createObjectURL(blob);
    setProfile((prev) => ({ ...prev, avatarUrl: url }));
  })();

  // cleanup
  return () => {
    if (url) URL.revokeObjectURL(url);
  };
}, [user?.avatarKey]);


  // Inject CSS once
  useEffect(() => {
    const id = "settings-v1";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = SETTINGS_CSS;
    document.head.appendChild(el);
    return () => { try { document.head.removeChild(el); } catch {} };
  }, []); 

//   //avatar and uploding image

//     const handleAvatarUpload = (file) => {
//   if (!file) return;

//   if (!file.type.startsWith("image/")) {
//     alert("Please select an image file.");
//     return;
//   }

//   const reader = new FileReader();

//     reader.onload = () => {
//     const avatarDataUrl = reader.result;

//     setProfile((prev) => ({
//      ...prev,
//      avatar: avatarDataUrl,
//     }));

//   // ✅ update navbar user too (optional but recommended)
//     updateUser({ avatar: avatarDataUrl });
//     };

//   reader.readAsDataURL(file);
//      };

  const AVATAR_KEY = "user_avatar";

const handleAvatarUpload = async (file) => {
  if (!file) return;

  // save in IndexedDB
  await setAvatar(AVATAR_KEY, file);

  // store only the key in fm_user (tiny)
  updateUser({ avatarKey: AVATAR_KEY });

  // optional: show preview instantly
  const url = URL.createObjectURL(file);
  setProfile((prev) => ({ ...prev, avatarUrl: url }));
};

  const CONTENT = {
    account: (
  <AccountTab
    profile={profile}
    onEditOpen={() => setModalOpen(true)}
    onAvatarUpload={handleAvatarUpload}
    onDeleteOpen={() => { setDeleteText(""); setDeleteOpen(true); }}
  />
),
    company:       <CompanyTab/>,
    security:      <SecurityTab/>,
    billing:       <BillingTab/>,
    notifications: <NotificationsTab/>,
    preferences:   <PreferencesTab 
    onDeleteOpen={() => { setDeleteText(""); setDeleteOpen(true); }}/>,
  };
  

  return (
    
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#080d1a 0%,#0b0f1e 50%,#060b16 100%)",
      color:"rgba(255,255,255,0.88)",
      fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
      display:"flex",
      position:"relative",
    }}>
      {/* ── Ambient glows (fixed, behind everything) ── */}
      <div style={{ position:"fixed", top:"8%", left:"15%", width:600, height:600, background:"radial-gradient(circle,rgba(37,99,235,0.055) 0%,transparent 70%)", pointerEvents:"none", borderRadius:"50%", zIndex:0 }}/>
      <div style={{ position:"fixed", bottom:"20%", right:"10%", width:480, height:480, background:"radial-gradient(circle,rgba(52,211,153,0.04) 0%,transparent 70%)", pointerEvents:"none", borderRadius:"50%", zIndex:0 }}/>

      {/* ════════════════════════════════════════
          SIDEBAR — flush left, full height, sticky
          ════════════════════════════════════════ */}

    <div style={{
      width: "100%",
      //maxWidth: 1400,
      margin: "0 auto",
      padding: "0 clamp(24px, 4vw, 72px)",
     position: "relative",
     zIndex: 1,
    }}>
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{
        width:280, flexShrink:0,
        minHeight:"100vh",
        position:"sticky", top:0,
        height:"100vh", overflowY:"auto",
        background:"rgba(255,255,255,0.022)",
        backdropFilter:"blur(24px)",
        WebkitBackdropFilter:"blur(24px)",
        borderRight:"1px solid rgba(255,255,255,0.075)",
        boxShadow:"1px 0 0 rgba(255,255,255,0.03)",
        zIndex:10,
        display:"flex", flexDirection:"column",
      }} className="settings-sidebar">

        {/* Sidebar header */}
        <div style={{
          padding:"28px 20px 16px",
          borderBottom:"1px solid rgba(255,255,255,0.065)",
          flexShrink:0,
        }}>
          <p style={{ fontSize:10.5, fontWeight:700, color:"rgba(255,255,255,0.28)", letterSpacing:".12em", textTransform:"uppercase", marginBottom:14 }}>
            Settings
          </p>
          {/* User mini card */}
          <div style={{
            padding:"11px 13px", borderRadius:12,
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.08)",
            display:"flex", alignItems:"center", gap:10,
          }}>
            <div style={{
              width:34, height:34, borderRadius:"50%", flexShrink:0,
              background:"linear-gradient(135deg,#2563eb,#7c3aed)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight:800, color:"#fff",
              boxShadow:"0 0 0 2px rgba(59,130,246,0.24)",
            }}>
              {profile.name.split(" ").map(w=>w[0]).join("").toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.88)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile.name}</p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile.role} · {profile.company}</p>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav style={{ padding:"12px 12px", flex:1 }}>
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              className={`s-tab${activeTab===tab.id?" s-tab-active":""}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ marginBottom:2 }}
            >
              <span className="s-tab-icon">
                <Svg size={15} color={activeTab===tab.id?"#34d399":"currentColor"}>
                  {tab.icon}
                </Svg>
              </span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div style={{
          padding:"16px 20px",
          borderTop:"1px solid rgba(255,255,255,0.06)",
          flexShrink:0,
        }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.2)", lineHeight:1.55 }}>
            FinMetrics Pro · v2.4.1
          </p>
          <p style={{ fontSize:10.5, color:"rgba(255,255,255,0.15)", marginTop:2 }}>
            © 2026 FinMetrics Labs
          </p>
        </div>
      </aside>



      {/* ════════════════════════════════════════
          MAIN CONTENT — flex-1, scrollable
          ════════════════════════════════════════ */}
      <section style={{
        flex:1, minWidth:0,
        minHeight:"100vh",
        overflowY:"auto",
        position:"relative", zIndex:1,
      }}>
        <div style={{ padding:"32px 36px 72px",  maxWidth:1460, width:"100%" }}>

          {/* ── Page Header ── */}
          <Reveal delay={1}>
            <div style={{ marginBottom:28 }}>
              {/* Breadcrumb */}
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", cursor:"pointer", transition:"color 0.18s" }}
                  onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.62)"}
                  onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>
                  
                </span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.18)" }}></span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:500 }}>Settings</span>
              </div>
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
                <div>
                  <h1 style={{ fontSize:24, fontWeight:800, color:"rgba(255,255,255,0.96)", letterSpacing:"-.04em", lineHeight:1, marginBottom:5 }}>
                    {NAV_TABS.find(t=>t.id===activeTab)?.label || "Settings"}
                  </h1>
                  <p style={{ fontSize:13.5, color:"rgba(255,255,255,0.38)", lineHeight:1.5 }}>
                    Manage your account, company, security, and preferences.
                  </p>
                </div>
              </div>
              {/* Subtle divider */}
              <div style={{ marginTop:20, height:1, background:"linear-gradient(90deg,rgba(255,255,255,0.08) 0%,transparent 100%)" }}/>
            </div>
          </Reveal>

          {/* ── Active tab content ── */}
          <div key={activeTab}>
            {CONTENT[activeTab]}
          </div>
        </div>
      </section>
      </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      {modalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setModalOpen(false)}
                             
        onSave={(form) => {
       // 1) update settings page profile state
        setProfile((p) => ({ ...p, ...form }));

       // 2) update Auth user (Navbar reads this)
     updateUser({
         fullName: form.name,
         email: form.email,
        role: form.role,
        phone: form.phone,
        avatar: form.avatar || profile.avatar,
        company: form.company, // optional if you have it
        });

        setModalOpen(false);
        }}
        />
      )}
      {deleteOpen && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 18,
    }}
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) setDeleteOpen(false);
    }}
  >
    <div
      className="s-card"
      style={{ width: "100%", maxWidth: 520, padding: 18, borderRadius: 18 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#fca5a5" }}>Delete Account</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", marginTop: 2 }}>
            This will remove local demo data. Type <b>DELETE</b> to confirm.
          </p>
        </div>
        <button className="s-btn-g" onClick={() => setDeleteOpen(false)}>Close</button>
      </div>

      <input
        className="s-input"
        value={deleteText}
        onChange={(e) => setDeleteText(e.target.value)}
        placeholder='Type DELETE'
        style={{ borderColor: "rgba(239,68,68,0.25)" }}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
        <button className="s-btn-g" onClick={() => setDeleteOpen(false)}>Cancel</button>
        <button
          className="s-btn-d"
          disabled={deleteText !== "DELETE"}
          onClick={() => {
            setDeleteOpen(false);
            handleDeleteAccount();
          }}
          style={{
            opacity: deleteText === "DELETE" ? 1 : 0.5,
            cursor: deleteText === "DELETE" ? "pointer" : "not-allowed",
          }}
        >
          Confirm Delete
        </button>
      </div>
    </div>
  </div>
)}

      {/* ── Responsive overrides ── */}
      <style>{`
        /* Tablet: sidebar narrows */
        @media (max-width:1024px) {
          .settings-sidebar { width:240px!important; }
        }
        /* Mobile: sidebar collapses to top horizontal strip */
        @media (max-width:768px) {
          .settings-sidebar {
            position:fixed!important; top:auto!important; bottom:0!important;
            left:0!important; right:0!important;
            width:100%!important; height:auto!important;
            min-height:unset!important;
            flex-direction:row!important;
            border-right:none!important;
            border-top:1px solid rgba(255,255,255,0.08)!important;
            overflow-x:auto!important; overflow-y:hidden!important;
            padding:0!important; z-index:50!important;
          }
          .settings-sidebar > :first-child { display:none!important; }
          .settings-sidebar > :last-child  { display:none!important; }
          .settings-sidebar > nav {
            display:flex!important; flex-direction:row!important;
            padding:8px 12px!important; gap:4px!important; flex:1!important;
          }
          .s-tab { flex-direction:column!important; gap:4px!important;
            padding:8px 12px!important; border-radius:10px!important;
            font-size:10px!important; min-width:60px!important; justify-content:center!important;
            align-items:center!important; }
          .s-tab-icon { opacity:1!important; }
          section { padding-bottom:90px!important; }
          section > div { padding:20px 16px 24px!important; }
        }
      `}</style>
    </div>
  );
}