import React, {useState} from "react";

export default function EmployeeForm({ onAdd }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function handle(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await onAdd({ name, email, department, position });
      setMsg("Employee added — password sent by email.");
      setName(""); setEmail(""); setDepartment(""); setPosition("");
    } catch (err) {
      setMsg(err.message || "Error");
    } finally { setSaving(false); }
  }

  return (
    <div className="card">
      <h3 style={{color:"#b91c1c"}}>Add Employee</h3>
      {msg && <div className="small" style={{color:"#19e13aff"}}>{msg}</div>}
      <br />
      <form onSubmit={handle}>
        <div className="form-row">
          <input className="input" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required />
          <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <input className="input" placeholder="Department" value={department} onChange={e=>setDepartment(e.target.value)} />
          <input className="input" placeholder="Position" value={position} onChange={e=>setPosition(e.target.value)} />
        </div>
        <div style={{marginTop:10}}>
          <button className="btn" disabled={saving}>{saving ? "Adding..." : "Add employee"}</button>
        </div>
      </form>
    </div>
  );
}
