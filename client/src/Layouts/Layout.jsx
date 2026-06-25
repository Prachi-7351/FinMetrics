// import { Outlet } from "react-router-dom";
// import Navbar from "../components/Navbar";

// export default function Layout() {
//   return (
//     <div className="min-h-screen bg-[radial-gradient(circle_at_30%_20%,#111827_0%,#0B0F19_60%)] text-white">
      
//       {/* Common Navbar */}
//       <Navbar />

//       {/* Page Content */}
//       <div className="max-w-7xl mx-auto px-8 py-6">
//         <Outlet />
//       </div>

//     </div>
//   );
// }

// import { Outlet } from "react-router-dom";
// import Navbar from "../components/Navbar";

// export default function Layout() {
//   return (
//     <div className="min-h-screen bg-[#0B0F19] text-white">
//       <Navbar />
//       <div className="max-w-7xl mx-auto px-8 py-6">
//         <Outlet />
//       </div>
//     </div>
//   );
// }


import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
}