import { useEffect, useState } from "react";
import {
  Wallet,
  TrendingUp,
  BriefcaseBusiness,
  Award,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import api from "../../services/api";

const PortfolioSummary = () => {
  const [summary, setSummary] = useState({
    value: 0,
    todayReturn: 0,
    holdings: 0,
    bestPerformer: "-",
    risk: "Moderate",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      // Change this endpoint according to your backend
      const { data } = await api.get("/portfolio/summary");

      setSummary({
        value: data.value || 0,
        todayReturn: data.todayReturn || 0,
        holdings: data.holdings || 0,
        bestPerformer: data.bestPerformer || "-",
        risk: data.risk || "Moderate",
      });
    } catch (err) {
      console.log(err);

      // Temporary demo values
      setSummary({
        value: 845230,
        todayReturn: 5234,
        holdings: 12,
        bestPerformer: "NVDA",
        risk: "Moderate",
      });
    }

    setLoading(false);
  };

  const riskColor = () => {
    switch (summary.risk.toLowerCase()) {
      case "low":
        return "text-green-400";

      case "high":
        return "text-red-400";

      default:
        return "text-yellow-400";
    }
  };

  return (
    <div className="bg-[#111827] border border-slate-700 rounded-2xl p-4 mt-5 shadow-lg">

      <h2 className="text-white text-lg font-semibold mb-5">
        Portfolio Summary
      </h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-cyan-400" size={28} />
        </div>
      ) : (
        <div className="space-y-5">

          {/* Total Value */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="p-2 rounded-lg bg-cyan-500/20">

                <Wallet className="text-cyan-400" size={20} />

              </div>

              <span className="text-slate-400 text-sm">
                Portfolio Value
              </span>

            </div>

            <span className="text-white font-bold text-lg">
              ₹{summary.value.toLocaleString()}
            </span>

          </div>

          {/* Today's Return */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="p-2 rounded-lg bg-green-500/20">

                <TrendingUp className="text-green-400" size={20} />

              </div>

              <span className="text-slate-400 text-sm">
                Today's Return
              </span>

            </div>

            <span
              className={`font-semibold ${
                summary.todayReturn >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {summary.todayReturn >= 0 ? "+" : "-"}₹
              {Math.abs(summary.todayReturn).toLocaleString()}
            </span>

          </div>

          {/* Holdings */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="p-2 rounded-lg bg-blue-500/20">

                <BriefcaseBusiness
                  className="text-blue-400"
                  size={20}
                />

              </div>

              <span className="text-slate-400 text-sm">
                Holdings
              </span>

            </div>

            <span className="text-white font-semibold">
              {summary.holdings}
            </span>

          </div>

          {/* Best Performer */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="p-2 rounded-lg bg-yellow-500/20">

                <Award className="text-yellow-400" size={20} />

              </div>

              <span className="text-slate-400 text-sm">
                Best Performer
              </span>

            </div>

            <span className="text-white font-semibold">
              {summary.bestPerformer}
            </span>

          </div>

          {/* Risk */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="p-2 rounded-lg bg-red-500/20">

                <ShieldCheck
                  className="text-red-400"
                  size={20}
                />

              </div>

              <span className="text-slate-400 text-sm">
                Risk Level
              </span>

            </div>

            <span className={`font-semibold ${riskColor()}`}>
              {summary.risk}
            </span>

          </div>

        </div>
      )}
    </div>
  );
};

export default PortfolioSummary;