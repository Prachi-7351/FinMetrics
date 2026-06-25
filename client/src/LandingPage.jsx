// import { Link } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";


import { useState, useEffect, useRef, useCallback } from "react";
///*body { background: #05090f; font-family: 'Inter', ui-sans-serif, system-ui, "SF PRo-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #fff; overflow-x: hidden; }*/
/* ── GLOBAL STYLES ─────────────────────────────────────────────────────────── */
const GlobalStyles = () => (
    <style>{`
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    :root{
       --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
       --font-display: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    }
    body{
    font-family: var(--font-sans);
    }

    body {
    background: #05090f;
    font-family: ' "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",  Roboto, Arial, sans-serif';
    color: #fff;
    }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #05090f; }
    ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #2563eb; }

    input[type=range] { -webkit-appearance: none; width: 100%; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; outline: none; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #3b82f6; cursor: pointer; box-shadow: 0 0 8px rgba(59,130,246,0.6); }

    @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
    @keyframes floatSlow { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
    @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes heatPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes tabEnter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .floating { animation: float 5s ease-in-out infinite; }
    .floating-slow { animation: floatSlow 7s ease-in-out infinite; }
    .dropdown-enter { animation: fadeSlideDown 0.22s ease-out forwards; }
    .tab-panel-enter { animation: tabEnter 0.35s ease-out forwards; }

    .hero-grid {
      background-image:
        linear-gradient(rgba(96,165,250,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(96,165,250,0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 100%);
    }

    .glass-card {
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .glass-hover {
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }
    .glass-hover:hover {
      transform: translateY(-3px);
      box-shadow: 0 18px 44px rgba(0,0,0,0.55), 0 0 0 1px rgba(59,130,246,0.14);
      border-color: rgba(255,255,255,0.12) !important;
    }

    .nav-link {
      position: relative; color: #9CA3AF; font-size: 14px; font-weight: 500;
      transition: color 0.2s ease; padding: 6px 12px; cursor: pointer;
      background: none; border: none; outline: none; border-radius: 8px;
      font-family: 'Inter', sans-serif;
    }
    .nav-link::after {
      content: ''; position: absolute; bottom: 2px; left: 12px; right: 12px;
      height: 1px; background: #3b82f6; transform: scaleX(0); transform-origin: center;
      transition: transform 0.25s ease;
    }
    .nav-link:hover { color: #fff; background: rgba(255,255,255,0.04); }
    .nav-link:hover::after { transform: scaleX(1); }
    .nav-link:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }

    .btn-login {
      background: #F3F4F6; color: #111827; border: none; border-radius: 10px;
      padding: 8px 18px; font-size: 13px; font-weight: 600; cursor: pointer;
      transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
      font-family: 'Inter', sans-serif; letter-spacing: -0.01em;
    }
    .btn-login:hover { background: #E5E7EB; transform: scale(1.03); box-shadow: 0 4px 16px rgba(0,0,0,0.25); }
    .btn-login:active { transform: scale(0.97); }

    .btn-primary {
      background: #2563eb; color: #fff; border: none; border-radius: 10px;
      padding: 11px 24px; font-size: 14px; font-weight: 600; cursor: pointer;
      transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
      font-family: 'Inter', sans-serif; letter-spacing: -0.01em;
    }
    .btn-primary:hover { background: #1d4ed8; transform: scale(1.02); box-shadow: 0 0 22px rgba(37,99,235,0.5); }
    .btn-primary:active { transform: scale(0.98); }

    .btn-secondary {
      background: transparent; color: #94A3B8; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; padding: 11px 24px; font-size: 14px; font-weight: 500; cursor: pointer;
      transition: all 0.2s ease; font-family: 'Inter', sans-serif;
    }
    .btn-secondary:hover { color: #fff; border-color: rgba(59,130,246,0.4); background: rgba(59,130,246,0.07); transform: scale(1.02); }

    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
  `}</style>
);


/* ── UTILS ─────────────────────────────────────────────────────────────────── */
function useInView(opts = {}) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold: 0.12, ...opts }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return [ref, inView];
}

