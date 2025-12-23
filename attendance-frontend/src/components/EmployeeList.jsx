import React, { useState, useEffect } from "react";
import api from "../api"; // Import api for loading managers inside edit modal

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

export default function EmployeeList({ employees, onDelete, onSelect }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [managers, setManagers] = useState([]);

  // Load managers for the dropdown in edit modal
  useEffect(() => {
    if (showEditModal) {
      const token = localStorage.getItem("token");
      api.getManagers(token).then(setManagers).catch(console.error);
    }
  }, [showEditModal]);

  // Delete Handlers
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(selectedId);
    setShowDeleteModal(false);
    setSelectedId(null);
  };

  // Edit Handlers
  const handleEditClick = (employee) => {
    setEditingEmployee({ ...employee });
    setShowEditModal(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await api.editEmployee(editingEmployee._id, editingEmployee, token);
      alert("Employee updated! Refreshing...");
      window.location.reload(); // Simple reload to reflect changes
    } catch (err) {
      alert("Error updating employee");
    }
  };

  return (
    <>
      <div className="card">
        <h3 style={{ color: "#b91c1c" }}>Employee List</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Manager</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e._id}>
                <td>
                  <button
                    className="link-btn"
                    onClick={() => onSelect(e)}
                    style={{
                      color: "#b91c1c",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {e.name}
                  </button>
                </td>
                <td>{e.email}</td>
                <td>{e.department || "-"}</td>
                <td>{e.manager_name || "-"}</td>
                <td style={{display:'flex', gap:5}}>
                  <button 
                    className="btn ghost" 
                    onClick={() => handleEditClick(e)}
                    style={{padding: "6px 10px", fontSize: 13}}
                  >
                    Edit
                  </button>
                  <button
                    className="btn"
                    style={{background: "#b91c1c", padding: "6px 10px", fontSize: 13}}
                    onClick={() => handleDeleteClick(e._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete Employee?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn danger" onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button className="btn ghost" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className="modal-overlay">
          <div className="modal-box" style={{width: 450}}>
            <h3 style={{color: "#b91c1c"}}>Edit Employee</h3>
            <form onSubmit={handleEditSave}>
               <div style={{textAlign: "left", marginBottom: 10}}>
                  <label>Name</label>
                  <input className="input" value={editingEmployee.name} onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})} required />
               </div>
               <div style={{textAlign: "left", marginBottom: 10}}>
                  <label>Email</label>
                  <input className="input" type="email" value={editingEmployee.email} onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value})} required />
               </div>
               <div style={{textAlign: "left", marginBottom: 10}}>
                  <label>Department</label>
                  <select className="input" value={editingEmployee.department} onChange={e => setEditingEmployee({...editingEmployee, department: e.target.value})}>
                     {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
               </div>
               <div style={{textAlign: "left", marginBottom: 10}}>
                  <label>Position</label>
                  <input className="input" value={editingEmployee.position} onChange={e => setEditingEmployee({...editingEmployee, position: e.target.value})} />
               </div>
               <div style={{textAlign: "left", marginBottom: 15}}>
                  <label>Manager</label>
                  <select className="input" value={editingEmployee.manager_id || ""} onChange={e => setEditingEmployee({...editingEmployee, manager_id: e.target.value || null})}>
                      <option value="">No Manager</option>
                      {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
               </div>
               <div className="modal-actions">
                  <button className="btn" type="submit">Save Changes</button>
                  <button className="btn ghost" type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}