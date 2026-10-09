// import {
//   TrendingUp,
//   TrendingDown,
//   BarChart3,
// } from "lucide-react";

// const stocks = [
//   {
//     name: "Google",
//     symbol: "GOOGL",
//     price: "$174.82",
//     change: "+2.31%",
//     up: true,
//   },
//   {
//     name: "Amazon",
//     symbol: "AMZN",
//     price: "$192.45",
//     change: "+1.14%",
//     up: true,
//   },
//   {
//     name: "NVIDIA",
//     symbol: "NVDA",
//     price: "$131.76",
//     change: "-0.92%",
//     up: false,
//   },
// ];

// export default function Watchlist() {
//   return (
//     <aside className="watchlist-panel">

//       <div className="watchlist-card">

//         <h3>Watchlist</h3>

//         {stocks.map((stock) => (
//           <div className="stock-item" key={stock.symbol}>

//             <div>

//               <h4>{stock.name}</h4>

//               <span>{stock.symbol}</span>

//             </div>

//             <div className="stock-price">

//               <strong>{stock.price}</strong>

//               <p className={stock.up ? "positive" : "negative"}>
//                 {stock.up ? (
//                   <TrendingUp size={14} />
//                 ) : (
//                   <TrendingDown size={14} />
//                 )}

//                 {stock.change}
//               </p>

//             </div>

//           </div>
//         ))}

//       </div>

//       <div className="prediction-card">

//         <div className="prediction-top">

//           <div>

//             <h3>Apple Prediction</h3>

//             <span>Next 30 Days</span>

//           </div>

//           <BarChart3 size={20} />

//         </div>

//         <div className="fake-chart">

//           <div className="line one"></div>
//           <div className="line two"></div>
//           <div className="line three"></div>

//         </div>

//         <div className="prediction-bottom">

//           <div>

//             <h2>+8.7%</h2>

//             <p>Expected Growth</p>

//           </div>

//           <div className="confidence">

//             <h2>87%</h2>

//             <p>Confidence</p>

//           </div>

//         </div>

//       </div>

//       <div className="sector-card">

//         <h3>Portfolio Allocation</h3>

//         <div className="sector">

//           <span>Technology</span>

//           <div className="progress">
//             <div style={{ width: "72%" }}></div>
//           </div>

//         </div>

//         <div className="sector">

//           <span>Finance</span>

//           <div className="progress">
//             <div style={{ width: "52%" }}></div>
//           </div>

//         </div>

//         <div className="sector">

//           <span>Healthcare</span>

//           <div className="progress">
//             <div style={{ width: "38%" }}></div>
//           </div>

//         </div>

//       </div>

//     </aside>
//   );
// }

import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";

const WATCHLIST = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "GOOGL", name: "Google" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "AMZN", name: "Amazon" },
];

export default function Watchlist() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWatchlist();
  }, []);

  async function loadWatchlist() {
    try {
      const requests = WATCHLIST.map((stock) =>
        api.get(`/stock/${stock.symbol}`)
      );

      const responses = await Promise.all(requests);

      const liveStocks = responses.map((res, index) => ({
        ...WATCHLIST[index],
        ...res.data.data,
      }));

      setStocks(liveStocks);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }

  return (
    <aside className="w-full">
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-4 shadow-lg">

        <h3 className="text-white text-base font-semibold mb-3">
          Live Watchlist
        </h3>

        {loading && (
          <div className="flex justify-center py-6">
            <Loader2
              className="animate-spin text-cyan-400"
              size={20}
            />
          </div>
        )}

        {!loading &&
          stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between py-3 border-b border-slate-800 last:border-none"
            >
              {/* Left */}

              <div>
                <h4 className="text-white text-sm font-semibold">
                  {stock.symbol}
                </h4>

                <p className="text-xs text-slate-400">
                  {stock.name}
                </p>
              </div>

              {/* Right */}

              <div className="text-right">

                <p className="text-white text-sm font-semibold">
                  ${stock.c?.toFixed(2)}
                </p>

                <div
                  className={`flex items-center justify-end gap-1 text-xs font-medium ${
                    stock.d >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {stock.d >= 0 ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}

                  {stock.dp?.toFixed(2)}%
                </div>

              </div>
            </div>
          ))}
      </div>
    </aside>
  );
}