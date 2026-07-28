import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Profile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", roomNo: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users/me");
      setProfile(res.data);
      setForm({
        name: res.data.name || "",
        phone: res.data.phone || "",
        roomNo: res.data.roomNo || "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaveSuccess(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const res = await api.patch("/users/me", form);
      setProfile(res.data);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="page">
      <h2>My Profile</h2>
      <Link to="/student">← Back to dashboard</Link>
      <button onClick={logout} style={{ marginLeft: "1rem" }}>Logout</button>

        <div className="card">
      <p>Email: {profile.email} (cannot be changed)</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div>
          <label>Room No</label>
          <input name="roomNo" value={form.roomNo} onChange={handleChange} />
        </div>
        {saveError && <p className="error-text">{saveError}</p>}
        {saveSuccess && <p className="success-text">Profile updated.</p>}
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
    </div>
  );
}