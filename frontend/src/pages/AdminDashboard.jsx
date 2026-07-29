import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StatsView from "../components/StatsView";

const STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED"];
const CATEGORIES = ["Electrical", "Plumbing", "Wifi/Internet", "Furniture", "Cleanliness", "Other"];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "WORKER", phone: "" });
  const [createUserError, setCreateUserError] = useState("");
  const [createUserSuccess, setCreateUserSuccess] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  async function loadComplaints() {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get("/complaints", { params });
      setComplaints(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }

  async function loadWorkers() {
    try {
      const res = await api.get("/users", { params: { role: "WORKER" } });
      setWorkers(res.data);
    } catch (err) {
      console.error("Failed to load workers", err);
    }
  }

  useEffect(() => {
    loadWorkers();
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, categoryFilter]);

  async function handleAssign(complaintId, workerId) {
    if (!workerId) return;
    setActionError("");
    try {
      await api.patch(`/complaints/${complaintId}/assign`, { workerId: Number(workerId) });
      loadComplaints();
    } catch (err) {
      setActionError(err.response?.data?.error || "Failed to assign worker");
    }
  }

  async function handleStatusChange(complaintId, status) {
    setActionError("");
    try {
      await api.patch(`/complaints/${complaintId}/status`, { status });
      loadComplaints();
    } catch (err) {
      setActionError(err.response?.data?.error || "Failed to update status");
    }
  }

  function handleNewUserChange(e) {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
    setCreateUserSuccess("");
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setCreateUserError("");
    setCreateUserSuccess("");
    setCreatingUser(true);
    try {
      const res = await api.post("/users", newUser);
      setCreateUserSuccess(`Created ${res.data.role} account: ${res.data.email}`);
      setNewUser({ name: "", email: "", password: "", role: "WORKER", phone: "" });
      loadWorkers();
    } catch (err) {
      setCreateUserError(err.response?.data?.error || "Failed to create user");
    } finally {
      setCreatingUser(false);
    }
  }

  return (
    <div className="page">
      <div className="header-row">
        <h2>Admin Dashboard</h2>
        <p>Welcome, {user.name}</p>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="card">
        <StatsView />
      </div>

      <div className="card">
        <h3>Create Admin/Worker Account</h3>
        <form onSubmit={handleCreateUser}>
          <div>
            <label>Name</label>
            <input name="name" value={newUser.name} onChange={handleNewUserChange} required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" name="email" value={newUser.email} onChange={handleNewUserChange} required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" name="password" value={newUser.password} onChange={handleNewUserChange} required />
          </div>
          <div>
            <label>Role</label>
            <select name="role" value={newUser.role} onChange={handleNewUserChange}>
              <option value="WORKER">Worker</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label>Phone</label>
            <input name="phone" value={newUser.phone} onChange={handleNewUserChange} />
          </div>
          {createUserError && <p className="error-text">{createUserError}</p>}
          {createUserSuccess && <p className="success-text">{createUserSuccess}</p>}
          <button type="submit" disabled={creatingUser}>
            {creatingUser ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>All Complaints</h3>
        <div>
          <label>Status: </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label style={{ marginLeft: "1rem" }}>Category: </label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error-text">{error}</p>}
        {actionError && <p className="error-text">{actionError}</p>}
        {!loading && complaints.length === 0 && <p>No complaints found.</p>}

        <table border="1" cellPadding="6" style={{ marginTop: "1rem", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Student</th>
              <th>Room</th>
              <th>Status</th>
              <th>Worker</th>
              <th>Created</th>
              <th>Assign</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.title}</td>
                <td>{c.category}</td>
                <td>{c.student?.name}</td>
                <td>{c.student?.roomNo || "—"}</td>
                <td>{c.status}</td>
                <td>{c.worker?.name || "—"}</td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <select defaultValue="" onChange={(e) => handleAssign(c.id, e.target.value)}>
                    <option value="" disabled>Assign...</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select value={c.status} onChange={(e) => handleStatusChange(c.id, e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}