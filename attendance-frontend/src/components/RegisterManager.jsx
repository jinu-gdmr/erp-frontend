import React, { useState, useEffect } from "react";

const departments = [
  "Projects Dept",
  "Accounts Dept",
  "Graphic Designing Dept",
  "HR Dept",
  "Administration Dept",
  "BRD Dept",
  "Engineering Dept",
  "Digital Marketing Dept"
];

export default function RegisterManager({ token, api }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState(departments[0]);
  const [showPassword, setShowPassword] = useState(false);
  
  const [managers, setManagers] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(null); // null or manager object

  // Load managers list
  async function loadManagers() {
    setLoading(true);
    try {
      const list = await api.getManagers(token);
      setManagers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadManagers(); }, []);

  // Populate form for editing
  function startEdit(manager) {
      setEditMode(manager);
      setName(manager.name);
      setEmail(manager.email);
      setDepartment(manager.department || departments[0]);
      setPassword(""); // Don't fill password
      setConfirmPassword("");
  }

  function cancelEdit() {
      setEditMode(null);
      setName(""); setEmail(""); setDepartment(departments[0]); setPassword(""); setConfirmPassword("");
  }

  async function submit(e) {
    e.preventDefault();
    
    if (!editMode && password !== confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    try {
      if (editMode) {
          // Update
          await api.editManager(editMode._id, { name, department }, token);
          alert("✅ Manager updated!");
          cancelEdit();
      } else {
          // Create
          await api.registerManager({ name, email, password, department }, token);
          alert("✅ Manager registered!");
          setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
      }
      loadManagers(); 
    } catch (err) {
      alert("❌ " + (err.message || "Error"));
    }
  }

  async function deleteManager(id) {
    if (!window.confirm("Delete this manager?")) return;
    try {
      await api.deleteManager(id, token);
      loadManagers();
    } catch (err) {
      alert("Error deleting manager");
    }
  }

  return (
    <div className="card">
      <h3 style={{ color: "#b91c1c" }}>{editMode ? "Edit Manager" : "Register Manager"}</h3>

      <form onSubmit={submit}>
        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label>Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div style={{ flex: 1 }}>
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={!!editMode} />
          </div>
        </div>
        
        <div className="form-row">
           <div style={{ flex: 1 }}>
            <label>Department</label>
            <select className="input" value={department} onChange={e=>setDepartment(e.target.value)} required>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}></div>
        </div>

        {!editMode && (
            <div className="form-row">
            <div style={{ flex: 1, position: "relative" }}>
                <label>Password</label>
                <input className="input" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: "42px" }} />
                <span className="material-icons" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "10px", top: "53%", transform: "translateY(-50%)", cursor: "pointer", color: "#b91c1c" }}>{showPassword ? "visibility_off" : "visibility"}</span>
            </div>
            <div style={{ flex: 1 }}>
                <label>Confirm Password</label>
                <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            </div>
        )}

        <div style={{ marginTop: 12, display: "flex", justifyContent: "end", gap: 10 }}>
          {editMode && <button className="btn ghost" type="button" onClick={cancelEdit}>Cancel</button>}
          <button className="btn" type="submit">{editMode ? "Update Manager" : "Create Manager"}</button>
        </div>
      </form>

      <h3 style={{ color: "#b91c1c", marginTop: "20px" }}>Manager List</h3>
      {!loading && managers.length > 0 && (
        <table className="leave-table">
          <thead><tr><th>Name</th><th>Email</th><th>Department</th><th style={{ textAlign: "center" }}>Action</th></tr></thead>
          <tbody>
            {managers.map((m) => (
              <tr key={m._id}>
                <td>{m.name}</td><td>{m.email}</td><td>{m.department}</td>
                <td style={{ textAlign: "center", display:'flex', justifyContent:'center', gap:10 }}>
                  <button className="btn" style={{background:'#2563eb', padding:'5px 10px', fontSize:12}} onClick={() => startEdit(m)}>Edit</button>
                  <button className="btn" style={{background:'#b91c1c', padding:'5px 10px', fontSize:12}} onClick={() => deleteManager(m._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}