function FadeIn({ children, delay = 0, className = "" }) {
    const [ref, inView] = useInView();
    return (
        <div ref={ref} className={className} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms` }}>
            {children}
        </div>
    );
}

function CountUp({ target, duration = 1600, decimals = 0, suffix = "" }) {
    const [val, setVal] = useState(0);
    const [ref, inView] = useInView();
    useEffect(() => {
        if (!inView) return;
        let start = null;
        const step = (ts) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(+(ease * target).toFixed(decimals));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [inView, target, duration, decimals]);
    return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>;
}

function Eyebrow({ children }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#60a5fa", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", padding: "4px 12px", borderRadius: 999 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", animation: "blink 2s ease-in-out infinite" }} />
            {children}
        </span>
    );
}

function SectionDivider() {
    return (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
            <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(59,130,246,0.18),transparent)" }} />
        </div>
    );
}

function ScrollProgressBar() {
    const [p, setP] = useState(0);
    useEffect(() => {
        const fn = () => { const el = document.documentElement; setP((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100); };
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);
    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, height: 2, background: "transparent" }}>
            <div style={{ height: "100%", width: `${p}%`, background: "linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa)", transition: "width 0.1s linear" }} />
        </div>
    );
}

/* ── NAVBAR ────────────────────────────────────────────────────────────────── */
function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [featOpen, setFeatOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const dropRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);

    useEffect(() => {
        const click = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setFeatOpen(false); };
        const esc = (e) => { if (e.key === "Escape") setFeatOpen(false); };
        document.addEventListener("mousedown", click);
        document.addEventListener("keydown", esc);
        return () => { document.removeEventListener("mousedown", click); document.removeEventListener("keydown", esc); };
    }, []);

    const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMobileOpen(false); setFeatOpen(false); };

    const feats = [
        { name: "AI CFO Engine", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", desc: "Recommendations based on burn rate & runway." },
        { name: "Stress Testing", icon: "M13 10V3L4 14h7v7l9-11h-7z", desc: "Simulate shocks before they happen." },
        { name: "Risk Radar", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", desc: "Dynamic scoring across key financial metrics." },
    ];

    return (
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}>
            <div style={{ position: "absolute", inset: 0, background: scrolled ? "rgba(5,9,15,0.94)" : "rgba(5,9,15,0.72)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(255,255,255,0.04)", boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.5)" : "none", transition: "all 0.4s ease" }} />

            <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: scrolled ? "10px 32px" : "15px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "padding 0.3s ease" }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 18px rgba(37,99,235,0.55)", transition: "box-shadow 0.2s ease" }}>
                        <svg viewBox="0 0 24 24" fill="none" width={18} height={18}><path d="M3 17l4-8 4 4 4-6 4 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 19, color: "#fff", letterSpacing: "-0.03em" }}>FinMetrics</span>
                </div>

                {/* Desktop nav */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="desk-nav">
                    {/* Features dropdown */}
                    <div ref={dropRef} style={{ position: "relative" }}>
                        <button className="nav-link" onClick={() => setFeatOpen(v => !v)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            Features
                            <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="currentColor" strokeWidth={2.5} style={{ transition: "transform 0.2s", transform: featOpen ? "rotate(180deg)" : "rotate(0)" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {featOpen && (
                            <div className="dropdown-enter" style={{ position: "absolute", top: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)", width: 460, borderRadius: 18, background: "rgba(8,14,30,0.98)", backdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 28px 64px rgba(0,0,0,0.75)", padding: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                                {feats.map(f => (
                                    <button key={f.name} onClick={() => { scrollTo("features"); setFeatOpen(false); }}
                                        style={{ padding: "12px 10px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.12)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.22)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                                            <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="#60a5fa" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
                                        </div>
                                        <p style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{f.name}</p>
                                        <p style={{ color: "#4B5563", fontSize: 11, lineHeight: 1.5 }}>{f.desc}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {[{ label: "How It Works", id: "how-it-works" }, { label: "Contact", id: "contact" }].map(item => (
                        <button key={item.id} className="nav-link" onClick={() => scrollTo(item.id)}>{item.label}</button>
                    ))}




                    <button
                        className="btn-login"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>
                </div>

                {/* Mobile hamburger */}
                <button onClick={() => setMobileOpen(v => !v)} style={{ display: "none", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, cursor: "pointer", color: "#9CA3AF", padding: "6px 8px", transition: "all 0.2s" }} className="mob-btn"
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#9CA3AF"; }}>
                    <svg viewBox="0 0 24 24" fill="none" width={20} height={20} stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div style={{ position: "relative", background: "rgba(5,9,15,0.98)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px 22px", display: "flex", flexDirection: "column", gap: 4 }}>
                    {["features", "how-it-works", "contact"].map(id => (
                        <button key={id} onClick={() => scrollTo(id)} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 14, fontWeight: 500, cursor: "pointer", textAlign: "left", padding: "10px 12px", borderRadius: 8, transition: "all 0.2s", fontFamily: "'Inter',sans-serif" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "#9CA3AF"; e.currentTarget.style.background = "none"; }}>
                            {id === "how-it-works" ? "How It Works" : id.charAt(0).toUpperCase() + id.slice(1)}
                        </button>
                    ))}
                    <div style={{ marginTop: 8 }}><div style={{ marginTop: 8 }}>
                        <button
                            className="btn-login"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                    </div></div>
                </div>
            )}

            <style>{`
        @media (max-width: 768px) { .desk-nav { display: none !important; } .mob-btn { display: flex !important; } }
      `}</style>
        </nav>
    );
}

/* ── HERO CHART ────────────────────────────────────────────────────────────── */
function MiniLineChart({ inView }) {
    const [offset, setOffset] = useState(300);
    useEffect(() => {
        if (!inView) return;
        let s = null;
        const step = (ts) => { if (!s) s = ts; const p = Math.min((ts - s) / 1400, 1); setOffset(300 * (1 - (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
    }, [inView]);
    const pts = [[0, 55], [30, 48], [60, 52], [90, 40], [120, 45], [150, 32], [180, 38], [210, 24], [240, 30], [270, 18], [300, 22]];
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
    return (
        <svg viewBox="0 0 300 70" style={{ width: "100%", height: 52 }} preserveAspectRatio="none">
            <defs>
                <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#1d4ed8" /><stop offset="100%" stopColor="#60a5fa" /></linearGradient>
                <linearGradient id="fg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient>
            </defs>
            <path d={d + " L300,70 L0,70 Z"} fill="url(#fg)" />
            <path d={d} fill="none" stroke="url(#cg)" strokeWidth="2" strokeDasharray="300" strokeDashoffset={offset} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ── HERO DASHBOARD ────────────────────────────────────────────────────────── */
function HeroDashboard() {
    const [ref, inView] = useInView();
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const onMove = useCallback((e) => { const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 6, y: ((e.clientY - r.top) / r.height - 0.5) * -6 }); }, []);

    return (
        <div ref={ref} style={{ position: "relative" }} onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
            <div style={{ position: "absolute", inset: -50, background: "radial-gradient(ellipse at center,rgba(37,99,235,0.14) 0%,transparent 70%)", pointerEvents: "none", borderRadius: "50%" }} />
            <div style={{ opacity: inView ? 1 : 0, transform: inView ? `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` : "perspective(900px) translateY(24px)", transition: "opacity 0.7s ease, transform 0.15s ease" }}>
                <div className="glass-card floating" style={{ borderRadius: 22, padding: 20 }}>
                    {/* Top bar */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <span style={{ color: "#6B7280", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Financial Overview</span>
                        <div style={{ display: "flex", gap: 5 }}>
                            {["rgba(239,68,68,0.5)", "rgba(234,179,8,0.5)", "rgba(34,197,94,0.5)"].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                        </div>
                    </div>
                    {/* Metrics */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 13, padding: "12px 14px" }}>
                            <p style={{ color: "#6B7280", fontSize: 11, marginBottom: 4 }}>Runway</p>
                            <p style={{ color: "#fff", fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>{inView ? <CountUp target={5.2} duration={1200} decimals={1} suffix=" mo" /> : "—"}</p>
                            <p style={{ color: "#3b82f6", fontSize: 11, marginTop: 4 }}>▼ 0.3 vs last month</p>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 13, padding: "12px 14px" }}>
                            <p style={{ color: "#6B7280", fontSize: 11, marginBottom: 4 }}>Risk Score</p>
                            <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
                                <p style={{ color: "#fff", fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>{inView ? <CountUp target={72} duration={1600} /> : "—"}</p>
                                <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 2 }}>/100</p>
                            </div>
                            <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                                <div style={{ height: "100%", width: inView ? "72%" : "0%", borderRadius: 2, background: "linear-gradient(90deg,#1d4ed8,#60a5fa)", transition: "width 1.6s ease-out" }} />
                            </div>
                        </div>
                    </div>
                    {/* Chart */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 13, padding: "12px 14px", marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ color: "#6B7280", fontSize: 11 }}>Burn Rate — 11 months</span>
                            <span style={{ color: "#3b82f6", fontSize: 11 }}>↓ 18% MoM</span>
                        </div>
                        <MiniLineChart inView={inView} />
                    </div>
                    {/* Recommendation */}
                    <div style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.12),rgba(29,78,216,0.06))", border: "1px solid rgba(59,130,246,0.18)", borderRadius: 13, padding: "12px 14px", display: "flex", gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg viewBox="0 0 24 24" fill="none" width={14} height={14} stroke="#60a5fa" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p style={{ color: "#93c5fd", fontSize: 11, fontWeight: 600, marginBottom: 3 }}>Top Recommendation</p>
                            <p style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.5 }}>Reduce discretionary spend by 12% → extend runway by 1.8 months.</p>
                        </div>
                    </div>
                </div>
                {/* Floating badges */}
                <div className="glass-card floating-slow" style={{ position: "absolute", top: -14, right: -22, borderRadius: 12, padding: "8px 14px", opacity: inView ? 1 : 0, transition: "opacity 0.7s ease 0.4s" }}>
                    <p style={{ color: "#6B7280", fontSize: 10 }}>Liquidity</p>
                    <p style={{ color: "#60a5fa", fontSize: 14, fontWeight: 700 }}>68 <span style={{ color: "#6B7280", fontSize: 11, fontWeight: 400 }}>/100</span></p>
                </div>
                <div className="glass-card floating" style={{ position: "absolute", bottom: -14, left: -22, borderRadius: 12, padding: "8px 14px", opacity: inView ? 1 : 0, transition: "opacity 0.7s ease 0.6s", animationDelay: "1.5s" }}>
                    <p style={{ color: "#6B7280", fontSize: 10 }}>Debt Exposure</p>
                    <p style={{ color: "#34d399", fontSize: 14, fontWeight: 700 }}>82 <span style={{ color: "#6B7280", fontSize: 11, fontWeight: 400 }}>/100</span></p>
                </div>
            </div>
        </div>
    );
}

/* ── HERO SECTION ──────────────────────────────────────────────────────────── */
function Hero() {
    const [email, setEmail] = useState("");
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    return (
        <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 96, paddingBottom: 80, overflow: "hidden" }}>
            {/* Grid — very subtle, faded radially */}
            <div className="hero-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
            {/* Ambient glows */}
            <div style={{ position: "absolute", top: "20%", left: "15%", width: 580, height: 580, background: "radial-gradient(circle,rgba(37,99,235,0.08) 0%,transparent 70%)", pointerEvents: "none", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: "10%", right: "8%", width: 420, height: 420, background: "radial-gradient(circle,rgba(29,78,216,0.06) 0%,transparent 70%)", pointerEvents: "none", borderRadius: "50%" }} />
            {/* Sparkles */}
            {[{ top: "14%", left: "8%", sz: 16 }, { top: "22%", right: "6%", sz: 12 }, { bottom: "28%", left: "4%", sz: 10 }, { top: "58%", right: "12%", sz: 14 }].map((s, i) => (
                <div key={i} style={{ position: "absolute", ...s, opacity: 0.2, pointerEvents: "none" }}>
                    <svg viewBox="0 0 24 24" width={s.sz} height={s.sz} fill="none">
                        <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
            ))}

            <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "0 32px", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
                {/* Left */}
                <div>
                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(37,99,235,0.12)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa", fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 999, marginBottom: 28 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", animation: "blink 2s ease-in-out infinite" }} />
                            AI-Powered Financial Intelligence
                        </span>
                    </div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(38px,5.5vw,68px)", lineHeight: 1.04, letterSpacing: "-0.04em", color: "#fff", marginBottom: 24, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.65s ease 0.1s" }}>
                        Know Your<br />
                        <span style={{ background: "linear-gradient(135deg,#60a5fa,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Financial Risk</span><br />
                        Before It Becomes<br />a Crisis.
                    </h1>
                    <p style={{ color: "#9CA3AF", fontSize: 17, lineHeight: 1.7, maxWidth: 480, marginBottom: 36, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.65s ease 0.2s" }}>
                        FinMetrics provides AI-powered financial intelligence — combining real-time risk monitoring, scenario simulations, and actionable CFO-level recommendations.
                    </p>
                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.65s ease 0.3s" }}>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                            <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
                                <svg viewBox="0 0 24 24" fill="none" width={15} height={15} stroke="#6B7280" strokeWidth={2} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)}
                                    style={{ width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", fontFamily: "'Inter',sans-serif", transition: "border-color 0.2s, box-shadow 0.2s" }}
                                    onFocus={e => { e.target.style.borderColor = "rgba(59,130,246,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                                />
                            </div>
                            <button
                                className="btn-primary"
                                onClick={() => navigate("/register")}
                            >
                                Sign Up
                            </button>
                        </div>
                        <p style={{ color: "#6B7280", fontSize: 12 }}>Built for founders, operators, and finance teams who need clarity before making decisions.</p>
                    </div>
                </div>
                {/* Right */}
                <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateX(0)" : "translateX(24px)", transition: "all 0.7s ease 0.35s" }}>
                    <HeroDashboard />
                </div>
            </div>
            <style>{`@media(max-width:900px){section>div[style*="grid-template-columns"]{grid-template-columns:1fr!important;gap:48px!important;}}`}</style>
        </section>
    );
}

/* ── TABBED FEATURES ───────────────────────────────────────────────────────── */
function PanelAICFO({ visible }) {
    const [ref, inView] = useInView();
    return (
        <div ref={ref} className={visible ? "tab-panel-enter" : ""} style={{ display: visible ? "block" : "none" }}>
            <div className="glass-card floating-slow" style={{ borderRadius: 22, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <span style={{ color: "#6B7280", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>AI CFO Engine</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#34d399", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 999, padding: "3px 10px" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", animation: "blink 1.5s infinite" }} />Live
                    </span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 13, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#9CA3AF", fontSize: 13 }}>Runway Remaining</span>
                    <span style={{ color: "#fff", fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>{inView && visible ? <CountUp target={5.2} decimals={1} duration={1200} suffix=" mo" /> : "5.2 mo"}</span>
                </div>
                <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 13, padding: "12px 14px", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
                        <span style={{ color: "#fca5a5", fontSize: 11, fontWeight: 600 }}>Risk Alert</span>
                    </div>
                    <p style={{ color: "#94A3B8", fontSize: 12 }}>Burn rate <span style={{ color: "#fca5a5", fontWeight: 600 }}>+18%</span> in last 60 days</p>
                </div>
                <div style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: 13, padding: "12px 14px", marginBottom: 10 }}>
                    <p style={{ color: "#6B7280", fontSize: 11, marginBottom: 4 }}>Suggested Action</p>
                    <p style={{ color: "#e0e7ff", fontSize: 13, fontWeight: 500 }}>Reduce discretionary spend by <span style={{ color: "#60a5fa", fontWeight: 700 }}>12%</span></p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 13, padding: "12px 14px" }}>
                        <p style={{ color: "#6B7280", fontSize: 11, marginBottom: 4 }}>Est. Impact</p>
                        <p style={{ color: "#34d399", fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)" }}>+1.8<span style={{ fontSize: 13, fontWeight: 400, color: "#6B7280" }}> mo</span></p>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 13, padding: "12px 14px" }}>
                        <p style={{ color: "#6B7280", fontSize: 11, marginBottom: 4 }}>Confidence</p>
                        <p style={{ color: "#60a5fa", fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)" }}>84<span style={{ fontSize: 13, fontWeight: 400, color: "#6B7280" }}>%</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PanelStress({ visible }) {
    const [revenue, setRevenue] = useState(-25);
    const [expense, setExpense] = useState(12);
    const runway = Math.max(0, 5.2 + (revenue / 100) * 3 - (expense / 100) * 1.5).toFixed(1);
    const risk = runway > 4 ? { label: "Moderate", color: "#facc15", bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.22)" }
        : runway > 2.5 ? { label: "High", color: "#fb923c", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.22)" }
            : { label: "Critical", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.22)" };
    const pts = [[0, 55], [60, 50], [120, 44], [180, 36 + Number(runway) * 1.5], [240, 28 + Number(runway) * 2], [300, 22 + Number(runway) * 2.5]];
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${Math.min(p[1], 65)}`).join(" ");

    return (
        <div className={visible ? "tab-panel-enter" : ""} style={{ display: visible ? "block" : "none" }}>
            <div className="glass-card floating-slow" style={{ borderRadius: 22, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <span style={{ color: "#6B7280", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Scenario Simulator</span>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 999, border: `1px solid ${risk.border}`, background: risk.bg, color: risk.color, transition: "all 0.3s ease" }}>{risk.label} Risk</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 13, padding: "14px 16px", marginBottom: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ color: "#9CA3AF", fontSize: 12 }}>Revenue Drop</span>
                                <span style={{ color: "#f87171", fontSize: 12, fontWeight: 700 }}>{revenue}%</span>
                            </div>
                            <input type="range" min={-60} max={0} value={revenue} onChange={e => setRevenue(Number(e.target.value))} />
                        </div>
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ color: "#9CA3AF", fontSize: 12 }}>Expense Increase</span>
                                <span style={{ color: "#fb923c", fontSize: 12, fontWeight: 700 }}>+{expense}%</span>
                            </div>
                            <input type="range" min={0} max={50} value={expense} onChange={e => setExpense(Number(e.target.value))} />
                        </div>
                    </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 13, padding: "10px 14px", marginBottom: 12 }}>
                    <svg viewBox="0 0 300 70" style={{ width: "100%", height: 46 }} preserveAspectRatio="none">
                        <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#1d4ed8" /><stop offset="100%" stopColor="#60a5fa" /></linearGradient></defs>
                        <path d={d + " L300,70 L0,70 Z"} fill="rgba(37,99,235,0.08)" />
                        <path d={d} fill="none" stroke="url(#sg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 13, padding: "12px 14px" }}>
                        <p style={{ color: "#6B7280", fontSize: 11, marginBottom: 4 }}>Revised Runway</p>
                        <p style={{ color: "#fff", fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)" }}>{runway}<span style={{ fontSize: 13, color: "#6B7280", fontWeight: 400 }}> mo</span></p>
                    </div>
                    <div style={{ background: risk.bg, border: `1px solid ${risk.border}`, borderRadius: 13, padding: "12px 14px", transition: "all 0.3s ease" }}>
                        <p style={{ color: "#6B7280", fontSize: 11, marginBottom: 4 }}>Risk Level</p>
                        <p style={{ color: risk.color, fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", transition: "color 0.3s ease" }}>{risk.label}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PanelRiskRadar({ visible }) {
    const [timeframe, setTimeframe] = useState("30D");
    const [tooltip, setTooltip] = useState(null);
    const [ref, inView] = useInView();
    const r = 38; const circ = 2 * Math.PI * r;
    const cells = [
        { label: "Liquidity", val: 0.68, color: "rgba(251,146,60,0.75)" },
        { label: "Revenue", val: 0.74, color: "rgba(59,130,246,0.7)" },
        { label: "Expenses", val: 0.61, color: "rgba(248,113,113,0.7)" },
        { label: "Debt", val: 0.82, color: "rgba(34,197,94,0.7)" },
        { label: "Margins", val: 0.55, color: "rgba(251,146,60,0.7)" },
        { label: "Capital", val: 0.78, color: "rgba(96,165,250,0.65)" },
        { label: "Cash", val: 0.65, color: "rgba(248,113,113,0.65)" },
        { label: "Overall", val: 0.72, color: "rgba(59,130,246,0.85)" },
    ];
    const trendPts = timeframe === "7D" ? [[0, 45], [50, 40], [100, 48], [150, 36], [200, 42], [250, 30], [300, 34]] : [[0, 55], [50, 48], [100, 52], [150, 42], [200, 46], [250, 35], [300, 38]];
    const trendD = trendPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");

    return (
        <div ref={ref} className={visible ? "tab-panel-enter" : ""} style={{ display: visible ? "block" : "none" }}>
            <div className="glass-card floating-slow" style={{ borderRadius: 22, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <span style={{ color: "#6B7280", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Risk Radar</span>
                    <div style={{ display: "flex", gap: 4 }}>
                        {["7D", "30D"].map(t => (
                            <button key={t} onClick={() => setTimeframe(t)}
                                style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 8, cursor: "pointer", transition: "all 0.2s", border: `1px solid ${timeframe === t ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.07)"}`, background: timeframe === t ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.03)", color: timeframe === t ? "#60a5fa" : "#6B7280", fontFamily: "'Inter',sans-serif" }}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, marginBottom: 14, alignItems: "center" }}>
                    <div style={{ position: "relative", width: 96, height: 96 }}>
                        <svg viewBox="0 0 100 100" width={96} height={96}>
                            <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={7} />
                            <circle cx={50} cy={50} r={r} fill="none" stroke="#3b82f6" strokeWidth={7} strokeLinecap="round"
                                strokeDasharray={circ} strokeDashoffset={inView && visible ? circ * (1 - 0.72) : circ}
                                transform="rotate(-90 50 50)"
                                style={{ transition: "stroke-dashoffset 1.4s ease-out", filter: "drop-shadow(0 0 6px rgba(59,130,246,0.6))" }} />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#fff", fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1 }}>72</span>
                            <span style={{ color: "#6B7280", fontSize: 10 }}>/100</span>
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4 }}>
                        {cells.map((c, i) => (
                            <div key={i} style={{ position: "relative" }} onMouseEnter={() => setTooltip(i)} onMouseLeave={() => setTooltip(null)}>
                                <div style={{ height: 26, borderRadius: 6, background: c.color, cursor: "pointer", animation: `heatPulse ${1.5 + i * 0.2}s ease-in-out infinite`, transition: "transform 0.15s ease", transform: tooltip === i ? "scale(1.07)" : "scale(1)" }} />
                                {tooltip === i && (
                                    <div style={{ position: "absolute", bottom: "115%", left: "50%", transform: "translateX(-50%)", background: "rgba(8,14,30,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 10px", whiteSpace: "nowrap", zIndex: 10, fontSize: 11, color: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", pointerEvents: "none" }}>
                                        {c.label}: {Math.round(c.val * 100)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 13, padding: "10px 14px", marginBottom: 12 }}>
                    <p style={{ color: "#6B7280", fontSize: 11, marginBottom: 6 }}>Risk Trend — {timeframe}</p>
                    <svg viewBox="0 0 300 60" style={{ width: "100%", height: 42 }} preserveAspectRatio="none">
                        <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#1d4ed8" /><stop offset="100%" stopColor="#60a5fa" /></linearGradient></defs>
                        <path d={trendD + " L300,60 L0,60 Z"} fill="rgba(37,99,235,0.07)" style={{ transition: "d 0.4s ease" }} />
                        <path d={trendD} fill="none" stroke="url(#rg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "d 0.4s ease" }} />
                    </svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {[{ label: "Liquidity Score", val: 68, w: "68%" }, { label: "Revenue Stability", val: 74, w: "74%" }, { label: "Expense Control", val: 61, w: "61%" }].map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ color: "#9CA3AF", fontSize: 11, width: 118, flexShrink: 0 }}>{item.label}</span>
                            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                                <div style={{ height: "100%", width: inView && visible ? item.w : "0%", background: "linear-gradient(90deg,#1d4ed8,#60a5fa)", borderRadius: 2, transition: `width 1.2s ease-out ${i * 0.15}s` }} />
                            </div>
                            <span style={{ color: "#fff", fontSize: 11, fontWeight: 600, width: 22, textAlign: "right" }}>{item.val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const TABS = [
    {
        id: "cfo", label: "AI CFO Engine", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
        micro: "CFO-level recommendations. Explained.", liner: "Detect runway risk and get actions with impact estimates.",
        bullets: ["Prioritized actions based on burn rate + runway", "Impact estimate (months of runway gained)", "Explainable reasoning (why this matters)"]
    },
    {
        id: "stress", label: "Stress Testing", icon: "M13 10V3L4 14h7v7l9-11h-7z",
        micro: "Simulate shocks before they happen.", liner: "Model revenue drops and expense spikes instantly.",
        bullets: ["Revenue drop + expense increase sliders", "Runway projection updates live", "Risk level changes (green / yellow / red)"]
    },
    {
        id: "radar", label: "Risk Radar", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
        micro: "Always-on financial monitoring.", liner: "Continuous risk scoring across core financial dimensions.",
        bullets: ["Liquidity + volatility + expense control scoring", "Trend over time (7D / 30D toggle)", "Alerts when thresholds break"]
    },
];

function TabbedFeatures() {
    const [active, setActive] = useState(0);

    const handleKey = (e, i) => {
        if (e.key === "ArrowRight") { e.preventDefault(); setActive(p => Math.min(p + 1, TABS.length - 1)); }
        if (e.key === "ArrowLeft") { e.preventDefault(); setActive(p => Math.max(p - 1, 0)); }
    };

    return (
        <section id="features" style={{ position: "relative", padding: "120px 0", overflow: "hidden" }}>
            {/* Background grid */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(96,165,250,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,0.022) 1px,transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 70% 80% at 50% 50%,black 10%,transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 50% 50%,black 10%,transparent 100%)" }} />
            <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 800, height: 800, background: "radial-gradient(ellipse at center,rgba(37,99,235,0.05) 0%,transparent 70%)", pointerEvents: "none", borderRadius: "50%" }} />

            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 64 }}>
                    <FadeIn><Eyebrow>Product Features</Eyebrow></FadeIn>
                    <FadeIn delay={80}>
                        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(32px,4vw,52px)", color: "#fff", marginTop: 20, marginBottom: 14, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                            Everything You Need to<br /><span style={{ background: "linear-gradient(135deg,#60a5fa,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Stay Ahead of Risk.</span>
                        </h2>
                    </FadeIn>
                    <FadeIn delay={160}>
                        <p style={{ color: "#9CA3AF", fontSize: 17, maxWidth: 460, margin: "0 auto" }}>Three intelligent modules. One unified platform.</p>
                    </FadeIn>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "start" }}>
                    {/* Left */}
                    <FadeIn>
                        <div>
                            {/* Tab strip */}
                            <div role="tablist" aria-label="Feature tabs" style={{ display: "flex", gap: 6, marginBottom: 36, padding: 5, background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", width: "fit-content" }}>
                                {TABS.map((t, i) => (
                                    <button key={t.id} role="tab" aria-selected={active === i} tabIndex={active === i ? 0 : -1}
                                        onKeyDown={e => handleKey(e, i)} onClick={() => setActive(i)}
                                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 9, border: `1px solid ${active === i ? "rgba(59,130,246,0.35)" : "transparent"}`, background: active === i ? "rgba(37,99,235,0.2)" : "transparent", color: active === i ? "#fff" : "#6B7280", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.25s ease", outline: "none", fontFamily: "'Inter',sans-serif", boxShadow: active === i ? "0 0 18px rgba(37,99,235,0.2),inset 0 1px 0 rgba(255,255,255,0.05)" : "none" }}
                                        onMouseEnter={e => { if (active !== i) { e.currentTarget.style.color = "#d1d5db"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; } }}
                                        onMouseLeave={e => { if (active !== i) { e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.background = "transparent"; } }}
                                        onFocus={e => { e.currentTarget.style.outline = "2px solid rgba(59,130,246,0.6)"; e.currentTarget.style.outlineOffset = "2px"; }}
                                        onBlur={e => { e.currentTarget.style.outline = "none"; }}>
                                        <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={t.icon} /></svg>
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Copy block — fixed height to prevent layout jump */}
                            <div style={{ minHeight: 220 }}>
                                {TABS.map((t, i) => (
                                    <div key={t.id} style={{ display: active === i ? "block" : "none", animation: active === i ? "tabEnter 0.35s ease-out" : "none" }}>
                                        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(22px,2.8vw,32px)", color: "#fff", letterSpacing: "-0.02em", marginBottom: 10, lineHeight: 1.2 }}>{t.micro}</h3>
                                        <p style={{ color: "#9CA3AF", fontSize: 16, marginBottom: 28, lineHeight: 1.65 }}>{t.liner}</p>
                                        <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                            {t.bullets.map((b, bi) => (
                                                <li key={bi} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "#94A3B8", fontSize: 14, lineHeight: 1.6 }}>
                                                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(37,99,235,0.15)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                                                        <svg viewBox="0 0 24 24" fill="none" width={10} height={10} stroke="#60a5fa" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                    </span>
                                                    {b}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeIn>

                    {/* Right panels */}
                    <FadeIn delay={160}>
                        <div style={{ position: "relative", minHeight: 420 }}>
                            <PanelAICFO visible={active === 0} />
                            <PanelStress visible={active === 1} />
                            <PanelRiskRadar visible={active === 2} />
                        </div>
                    </FadeIn>
                </div>
            </div>
            <style>{`@media(max-width:900px){#features>div>div:last-child{grid-template-columns:1fr!important;gap:48px!important;} div[role="tablist"]{flex-wrap:wrap;width:auto!important;}}`}</style>
        </section>
    );
}

/* ── HOW IT WORKS ──────────────────────────────────────────────────────────── */
const STEPS = [
    { n: "01", title: "Connect Your Data", desc: "Integrate financial data sources securely in minutes — accounting platforms, spreadsheets, or direct API.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { n: "02", title: "AI Analyzes Instantly", desc: "Our engine processes your metrics in real-time, calculating risk scores, burn rate trends, and runway projections.", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
    { n: "03", title: "Act on Intelligence", desc: "Receive specific, explainable recommendations with projected financial impact before risks escalate into crises.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

function HowItWorks() {
    return (
        <section id="how-it-works" style={{ padding: "120px 0" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
                <div style={{ textAlign: "center", marginBottom: 64 }}>
                    <FadeIn><Eyebrow>Simple Process</Eyebrow></FadeIn>
                    <FadeIn delay={80}><h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(30px,4vw,48px)", color: "#fff", marginTop: 20, marginBottom: 12, letterSpacing: "-0.03em" }}>How FinMetrics Works</h2></FadeIn>
                    <FadeIn delay={160}><p style={{ color: "#9CA3AF", fontSize: 17 }}>From connection to clarity in three intentional steps.</p></FadeIn>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, position: "relative" }}>
                    <div style={{ position: "absolute", top: 44, left: "18%", right: "18%", height: 1, background: "linear-gradient(90deg,transparent,rgba(59,130,246,0.22),transparent)", pointerEvents: "none" }} />
                    {STEPS.map((s, i) => (
                        <FadeIn key={i} delay={i * 100}>
                            <div className="glass-card glass-hover" style={{ borderRadius: 20, padding: 28, cursor: "default" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
                                    <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(37,99,235,0.14)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <svg viewBox="0 0 24 24" fill="none" width={18} height={18} stroke="#60a5fa" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                                    </div>
                                    <span style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 900, color: "rgba(37,99,235,0.14)", lineHeight: 1, marginTop: 2, userSelect: "none" }}>{s.n}</span>
                                </div>
                                <h3 style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{s.title}</h3>
                                <p style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 1.65 }}>{s.desc}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
            <style>{`@media(max-width:768px){#how-it-works div[style*="repeat(3,1fr)"]{grid-template-columns:1fr!important;}}`}</style>
        </section>
    );
}

/* ── TRUST ─────────────────────────────────────────────────────────────────── */
function Trust() {
    const items = [
        { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", t: "SOC 2 Type II", d: "Enterprise-grade compliance" },
        { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", t: "AES-256 Encryption", d: "All data at rest and in transit" },
        { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", t: "On-Premise Ready", d: "Deploy in your infrastructure" },
        { icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", t: "Full Audit Logs", d: "Visibility into all system access" },
    ];
    return (
        <section style={{ padding: "80px 0", background: "linear-gradient(to bottom,transparent,rgba(3,6,9,0.6))" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <FadeIn><Eyebrow>Enterprise Security</Eyebrow></FadeIn>
                    <FadeIn delay={80}><h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,3.5vw,40px)", color: "#fff", marginTop: 18, letterSpacing: "-0.02em" }}>Built for Security-First Organizations</h2></FadeIn>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                    {items.map((it, i) => (
                        <FadeIn key={i} delay={i * 70}>
                            <div className="glass-card glass-hover" style={{ borderRadius: 18, padding: "22px 20px", cursor: "default" }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(37,99,235,0.14)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                                    <svg viewBox="0 0 24 24" fill="none" width={16} height={16} stroke="#60a5fa" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={it.icon} /></svg>
                                </div>
                                <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{it.t}</p>
                                <p style={{ color: "#6B7280", fontSize: 12 }}>{it.d}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
            <style>{`@media(max-width:768px){section div[style*="repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}}`}</style>
        </section>
    );
}

/* ── TESTIMONIALS ──────────────────────────────────────────────────────────── */
const TESTIS = [
    { q: "FinMetrics helped us identify runway risk three months earlier than expected. We had time to act strategically rather than reactively.", name: "Sarah Chen", title: "Founder, B2B SaaS Company" },
    { q: "The stress testing feature fundamentally changed how we approach budgeting. We model scenarios before every major decision now.", name: "Marcus Rivera", title: "Finance Lead, Growth Startup" },
    { q: "The recommendations are practical and explainable — not vague AI outputs. Every suggestion has a clear rationale and impact estimate.", name: "Priya Mehta", title: "Startup Advisor" },
];

function Testimonials() {
    const [active, setActive] = useState(0);
    const timerRef = useRef(null);
    const go = (dir) => setActive(p => (p + dir + TESTIS.length) % TESTIS.length);
    const startTimer = useCallback(() => { clearInterval(timerRef.current); timerRef.current = setInterval(() => setActive(p => (p + 1) % TESTIS.length), 7000); }, []);
    useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, [startTimer]);

    const arrowBtn = (dir, content) => (
        <button onClick={() => { go(dir); startTimer(); }}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280", transition: "all 0.2s ease", fontFamily: "'Inter',sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(37,99,235,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
            {content}
        </button>
    );

    return (
        <section style={{ padding: "120px 0", background: "rgba(3,6,9,0.5)" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
                <div style={{ textAlign: "center", marginBottom: 56 }}>
                    <FadeIn><Eyebrow>What Teams Say</Eyebrow></FadeIn>
                    <FadeIn delay={80}><h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,3.5vw,42px)", color: "#fff", marginTop: 18, letterSpacing: "-0.02em" }}>Trusted by Finance-Focused Teams</h2></FadeIn>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} onMouseEnter={() => clearInterval(timerRef.current)} onMouseLeave={startTimer}>
                    {TESTIS.map((t, i) => (
                        <FadeIn key={i} delay={i * 80}>
                            <div className="glass-card" onClick={() => { setActive(i); startTimer(); }}
                                style={{ borderRadius: 20, padding: 24, cursor: "pointer", border: active === i ? "1px solid rgba(59,130,246,0.28)" : "1px solid rgba(255,255,255,0.08)", boxShadow: active === i ? "0 10px 30px rgba(0,0,0,0.4),0 0 0 1px rgba(59,130,246,0.1)" : "0 10px 30px rgba(0,0,0,0.4)", transition: "all 0.3s ease", transform: "translateY(0)" }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = active === i ? "0 18px 44px rgba(0,0,0,0.5),0 0 0 1px rgba(59,130,246,0.18)" : "0 18px 44px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.08)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = active === i ? "0 10px 30px rgba(0,0,0,0.4),0 0 0 1px rgba(59,130,246,0.1)" : "0 10px 30px rgba(0,0,0,0.4)"; }}>
                                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                                    {[...Array(5)].map((_, si) => <svg key={si} viewBox="0 0 24 24" width={13} height={13} fill="#3b82f6"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}
                                </div>
                                <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>"{t.q}"</p>
                                <div>
                                    <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{t.name}</p>
                                    <p style={{ color: "#4B5563", fontSize: 12, marginTop: 3 }}>{t.title}</p>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 36 }}>
                    {arrowBtn(-1, <svg viewBox="0 0 24 24" fill="none" width={14} height={14} stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>)}
                    <div style={{ display: "flex", gap: 7 }}>
                        {TESTIS.map((_, i) => (
                            <button key={i} onClick={() => { setActive(i); startTimer(); }}
                                style={{ height: 7, borderRadius: 999, cursor: "pointer", border: "none", transition: "all 0.3s ease", width: active === i ? 24 : 7, background: active === i ? "#3b82f6" : "rgba(255,255,255,0.15)" }} />
                        ))}
                    </div>
                    {arrowBtn(1, <svg viewBox="0 0 24 24" fill="none" width={14} height={14} stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>)}
                </div>
            </div>
            <style>{`@media(max-width:768px){section div[style*="repeat(3,1fr)"]{grid-template-columns:1fr!important;}}`}</style>
        </section>
    );
}

/* ── CONTACT ───────────────────────────────────────────────────────────────── */
function Contact() {
    const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const submit = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); setDone(true); }, 1800); };
    const iS = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'Inter',sans-serif", transition: "border-color 0.2s,box-shadow 0.2s" };
    const f = (e) => { e.target.style.borderColor = "rgba(59,130,246,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; };
    const b = (e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; };

    return (
        <section id="contact" style={{ padding: "120px 0" }}>
            <div style={{ maxWidth: 660, margin: "0 auto", padding: "0 32px" }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <FadeIn><Eyebrow>Get In Touch</Eyebrow></FadeIn>
                    <FadeIn delay={80}><h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(28px,4vw,46px)", color: "#fff", marginTop: 20, marginBottom: 12, letterSpacing: "-0.03em" }}>Have Questions? Let's Talk.</h2></FadeIn>
                    <FadeIn delay={160}><p style={{ color: "#9CA3AF", fontSize: 16 }}>Reach out to discuss financial modeling, risk analytics, or implementation.</p></FadeIn>
                </div>
                <FadeIn delay={200}>
                    <div className="glass-card" style={{ borderRadius: 24, padding: 32 }}>
                        {done ? (
                            <div style={{ padding: "48px 0", textAlign: "center" }}>
                                <div style={{ width: 58, height: 58, borderRadius: "50%", background: "rgba(37,99,235,0.14)", border: "1px solid rgba(59,130,246,0.28)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                                    <svg viewBox="0 0 24 24" fill="none" width={24} height={24} stroke="#60a5fa" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <p style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Message Received</p>
                                <p style={{ color: "#9CA3AF", fontSize: 15 }}>Thank you. We'll respond within 24 hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={submit}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                    {[{ id: "name", label: "Name", type: "text", req: true }, { id: "email", label: "Work Email", type: "email", req: true }].map(fi => (
                                        <div key={fi.id}>
                                            <label style={{ color: "#6B7280", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>{fi.label}</label>
                                            <input type={fi.type} required={fi.req} placeholder={fi.label} value={form[fi.id]} onChange={e => setForm(p => ({ ...p, [fi.id]: e.target.value }))} style={iS} onFocus={f} onBlur={b} />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ color: "#6B7280", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Company <span style={{ color: "#374151" }}>(optional)</span></label>
                                    <input type="text" placeholder="Your company" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} style={iS} onFocus={f} onBlur={b} />
                                </div>
                                <div style={{ marginBottom: 22 }}>
                                    <label style={{ color: "#6B7280", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Message</label>
                                    <textarea required rows={4} placeholder="Your message..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ ...iS, resize: "none" }} onFocus={f} onBlur={b} />
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "13px 0", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                    {loading ? (<><svg viewBox="0 0 24 24" fill="none" width={16} height={16} style={{ animation: "spin 0.8s linear infinite" }}><circle cx={12} cy={12} r={10} stroke="rgba(255,255,255,0.25)" strokeWidth={3} /><path d="M12 2a10 10 0 010 20" stroke="#fff" strokeWidth={3} strokeLinecap="round" /></svg>Sending...</>) : "Send Message"}
                                </button>
                            </form>
                        )}
                    </div>
                </FadeIn>
            </div>
            <style>{`@media(max-width:600px){form>div[style*="grid-template-columns"]{grid-template-columns:1fr!important;}}`}</style>
        </section>
    );
}

/* ── FINAL CTA ─────────────────────────────────────────────────────────────── */
function FinalCTA() {
    return (
        <section style={{ position: "relative", padding: "120px 0", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ width: 700, height: 700, background: "radial-gradient(circle,rgba(37,99,235,0.11) 0%,transparent 65%)", borderRadius: "50%" }} />
            </div>
            <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
                <FadeIn><Eyebrow>Get Started Today</Eyebrow></FadeIn>
                <FadeIn delay={80}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(32px,5vw,60px)", color: "#fff", marginTop: 24, marginBottom: 18, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
                        Make Smarter Financial<br /><span style={{ background: "linear-gradient(135deg,#60a5fa,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Decisions Starting Today.</span>
                    </h2>
                </FadeIn>
                <FadeIn delay={160}>
                    <p style={{ color: "#9CA3AF", fontSize: 18, marginBottom: 40 }}>Join the organizations that see risk before it becomes a crisis.</p>
                </FadeIn>
                <FadeIn delay={240}>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                            className="btn-primary"
                            onClick={() => navigate("/dashboard")}
                        >
                            Start Free Trial
                        </button>
                        <button className="btn-secondary" style={{ padding: "14px 34px", fontSize: 16 }}>Learn More</button>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

/* ── FOOTER ────────────────────────────────────────────────────────────────── */
function Footer() {
    const cols = [
        { title: "Product", links: ["AI CFO Engine", "Stress Testing Simulator", "Risk Radar", "How It Works"] },
        { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security Overview"] },
        { title: "Resources", links: ["Documentation (Coming Soon)", "LinkedIn", "GitHub", "Contact"] },
    ];
    return (
        <footer style={{ background: "#030609", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px 32px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg viewBox="0 0 24 24" fill="none" width={14} height={14}><path d="M3 17l4-8 4 4 4-6 4 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "#fff" }}>FinMetrics</span>
                        </div>
                        <p style={{ color: "#374151", fontSize: 13, lineHeight: 1.7, maxWidth: 240 }}>AI-powered financial intelligence platform to help organizations manage risk, extend runway, and make informed strategic decisions.</p>
                    </div>
                    {cols.map(col => (
                        <div key={col.title}>
                            <p style={{ color: "#9CA3AF", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{col.title}</p>
                            <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none" }}>
                                {col.links.map(link => (
                                    <li key={link}>
                                        <a href="#" style={{ color: "#374151", fontSize: 13, textDecoration: "none", display: "inline-block", transition: "color 0.2s ease, padding-left 0.2s ease" }}
                                            onMouseEnter={e => { e.currentTarget.style.color = "#9CA3AF"; e.currentTarget.style.paddingLeft = "4px"; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = "#374151"; e.currentTarget.style.paddingLeft = "0"; }}>
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <p style={{ color: "#1F2937", fontSize: 12 }}>© 2026 FinMetrics. All rights reserved.</p>
                    <p style={{ color: "#1F2937", fontSize: 12 }}>Designed for financial clarity.</p>
                </div>
            </div>
            <style>{`@media(max-width:768px){footer div[style*="grid-template-columns"]{grid-template-columns:1fr 1fr!important;}}`}</style>
        </footer>
    );
}

/* ── APP ───────────────────────────────────────────────────────────────────── */
export default function App() {
    return (
        <>
            <GlobalStyles />
            <ScrollProgressBar />
            <Navbar />
            <main>
                <Hero />
                <SectionDivider />
                <TabbedFeatures />
                <SectionDivider />
                <HowItWorks />
                <Trust />
                <SectionDivider />
                <Testimonials />
                <SectionDivider />
                <Contact />
                <FinalCTA />
            </main>
            <Footer />
        </>
    );
}