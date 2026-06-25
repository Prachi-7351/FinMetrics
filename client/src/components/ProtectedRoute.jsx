// client/src/components/ProtectedRoute.jsx
// REPLACE the entire file with this version:

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Wait for the auth check to finish before deciding
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#080C14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: "2px solid #3b82f6",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
