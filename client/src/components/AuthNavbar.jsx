import { Link } from "react-router-dom";


export default function AuthNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[#05090f]/80 backdrop-blur-xl border-b border-white/5" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/30 transition-transform duration-200 group-hover:scale-105">
            <span className="text-white font-semibold text-sm">F</span>
          </div>

          <span className="text-white font-semibold text-lg tracking-tight">
            FinMetrics
          </span>
        </Link>

        {/* Back to home */}
        <Link
          to="/"
          className="text-sm text-white/40 hover:text-white transition-all duration-200 hover:translate-x-0.5"
        >
          ← Back to home
        </Link>
      </div>
    </nav>
  );
}