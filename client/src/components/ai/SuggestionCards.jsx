// import {
//   ArrowUpRight,
//   Clock3,
//   Gauge,
//   BrainCircuit,
//   CircleDollarSign,
//   ChevronRight,
// } from "lucide-react";

// const priorityColors = {
//   critical: "#EF4444",
//   high: "#F97316",
//   medium: "#EAB308",
//   low: "#22C55E",
// };

// function MetricChip({ label, value }) {
//   return (
//     <div
//       style={{
//         background: "rgba(255,255,255,.04)",
//         border: "1px solid rgba(255,255,255,.06)",
//         borderRadius: 14,
//         padding: "12px",
//       }}
//     >
//       <div
//         style={{
//           color: "#94A3B8",
//           fontSize: 12,
//           marginBottom: 6,
//         }}
//       >
//         {label}
//       </div>

//       <div
//         style={{
//           color: "#fff",
//           fontWeight: 700,
//           fontSize: 16,
//         }}
//       >
//         {value}
//       </div>
//     </div>
//   );
// }

// export default function RecommendationCards({
//   recommendations = [],
// }) {
//   if (!recommendations.length) return null;

//   return (
//     <section
//       style={{
//         marginBottom: 34,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 24,
//           flexWrap: "wrap",
//           gap: 12,
//         }}
//       >
//         <div>
//           <h2
//             style={{
//               color: "#fff",
//               fontSize: 30,
//               fontWeight: 700,
//               marginBottom: 8,
//             }}
//           >
//             AI Recommendations
//           </h2>

//           <p
//             style={{
//               color: "#94A3B8",
//             }}
//           >
//             Executive actions ranked by impact,
//             confidence and implementation effort.
//           </p>
//         </div>

//         <div
//           style={{
//             padding: "10px 18px",
//             borderRadius: 999,
//             background: "rgba(37,99,235,.10)",
//             color: "#60A5FA",
//             fontWeight: 600,
//           }}
//         >
//           {recommendations.length} Recommendations
//         </div>
//       </div>

//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns:
//             "repeat(auto-fit,minmax(390px,1fr))",
//           gap: 24,
//         }}
//       >
//         {recommendations.map((rec, index) => (
//           <div
//             key={rec.id || index}
//             className="glass-card"
//             style={{
//               borderRadius: 26,
//               overflow: "hidden",
//               border: `1px solid ${
//                 priorityColors[
//                   rec.priority?.toLowerCase()
//                 ] || "#334155"
//               }`,
//               transition: ".3s",
//             }}
//           >
//             {/* Top Ribbon */}

//             <div
//               style={{
//                 padding: "20px 24px",
//                 background:
//                   "linear-gradient(90deg,#0F172A,#172554)",
//                 borderBottom:
//                   "1px solid rgba(255,255,255,.06)",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent:
//                     "space-between",
//                   alignItems: "center",
//                 }}
//               >
//                 <div
//                   style={{
//                     padding: "6px 14px",
//                     borderRadius: 999,
//                     background:
//                       priorityColors[
//                         rec.priority?.toLowerCase()
//                       ] || "#2563EB",
//                     color: "#fff",
//                     fontSize: 12,
//                     fontWeight: 700,
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   {rec.priority}
//                 </div>

//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 6,
//                     color: "#60A5FA",
//                     fontWeight: 600,
//                   }}
//                 >
//                   <BrainCircuit size={16} />
//                   {rec.confidence || 95}%
//                 </div>
//               </div>

//               <h3
//                 style={{
//                   color: "#fff",
//                   marginTop: 18,
//                   marginBottom: 10,
//                   fontSize: 24,
//                 }}
//               >
//                 {rec.title}
//               </h3>

//               <p
//                 style={{
//                   color: "#CBD5E1",
//                   lineHeight: 1.7,
//                 }}
//               >
//                 {rec.desc}
//               </p>
//             </div>

//             {/* Metrics */}

//             <div
//               style={{
//                 padding: 24,
//               }}
//             >
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns:
//                     "repeat(2,1fr)",
//                   gap: 14,
//                   marginBottom: 22,
//                 }}
//               >
//                 <MetricChip
//                   label="Impact"
//                   value={rec.impact}
//                 />

//                 <MetricChip
//                   label="Effort"
//                   value={rec.effort}
//                 />

//                 <MetricChip
//                   label="Confidence"
//                   value={`${rec.confidence}%`}
//                 />

//                 <MetricChip
//                   label="Priority"
//                   value={rec.priority}
//                 />
//               </div>

//               {/* Confidence */}

