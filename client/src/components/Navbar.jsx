// import { NavLink, useNavigate } from "react-router-dom";
// import { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Bell,
//   ChevronDown,
//   HelpCircle,
//   LogOut,
//   Menu,
//   Settings,
//   User,
//   X,
//   LayoutDashboard,
//   ShieldAlert,
//   Activity,
//   Sparkles,
//   Database,
//   FileText,
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";

// // ─── Nav items ───────────────────────────────────────────────────────────────
// const NAV_ITEMS = [
//   { name: "Dashboard", path: "/dashboard",          icon: LayoutDashboard },
//   { name: "Risk",      path: "/risk-radar",          icon: ShieldAlert     },
//   { name: "Simulator", path: "/stress-simulator",   icon: Activity        },
//   { name: "AI CFO",    path: "/ai-recommendations", icon: Sparkles        },
//   { name: "Data",      path: "/data",               icon: Database        },
//   { name: "Reports",   path: "/reports",            icon: FileText        },
// ];

// const MOCK_NOTIFS = [
//   { id: 1, title: "Runway dropped below 3 months",    meta: "Risk Radar · 2h ago",  tone: "danger"  },
//   { id: 2, title: "Simulation saved: Recession Plan", meta: "Simulator · 1d ago",   tone: "info"    },
//   { id: 3, title: "New AI recommendation available",  meta: "AI CFO · 3d ago",      tone: "success" },
// ];

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function getInitials(name = "") {
//   const parts = name.trim().split(" ").filter(Boolean);
//   if (!parts.length) return "U";
//   if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
//   return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
// }

// function useEscapeKey(handler) {
//   useEffect(() => {
//     const fn = (e) => { if (e.key === "Escape") handler?.(); };
//     window.addEventListener("keydown", fn);
//     return () => window.removeEventListener("keydown", fn);
//   }, [handler]);
// }

// function useOutsideClick(ref, handler) {
//   useEffect(() => {
//     const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) handler?.(); };
//     document.addEventListener("mousedown", fn);
//     document.addEventListener("touchstart", fn, { passive: true });
//     return () => {
//       document.removeEventListener("mousedown", fn);
//       document.removeEventListener("touchstart", fn);
//     };
//   }, [ref, handler]);
// }

// // ─── Injected CSS (keyframes + classes Tailwind can't express) ────────────────
// const NAV_CSS = `
//   /* Dropdown fade-slide */
//   @keyframes navDropIn {
//     from { opacity: 0; transform: translateY(-6px) scale(0.98); }
//     to   { opacity: 1; transform: translateY(0)    scale(1);    }
//   }
//   .nav-drop {
//     animation: navDropIn 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
//   }

//   /* Mobile sheet slide-down */
//   @keyframes mobileSheetIn {
//     from { opacity: 0; transform: translateY(-8px); }
//     to   { opacity: 1; transform: translateY(0);    }
//   }
//   .mobile-sheet {
//     animation: mobileSheetIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
//   }

//   /* Nav link hover underline (center-out) */
//   .nav-link-line {
//     position: absolute;
//     bottom: 6px;
//     left: 50%;
//     transform: translateX(-50%) scaleX(0);
//     width: calc(100% - 20px);
//     height: 1.5px;
//     background: rgba(255,255,255,0.22);
//     border-radius: 999px;
//     transform-origin: center;
//     transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
//   }
//   .nav-link:hover .nav-link-line { transform: translateX(-50%) scaleX(1); }

//   /* Active state glow underline */
//   .nav-link-active-line {
//     position: absolute;
//     bottom: 5px;
//     left: 50%;
//     transform: translateX(-50%);
//     width: calc(100% - 16px);
//     height: 2px;
//     border-radius: 999px;
//     background: linear-gradient(90deg, rgba(52,211,153,0) 0%, rgba(52,211,153,0.9) 50%, rgba(52,211,153,0) 100%);
//     box-shadow: 0 0 8px rgba(52,211,153,0.5);
//   }

//   /* Avatar ring pulse (very subtle) */
//   .avatar-ring {
//     transition: box-shadow 0.22s ease, transform 0.18s ease;
//   }
//   .avatar-ring:hover {
//     box-shadow: 0 0 0 3px rgba(59,130,246,0.28), 0 0 18px rgba(59,130,246,0.2);
//     transform: scale(1.04);
//   }

//   /* Notif badge pulse */
//   @keyframes notifPulse {
//     0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.45); }
//     60%       { box-shadow: 0 0 0 5px rgba(52,211,153,0);  }
//   }
//   .notif-dot { animation: notifPulse 2.4s ease-in-out infinite; }

//   /* Drop item hover */
//   .drop-item {
//     display: flex; align-items: center; gap: 10px;
//     width: 100%; padding: 9px 12px;
//     border-radius: 10px; border: none;
//     background: transparent;
//     color: rgba(255,255,255,0.72);
//     font-size: 13px; font-weight: 500;
//     font-family: inherit;
//     text-align: left; cursor: pointer;
//     transition: background 0.16s ease, color 0.16s ease;
//   }
//   .drop-item:hover {
//     background: rgba(255,255,255,0.06);
//     color: rgba(255,255,255,0.95);
//   }
//   .drop-item:focus-visible {
//     outline: 2px solid rgba(59,130,246,0.6);
//     outline-offset: -2px;
//   }
//   .drop-item-icon {
//     color: rgba(255,255,255,0.35);
//     transition: color 0.16s ease;
//     flex-shrink: 0;
//   }
//   .drop-item:hover .drop-item-icon { color: rgba(255,255,255,0.65); }
//   .drop-item-arrow {
//     margin-left: auto;
//     color: rgba(255,255,255,0.18);
//     transition: color 0.16s ease;
//   }
//   .drop-item:hover .drop-item-arrow { color: rgba(255,255,255,0.4); }

//   /* Logout item */
//   .drop-item-logout {
//     color: rgba(252,165,165,0.85);
//   }
//   .drop-item-logout:hover {
//     background: rgba(239,68,68,0.1);
//     color: rgba(252,165,165,1);
//   }
//   .drop-item-logout .drop-item-icon { color: rgba(239,68,68,0.55); }
//   .drop-item-logout:hover .drop-item-icon { color: rgba(239,68,68,0.85); }

//   /* Notif item */
//   .notif-item {
//     display: flex; align-items: flex-start; gap: 10px;
//     width: 100%; padding: 10px 12px;
//     border-radius: 10px; border: none;
//     background: transparent;
//     text-align: left; cursor: pointer;
//     transition: background 0.16s ease;
//     font-family: inherit;
//   }
//   .notif-item:hover { background: rgba(255,255,255,0.05); }

//   /* Glass panel */
//   .glass-panel {
//     background: rgba(8,14,28,0.92);
//     backdrop-filter: blur(28px);
//     -webkit-backdrop-filter: blur(28px);
//     border: 1px solid rgba(255,255,255,0.09);
//     box-shadow: 0 24px 56px rgba(0,0,0,0.65),
//                 0 0 0 1px rgba(255,255,255,0.03) inset;
//     border-radius: 18px;
//     overflow: hidden;
//   }

//   /* Mobile nav link */
//   .mobile-nav-link {
//     display: flex; align-items: center; gap: 12px;
//     padding: 11px 14px; border-radius: 12px;
//     font-size: 14px; font-weight: 500;
//     transition: background 0.16s ease, color 0.16s ease;
//     color: rgba(255,255,255,0.65);
//     text-decoration: none;
//   }
//   .mobile-nav-link:hover {
//     background: rgba(255,255,255,0.06);
//     color: rgba(255,255,255,0.92);
//   }
//   .mobile-nav-link.active {
//     background: rgba(255,255,255,0.07);
//     color: #fff;
//   }

//   @media (prefers-reduced-motion: reduce) {
//     .nav-drop, .mobile-sheet { animation: none; opacity: 1; transform: none; }
//     .nav-link-line { transition: none; }
//     .avatar-ring:hover { transform: none; }
//     .notif-dot { animation: none; }
//   }
// `;

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function DropItem({ icon, label, onClick, className = "" }) {
//   return (
//     <button onClick={onClick} className={`drop-item ${className}`}>
//       <span className="drop-item-icon">{icon}</span>
//       <span style={{ flex: 1 }}>{label}</span>
//       <span className="drop-item-arrow" style={{ fontSize: 14 }}>›</span>
//     </button>
//   );
// }

// const NOTIF_TONE = {
//   danger:  { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",   color: "#fca5a5", label: "Risk"   },
//   success: { bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.25)",  color: "#6ee7b7", label: "Update" },
//   info:    { bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.22)",  color: "#93c5fd", label: "Info"   },
// };

// function NotifItem({ title, meta, tone = "info" }) {
//   const t = NOTIF_TONE[tone] || NOTIF_TONE.info;
//   return (
//     <button className="notif-item">
//       <span style={{
//         display: "inline-flex", alignItems: "center",
//         background: t.bg, border: `1px solid ${t.border}`,
//         color: t.color, borderRadius: 7,
//         fontSize: 10, fontWeight: 700,
//         padding: "2px 7px", flexShrink: 0, marginTop: 1,
//       }}>
//         {t.label}
//       </span>
//       <div style={{ minWidth: 0 }}>
//         <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.88)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//           {title}
//         </p>
//         <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//           {meta}
//         </p>
//       </div>
//     </button>
//   );
// }

// // ─── Main Navbar ──────────────────────────────────────────────────────────────
// export default function AppNavbar() {
//   const navigate = useNavigate();
//   const { user, logout } = useAuth();

//   const [scrolled,     setScrolled]     = useState(false);
//   const [mobileOpen,   setMobileOpen]   = useState(false);
//   const [profileOpen,  setProfileOpen]  = useState(false);
//   const [notifOpen,    setNotifOpen]    = useState(false);

//   const profileRef = useRef(null);
//   const notifRef   = useRef(null);

//   const displayName  = user?.fullName || "User";
//   const displayEmail = user?.email    || "";
//   const initials     = useMemo(() => getInitials(displayName), [displayName]);

//   // Inject CSS once
//   useEffect(() => {
//     const id = "appnav-css";
//     if (document.getElementById(id)) return;
//     const el = document.createElement("style");
//     el.id = id; el.textContent = NAV_CSS;
//     document.head.appendChild(el);
//     return () => { try { document.head.removeChild(el); } catch {} };
//   }, []);

//   // Scroll detection
//   useEffect(() => {
//     const fn = () => setScrolled(window.scrollY > 8);
//     fn();
//     window.addEventListener("scroll", fn, { passive: true });
//     return () => window.removeEventListener("scroll", fn);
//   }, []);

//   const closeAll = () => { setProfileOpen(false); setNotifOpen(false); setMobileOpen(false); };

//   useEscapeKey(closeAll);
//   useOutsideClick(profileRef, () => setProfileOpen(false));
//   useOutsideClick(notifRef,   () => setNotifOpen(false));

//   const handleLogout = () => { logout?.(); closeAll(); navigate("/login"); };
//   const go = (path) => { closeAll(); navigate(path); };

//   return (
//     <>
//       <header
//         style={{
//           position: "sticky", top: 0, zIndex: 50,
//           width: "100%",
//           height: scrolled ? 60 : 72,
//           transition: "height 0.22s cubic-bezier(0.22,1,0.36,1)",
//         }}
//       >
//         {/* ── Glass background layer ── */}
//         <div style={{
//           position: "absolute", inset: 0,
//           background: scrolled
//             ? "rgba(5,9,15,0.88)"
//             : "rgba(5,9,15,0.65)",
//           backdropFilter: "blur(28px)",
//           WebkitBackdropFilter: "blur(28px)",
//           borderBottom: "1px solid rgba(255,255,255,0.08)",
//           boxShadow: scrolled
//             ? "0 4px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03) inset"
//             : "0 2px 16px rgba(0,0,0,0.25)",
//           transition: "background 0.22s ease, box-shadow 0.22s ease",
//         }} />

//         {/* ── Top glow strip ── */}
//         <div style={{
//           position: "absolute", inset: "0 0 auto 0", height: 1,
//           background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.18) 30%, rgba(59,130,246,0.18) 70%, transparent 100%)",
//           pointerEvents: "none",
//         }} />

//         {/* ── Inner layout ── */}
//         <div style={{
//           position: "relative",
//           maxWidth: 1320, margin: "0 auto",
//           height: "100%",
//           display: "flex", alignItems: "center",
//           justifyContent: "space-between",
//           padding: "0 28px",
//           gap: 16,
//         }}>

//           {/* ── LEFT: Logo ── */}
//           <button
//             onClick={() => go("/dashboard")}
//             style={{
//               display: "flex", alignItems: "center", gap: 10,
//               background: "none", border: "none", cursor: "pointer",
//               padding: "6px 10px 6px 6px",
//               borderRadius: 12,
//               transition: "background 0.18s ease",
//               flexShrink: 0,
//             }}
//             onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
//             onMouseLeave={e => e.currentTarget.style.background = "none"}
//           >
//             {/* Icon */}
//             <div style={{
//               width: 34, height: 34,
//               borderRadius: 10,
//               background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               boxShadow: "0 0 18px rgba(37,99,235,0.55), 0 2px 8px rgba(0,0,0,0.4)",
//               border: "1px solid rgba(255,255,255,0.12)",
//               flexShrink: 0,
//             }}>
//               {/* Small chart icon */}
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
//                 stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M3 17l4-8 4 4 4-6 4 10"/>
//               </svg>
//             </div>
//             <span style={{
//               fontSize: 15, fontWeight: 700,
//               letterSpacing: "-0.03em",
//               color: "rgba(255,255,255,0.92)",
//             }}>
//               FinMetrics
//             </span>
//           </button>

//           {/* ── CENTER: Nav links (desktop) ── */}
//           <nav style={{
//             display: "flex", alignItems: "center", gap: 2,
//             position: "absolute",
//             left: "50%", transform: "translateX(-50%)",
//           }}
//             className="hidden-mobile"
//           >
//             {NAV_ITEMS.map((item) => (
//               <NavLink
//                 key={item.name}
//                 to={item.path}
//                 onClick={closeAll}
//                 style={{ textDecoration: "none" }}
//                 className="nav-link"
//               >
//                 {({ isActive }) => (
//                   <span style={{
//                     position: "relative",
//                     display: "inline-flex", alignItems: "center",
//                     padding: "7px 14px",
//                     borderRadius: 10,
//                     fontSize: 13.5,
//                     fontWeight: isActive ? 600 : 500,
//                     color: isActive ? "#fff" : "rgba(255,255,255,0.58)",
//                     background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
//                     letterSpacing: "-0.01em",
//                     transition: "color 0.18s ease, background 0.18s ease",
//                     cursor: "pointer",
//                     userSelect: "none",
//                     whiteSpace: "nowrap",
//                   }}
//                     onMouseEnter={e => {
//                       if (!isActive) {
//                         e.currentTarget.style.color = "rgba(255,255,255,0.88)";
//                         e.currentTarget.style.background = "rgba(255,255,255,0.045)";
//                       }
//                     }}
//                     onMouseLeave={e => {
//                       if (!isActive) {
//                         e.currentTarget.style.color = "rgba(255,255,255,0.58)";
//                         e.currentTarget.style.background = "transparent";
//                       }
//                     }}
//                   >
//                     {item.name}
//                     {/* Hover underline */}
//                     {!isActive && <span className="nav-link-line" />}
//                     {/* Active glow underline */}
//                     {isActive  && <span className="nav-link-active-line" />}
//                   </span>
//                 )}
//               </NavLink>
//             ))}
//           </nav>

//           {/* ── RIGHT: Actions ── */}
//           <div style={{
//             display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
//           }}>

//             {/* Mobile hamburger */}
//             <button
//               onClick={() => { setMobileOpen(v => !v); setNotifOpen(false); setProfileOpen(false); }}
//               style={{
//                 display: "none",
//                 width: 38, height: 38,
//                 borderRadius: 10,
//                 border: "1px solid rgba(255,255,255,0.1)",
//                 background: "rgba(255,255,255,0.05)",
//                 color: "rgba(255,255,255,0.7)",
//                 alignItems: "center", justifyContent: "center",
//                 cursor: "pointer",
//                 transition: "background 0.18s, color 0.18s",
//               }}
//               className="mobile-only"
//               aria-label="Open navigation"
//               onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
//               onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
//             >
//               {mobileOpen ? <X size={17} /> : <Menu size={17} />}
//             </button>

//             {/* ── Grouped right pill ── */}
//             <div style={{
//               display: "flex", alignItems: "center", gap: 4,
//               background: "rgba(255,255,255,0.04)",
//               border: "1px solid rgba(255,255,255,0.08)",
//               borderRadius: 14,
//               padding: "4px 6px",
//             }}>

//               {/* Bell */}
//               <div ref={notifRef} style={{ position: "relative" }}>
//                 <button
//                   onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
//                   aria-label="Notifications"
//                   style={{
//                     position: "relative",
//                     width: 36, height: 36,
//                     borderRadius: 9,
//                     border: "none",
//                     background: notifOpen ? "rgba(255,255,255,0.09)" : "transparent",
//                     color: notifOpen ? "#fff" : "rgba(255,255,255,0.6)",
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     cursor: "pointer",
//                     transition: "background 0.18s, color 0.18s",
//                     outline: "none",
//                   }}
//                   onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
//                   onMouseLeave={e => {
//                     if (!notifOpen) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }
//                   }}
//                 >
//                   <Bell size={17} />
//                   {/* Dot badge */}
//                   <span className="notif-dot" style={{
//                     position: "absolute", top: 8, right: 8,
//                     width: 6, height: 6,
//                     borderRadius: "50%",
//                     background: "#34d399",
//                     border: "1.5px solid rgba(5,9,15,0.9)",
//                   }} />
//                 </button>

//                 {/* Notif dropdown */}
//                 {notifOpen && (
//                   <div className="glass-panel nav-drop" style={{
//                     position: "absolute", right: 0, top: "calc(100% + 10px)",
//                     width: 312,
//                   }}>
//                     <div style={{
//                       display: "flex", alignItems: "center", justifyContent: "space-between",
//                       padding: "13px 16px 11px",
//                       borderBottom: "1px solid rgba(255,255,255,0.07)",
//                     }}>
//                       <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
//                         Notifications
//                       </p>
//                       <button style={{
//                         fontSize: 11, color: "rgba(255,255,255,0.35)",
//                         background: "none", border: "none", cursor: "pointer",
//                         fontFamily: "inherit",
//                         transition: "color 0.16s",
//                       }}
//                         onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
//                         onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
//                       >
//                         Mark all read
//                       </button>
//                     </div>
//                     <div style={{ padding: "6px 6px 8px" }}>
//                       {MOCK_NOTIFS.map(n => (
//                         <NotifItem key={n.id} {...n} />
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Divider */}
//               <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.09)", margin: "0 2px" }} />

//               {/* Profile */}
//               <div ref={profileRef} style={{ position: "relative" }}>
//                 <button
//                   onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
//                   style={{
//                     display: "flex", alignItems: "center", gap: 8,
//                     padding: "4px 8px 4px 4px",
//                     borderRadius: 10,
//                     border: "none",
//                     background: profileOpen ? "rgba(255,255,255,0.08)" : "transparent",
//                     cursor: "pointer",
//                     outline: "none",
//                     transition: "background 0.18s ease",
//                   }}
//                   onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
//                   onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = "transparent"; }}
//                 >
//                   {/* Avatar circle */}
//                   <div className="avatar-ring" style={{
//                     width: 30, height: 30,
//                     borderRadius: "50%",
//                     background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     fontSize: 11, fontWeight: 800,
//                     color: "#fff",
//                     letterSpacing: "-0.01em",
//                     boxShadow: "0 0 0 2px rgba(59,130,246,0.22), 0 0 14px rgba(59,130,246,0.15)",
//                     flexShrink: 0,
//                     userSelect: "none",
//                   }}>
//                     {initials}
//                   </div>

//                   {/* Name (sm+) */}
//                   <span style={{
//                     fontSize: 13, fontWeight: 500,
//                     color: "rgba(255,255,255,0.72)",
//                     maxWidth: 100,
//                     overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//                   }}
//                     className="hidden-xs"
//                   >
//                     {displayName.split(" ")[0]}
//                   </span>

//                   <ChevronDown size={14} style={{
//                     color: "rgba(255,255,255,0.35)",
//                     transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
//                     transition: "transform 0.22s ease",
//                     flexShrink: 0,
//                   }} />
//                 </button>

//                 {/* Profile dropdown */}
//                 {profileOpen && (
//                   <div className="glass-panel nav-drop" style={{
//                     position: "absolute", right: 0, top: "calc(100% + 10px)",
//                     width: 272,
//                   }}>
//                     {/* User header */}
//                     <div style={{
//                       padding: "14px 16px",
//                       borderBottom: "1px solid rgba(255,255,255,0.07)",
//                       display: "flex", alignItems: "center", gap: 11,
//                     }}>
//                       <div style={{
//                         width: 38, height: 38,
//                         borderRadius: "50%",
//                         background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
//                         display: "flex", alignItems: "center", justifyContent: "center",
//                         fontSize: 13, fontWeight: 800, color: "#fff",
//                         boxShadow: "0 0 0 2px rgba(59,130,246,0.25), 0 0 18px rgba(59,130,246,0.18)",
//                         flexShrink: 0,
//                         userSelect: "none",
//                       }}>
//                         {initials}
//                       </div>
//                       <div style={{ minWidth: 0 }}>
//                         <p style={{
//                           fontSize: 13.5, fontWeight: 600,
//                           color: "rgba(255,255,255,0.92)",
//                           overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//                           marginBottom: 2,
//                         }}>
//                           {displayName}
//                         </p>
//                         <p style={{
//                           fontSize: 11.5, color: "rgba(255,255,255,0.35)",
//                           overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//                         }}>
//                           {displayEmail}
//                         </p>
//                       </div>
//                     </div>

//                     <div style={{ padding: "6px" }}>
//                       <DropItem icon={<User size={15} />}        label="My Profile"        onClick={() => go("/profile")}  />
//                       <DropItem icon={<Settings size={15} />}    label="Company Settings"  onClick={() => go("/settings")} />
//                       <DropItem icon={<HelpCircle size={15} />}  label="Help / Support"    onClick={() => go("/support")}  />
//                     </div>

//                     <div style={{
//                       padding: "6px",
//                       borderTop: "1px solid rgba(255,255,255,0.07)",
//                     }}>
//                       <DropItem
//                         icon={<LogOut size={15} />}
//                         label="Logout"
//                         onClick={handleLogout}
//                         className="drop-item-logout"
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── Mobile nav sheet ── */}
//         {mobileOpen && (
//           <div style={{
//             position: "relative",
//             padding: "0 16px 12px",
//           }}>
//             <div className="glass-panel mobile-sheet" style={{
//               padding: "8px",
//             }}>
//               {NAV_ITEMS.map((item) => {
//                 const Icon = item.icon;
//                 return (
//                   <NavLink
//                     key={item.name}
//                     to={item.path}
//                     onClick={() => setMobileOpen(false)}
//                     style={{ textDecoration: "none" }}
//                     className={({ isActive }) => `mobile-nav-link${isActive ? " active" : ""}`}
//                   >
//                     <Icon size={16} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
//                     <span style={{ flex: 1 }}>{item.name}</span>
//                     <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>›</span>
//                   </NavLink>
//                 );
//               })}

