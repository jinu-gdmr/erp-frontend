import React, { useEffect, useState } from "react";
import EmployeeForm from "./EmployeeForm";
import EmployeeList from "./EmployeeList";
import AdminLeavePage from "./AdminLeavePage";
import AdminAttendancePage from "./AdminAttendancePage";

export default function AdminDashboard({ token, api }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState("employees"); // employees | leaves | attendance
  const [subView, setSubView] = useState("add"); // add | list (for employee view)

  async function loadEmployees() {
    setLoading(true);
    try {
      const list = await api.listEmployees(token);
      setEmployees(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function addEmployee(data) {
    await api.addEmployee(data, token);
    await loadEmployees();
    setSubView("list"); // switch to list after add
  }

  async function deleteEmployee(id) {
    if (!window.confirm("Delete this employee?")) return;
    await api.deleteEmployee(id, token);
    await loadEmployees();
  }

  return (
    <div>
      {/* Main Header */}
      <div
        className="card"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h2 style={{ color: "#b91c1c", margin: 0 }}>Admin Dashboard</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className={`btn ${view === "employees" ? "" : "ghost"}`}
            onClick={() => setView("employees")}
          >
            Employees
          </button>
          <button
            className={`btn ${view === "leaves" ? "" : "ghost"}`}
            onClick={() => setView("leaves")}
          >
            Leaves
          </button>
          <button
            className={`btn ${view === "attendance" ? "" : "ghost"}`}
            onClick={() => setView("attendance")}
          >
            Attendance
          </button>
        </div>
      </div>

      {/* Employee Management */}
      {view === "employees" && (
        <>
          {/* Sub Tabs */}
          <div
            className="card"
            style={{ display: "flex", gap: "8px", marginTop: "12px" }}
          >
            <button
              className={`btn ${subView === "add" ? "" : "ghost"}`}
              onClick={() => setSubView("add")}
            >
              Add Employee
            </button>
            <button
              className={`btn ${subView === "list" ? "" : "ghost"}`}
              onClick={() => setSubView("list")}
            >
              Employee List
            </button>
          </div>

          {/* Sub View Content */}
          {subView === "add" && (
            <div style={{ marginTop: "16px" }}>
              <EmployeeForm onAdd={addEmployee} />
            </div>
          )}

          {subView === "list" && (
            <div style={{ marginTop: "16px" }}>
              {/* {loading ? (
                <div className="card">Loading employees...</div>
              ) : (
                <EmployeeList employees={employees} onDelete={deleteEmployee} />
              )} */}
              {loading ? (
                <div className="card">Loading employees...</div>
              ) : employees.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "12px" }}>
                  No employees found
                </div>
              ) : (
                <EmployeeList employees={employees} onDelete={deleteEmployee} />
              )}
            </div>
          )}

          <div className="card" style={{ marginTop: "20px" }}>
            <h3 style={{ color: "#b91c1c" }}>Admin Actions</h3>
            <p className="small">
              Export reports and payroll integration will be added soon.
            </p>
          </div>
        </>
      )}

      {/* Leave Management */}
      {view === "leaves" && (
        <div style={{ marginTop: "16px" }}>
          <AdminLeavePage token={token} api={api} />
        </div>
      )}

      {/* Attendance Management */}
      {view === "attendance" && (
        <div style={{ marginTop: "16px" }}>
          <AdminAttendancePage token={token} api={api} />
        </div>
      )}
    </div>
  );
}
