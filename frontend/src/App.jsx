
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import ResourceManager from "./components/ResourceManager";
import { useAuth } from "./context/AuthContext";

function RoleDashboard() {
  const { user } = useAuth();

  if (user?.role === "faculty") {
    return <FacultyDashboard />;
  }

  if (user?.role === "student") {
    return <Dashboard />;
  }

  return <Navigate to="/" replace />;
}

function DashboardRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="state-card">Loading your account…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!["student", "faculty"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <RoleDashboard />;
}

function LoginRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="state-card">Loading your account…</div>;
  }

  if (user && ["student", "faculty"].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
}

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<LoginRoute />} />

        <Route path="/dashboard" element={<DashboardRoute />} />

        <Route
          path="/courses"
          element={
            <ProtectedRoute roles={["student", "faculty"]}>
              <ResourceManager kind="courses" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute roles={["student", "faculty"]}>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </>
  );
}
