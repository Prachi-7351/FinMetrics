// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import AIRecommendations from "./pages/AIRecommendations";
// import StressSimulator from "./pages/StressSimulator";
// import RiskRadar from "./pages/RiskRadar";
// import Settings from "./pages/Settings";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/recommendations" element={<AIRecommendations />} />
//         <Route path="/stress-test" element={<StressSimulator />} />
//         <Route path="/risk-radar" element={<RiskRadar />} />
//         <Route path="/settings" element={<Settings />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Landing from "./pages/LandingPage";
// import Dashboard from "./pages/Dashboard";
// import RiskRadar from "./pages/RiskRadar";
// import StressSimulator from "./pages/StressSimulator";
// import AIRecommendations from "./pages/AIRecommendations";
// import Settings from "./pages/Settings";

// import Layout from "./Layouts/Layout";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* Landing page — NO navbar */}
//         <Route path="/" element={<Landing />} />

//         {/* Internal app pages — WITH navbar */}
//         <Route path="/app" element={<Layout />}>
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="risk-radar" element={<RiskRadar />} />
//           <Route path="stress-simulator" element={<StressSimulator />} />
//           <Route path="ai-recommendations" element={<AIRecommendations />} />
//           <Route path="settings" element={<Settings />} />
//         </Route>

//       </Routes>
//     </BrowserRouter>
//   );
// }



import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import RiskRadar from "./pages/RiskRadar";
import StressSimulator from "./pages/StressSimulator";
import AIRecommendations from "./pages/AIRecommendations";
import Settings from "./pages/Settings";
import Layout from "./Layouts/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing (no navbar) */}
        <Route path="/" element={<LandingPage />} />

        {/* All pages with navbar */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/risk-radar" element={<RiskRadar />} />
          <Route path="/stress-simulator" element={<StressSimulator />} />
          <Route path="/ai-recommendations" element={<AIRecommendations />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}