import React, { useEffect, useState } from "react";
import EmployeeForm from "./EmployeeForm";
import EmployeeList from "./EmployeeList";
import AdminLeavePage from "./AdminLeavePage";
import AdminAttendancePage from "./AdminAttendancePage";
import RegisterManager from "./RegisterManager";
import AdminAttendanceSummary from "./AdminAttendanceSummary";

export default function AdminDashboard({ token, api }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState("employees");
  const [subView, setSubView] = useState("add");

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
    setSubView("list");
  }

  async function deleteEmployee(id) {
    await api.deleteEmployee(id, token);
    await loadEmployees();
  }

  return (
    <div>
      {/* Main Header */}
      <div className="card">
        <h2 style={{ color: "#b91c1c", margin: 0 }}>Admin Dashboard</h2>

        <div className="admin-buttons">
          <button
            className={`btn ${view === "employees" ? "" : "ghost"}`}
            onClick={() => setView("employees")}
          >
            Employees
          </button>

          <button
            className={`btn ${view === "manager" ? "" : "ghost"}`}
            onClick={() => setView("manager")}
          >
            Managers
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

          {/* NEW: Attendance Summary */}
          <button
            className={`btn ${view === "summary" ? "" : "ghost"}`}
            onClick={() => setView("summary")}
          >
            Summary
          </button>
        </div>
      </div>

      {/* Employees */}
      {view === "employees" && (
        <>
          <div className="card admin-buttons" style={{ marginTop: "12px" }}>
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

          {subView === "add" && (
            <div style={{ marginTop: "16px" }}>
              <EmployeeForm onAdd={addEmployee} />
            </div>
          )}

          {subView === "list" && (
            <div style={{ marginTop: "16px" }}>
              {loading ? (
                <div className="card">Loading employees...</div>
              ) : employees.length === 0 ? (
                <div className="card" style={{ textAlign: "center" }}>
                  No employees found
                </div>
              ) : (
                <EmployeeList employees={employees} onDelete={deleteEmployee} />
              )}
            </div>
          )}
        </>
      )}

      {/* Leaves */}
      {view === "leaves" && (
        <div style={{ marginTop: "16px" }}>
          <AdminLeavePage token={token} api={api} />
        </div>
      )}

      {/* Attendance */}
      {view === "attendance" && (
        <div style={{ marginTop: "16px" }}>
          <AdminAttendancePage token={token} api={api} />
        </div>
      )}

      {/* Manager List + Add Manager */}
      {view === "manager" && (
        <div style={{ marginTop: "16px" }}>
          <RegisterManager token={token} api={api} />
        </div>
      )}

      {/* NEW: Attendance Summary Dashboard */}
      {view === "summary" && (
        <div style={{ marginTop: "16px" }}>
          <AdminAttendanceSummary token={token} api={api} />
        </div>
      )}
    </div>
  );
}
