import { Outlet } from "react-router-dom";
import AuthNavbar from "../components/AuthNavbar";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <AuthNavbar />
      <Outlet />
    </div>
  );
}