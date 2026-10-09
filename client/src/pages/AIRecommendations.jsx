import { useState } from "react";
import AISidebar from "../components/ai/AISidebar";
import api from "../services/api";
import AILanding from "../components/ai/AILanding";
import AIInput from "../components/ai/AIInput";
import Watchlist from "../components/ai/Watchlist";
import SuggestionCards from "../components/ai/SuggestionCards";
import ReactMarkdown from "react-markdown";
import "../styles/ai.css";
import PortfolioSummary from "../components/ai/PortfolioSummary";
export default function AIRecommendations() {
    const [messages, setMessages] = useState([]);

    const [loading, setLoading] = useState(false);

    const handleSend = async (prompt) => {
        if (!prompt.trim()) return;

        setMessages((prev) => [
            ...prev,
            {
                type: "user",
                text: prompt,
            },
        ]);

        setLoading(true);

        try {
            const { data } = await api.post("/ai/cfo", {
                prompt,
            });

            setMessages((prev) => [
                ...prev,
                {
                    type: "ai",
                    text:
                        data.answer ||
                        data.response ||
                        data.message ||
                        "No response received.",
                },
            ]);
        } catch (err) {
            console.error(err);

            setMessages((prev) => [
                ...prev,
                {
                    type: "ai",
                    text: "Unable to get AI response.",
                },
            ]);
        }

        setLoading(false);
    };

    return (
        <div className="ai-page">

            {/* Existing Sidebar */}
            <AISidebar />

            {/* Main */}
            <main className="ai-main">

                <div className="ai-center">

                    {messages.length === 0 ? (
                        <>
                            <AILanding />
                            <SuggestionCards />
                        </>
                    ) : (
                        <div className="chat-container">

                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={
                                        msg.type === "user"
                                            ? "message user-message"
                                            : "message ai-message"
                                    }
                                >
                                    <ReactMarkdown>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            ))}

                            {loading && (
                                <div className="message ai-message">
                                    <div className="typing-loader">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    <AIInput onSend={handleSend} />

                </div>

            </main>

            {/* Right Panel */}
            <div className="w-72 shrink-0 p-4 flex flex-col gap-4 overflow-y-auto overflow-x-hidden border-l border-slate-800 bg-[#0B1220]">

                <Watchlist />

                <PortfolioSummary />

            </div>

        </div>
    );
}