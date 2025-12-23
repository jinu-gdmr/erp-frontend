import React, { useState } from "react";

export default function EmployeeList({ employees, onDelete, onEdit }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    onDelete(selectedId);
    setShowModal(false);
    setSelectedId(null);
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
                <td>{e.name}</td>
                <td>{e.email}</td>
                <td>{e.department || "-"}</td>
                <td>{e.manager_name || "-"}</td>
                <td>
                  <div style={{display:'flex', gap:8}}>
                      <button className="btn" style={{background:'#2563eb', padding:'4px 8px', fontSize:12}} onClick={() => onEdit(e)}>
                        Edit
                      </button>
                      <button className="btn ghost" style={{padding:'4px 8px', fontSize:12}} onClick={() => handleDeleteClick(e._id)}>
                        Delete
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete Employee?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn danger" onClick={confirmDelete}>Yes, Delete</button>
              <button className="btn ghost" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}