import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/publicNavbar.jsx";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <PublicNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}



