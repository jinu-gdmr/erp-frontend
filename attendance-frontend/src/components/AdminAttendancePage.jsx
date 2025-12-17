import React, { useEffect, useState } from "react";

// Helper function to group records by date
function groupAttendance(records) {
  const groups = {};
  records.forEach(rec => {
    const date = rec.date;
    if (!groups[date]) {
      groups[date] = {
        checkin: null,
        checkout: null,
        absent: null,
      };
    }
    groups[date][rec.type] = rec;
  });
  
  // Convert groups into an array of consolidated records, newest first
  return Object.entries(groups)
    .map(([date, records]) => ({
      date,
      checkin: records.checkin,
      checkout: records.checkout,
      absent: records.absent,
      // Use latest timestamp for sorting (checkout > checkin > absent)
      sortTime: new Date(records.checkout?.time || records.checkin?.time || records.absent?.time).getTime()
    }))
    .sort((a, b) => b.sortTime - a.sortTime); // Sort by newest activity date
}

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
      // NEW: Consolidate records for display
      setAttendance(groupAttendance(records));
    } catch (err) {
      console.error("Error loading attendance", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);
  
  // Helper to display time
  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Helper for status badge
  const getStatusDisplay = (rec) => {
      if (rec.absent) {
          return <span className="attendance-indicator leave">Absent</span>;
      }
      if (rec.checkin && rec.checkout) {
          if (rec.checkin.status_indicator === "Late") {
              return <span className="attendance-indicator late">Late Check-in</span>;
          }
          if (rec.checkout.status_indicator === "Early") {
              return <span className="attendance-indicator early">Early Checkout</span>;
          }
          return <span className="attendance-indicator on-time">Full Day</span>;
      }
      if (rec.checkin) {
           if (rec.checkin.day_type === "half-day") {
                return <span className="attendance-indicator on-time">Half Day (In)</span>;
           }
           if (rec.checkin.status_indicator === "Late") {
               return <span className="attendance-indicator late">Late Check-in</span>;
           }
           return <span className="attendance-indicator on-time">Checked In</span>;
      }
      return "-";
  }

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

      {/* ✅ RIGHT COLUMN: Attendance Details (Consolidated View) */}
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
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>C/I Photo</th>
                    <th>C/O Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((rec) => (
                    <tr key={rec.date}>
                      <td>{rec.date}</td>
                      <td style={{ color: rec.checkin?.status_indicator === 'Late' ? '#d97706' : '#16a34a', fontWeight: 600 }}>
                          {formatTime(rec.checkin?.time)}
                      </td>
                      <td style={{ color: rec.checkout?.status_indicator === 'Early' ? '#dc2626' : '#333', fontWeight: 600 }}>
                          {formatTime(rec.checkout?.time)}
                      </td>
                      <td>{getStatusDisplay(rec)}</td>
                      <td>
                        {rec.checkin?.photo_url ? (
                          <a
                            href={rec.checkin.photo_url.startsWith('http') ? rec.checkin.photo_url : `https://erp-backend-production-d377.up.railway.app${rec.checkin.photo_url}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        ) : "-"}
                      </td>
                      <td>
                        {rec.checkout?.photo_url ? (
                          <a
                            href={rec.checkout.photo_url.startsWith('http') ? rec.checkout.photo_url : `https://erp-backend-production-d377.up.railway.app${rec.checkout.photo_url}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        ) : "-"}
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