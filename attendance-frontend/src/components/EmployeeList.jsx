import React, { useState } from "react";

export default function EmployeeList({ employees, onDelete, onSelect }) {
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

  const cancelDelete = () => {
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
                <td>
                  <button
                    className="btn ghost"
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

      {/* ✅ Delete Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete Employee?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn danger" onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button className="btn ghost" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
