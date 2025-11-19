import React, { useEffect, useState } from "react";

export default function AdminAttendanceSummary({ token, api }) {
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [summary, setSummary] = useState(null);

  async function loadSummary() {
    const data = await api.getAttendanceSummary(month, token);
    setSummary(data);
  }

  useEffect(() => {
    loadSummary();
  }, [month]);

  if (!summary) return <div className="card">Loading...</div>;

  return (
    <>
      {/* ---------------- CSS DESIGN START ---------------- */}
      <style>{`
        .card {
          background: #ffffff;
          padding: 25px;
          border-radius: 14px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          margin-top: 20px;
          animation: fadeIn 0.4s ease;
        }

        h3 {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        h4 {
          margin-top: 10px;
          margin-bottom: 20px;
          font-size: 18px;
          color: #333;
        }

        input.input {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 15px;
          outline: none;
          transition: 0.2s;
        }

        input.input:focus {
          border-color: #b91c1c;
          box-shadow: 0 0 4px rgba(185, 28, 28, 0.4);
        }

        /* Scrollable Table Wrapper */
        .table-container {
          max-height: 420px; 
          overflow-y: auto;
          border-radius: 10px;
          border: 1px solid #ececec;
        }

        .styled-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 15px;
        }

        /* Sticky Header */
        .styled-table thead th {
          background-color: #b91c1c;
          color: #ffffff;
          text-align: left;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .styled-table th,
        .styled-table td {
          padding: 12px 15px;
        }

        .styled-table tbody tr {
          border-bottom: 1px solid #dddddd;
          transition: background 0.2s ease;
        }

        .styled-table tbody tr:hover {
          background-color: #f6f1f1;
        }

        .styled-table tbody tr:last-of-type {
          border-bottom: 2px solid #b91c1c;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* ---------------- CSS DESIGN END ---------------- */}

      <div className="card">
        <h3 style={{ color: "#b91c1c" }}>Monthly Attendance Summary</h3>

        {/* Month Selector */}
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="input"
          style={{ width: "180px", marginBottom: "15px" }}
        />

        <h4>Total Employees: {summary.total_employees}</h4>

        {/* Scrollable Table */}
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Present</th>
                <th>Absent</th>
                <th>On Leave</th>
                <th>Not Checked-in</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(summary.days).map(([date, d]) => (
                <tr key={date}>
                  <td>{date}</td>
                  <td>{d.present.length}</td>
                  <td>{d.absent.length}</td>
                  <td>{d.leave.length}</td>
                  <td>{d.not_checked_in.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
