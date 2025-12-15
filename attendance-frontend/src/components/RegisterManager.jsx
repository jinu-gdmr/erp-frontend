import React, { useState, useEffect } from "react";

const departments = [
  "Sales", "Marketing", "Technology", "Finance", "HR", "Management", "Operations"
];

export default function RegisterManager({ token, api }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState(departments[0]); // NEW: Department State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [managers, setManagers] = useState([]); 
  const [loading, setLoading] = useState(false);

  // Load managers list
  async function loadManagers() {
    try {
      setLoading(true);
      const list = await api.getManagers(token);
      setManagers(list);
    } catch (err) {
      console.error("Error loading managers:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadManagers();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg("");

    if (password !== confirmPassword) {
      setMsg("❌ Passwords do not match!");
      setShowModal(true);
      return;
    }

    try {
      await api.registerManager({ name, email, password, department }, token); // Department added to payload
      setMsg("✅ Manager registered successfully!");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setDepartment(departments[0]); // Reset department
      loadManagers(); 
    } catch (err) {
      setMsg("❌ " + (err.message || "Error registering manager"));
    }

    setShowModal(true);
  }

  // Delete Manager
  async function deleteManager(id) {
    if (!window.confirm("Delete this manager?")) return;
    try {
      await api.deleteManager(id, token);
      loadManagers(); // refresh
    } catch (err) {
      alert("Error deleting manager");
    }
  }

  return (
    <div className="card">
      <h3 style={{ color: "#b91c1c" }}>Register Manager</h3>

      {/* Form Section */}
      <form onSubmit={submit}>
        {/* Row 1: Name and Email */}
        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label>Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        {/* NEW Row: Department Assignment */}
        <div className="form-row">
           <div style={{ flex: 1 }}>
            <label>Department</label>
            <select className="input" value={department} onChange={e=>setDepartment(e.target.value)} required>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            {/* Empty spacer div for alignment */}
          </div>
        </div>


        {/* Row 2: Passwords */}
        <div className="form-row">
          <div style={{ flex: 1, position: "relative" }}>
            <label>Password</label>
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: "42px" }}
            />
            <span
              className="material-icons"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "53%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#b91c1c",
              }}
            >
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </div>

          <div style={{ flex: 1, position: "relative" }}>
            <label>Confirm Password</label>
            <input
              className="input"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ paddingRight: "42px" }}
            />
            <span
              className="material-icons"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              style={{
                position: "absolute",
                right: "10px",
                top: "53%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#b91c1c",
              }}
            >
              {showConfirmPassword ? "visibility_off" : "visibility"}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "end" }}>
          <button className="btn" type="submit">
            Create Manager
          </button>
        </div>
      </form>

      {/* Manager List Section */}
      <h3 style={{ color: "#b91c1c", marginTop: "20px" }}>Manager List</h3>

      {loading && <p>Loading managers...</p>}
      {!loading && managers.length === 0 && <p>No managers found.</p>}

      {!loading && managers.length > 0 && (
        <table className="leave-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th> {/* NEW: Department Column */}
              <th style={{ textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {managers.map((m) => (
              <tr key={m._id}>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{m.department}</td> {/* NEW: Department Data */}
                <td style={{ textAlign: "center" }}>
                  <button
                    className="btn"
                    style={{ background: "#b91c1c" }}
                    onClick={() => deleteManager(m._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ color: "#b91c1c" }}>Message</h4>
            <p style={{ color: msg.includes("✅") ? "green" : "red" }}>{msg}</p>
            <button className="btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}