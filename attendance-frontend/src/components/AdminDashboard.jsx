import React, { useEffect, useState } from "react";
import EmployeeForm from "./EmployeeForm";
import EmployeeList from "./EmployeeList";
import AdminLeavePage from "./AdminLeavePage";
import AdminAttendancePage from "./AdminAttendancePage";
import RegisterManager from "./RegisterManager";
import AdminAttendanceSummary from "./AdminAttendanceSummary";
import { FaCheckCircle, FaTimesCircle, FaUserClock, FaUserSlash } from "react-icons/fa";


export default function AdminDashboard({ token, api }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState("employees");
  const [subView, setSubView] = useState("add");

  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    leave: 0,
    not_checked_in: 0,
  });

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

 async function loadTodayStats() {
  try {
    const res = await api.todayStats(token);
    setStats(res); // direct update
  } catch (err) {
    console.error("Stats load error:", err);
  }
}


  useEffect(() => {
    loadEmployees();
    loadTodayStats();
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
      </div>

      {/* TODAY OVERVIEW — Responsive Cards Above Buttons */}
      <div className="card" style={{ marginTop: "15px" }}>
        <h3 style={{ color: "#b91c1c", marginBottom: "12px" }}>
          Today Overview
        </h3>

        <div className="overview-grid">

          <div className="overview-card">
            <FaCheckCircle size={32} className="green-text" style={{ marginBottom: "6px" }} />
            <h4 className="overview-title green-text">Present</h4>
            <p className="overview-count">{stats.present}</p>
          </div>

          <div className="overview-card">
            <FaTimesCircle size={32} className="red-text" style={{ marginBottom: "6px" }} />
            <h4 className="overview-title red-text">Absent</h4>
            <p className="overview-count">{stats.absent}</p>
          </div>

          <div className="overview-card">
            <FaUserClock size={32} className="red-dark-text" style={{ marginBottom: "6px" }} />
            <h4 className="overview-title red-dark-text">Leave</h4>
            <p className="overview-count">{stats.leave}</p>
          </div>

          <div className="overview-card">
            <FaUserSlash size={32} className="orange-text" style={{ marginBottom: "6px" }} />
            <h4 className="overview-title orange-text">Not Checked In</h4>
            <p className="overview-count">{stats.not_checked_in}</p>
          </div>

        </div>
      </div>



      {/* Navigation Buttons */}
      <div className="card" style={{ marginTop: "15px" }}>
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

          <button
            className={`btn ${view === "summary" ? "" : "ghost"}`}
            onClick={() => setView("summary")}
          >
            Summary
          </button>
        </div>
      </div>

      {/* EMPLOYEE MANAGEMENT */}
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

      {/* LEAVES */}
      {view === "leaves" && (
        <div style={{ marginTop: "16px" }}>
          <AdminLeavePage token={token} api={api} />
        </div>
      )}

      {/* ATTENDANCE */}
      {view === "attendance" && (
        <div style={{ marginTop: "16px" }}>
          <AdminAttendancePage token={token} api={api} />
        </div>
      )}

      {/* MANAGER SECTION */}
      {view === "manager" && (
        <div style={{ marginTop: "16px" }}>
          <RegisterManager token={token} api={api} />
        </div>
      )}

      {/* ATTENDANCE SUMMARY */}
      {view === "summary" && (
        <div style={{ marginTop: "16px" }}>
          <AdminAttendanceSummary token={token} api={api} />
        </div>
      )}
    </div>
  );
}