//               {/* Mobile profile actions */}
//               <div style={{
//                 height: 1,
//                 background: "rgba(255,255,255,0.07)",
//                 margin: "6px 4px",
//               }} />
//               <button className="mobile-nav-link" onClick={() => go("/profile")} style={{ width: "100%", border: "none", cursor: "pointer" }}>
//                 <User size={16} style={{ color: "rgba(255,255,255,0.35)" }} />
//                 <span style={{ flex: 1 }}>My Profile</span>
//               </button>
//               <button className="mobile-nav-link drop-item-logout" onClick={handleLogout} style={{ width: "100%", border: "none", cursor: "pointer" }}>
//                 <LogOut size={16} style={{ color: "rgba(239,68,68,0.55)" }} />
//                 <span style={{ flex: 1 }}>Logout</span>
//               </button>
//             </div>
//           </div>
//         )}
//       </header>

//       {/* ── Responsive overrides ── */}
//       <style>{`
//         @media (min-width: 768px) {
//           .mobile-only { display: none !important; }
//           .hidden-mobile { display: flex !important; }
//         }
//         @media (max-width: 767px) {
//           .hidden-mobile { display: none !important; }
//           .mobile-only { display: flex !important; }
//         }
//         @media (max-width: 480px) {
//           .hidden-xs { display: none !important; }
//         }
//       `}</style>
//     </>
//   );
// }



