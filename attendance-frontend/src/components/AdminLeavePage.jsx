import React, { useEffect, useState } from "react"; 

export default function AdminLeavePage({ token, api }) {
  const role = localStorage.getItem("role"); // "admin" or "manager"
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const list = await api.adminLeaves(token);
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
    if (!window.confirm(`Mark as ${status}?`)) return;
    try {
      await api.updateLeave(id, { status }, token);
      await load();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div className="card" style={{ padding: 0, border: "none", boxShadow: "none" }}>
      <div style={{ padding: "20px 20px 10px", borderBottom: "1px solid #f0f0f0" }}>
        <h3 style={{ color: "var(--red)", margin: 0, fontSize: "18px" }}>Leave Requests</h3>
      </div>

      {error && <div className="alert" style={{ margin: "20px" }}>{error}</div>}
      
      {loading && <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>Loading...</div>}
      
      {!loading && leaves.length === 0 && (
        <div style={{ padding: "30px", textAlign: "center", color: "#888" }}>
          No leave requests found.
        </div>
      )}

      {!loading && leaves.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>Attachment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#333" }}>{l.employee_name}</div>
                  </td>
                  <td style={{ fontSize: "13px" }}>{l.date}</td>
                  <td style={{ textTransform: "capitalize", fontSize: "13px" }}>{l.type}</td>
                  <td style={{ fontSize: "13px", color: "#555", maxWidth: "200px" }}>
                    {l.reason || "-"}
                  </td>
                  <td>
                    {/* Status Badge */}
                    <span className={`status-badge ${l.status ? l.status.toLowerCase() : 'pending'}`}>
                      {l.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px", color: "#777" }}>
                    {l.applied_at ? new Date(l.applied_at).toLocaleDateString() : "-"}
                  </td>
                  <td>
                    {l.attachment_url ? (
                      <a 
                        href={`https://erp-backend-production-d377.up.railway.app${l.attachment_url}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: "var(--red)", fontSize: "13px", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        View File
                      </a>
                    ) : <span style={{ color: "#ccc" }}>-</span>}
                  </td>
                  <td>
                    {(role === "admin" || role === "manager") && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn-solid-green"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => updateStatus(l._id, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-solid-red"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => updateStatus(l._id, "Rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}