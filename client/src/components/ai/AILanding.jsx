// import FadeUp from "../animations/FadeUp";
// import {
//   Sparkles,
//   BrainCircuit,
//   Download,
//   Trash2,
//   Activity,
// } from "lucide-react";

// export default function AIHero({
//   downloadConversation,
//   clearConversation,
// }) {
//   return (
//     <FadeUp>
//       <section
//         className="glass-card"
//         style={{
//           position: "relative",
//           overflow: "hidden",
//           borderRadius: 28,
//           padding: "42px",
//           marginBottom: 28,
//           background:
//             "linear-gradient(135deg,#0f172a 0%,#111827 55%,#172554 100%)",
//           border: "1px solid rgba(59,130,246,.18)",
//         }}
//       >
//         {/* Glow */}
//         <div
//           style={{
//             position: "absolute",
//             width: 320,
//             height: 320,
//             borderRadius: "50%",
//             background: "#2563eb",
//             filter: "blur(120px)",
//             opacity: 0.18,
//             top: -130,
//             right: -100,
//             pointerEvents: "none",
//           }}
//         />

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             gap: 30,
//             flexWrap: "wrap",
//             position: "relative",
//             zIndex: 2,
//           }}
//         >
//           {/* LEFT */}
//           <div style={{ flex: 1, minWidth: 350 }}>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 10,
//                 marginBottom: 20,
//                 flexWrap: "wrap",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 8,
//                   padding: "7px 15px",
//                   borderRadius: 999,
//                   background: "rgba(37,99,235,.15)",
//                   border: "1px solid rgba(59,130,246,.25)",
//                 }}
//               >
//                 <Activity size={15} color="#60A5FA" />

//                 <span
//                   style={{
//                     color: "#93C5FD",
//                     fontWeight: 600,
//                     fontSize: 13,
//                   }}
//                 >
//                   LIVE AI
//                 </span>
//               </div>

//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 8,
//                   padding: "7px 15px",
//                   borderRadius: 999,
//                   background: "rgba(16,185,129,.10)",
//                   border: "1px solid rgba(16,185,129,.20)",
//                 }}
//               >
//                 <BrainCircuit size={15} color="#34D399" />

//                 <span
//                   style={{
//                     color: "#6EE7B7",
//                     fontWeight: 600,
//                     fontSize: 13,
//                   }}
//                 >
//                   GPT Financial Intelligence
//                 </span>
//               </div>
//             </div>

//             <h1
//               style={{
//                 color: "#fff",
//                 fontSize: 44,
//                 fontWeight: 800,
//                 marginBottom: 14,
//                 lineHeight: 1.1,
//               }}
//             >
//               AI Financial Copilot
//             </h1>

//             <p
//               style={{
//                 color: "#94A3B8",
//                 fontSize: 17,
//                 lineHeight: 1.8,
//                 maxWidth: 720,
//               }}
//             >
//               Analyze financial statements, discover business risks,
//               understand live market movements, generate executive reports,
//               receive AI-powered recommendations, and simulate future business
//               scenarios — all from one intelligent workspace.
//             </p>

//             <div
//               style={{
//                 display: "flex",
//                 gap: 14,
//                 marginTop: 28,
//                 flexWrap: "wrap",
//               }}
//             >
//               {[
//                 "Live Stocks",
//                 "Risk Detection",
//                 "Executive Reports",
//                 "AI CFO",
//                 "Financial Forecasting",
//               ].map((item) => (
//                 <div
//                   key={item}
//                   style={{
//                     padding: "10px 18px",
//                     borderRadius: 999,
//                     background: "rgba(255,255,255,.05)",
//                     color: "#CBD5E1",
//                     border: "1px solid rgba(255,255,255,.06)",
//                     fontSize: 14,
//                   }}
//                 >
//                   {item}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* RIGHT */}
//           <div
//             style={{
//               width: 320,
//               display: "flex",
//               flexDirection: "column",
//               gap: 18,
//             }}
//           >
//             <div
//               className="glass-card"
//               style={{
//                 borderRadius: 22,
//                 padding: 24,
//                 background: "rgba(255,255,255,.04)",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   marginBottom: 18,
//                 }}
//               >
//                 <span
//                   style={{
//                     color: "#94A3B8",
//                   }}
//                 >
//                   AI Status
//                 </span>

//                 <Sparkles color="#60A5FA" size={18} />
//               </div>

//               <h2
//                 style={{
//                   color: "#fff",
//                   fontSize: 34,
//                   marginBottom: 10,
//                 }}
//               >
//                 Online
//               </h2>

//               <div
//                 style={{
//                   height: 10,
//                   width: "100%",
//                   background: "#1E293B",
//                   borderRadius: 999,
//                   overflow: "hidden",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "96%",
//                     height: "100%",
//                     background:
//                       "linear-gradient(90deg,#2563EB,#38BDF8)",
//                   }}
//                 />
//               </div>

//               <div
//                 style={{
//                   marginTop: 12,
//                   color: "#60A5FA",
//                   fontSize: 13,
//                 }}
//               >
//                 System Confidence : 96%
//               </div>
//             </div>

//             <button
//               onClick={downloadConversation}
//               className="btn-primary"
//               style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 gap: 10,
//               }}
//             >
//               <Download size={18} />
//               Export Conversation
//             </button>

//             <button
//               onClick={clearConversation}
//               className="btn-secondary"
//               style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 gap: 10,
//               }}
//             >
//               <Trash2 size={18} />
//               Clear Conversation
//             </button>
//           </div>
//         </div>
//       </section>
//     </FadeUp>
//   );
// }

import { Sparkles } from "lucide-react";

export default function AILanding() {
  return (
    <div className="ai-landing">

      <div className="hero-left">

        <div className="hero-badge">
          <Sparkles size={16} />
          FinMetric AI
        </div>

        <h1 className="hero-title">
          Your Stock Analyst,
          <br />
          Powered by <span>FinMetric AI</span>
        </h1>

        <p className="hero-subtitle">
          Turn every investment question into actionable insights using
          AI-powered financial analysis, prediction and portfolio guidance.
        </p>

      </div>

      <div className="hero-right">

        <div className="orb-container">

          <div className="orb outer"></div>
          <div className="orb middle"></div>
          <div className="orb inner"></div>

          <div className="pulse pulse1"></div>
          <div className="pulse pulse2"></div>
          <div className="pulse pulse3"></div>

        </div>

      </div>

    </div>
  );
}