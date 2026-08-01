import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  async function loadComplaints() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/complaints/assigned");
      setComplaints(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  async function handleComplete(complaintId) {
    setActionError("");
    try {
      await api.patch(`/complaints/${complaintId}/complete`);
      loadComplaints();
    } catch (err) {
      setActionError(err.response?.data?.error || "Failed to mark complete");
    }
  }

  return (
    <div className="page">
      <div className="header-row">
  <div>
    <h2 style={{ margin: 0 }}>Worker Dashboard</h2>
    <p style={{ margin: 0, color: "#666" }}>Welcome, {user.name}</p>
  </div>
  <button onClick={logout}>Logout</button>
</div>


        <div className="card">
      <h3>Assigned Complaints</h3>
      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}
      {actionError && <p className="error-text">{actionError}</p>}
      {!loading && complaints.length === 0 && <p>No complaints assigned to you.</p>}

      <ul>
  {complaints.map((c) => (
    <li key={c.id}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <strong style={{ fontSize: "1.05rem" }}>{c.title}</strong>
        <span style={{ fontSize: "0.8rem", color: "#666" }}>[{c.category}] — {c.status}</span>
      </div>
      <p style={{ margin: "0.5rem 0", color: "#333" }}>{c.description}</p>
      <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#555" }}>
        Student: {c.student?.name} (Room {c.student?.roomNo || "—"}, {c.student?.phone || "no phone"})
      </p>
      {c.photoUrl && (
        <img
          src={c.photoUrl} alt="complaint" 
          style={{ width: "150px", borderRadius: "6px", display: "block", marginBottom: "0.75rem" }}
        />
      )}
      {c.status !== "COMPLETED" && (
        <button onClick={() => handleComplete(c.id)}>Mark Completed</button>
      )}
    </li>
  ))}
</ul>
    </div>
    </div>
  );
}