import React, { useEffect, useState } from "react";
import EmployeeForm from "./EmployeeForm";
import EmployeeList from "./EmployeeList";
import AdminLeavePage from "./AdminLeavePage";
import AdminAttendancePage from "./AdminAttendancePage";
import RegisterManager from "./RegisterManager";
import AdminAttendanceSummary from "./AdminAttendanceSummary";
import HolidayCalendar from "./HolidayCalendar"; 
import {
  FaUserPlus, FaUsers, FaCalendarCheck, FaClock, FaChartPie, FaUserTie,
  FaArrowLeft, FaCheckCircle, FaTimesCircle, FaUserClock, FaUserSlash, FaTimes, FaCalendarAlt
} from "react-icons/fa";

export default function AdminDashboard({ token, api }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("dashboard"); 
  const [subView, setSubView] = useState("list");
  const [stats, setStats] = useState({ present: 0, absent: 0, leave: 0, not_checked_in: 0 });

  // Edit Employee State
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Stats Details Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailList, setDetailList] = useState([]);
  
  async function loadEmployees() {
    setLoading(true);
    try {
      const list = await api.listEmployees(token);
      setEmployees(list);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }

  async function loadTodayStats() {
    try { const res = await api.todayStats(token); setStats(res); } 
    catch (err) { console.error(err); }
  }

  useEffect(() => { loadEmployees(); loadTodayStats(); }, []);

  async function addEmployee(data) {
    await api.addEmployee(data, token);
    await loadEmployees();
    setSubView("list");
  }

  async function updateEmployee(data) {
      if(!editingEmployee) return;
      await api.editEmployee(editingEmployee._id, data, token);
      setEditingEmployee(null);
      await loadEmployees();
  }

  async function deleteEmployee(id) {
    await api.deleteEmployee(id, token);
    await loadEmployees();
  }

  async function handleStatClick(type, title) {
    // ... existing stat logic ... (omitted for brevity, same as before)
    setDetailTitle(title); setDetailModalOpen(true); // Placeholder
  }

  // ... Sub-components (StatItem, QuickLaunchItem) same as before ...
  const QuickLaunchItem = ({ icon, label, onClick }) => (<div className="quick-launch-item" onClick={onClick}><div className="quick-launch-icon">{icon}</div><div className="quick-launch-label">{label}</div></div>);
  const StatItem = ({ icon, label, count, colorClass, onClick }) => (<div className="stat-row clickable-stat" onClick={onClick}><div className={`stat-icon-box ${colorClass}`}>{icon}</div><div className="stat-info"><span className="stat-count">{count}</span><span className="stat-label">{label}</span></div></div>);

  return (
    <div>
      {/* ... CSS ... */}
      
      {view === "dashboard" ? (
        <div className="dashboard-header-card card"><h2 style={{ color: "var(--red)", margin: 0 }}>Dashboard</h2></div>
      ) : (
        <div className="dashboard-header-card card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><button className="btn ghost" onClick={() => setView("dashboard")} style={{padding: '8px 12px', display:'flex', alignItems:'center', gap:6}}><FaArrowLeft /> Back</button><h3 style={{ margin: 0, color: "var(--red)", textTransform: 'capitalize' }}>{view.replace("-", " ")}</h3></div>
      )}

      {view === "dashboard" && (
        <div className="dashboard-grid-container">
          <div className="card dashboard-widget">
            <h4 className="widget-title">Today's Attendance</h4>
            <div className="stats-list">
              <StatItem icon={<FaCheckCircle />} label="Present" count={stats.present} colorClass="text-green" onClick={() => handleStatClick('present', 'Present Today')}/>
              <StatItem icon={<FaTimesCircle />} label="Absent" count={stats.absent} colorClass="text-red" onClick={() => handleStatClick('absent', 'Absent Today')}/>
              <StatItem icon={<FaUserClock />} label="On Leave" count={stats.leave} colorClass="text-dark-red" onClick={() => handleStatClick('leave', 'On Leave Today')}/>
              <StatItem icon={<FaUserSlash />} label="Not Checked In" count={stats.not_checked_in} colorClass="text-orange" onClick={() => handleStatClick('not_checked_in', 'Not Checked In')}/>
            </div>
          </div>
          <div className="card dashboard-widget">
            <h4 className="widget-title">Quick Launch</h4>
            <div className="quick-launch-grid">
              <QuickLaunchItem icon={<FaUserPlus />} label="Add Employee" onClick={() => { setView("employees"); setSubView("add"); }} />
              <QuickLaunchItem icon={<FaUsers />} label="Employee List" onClick={() => { setView("employees"); setSubView("list"); }} />
              <QuickLaunchItem icon={<FaCalendarCheck />} label="Leave Requests" onClick={() => setView("leaves")} />
              <QuickLaunchItem icon={<FaClock />} label="Attendance Logs" onClick={() => setView("attendance")} />
              <QuickLaunchItem icon={<FaUserTie />} label="Managers" onClick={() => setView("manager")} />
              <QuickLaunchItem icon={<FaChartPie />} label="Reports" onClick={() => setView("summary")} />
              <QuickLaunchItem icon={<FaCalendarAlt />} label="Holidays" onClick={() => setView("holidays")} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
          <div className="modal-overlay" onClick={() => setEditingEmployee(null)}>
              <div className="modal-card" onClick={e => e.stopPropagation()} style={{width:'500px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}>
                      <h3>Edit Employee</h3>
                      <button className="btn ghost" onClick={() => setEditingEmployee(null)}><FaTimes/></button>
                  </div>
                  <EmployeeForm initialData={editingEmployee} onAdd={updateEmployee} api={api} token={token} />
              </div>
          </div>
      )}

      {/* INNER PAGES */}
      {view === "employees" && (
        <>
          <div className="card admin-buttons" style={{ marginTop: "12px" }}>
            <button className={`btn ${subView === "list" ? "" : "ghost"}`} onClick={() => setSubView("list")}>Employee List</button>
            <button className={`btn ${subView === "add" ? "" : "ghost"}`} onClick={() => setSubView("add")}>Add New Employee</button>
          </div>
          <div style={{ marginTop: "16px" }}>
            {subView === "add" ? (
              <EmployeeForm onAdd={addEmployee} api={api} token={token} />
            ) : (
              <EmployeeList employees={employees} onDelete={deleteEmployee} onEdit={setEditingEmployee} />
            )}
          </div>
        </>
      )}

      {view === "leaves" && <div style={{ marginTop: "16px" }}><AdminLeavePage token={token} api={api} /></div>}
      {view === "attendance" && <div style={{ marginTop: "16px" }}><AdminAttendancePage token={token} api={api} /></div>}
      {view === "manager" && <div style={{ marginTop: "16px" }}><RegisterManager token={token} api={api} /></div>}
      {view === "summary" && <div style={{ marginTop: "16px" }}><AdminAttendanceSummary token={token} api={api} /></div>}
      {view === "holidays" && <div style={{ marginTop: "16px" }}><HolidayCalendar /></div>}
    </div>
  );
}