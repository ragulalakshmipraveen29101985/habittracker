import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./state/AuthContext";
import { Login } from "./screens/Login";
import { Dashboard } from "./screens/Dashboard";
import { TrackerDetail } from "./screens/TrackerDetail";
import { Archive } from "./screens/Archive";

function Routed() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--ink-mute)" }}>
        Loading…
      </div>
    );
  }
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tracker/:id" element={<TrackerDetail />} />
      <Route path="/archive" element={<Archive />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routed />
    </AuthProvider>
  );
}
