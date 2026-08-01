import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const CATEGORIES = ["Electrical", "Plumbing", "Wifi/Internet", "Furniture", "Cleanliness", "Other"];

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [form, setForm] = useState({ category: CATEGORIES[0], title: "", description: "" });
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function loadComplaints() {
    setLoadingList(true);
    setListError("");
    try {
      const res = await api.get("/complaints/mine");
      setComplaints(res.data);
    } catch (err) {
      setListError(err.response?.data?.error || "Failed to load complaints");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("category", form.category);
      data.append("title", form.title);
      data.append("description", form.description);
      if (photo) data.append("photo", photo);

      await api.post("/complaints", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm({ category: CATEGORIES[0], title: "", description: "" });
      setPhoto(null);
      e.target.reset();
      loadComplaints();
    } catch (err) {
      setSubmitError(err.response?.data?.error || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  }

  return (
  <div className="page">
    <div className="header-row">
      <h2>Student Dashboard</h2>
        <p>Welcome, {user.name} (Room {user.roomNo || "—"})</p>
        <Link to="/profile">My Profile</Link>
        <button onClick={logout} style={{ marginLeft: "1rem" }}>Logout</button>
      </div>

      <div className="card">
      <h3>Submit a Complaint</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} required />
        </div>
        <div>
          <label>Photo (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
        </div>
        {submitError && <p className="error-text">{submitError}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
      </div>

      <div className="card">
      <h3>My Complaints</h3>
      {loadingList && <p>Loading...</p>}
      {listError && <p className="error-text">{listError}</p>}
      {!loadingList && complaints.length === 0 && <p>No complaints yet.</p>}
      <ul>
        {complaints.map((c) => (
          <li key={c.id}>
            <strong>{c.title}</strong> [{c.category}] — {c.status}
            <br />
            {c.description}
            {c.photoUrl && (
              <div>
                <img src={c.photoUrl} alt="complaint" width="150" />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}