import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, ChevronDown, HelpCircle, LogOut,
  Menu, Settings, User, X,
  LayoutDashboard, ShieldAlert, Activity,
  Sparkles, Database, FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard",          icon: LayoutDashboard },
  { name: "Risk",      path: "/risk-radar",          icon: ShieldAlert     },
  { name: "Simulator", path: "/stress-simulator",   icon: Activity        },
  { name: "AI CFO",    path: "/ai-recommendations", icon: Sparkles        },
  { name: "Data",      path: "/data",               icon: Database        },
  { name: "Reports",   path: "/reports",            icon: FileText        },
];

const MOCK_NOTIFS = [
  { id: 1, title: "Runway dropped below 3 months",    meta: "Risk Radar · 2h ago", tone: "danger"  },
  { id: 2, title: "Simulation saved: Recession Plan", meta: "Simulator · 1d ago",  tone: "info"    },
  { id: 3, title: "New AI recommendation available",  meta: "AI CFO · 3d ago",     tone: "success" },
];

const NTONE = {
  danger:  { bg:"rgba(239,68,68,0.12)",  bd:"rgba(239,68,68,0.28)",  clr:"#fca5a5", lbl:"Risk"   },
  success: { bg:"rgba(52,211,153,0.12)", bd:"rgba(52,211,153,0.28)", clr:"#6ee7b7", lbl:"Update" },
  info:    { bg:"rgba(59,130,246,0.12)", bd:"rgba(59,130,246,0.22)", clr:"#93c5fd", lbl:"Info"   },
};

