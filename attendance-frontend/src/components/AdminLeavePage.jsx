import React, { useEffect, useState } from "react"; 

export default function AdminLeavePage({ token, api }) {
  const role = localStorage.getItem("role"); // "admin" or "manager"
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const list = await api.adminLeaves(token);
      list.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
      setLeaves(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

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
      <h3 style={{ color: "#b91c1c", marginBottom: 15 }}>Leave Requests</h3>

      {loading && <p>Loading...</p>}
      {!loading && leaves.length === 0 && <p>No leave requests found.</p>}

      {!loading && leaves.length > 0 && (
        <div style={{overflowX: 'auto'}}>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Manager Statuss</th>
                <th>HR Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id}>
                  <td>
                    <div style={{fontWeight:500}}>{l.employee_name}</div>
                    <div className="small">{l.type}</div>
                  </td>
                  <td>{l.date}</td>
                  <td>
                    {l.reason}
                    {l.attachment_url && (
                        <div style={{marginTop:4}}>
                            <a href={`http://localhost:5000${l.attachment_url}`} target="_blank" rel="noreferrer" style={{color: 'blue', fontSize:12}}>
                            View File
                            </a>
                        </div>
                    )}
                  </td>
                  
                  {/* Manager Status Column */}
                  <td>
                    <span className={`status-text ${l.manager_status || 'Pending'}`}>
                      {l.manager_status || 'Pending'}
                    </span>
                  </td>

                  {/* HR Status Column */}
                  <td>
                    <span className={`status-text ${l.admin_status || 'Pending'}`}>
                      {l.admin_status || 'Pending'}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td>
                    <div style={{display: 'flex', gap: 8}}>
                      {/* Manager Actions */}
                      {role === 'manager' && (
                        <>
                          <button className="btn-solid-green" onClick={() => updateStatus(l._id, "Approved")}>Approve</button>
                          <button className="btn-solid-red" onClick={() => updateStatus(l._id, "Rejected")}>Reject</button>
                        </>
                      )}

                      {/* Admin Actions */}
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