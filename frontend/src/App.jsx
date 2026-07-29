import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import Profile from "./pages/Profile";

function Home() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (user) {
    const roleRedirect = { STUDENT: "/student", ADMIN: "/admin", WORKER: "/worker" };
    return <Navigate to={roleRedirect[user.role] || "/login"} replace />;
  }

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: "500px", margin: "3rem auto", textAlign: "center" }}>
        <h1>Smart Hostel Complaint Management System</h1>
        <p>Report hostel issues online, track resolution status, and get things fixed faster.</p>
        <div style={{ marginTop: "1.5rem" }}>
          <Link to="/login"><button>Login</button></Link>
          <Link to="/register" style={{ marginLeft: "1rem" }}><button>Register</button></Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker"
            element={
              <ProtectedRoute allowedRoles={["WORKER"]}>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}