// ─── CSS injected once ────────────────────────────────────────────────────────
const NAV_CSS = `
  @keyframes navDropIn {
    from { opacity:0; transform:translateY(-7px) scale(0.97); }
    to   { opacity:1; transform:translateY(0)    scale(1);    }
  }
  @keyframes mobileIn {
    from { opacity:0; transform:translateY(-10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes notifPulse {
    0%,100% { box-shadow:0 0 0 0 rgba(52,211,153,0.5); }
    60%     { box-shadow:0 0 0 5px rgba(52,211,153,0);  }
  }

  .nav-drop    { animation: navDropIn 0.2s  cubic-bezier(0.22,1,0.36,1) both; }
  .mob-sheet   { animation: mobileIn  0.22s cubic-bezier(0.22,1,0.36,1) both; }
  .notif-dot   { animation: notifPulse 2.6s ease-in-out infinite; }

  /* center-out hover underline */
  .nav-ul {
    position:absolute; bottom:5px; left:50%;
    transform:translateX(-50%) scaleX(0);
    width:calc(100% - 20px); height:1.5px;
    background:rgba(255,255,255,0.2); border-radius:999px;
    transform-origin:center;
    transition:transform 0.22s cubic-bezier(0.22,1,0.36,1);
  }
  .nav-lw:hover .nav-ul { transform:translateX(-50%) scaleX(1); }

  /* active glow underline */
  .nav-al {
    position:absolute; bottom:4px; left:50%;
    transform:translateX(-50%);
    width:calc(100% - 18px); height:2px; border-radius:999px;
    background:linear-gradient(90deg,rgba(52,211,153,0) 0%,rgba(52,211,153,0.9) 50%,rgba(52,211,153,0) 100%);
    box-shadow:0 0 9px rgba(52,211,153,0.5);
  }

  /* circular icon button */
  .ic-btn {
    position:relative;
    width:38px; height:38px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    border:1px solid rgba(255,255,255,0.1);
    background:rgba(255,255,255,0.05);
    color:rgba(255,255,255,0.6);
    cursor:pointer; outline:none;
    transition:background 0.18s,color 0.18s,box-shadow 0.18s,transform 0.18s;
    flex-shrink:0;
  }
  .ic-btn:hover {
    background:rgba(255,255,255,0.1); color:#fff;
    box-shadow:0 0 0 3px rgba(59,130,246,0.15),0 4px 16px rgba(0,0,0,0.35);
    transform:scale(1.05);
  }
  .ic-btn:focus-visible { outline:2px solid rgba(59,130,246,0.65); outline-offset:2px; }
  .ic-btn.ic-active {
    background:rgba(255,255,255,0.1); color:#fff;
    box-shadow:0 0 0 3px rgba(59,130,246,0.18);
  }

  /* profile pill */
  .prof-pill {
    display:flex; align-items:center; gap:10px;
    padding:5px 12px 5px 5px; border-radius:999px;
    border:1px solid rgba(255,255,255,0.1);
    background:rgba(255,255,255,0.05);
    cursor:pointer; outline:none;
    transition:background 0.18s,border-color 0.18s,box-shadow 0.18s,transform 0.18s;
  }
  .prof-pill:hover {
    background:rgba(255,255,255,0.09);
    border-color:rgba(255,255,255,0.18);
    box-shadow:0 0 0 3px rgba(59,130,246,0.1),0 4px 20px rgba(0,0,0,0.3);
    transform:scale(1.015);
  }
  .prof-pill:focus-visible { outline:2px solid rgba(59,130,246,0.65); outline-offset:2px; }
  .prof-pill.pill-open {
    background:rgba(255,255,255,0.1);
    border-color:rgba(255,255,255,0.18);
    box-shadow:0 0 0 3px rgba(59,130,246,0.15);
  }

  /* avatar */
  .av-ring {
    width:30px; height:30px; border-radius:50%;
    background:linear-gradient(135deg,#3b82f6,#6366f1);
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:800; color:#fff;
    letter-spacing:-0.01em; user-select:none; flex-shrink:0;
    box-shadow:0 0 0 2px rgba(59,130,246,0.28),0 0 14px rgba(59,130,246,0.18);
    transition:box-shadow 0.2s ease;
  }
  .prof-pill:hover .av-ring {
    box-shadow:0 0 0 2.5px rgba(59,130,246,0.48),0 0 20px rgba(59,130,246,0.28);
  }

  /* glass dropdown */
  .g-panel {
    background:rgba(7,12,24,0.95);
    backdrop-filter:blur(32px); -webkit-backdrop-filter:blur(32px);
    border:1px solid rgba(255,255,255,0.09);
    box-shadow:0 28px 64px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.025) inset;
    border-radius:18px; overflow:hidden;
  }

  /* dropdown row */
  .d-row {
    display:flex; align-items:center; gap:10px;
    width:100%; padding:9px 12px; border-radius:11px;
    border:none; background:transparent;
    color:rgba(255,255,255,0.7);
    font-size:13px; font-weight:500; font-family:inherit;
    text-align:left; cursor:pointer;
    transition:background 0.15s,color 0.15s,box-shadow 0.15s;
  }
  .d-row:hover { background:rgba(255,255,255,0.065); color:rgba(255,255,255,0.95); }
  .d-row:focus-visible { outline:2px solid rgba(59,130,246,0.6); outline-offset:-2px; }
  .d-row .d-icon { color:rgba(255,255,255,0.32); flex-shrink:0; transition:color 0.15s; }
  .d-row:hover .d-icon { color:rgba(255,255,255,0.62); }
  .d-row .d-arr { margin-left:auto; color:rgba(255,255,255,0.18); font-size:14px; transition:color 0.15s; }
  .d-row:hover .d-arr { color:rgba(255,255,255,0.42); }
  .d-logout { color:rgba(252,165,165,0.82); }
  .d-logout:hover { background:rgba(239,68,68,0.09); color:#fca5a5; }
  .d-logout .d-icon { color:rgba(239,68,68,0.5); }
  .d-logout:hover .d-icon { color:rgba(239,68,68,0.8); }

  /* notif row */
  .n-row {
    display:flex; align-items:flex-start; gap:10px;
    width:100%; padding:10px 12px; border-radius:11px;
    border:none; background:transparent;
    text-align:left; cursor:pointer; font-family:inherit;
    transition:background 0.15s;
  }
  .n-row:hover { background:rgba(255,255,255,0.05); }

  /* mobile nav link */
  .mob-link {
    display:flex; align-items:center; gap:12px;
    padding:11px 14px; border-radius:12px;
    font-size:14px; font-weight:500;
    color:rgba(255,255,255,0.62); text-decoration:none;
    transition:background 0.15s,color 0.15s;
  }
  .mob-link:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.92); }
  .mob-active { background:rgba(255,255,255,0.08)!important; color:#fff!important; }

  /* tooltip */
  .tw { position:relative; display:inline-flex; align-items:center; }
  .tb {
    position:absolute; bottom:calc(100% + 7px); left:50%;
    transform:translateX(-50%);
    background:rgba(7,12,24,0.97); border:1px solid rgba(255,255,255,0.1);
    border-radius:7px; padding:4px 9px; font-size:11px; font-weight:500;
    color:rgba(255,255,255,0.72); white-space:nowrap; pointer-events:none;
    opacity:0; transition:opacity 0.14s ease;
    box-shadow:0 6px 20px rgba(0,0,0,0.5);
  }
  .tw:hover .tb { opacity:1; }

  @media (prefers-reduced-motion:reduce) {
    .nav-drop,.mob-sheet { animation:none; opacity:1; transform:none; }
    .nav-ul { transition:none; }
    .ic-btn:hover,.prof-pill:hover { transform:none; }
    .notif-dot { animation:none; }
  }
`;

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useEscapeKey(handler) {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") handler?.(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [handler]);
}

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) handler?.(); };
    document.addEventListener("mousedown", fn);
    document.addEventListener("touchstart", fn, { passive: true });
    return () => {
      document.removeEventListener("mousedown", fn);
      document.removeEventListener("touchstart", fn);
    };
  }, [ref, handler]);
}

