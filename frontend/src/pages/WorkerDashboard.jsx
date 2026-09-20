import { useState, useEffect, useRef } from "react";
import api, { fileUrl } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [proofFiles, setProofFiles] = useState({});
  const [toast, setToast] = useState("");

  const prevComplaintsRef = useRef({}); // { [id]: rejected boolean } from last fetch

  async function loadComplaints() {
    try {
      const res = await api.get("/complaints/assigned");
      const newComplaints = res.data;

      // detect newly-rejected complaints since last fetch
      const prev = prevComplaintsRef.current;
      const newlyRejected = newComplaints.find(
        (c) => c.rejected && prev[c.id] === false
      );
      if (newlyRejected) {
        setToast(`"${newlyRejected.title}" was rejected — please redo and resubmit.`);
        setTimeout(() => setToast(""), 6000);
      }

      // update the ref for next comparison
      const snapshot = {};
      newComplaints.forEach((c) => (snapshot[c.id] = c.rejected));
      prevComplaintsRef.current = snapshot;

      setComplaints(newComplaints);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
    const interval = setInterval(loadComplaints, 60000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  function handleFileChange(complaintId, file) {
    setProofFiles((prev) => ({ ...prev, [complaintId]: file }));
  }

  async function handleComplete(complaintId) {
    setActionError("");
    const file = proofFiles[complaintId];
    if (!file) {
      setActionError("Please attach a proof photo before marking complete");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    try {
      await api.patch(`/complaints/${complaintId}/complete`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      loadComplaints();
    } catch (err) {
      setActionError(err.response?.data?.error || "Failed to mark complete");
    }
  }

  return (
    <div className="page">
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            background: "#b00020",
            color: "white",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          {toast}
        </div>
      )}

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

              {c.rejected && (
                <p style={{ margin: "0.25rem 0", color: "#b00020", fontWeight: "bold", fontSize: "0.85rem" }}>
                  ⚠ Rejected by admin — please redo and resubmit
                </p>
              )}

              <p style={{ margin: "0.5rem 0", color: "#333" }}>{c.description}</p>
              <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#555" }}>
                Student: {c.student?.name} (Room {c.student?.roomNo || "—"}, {c.student?.phone || "no phone"})
              </p>
              {c.photoUrl && (
                <img
                  src={fileUrl(c.photoUrl)} alt="complaint"
                  style={{ width: "150px", borderRadius: "6px", display: "block", marginBottom: "0.75rem" }}
                />
              )}

              {c.status === "AWAITING_APPROVAL" && (
                <p style={{ fontSize: "0.85rem", color: "#a67c00" }}>
                  Waiting for admin approval — proof photo submitted.
                </p>
              )}

              {(c.status === "ASSIGNED" || c.status === "IN_PROGRESS") && (
                <div style={{ marginTop: "0.5rem" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(c.id, e.target.files[0])}
                  />
                  <button onClick={() => handleComplete(c.id)} style={{ marginLeft: "0.5rem" }}>
                    Mark Completed
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}