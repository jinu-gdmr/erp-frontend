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

  // Helper to safely get lowercase status for CSS class
  const getStatusClass = (status) => (status ? status.toLowerCase() : "pending");

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
                <th>Employee</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Manager Status</th>
                <th>HR Status</th>
                <th>Overall</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#333" }}>{l.employee_name}</div>
                    <div className="small" style={{ textTransform: "capitalize" }}>{l.type}</div>
                  </td>
                  <td style={{ fontSize: "13px" }}>{l.date}</td>
                  <td style={{ fontSize: "13px", color: "#555", maxWidth: "200px" }}>
                    {l.reason || "-"}
                    {l.attachment_url && (
                      <div style={{ marginTop: "4px" }}>
                        <a 
                          href={`https://erp-backend-production-d377.up.railway.app${l.attachment_url}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ color: "var(--red)", fontSize: "12px", textDecoration: "underline" }}
                        >
                          View Attachment
                        </a>
                      </div>
                    )}
                  </td>
                  
                  {/* Manager Status Column */}
                  <td>
                    <span className={`status-badge ${getStatusClass(l.manager_status)}`}>
                      {l.manager_status || 'Pending'}
                    </span>
                  </td>

                  {/* HR Status Column */}
                  <td>
                    <span className={`status-badge ${getStatusClass(l.admin_status)}`}>
                      {l.admin_status || 'Pending'}
                    </span>
                  </td>

                  {/* Overall Status Column */}
                  <td>
                    <span className={`status-badge ${getStatusClass(l.status)}`}>
                      {l.status || 'Pending'}
                    </span>
                  </td>

                  {/* Action Buttons based on Role */}
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {role === 'manager' && (
                        <>
                          <button className="btn-solid-green" onClick={() => updateStatus(l._id, "Approved")}>Approve</button>
                          <button className="btn-solid-red" onClick={() => updateStatus(l._id, "Rejected")}>Reject</button>
                        </>
                      )}

                      {role === 'admin' && (
                        <>
                          <button className="btn-solid-green" onClick={() => updateStatus(l._id, "Approved")}>Approve</button>
                          <button className="btn-solid-red" onClick={() => updateStatus(l._id, "Rejected")}>Reject</button>
                        </>
                      )}
                    </div>
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