//               <div
//                 style={{
//                   marginBottom: 24,
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent:
//                       "space-between",
//                     marginBottom: 8,
//                   }}
//                 >
//                   <span
//                     style={{
//                       color: "#94A3B8",
//                       fontSize: 13,
//                     }}
//                   >
//                     AI Confidence
//                   </span>

//                   <span
//                     style={{
//                       color: "#fff",
//                     }}
//                   >
//                     {rec.confidence}%
//                   </span>
//                 </div>

//                 <div
//                   style={{
//                     height: 10,
//                     background: "#1E293B",
//                     borderRadius: 999,
//                     overflow: "hidden",
//                   }}
//                 >
//                   <div
//                     style={{
//                       width: `${rec.confidence}%`,
//                       height: "100%",
//                       background:
//                         "linear-gradient(90deg,#2563EB,#38BDF8)",
//                     }}
//                   />
//                 </div>
//               </div>

//               {/* KPI Chips */}

//               <div
//                 style={{
//                   display: "flex",
//                   gap: 10,
//                   flexWrap: "wrap",
//                   marginBottom: 22,
//                 }}
//               >
//                 <div
//                   style={{
//                     padding: "8px 14px",
//                     borderRadius: 999,
//                     background:
//                       "rgba(34,197,94,.10)",
//                     color: "#22C55E",
//                     display: "flex",
//                     gap: 6,
//                     alignItems: "center",
//                   }}
//                 >
//                   <ArrowUpRight size={15} />
//                   ROI
//                 </div>

//                 <div
//                   style={{
//                     padding: "8px 14px",
//                     borderRadius: 999,
//                     background:
//                       "rgba(59,130,246,.10)",
//                     color: "#60A5FA",
//                     display: "flex",
//                     gap: 6,
//                     alignItems: "center",
//                   }}
//                 >
//                   <Gauge size={15} />
//                   KPI
//                 </div>

//                 <div
//                   style={{
//                     padding: "8px 14px",
//                     borderRadius: 999,
//                     background:
//                       "rgba(250,204,21,.10)",
//                     color: "#FACC15",
//                     display: "flex",
//                     gap: 6,
//                     alignItems: "center",
//                   }}
//                 >
//                   <Clock3 size={15} />
//                   Short Term
//                 </div>

//                 <div
//                   style={{
//                     padding: "8px 14px",
//                     borderRadius: 999,
//                     background:
//                       "rgba(168,85,247,.10)",
//                     color: "#C084FC",
//                     display: "flex",
//                     gap: 6,
//                     alignItems: "center",
//                   }}
//                 >
//                   <CircleDollarSign
//                     size={15}
//                   />
//                   Finance
//                 </div>
//               </div>

//               {/* AI Reasoning */}

//               <div
//                 style={{
//                   padding: 18,
//                   borderRadius: 18,
//                   background:
//                     "rgba(37,99,235,.08)",
//                   border:
//                     "1px solid rgba(37,99,235,.18)",
//                 }}
//               >
//                 <div
//                   style={{
//                     color: "#60A5FA",
//                     fontWeight: 700,
//                     marginBottom: 10,
//                   }}
//                 >
//                   AI Reasoning
//                 </div>

//                 <p
//                   style={{
//                     color: "#CBD5E1",
//                     lineHeight: 1.8,
//                   }}
//                 >
//                   {rec.reasoning}
//                 </p>
//               </div>

//               {/* Footer */}

//               <button
//                 className="btn-primary"
//                 style={{
//                   width: "100%",
//                   marginTop: 22,
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   gap: 8,
//                 }}
//               >
//                 View Complete Analysis

//                 <ChevronRight size={18} />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

import {
  TrendingUp,
  PieChart,
  Building2,
} from "lucide-react";

const suggestions = [
  {
    icon: <TrendingUp size={24} />,
    title: "Analyze today's market sentiment",
    color: "#22c55e",
  },
  {
    icon: <PieChart size={24} />,
    title: "Suggest a better diversification strategy",
    color: "#facc15",
  },
  {
    icon: <Building2 size={24} />,
    title: "Break down a company's financial health",
    color: "#38bdf8",
  },
];

export default function SuggestionCards({ onSelect }) {
  return (
    <div className="suggestion-grid">
      {suggestions.map((item, index) => (
        <div
          key={index}
          className="suggestion-card"
          onClick={() => onSelect(item.title)}
        >
          <div
            className="suggestion-icon"
            style={{
              color: item.color,
            }}
          >
            {item.icon}
          </div>

          <h3>{item.title}</h3>

          <p>
            Click to instantly generate AI insights and recommendations.
          </p>
        </div>
      ))}
    </div>
  );
}