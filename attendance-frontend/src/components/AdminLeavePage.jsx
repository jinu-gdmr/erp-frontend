import React, { useEffect, useState } from "react";

export default function AdminLeavePage({ token, api }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const list = await api.adminLeaves(token);
      // sort latest first
      list.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
      setLeaves(list);
    } catch (err) {
      setError(err.message || "Failed to load leaves");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id, status) {
    if (!window.confirm(`Are you sure to mark this as ${status}?`)) return;
    try {
      await api.updateLeave(id, { status }, token);
      await load();
    } catch (err) {
      alert("Error updating status: " + (err.message || ""));
    }
  }

  return (
    <div className="card">
      <h3 style={{ color: "#b91c1c" }}>Leave Requests</h3>
      {error && <div className="alert">{error}</div>}
      {loading && <div>Loading...</div>}
      {!loading && leaves.length === 0 && <div>No leave requests yet.</div>}

      {!loading && leaves.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Date</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Applied</th>
              <th>Attachment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l._id}>
                <td>{l.user_id}</td>
                <td>{l.date}</td>
                <td>{l.type}</td>
                <td>{l.reason || "-"}</td>
                <td>
                  <span
                    style={{
                      color:
                        l.status === "approved"
                          ? "green"
                          : l.status === "rejected"
                          ? "red"
                          : "#b91c1c",
                      fontWeight: 600,
                    }}
                  >
                    {l.status}
                  </span>
                </td>
                <td>
                  {l.applied_at
                    ? new Date(l.applied_at).toLocaleString()
                    : "-"}
                </td>

                <td>
                  {l.attachment_url ? (
                    <a
                      href={`http://localhost:5000${l.attachment_url}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View File
                    </a>
                  ) : (
                    "-"
                  )}
                </td>

                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="btn"
                      style={{ background: "green" }}
                      onClick={() => updateStatus(l._id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn"
                      style={{ background: "#b91c1c" }}
                      onClick={() => updateStatus(l._id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
