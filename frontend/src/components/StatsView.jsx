import { useState, useEffect } from "react";
import api from "../api/axios";

function getCount(entry) {
  return typeof entry._count === "number" ? entry._count : entry._count?._all ?? 0;
}

export default function StatsView() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get("/stats");
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load stats");
      }
    }
    loadStats();
  }, []);

  if (error) return <p className="error-text">{error}</p>;
  if (!stats) return <p>Loading stats...</p>;

  return (
    <div>
      <h3>Stats</h3>
      <p>Total complaints: {stats.total}</p>

      <div style={{ display: "flex", gap: "3rem" }}>
        <div>
          <strong>By Status</strong>
          <ul>
            {stats.byStatus.map((s) => (
              <li key={s.status}>{s.status}: {getCount(s)}</li>
            ))}
          </ul>
        </div>

        <div>
          <strong>By Category</strong>
          <ul>
            {stats.byCategory.map((c) => (
              <li key={c.category}>{c.category}: {getCount(c)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}