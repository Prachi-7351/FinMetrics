




// import { NavLink } from "react-router-dom";

// const navItems = [
//   { name: "Dashboard", path: "/dashboard" },
//   { name: "Risk Radar", path: "/risk-radar" },
//   { name: "Stress Simulator", path: "/stress-simulator" },
//   { name: "AI Recommendations", path: "/ai-recommendations" },
//   { name: "Settings", path: "/settings" },
// ];

// export default function Navbar() {
//   return (
//     <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/5 border-b border-white/10">
//       <div className="max-w-7xl mx-auto px-8">
//         <div className="flex items-center justify-between h-14">

//           {/* Logo */}
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold">
//               F
//             </div>
//             <span className="text-white font-semibold tracking-tight">
//               FinMetrics
//             </span>
//           </div>

//           {/* Links */}
//           <div className="flex items-center gap-8 text-sm font-medium">
//             {navItems.map((item) => (
//               <NavLink
//                 key={item.name}
//                 to={item.path}
//                 className={({ isActive }) =>
//                   `relative transition-all duration-200 ${
//                     isActive
//                       ? "text-white"
//                       : "text-slate-400 hover:text-white"
//                   }`
//                 }
//               >
//                 {({ isActive }) => (
//                   <div className="relative">
//                     {item.name}
//                     {isActive && (
//                       <span className="absolute -bottom-4 left-0 w-full h-[2px] bg-blue-500 rounded-full" />
//                     )}
//                   </div>
//                 )}
//               </NavLink>
//             ))}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }


import { NavLink } from "react-router-dom";

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Risk Radar", path: "/risk-radar" },
  { name: "Stress Simulator", path: "/stress-simulator" },
  { name: "AI Recommendations", path: "/ai-recommendations" },
  { name: "Settings", path: "/settings" },
];

export default function Navbar() {
  return (
    <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-center h-14 gap-10 text-sm font-medium">

          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `relative transition-all duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <div className="relative">
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-4 left-0 w-full h-[2px] bg-blue-500 rounded-full" />
                  )}
                </div>
              )}
            </NavLink>
          ))}

        </div>
      </div>
    </div>
  );
}