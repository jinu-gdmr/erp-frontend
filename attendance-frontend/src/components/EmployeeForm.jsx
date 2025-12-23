import React, {useState, useEffect} from "react";

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

export default function EmployeeForm({ onAdd, initialData, api, token }) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [department, setDepartment] = useState(initialData?.department || departments[0]); 
  const [position, setPosition] = useState(initialData?.position || "");
  const [managerId, setManagerId] = useState(initialData?.manager_id || "");
  const [managers, setManagers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadManagers() {
    try {
      const list = await api.getManagers(token);
      setManagers(list);
    } catch (err) {
      console.error("Failed to load managers", err);
    }
  }

  useEffect(() => {
    loadManagers();
  }, []);

  async function handle(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await onAdd({ 
        name, 
        email, 
        department, 
        position, 
        manager_id: managerId || undefined 
      });
      if (!initialData) {
          setMsg("Employee added — credentials sent by email.");
          setName(""); setEmail(""); setDepartment(departments[0]); setPosition(""); setManagerId("");
      } else {
          setMsg("Employee updated successfully.");
      }
    } catch (err) {
      setMsg(err.message || "Error");
    } finally { setSaving(false); }
  }

  return (
    <div className="card">
      <h3 style={{color:"#b91c1c"}}>{initialData ? "Edit Employee" : "Add Employee"}</h3>
      {msg && <div className="small" style={{color: msg.includes("Error") ? "red" : "green", fontWeight: 500}}>{msg}</div>}
      <br />
      <form onSubmit={handle}>
        <div className="form-row">
          <input className="input" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required />
          <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required disabled={!!initialData} />
        </div>
        
        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label>Department</label>
            <select className="input" value={department} onChange={e=>setDepartment(e.target.value)} required>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Position</label>
            <input className="input" placeholder="Position" value={position} onChange={e=>setPosition(e.target.value)} />
          </div>
        </div>
        
        <div className="form-row">
          <div style={{flex: 1}}>
            <label>Assign Manager</label>
            <select className="input" value={managerId} onChange={e=>setManagerId(e.target.value)}>
              <option value="">-- No Manager Assigned --</option>
              {managers.map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.department})</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{marginTop:10}}>
          <button className="btn" disabled={saving}>{saving ? "Saving..." : (initialData ? "Update Employee" : "Add Employee")}</button>
        </div>
      </form>
    </div>
  );
}