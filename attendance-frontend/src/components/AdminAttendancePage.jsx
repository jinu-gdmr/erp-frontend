import React, { useEffect, useState } from "react";

export default function AdminAttendancePage({ token, api }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load employees
  async function loadEmployees() {
    setLoading(true);
    try {
      const list = await api.listEmployees(token);
      setEmployees(list);
    } catch (err) {
      console.error("Error loading employees", err);
    } finally {
      setLoading(false);
    }
  }

  // Load attendance for one employee
  async function loadAttendance(emp) {
    setSelectedEmp(emp);
    setLoading(true);
    try {
      const records = await api.employeeAttendance(emp._id, token);
      setAttendance(records);
    } catch (err) {
      console.error("Error loading attendance", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
  <div className="card">
    <h3 style={{ color: "#b91c1c" }}>Attendance Management</h3>

    <div className="columns" style={{ marginTop: "16px" }}>
      
      {/* ✅ LEFT COLUMN: Employees List */}
      <div className="col" style={{ maxWidth: "350px" }}>
        <h4 style={{ color: "#b91c1c" }}>Employees</h4>

        {loading && employees.length === 0 ? (
          <p>Loading employees...</p>
        ) : employees.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          <table className="table" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp._id}
                  className={
                    selectedEmp && selectedEmp._id === emp._id
                      ? "active-row"
                      : ""
                  }
                >
                  <td>{emp.name}</td>
                  <td>
                    <button
                      className="btn ghost"
                      style={{
                        padding: "5px 8px",
                        fontSize: "12px",
                        borderRadius: "6px",
                      }}
                      onClick={() => loadAttendance(emp)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ RIGHT COLUMN: Attendance Details */}
      <div className="col" style={{ flex: 2 }}>
        {selectedEmp ? (
          <>
            <h4 style={{ color: "#b91c1c" }}>
              Attendance – {selectedEmp.name}
            </h4>

            {loading ? (
              <p>Loading attendance...</p>
            ) : attendance.length === 0 ? (
              <p>No records found.</p>
            ) : (
              <table className="table" style={{ marginTop: 10 }}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Date / Time</th>
                    <th>Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a._id}>
                      <td
                        style={{
                          color:
                            a.type === "checkin" ? "green" : "#b91c1c",
                          fontWeight: 600,
                        }}
                      >
                        {a.type}
                      </td>
                      <td>{new Date(a.time).toLocaleString()}</td>
                      <td>
                        {a.photo_url ? (
                          <a
                            href={`http://localhost:5000${a.photo_url}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Photo
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <p>Select an employee to view attendance.</p>
        )}
      </div>
    </div>
  </div>
);
}
