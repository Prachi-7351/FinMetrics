import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const navItem = (path, label) => (
    <Link
      to={path}
      className={`block px-4 py-2 rounded-lg transition ${
        location.pathname === path
          ? "bg-blue-600 text-white"
          : "text-gray-300 hover:bg-gray-700"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-5">
      <h1 className="text-2xl font-bold mb-8">FinMetrics</h1>
      <nav className="space-y-2">
        {navItem("/dashboard", "Dashboard")}
        {navItem("/recommendations", "AI CFO")}
        {navItem("/stress-test", "Stress Simulator")}
        {navItem("/risk-radar", "Risk Radar")}
        {navItem("/settings", "Settings")}
      </nav>
    </div>
  );
};

export default Sidebar;