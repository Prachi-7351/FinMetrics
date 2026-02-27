// const MetricCard = ({ title, value, change }) => {
//   return (
//     <div className="bg-white rounded-2xl shadow p-6">
//       <h3 className="text-gray-500 text-sm">{title}</h3>
//       <p className="text-2xl font-bold mt-2">{value}</p>
//       <p
//         className={`mt-2 text-sm ${
//           change >= 0 ? "text-green-500" : "text-red-500"
//         }`}
//       >
//         {change >= 0 ? "+" : ""}
//         {change}% this month
//       </p>
//     </div>
//   );
// };

// export default MetricCard;


//---------------------------------------------------------------------------
import React from "react";

const MetricCard = ({
  title,
  value,
  change,
  changeType = "positive", // "positive" | "negative"
  subtitle,
}) => {
  return (
    <div className="relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] p-6 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
      
      {/* Title */}
      <p className="text-sm text-slate-400 font-medium">{title}</p>

      {/* Main Value */}
      <h2 className="text-3xl font-semibold text-white mt-2 tracking-tight">
        {value}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      )}

      {/* Change Indicator */}
      {change && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              changeType === "positive"
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {change}
          </span>
          <span className="text-xs text-slate-500">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;