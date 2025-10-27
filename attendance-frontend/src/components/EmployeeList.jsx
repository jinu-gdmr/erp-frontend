import React from "react";

export default function EmployeeList({ employees, onDelete, onSelect }) {
  return (
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
                <button className="btn ghost" onClick={() => onDelete(e._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
