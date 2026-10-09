// import { useRef } from "react";
// import {
//   SendHorizonal,
//   Mic,
//   Paperclip,
//   Sparkles,
//   BarChart3,
//   TrendingUp,
//   DollarSign,
//  Building2,
// } from "lucide-react";

// const QUICK_PROMPTS = [
//   {
//     icon: <BarChart3 size={16} />,
//     text: "Analyze my business health",
//   },
//   {
//     icon: <DollarSign size={16} />,
//     text: "Reduce expenses",
//   },
//   {
//     icon: <TrendingUp size={16} />,
//     text: "Improve cash flow",
//   },
//   {
//     icon: <Building2 size={16} />,
//     text: "Analyze Apple",
//   },
//   {
//     icon: <Building2 size={16} />,
//     text: "Analyze NVIDIA",
//   },
//   {
//     icon: <Sparkles size={16} />,
//     text: "Growth strategy",
//   },
// ];

// export default function AIInputBox({
//   prompt,
//   setPrompt,
//   askAI,
//   loading,
// }) {
//   const inputRef = useRef(null);

//   function handleSubmit() {
//     askAI(prompt);
//   }

//   return (
//     <div
//       className="glass-card"
//       style={{
//         borderRadius: 28,
//         padding: 30,
//         marginBottom: 28,
//       }}
//     >
//       {/* Heading */}

//       <div
//         style={{
//           marginBottom: 24,
//         }}
//       >
//         <h2
//           style={{
//             color: "#fff",
//             fontSize: 28,
//             marginBottom: 8,
//             fontWeight: 700,
//           }}
//         >
//           Ask your AI CFO
//         </h2>

//         <p
//           style={{
//             color: "#94A3B8",
//             lineHeight: 1.7,
//             fontSize: 15,
//           }}
//         >
//           Ask about your company, upload financial reports,
//           analyze live markets, compare companies or
//           generate executive insights.
//         </p>
//       </div>

//       {/* Prompt */}

//       <div
//         style={{
//           borderRadius: 28,
//           border: "1px solid rgba(255,255,255,.08)",
//           background:
//             "linear-gradient(180deg,#111827,#0F172A)",
//           padding: 22,
//           minHeight: 210,
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "space-between",
//         }}
//       >
//         <textarea
//           ref={inputRef}
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           placeholder="Ask anything about your company, financial strategy, budgeting, stock market, revenue forecast, investments or business risks..."
//           rows={6}
//           style={{
//             width: "100%",
//             background: "transparent",
//             border: "none",
//             outline: "none",
//             resize: "none",
//             color: "#fff",
//             fontSize: 17,
//             lineHeight: 1.8,
//           }}
//         />

//         {/* Bottom */}

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginTop: 24,
//             flexWrap: "wrap",
//             gap: 16,
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               gap: 12,
//               flexWrap: "wrap",
//             }}
//           >
//             <button className="btn-secondary">
//               <Paperclip
//                 size={17}
//                 style={{
//                   marginRight: 8,
//                 }}
//               />
//               Upload
//             </button>

//             <button className="btn-secondary">
//               <Mic
//                 size={17}
//                 style={{
//                   marginRight: 8,
//                 }}
//               />
//               Voice
//             </button>

//             <button className="btn-secondary">
//               <Sparkles
//                 size={17}
//                 style={{
//                   marginRight: 8,
//                 }}
//               />
//               Deep Research
//             </button>
//           </div>

//           <button
//             className="btn-primary"
//             onClick={handleSubmit}
//             disabled={loading}
//             style={{
//               minWidth: 170,
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               gap: 10,
//             }}
//           >
//             <SendHorizonal size={18} />

//             {loading ? "Thinking..." : "Ask AI CFO"}
//           </button>
//         </div>
//       </div>

//       {/* Quick prompts */}

//       <div
//         style={{
//           display: "flex",
//           flexWrap: "wrap",
//           gap: 14,
//           marginTop: 26,
//         }}
//       >
//         {QUICK_PROMPTS.map((item) => (
//           <button
//             key={item.text}
//             onClick={() => setPrompt(item.text)}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 10,
//               padding: "12px 18px",
//               borderRadius: 999,
//               border: "1px solid rgba(255,255,255,.08)",
//               background: "rgba(255,255,255,.03)",
//               color: "#CBD5E1",
//               cursor: "pointer",
//               transition: ".25s",
//               fontSize: 14,
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.background =
//                 "rgba(37,99,235,.12)";
//               e.currentTarget.style.border =
//                 "1px solid rgba(59,130,246,.4)";
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.background =
//                 "rgba(255,255,255,.03)";
//               e.currentTarget.style.border =
//                 "1px solid rgba(255,255,255,.08)";
//             }}
//           >
//             {item.icon}
//             {item.text}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import {
  Plus,
  Globe,
  Mic,
  Send,
  Sparkles,
} from "lucide-react";

export default function AIInput({ onSend }) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!prompt.trim()) return;

    onSend(prompt);
    setPrompt("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="ai-input-wrapper">

      <div className="ai-input-box">

        <input
          type="text"
          placeholder="Ask anything about stocks, investments, mutual funds..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="input-bottom">

          <div className="input-left">

            <button className="icon-btn">
              <Plus size={18} />
            </button>

            <button className="research-btn">
              <Sparkles size={16} />
              Deep Research
            </button>

          </div>

          <div className="input-right">

            <button className="icon-btn">
              <Globe size={18} />
            </button>

            <button className="icon-btn">
              <Mic size={18} />
            </button>

            <button
              className="send-btn"
              onClick={handleSubmit}
            >
              <Send size={18} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}