function getInitials(name = "") {
  const p = name.trim().split(" ").filter(Boolean);
  if (!p.length) return "U";
  if (p.length === 1) return p[0][0]?.toUpperCase() || "U";
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Circular icon button with hover tooltip */
function IcBtn({ icon, label, onClick, active = false, children }) {
  return (
    <div className="tw">
      <button
        onClick={onClick}
        aria-label={label}
        className={`ic-btn${active ? " ic-active" : ""}`}
      >
        {icon}
        {children}
      </button>
      <span className="tb">{label}</span>
    </div>
  );
}

/** Dropdown menu row */
function DRow({ icon, label, onClick, extra = "" }) {
  return (
    <button onClick={onClick} className={`d-row ${extra}`}>
      <span className="d-icon">{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      <span className="d-arr">›</span>
    </button>
  );
}

/** Notification row */
function NRow({ title, meta, tone = "info" }) {
  const t = NTONE[tone] || NTONE.info;
  return (
    <button className="n-row">
      <span style={{
        display:"inline-flex", alignItems:"center",
        background:t.bg, border:`1px solid ${t.bd}`, color:t.clr,
        borderRadius:6, fontSize:10, fontWeight:700,
        padding:"2px 7px", flexShrink:0, marginTop:1,
      }}>{t.lbl}</span>
      <div style={{ minWidth:0 }}>
        <p style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.88)",
          marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {title}
        </p>
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.33)",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {meta}
        </p>
      </div>
    </button>
  );
}

// ─── AppNavbar ────────────────────────────────────────────────────────────────
export default function AppNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);

  const profileRef = useRef(null);
  const notifRef   = useRef(null);

  const displayName  = user?.fullName || "Alex Brown";
  const displayEmail = user?.email    || "";
  const roleLabel    = user?.company  || user?.role || "Workspace";
  const initials     = useMemo(() => getInitials(displayName), [displayName]);

  // Inject CSS once
  useEffect(() => {
    const id = "appnav-v4";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = NAV_CSS;
    document.head.appendChild(el);
    return () => { try { document.head.removeChild(el); } catch {} };
  }, []);

  // Scroll awareness
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const closeAll     = () => { setProfileOpen(false); setNotifOpen(false); setMobileOpen(false); };
  const go           = (path) => { closeAll(); navigate(path); };
  const handleLogout = () => { logout?.(); closeAll(); navigate("/login"); };

  useEscapeKey(closeAll);
  useOutsideClick(profileRef, () => setProfileOpen(false));
  useOutsideClick(notifRef,   () => setNotifOpen(false));

  return (
    <>
      <header style={{
        position:"sticky", top:0, zIndex:50, width:"100%",
        height: scrolled ? 60 : 70,
        transition:"height 0.22s cubic-bezier(0.22,1,0.36,1)",
      }}>

        {/* Glass BG layer */}
        <div style={{
          position:"absolute", inset:0,
          background: scrolled ? "rgba(5,9,15,0.92)" : "rgba(5,9,15,0.7)",
          backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
          borderBottom:"1px solid rgba(255,255,255,0.075)",
          boxShadow: scrolled
            ? "0 4px 36px rgba(0,0,0,0.55),0 1px 0 rgba(255,255,255,0.03) inset"
            : "0 2px 18px rgba(0,0,0,0.28)",
          transition:"background 0.22s ease,box-shadow 0.22s ease",
        }} />

        {/* Top accent line */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:1, pointerEvents:"none",
          background:"linear-gradient(90deg,transparent 0%,rgba(59,130,246,0.2) 30%,rgba(59,130,246,0.2) 70%,transparent 100%)",
        }} />

        {/* Inner row */}
        <div style={{
          position:"relative", 
          width:"100%",
           maxWidth:"none", 
           margin:"0 auto",
          height:"100%", 
          display:"flex", 
          alignItems:"center",
          justifyContent:"space-between", 
          padding:"0 clamp(24px, 4vw, 72px)",
           gap:12,
        }}>

          {/* ── Logo ── */}
          <button
            onClick={() => go("/dashboard")}
            style={{
              display:"flex", alignItems:"center", gap:9,
              background:"none", border:"none", cursor:"pointer",
              padding:"5px 10px 5px 4px", borderRadius:12, flexShrink:0,
              transition:"background 0.18s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <div style={{
              width:32, height:32, borderRadius:9, flexShrink:0,
              background:"linear-gradient(135deg,#2563eb,#1d4ed8)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 0 18px rgba(37,99,235,0.5),0 2px 8px rgba(0,0,0,0.4)",
              border:"1px solid rgba(255,255,255,0.12)",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l4-8 4 4 4-6 4 10"/>
              </svg>
            </div>
            <span style={{ fontSize:14.5, fontWeight:700, letterSpacing:"-0.03em", color:"rgba(255,255,255,0.92)" }}>
              FinMetrics
            </span>
          </button>

          {/* ── Center nav (desktop) ── */}
          <nav style={{
            display:"flex", alignItems:"center", gap:1,
            position:"absolute", left:"50%", transform:"translateX(-50%)",
          }} className="nc-desk">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={closeAll}
                style={{ textDecoration:"none" }}
                className="nav-lw"
              >
                {({ isActive }) => (
                  <span
                    style={{
                      position:"relative",
                      display:"inline-flex", alignItems:"center",
                      padding:"7px 13px", borderRadius:10,
                      fontSize:13.5, letterSpacing:"-0.01em",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#fff" : "rgba(255,255,255,0.56)",
                      background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                      userSelect:"none", whiteSpace:"nowrap", cursor:"pointer",
                      transition:"color 0.18s ease,background 0.18s ease",
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.color = "rgba(255,255,255,0.88)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.color = "rgba(255,255,255,0.56)";
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {item.name}
                    {!isActive && <span className="nav-ul" />}
                    {isActive  && <span className="nav-al" />}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Right side ── */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>

            {/* Mobile hamburger (hidden on desktop) */}
            <button
              onClick={() => { setMobileOpen(v => !v); setNotifOpen(false); setProfileOpen(false); }}
              className="ic-btn mob-ham"
              style={{ display:"none", borderRadius:10 }}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={17}/> : <Menu size={17}/>}
            </button>

            {/* ── Bell ── */}
            <div ref={notifRef} style={{ position:"relative" }}>
              <IcBtn
                icon={<Bell size={16}/>}
                label="Notifications"
                active={notifOpen}
                onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
              >
                <span className="notif-dot" style={{
                  position:"absolute", top:9, right:9,
                  width:6, height:6, borderRadius:"50%",
                  background:"#34d399",
                  border:"1.5px solid rgba(5,9,15,0.95)",
                }}/>
              </IcBtn>

              {notifOpen && (
                <div className="g-panel nav-drop" style={{
                  position:"absolute", right:0, top:"calc(100% + 10px)",
                  width:316, zIndex:60,
                }}>
                  <div style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"13px 16px 10px",
                    borderBottom:"1px solid rgba(255,255,255,0.07)",
                  }}>
                    <p style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.9)" }}>
                      Notifications
                    </p>
                    <button style={{
                      fontSize:11, color:"rgba(255,255,255,0.32)", background:"none",
                      border:"none", cursor:"pointer", fontFamily:"inherit", transition:"color 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.32)"}
                    >Mark all read</button>
                  </div>
                  <div style={{ padding:"6px 6px 8px" }}>
                    {MOCK_NOTIFS.map(n => <NRow key={n.id} {...n}/>)}
                  </div>
                </div>
              )}
            </div>

            {/* ── Settings ── */}
            <IcBtn
              icon={<Settings size={16}/>}
              label="Settings"
              onClick={() => go("/settings")}
            />

            {/* ── Profile identity pill ── */}
            <div ref={profileRef} style={{ position:"relative" }}>

              {/* Desktop: full pill (avatar + name + role + chevron) */}
              <button
                onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
                className={`prof-pill pill-desk${profileOpen ? " pill-open" : ""}`}
              >
                <div className="av-ring">{initials}</div>

                <div style={{
                  display:"flex", flexDirection:"column",
                  alignItems:"flex-start", lineHeight:1, minWidth:0,
                }}>
                  <span style={{
                    fontSize:13, fontWeight:600,
                    color:"rgba(255,255,255,0.9)",
                    letterSpacing:"-0.015em",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                    maxWidth:120,
                  }}>
                    {displayName}
                  </span>
                  <span style={{
                    fontSize:10.5, fontWeight:400,
                    color:"rgba(255,255,255,0.38)",
                    marginTop:3,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                    maxWidth:120,
                  }}>
                    {roleLabel}
                  </span>
                </div>

                <ChevronDown size={14} style={{
                  color:"rgba(255,255,255,0.35)",
                  transform: profileOpen ? "rotate(180deg)" : "rotate(0)",
                  transition:"transform 0.22s ease",
                  flexShrink:0, marginLeft:2,
                }}/>
              </button>

              {/* Mobile: compact pill (avatar + chevron only) */}
              <button
                onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
                className={`prof-pill pill-mob${profileOpen ? " pill-open" : ""}`}
                style={{ display:"none" }}
              >
                <div className="av-ring">{initials}</div>
                <ChevronDown size={13} style={{
                  color:"rgba(255,255,255,0.35)",
                  transform: profileOpen ? "rotate(180deg)" : "rotate(0)",
                  transition:"transform 0.22s ease",
                }}/>
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div className="g-panel nav-drop" style={{
                  position:"absolute", right:0, top:"calc(100% + 10px)",
                  width:272, zIndex:60,
                }}>
                  {/* User info header */}
                  <div style={{
                    padding:"14px 15px",
                    borderBottom:"1px solid rgba(255,255,255,0.07)",
                    display:"flex", alignItems:"center", gap:10,
                  }}>
                    <div style={{
                      width:38, height:38, borderRadius:"50%", flexShrink:0,
                      background:"linear-gradient(135deg,#3b82f6,#6366f1)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:13, fontWeight:800, color:"#fff", userSelect:"none",
                      boxShadow:"0 0 0 2px rgba(59,130,246,0.3),0 0 20px rgba(59,130,246,0.2)",
                    }}>{initials}</div>
                    <div style={{ minWidth:0 }}>
                      <p style={{
                        fontSize:13.5, fontWeight:600, color:"rgba(255,255,255,0.92)",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                        marginBottom:3,
                      }}>{displayName}</p>
                      <p style={{
                        fontSize:11.5, color:"rgba(255,255,255,0.32)",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                      }}>{displayEmail || roleLabel}</p>
                    </div>
                  </div>

                  <div style={{ padding:"6px" }}>
                    <DRow icon={<User size={15}/>}       label="My Profile"       onClick={() => go("/profile")}  />
                    <DRow icon={<Settings size={15}/>}   label="Company Settings" onClick={() => go("/settings")} />
                    <DRow icon={<HelpCircle size={15}/>} label="Help / Support"   onClick={() => go("/support")}  />
                  </div>

                  <div style={{ padding:"6px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                    <DRow icon={<LogOut size={15}/>} label="Logout" onClick={handleLogout} extra="d-logout"/>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile nav sheet ── */}
        {mobileOpen && (
          <div style={{ position:"relative", padding:"0 14px 12px" }}>
            <div className="g-panel mob-sheet" style={{ padding:"8px" }}>
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    style={{ textDecoration:"none" }}
                    className={({ isActive }) => `mob-link${isActive ? " mob-active" : ""}`}
                  >
                    <Icon size={16} style={{ color:"rgba(255,255,255,0.35)", flexShrink:0 }}/>
                    <span style={{ flex:1 }}>{item.name}</span>
                    <span style={{ color:"rgba(255,255,255,0.18)", fontSize:15 }}>›</span>
                  </NavLink>
                );
              })}

              <div style={{ height:1, background:"rgba(255,255,255,0.07)", margin:"6px 4px" }}/>

              <button className="mob-link" onClick={() => go("/profile")}
                style={{ width:"100%", border:"none", cursor:"pointer", background:"none" }}>
                <User size={16} style={{ color:"rgba(255,255,255,0.35)" }}/>
                <span style={{ flex:1 }}>My Profile</span>
              </button>

              <button className="mob-link d-logout" onClick={handleLogout}
                style={{ width:"100%", border:"none", cursor:"pointer", background:"none" }}>
                <LogOut size={16} style={{ color:"rgba(239,68,68,0.5)" }}/>
                <span style={{ flex:1 }}>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Responsive breakpoints ── */}
      <style>{`
        .nc-desk   { display:flex !important; }
        .mob-ham   { display:none !important; }
        .pill-desk { display:flex !important; }
        .pill-mob  { display:none !important; }

        @media (max-width:767px) {
          .nc-desk   { display:none !important; }
          .mob-ham   { display:flex !important; }
          .pill-desk { display:none !important; }
          .pill-mob  { display:flex !important; }
        }
      `}</style>
    </>
  );
}