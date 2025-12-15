import React, { useEffect, useState } from "react";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";

// Helper function to convert data to CSV format
function convertToCSV(summary) {
    let csv = 'Date,Present,Absent,On Leave,Not Checked-in\n';
    
    Object.entries(summary.days).forEach(([date, d]) => {
        csv += `${date},${d.present.length},${d.absent.length},${d.leave.length},${d.not_checked_in.length}\n`;
    });
    
    return csv;
}

// Helper function to convert data to PDF format (simplified text output)
function convertToPDFText(summary, month) {
  let text = `Monthly Attendance Summary: ${month}\n`;
  text += `Total Employees: ${summary.total_employees}\n\n`;
  text += '----------------------------------------------------------\n';
  text += 'Date       | Present | Absent | On Leave | Not Checked-in\n';
  text += '----------------------------------------------------------\n';
  
  Object.entries(summary.days).forEach(([date, d]) => {
      text += `${date} | ${String(d.present.length).padEnd(7)} | ${String(d.absent.length).padEnd(6)} | ${String(d.leave.length).padEnd(8)} | ${d.not_checked_in.length}\n`;
  });
  text += '----------------------------------------------------------\n';
  
  return text;
}


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
  
  // --- NEW: Export Handlers ---
  function handleExport(format) {
    if (!summary) return;

    if (format === 'csv') {
        const csvData = convertToCSV(summary);
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Attendance_Summary_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else if (format === 'pdf') {
        const pdfText = convertToPDFText(summary, month);
        // Simplified PDF generation using window.print() for plain text output (requires user to choose 'Save as PDF')
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<pre>');
        printWindow.document.write(pdfText);
        printWindow.document.write('</pre>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }
  }

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

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
             {/* Month Selector */}
            <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input"
            style={{ width: "180px" }}
            />
            
            {/* NEW: Export Buttons */}
            <div style={{display: 'flex', gap: '10px'}}>
                <button 
                    className="btn ghost" 
                    onClick={() => handleExport('csv')}
                    style={{padding: '8px 12px', display:'flex', alignItems:'center', gap: 5}}
                >
                    <FaFileCsv /> Export CSV
                </button>
                 <button 
                    className="btn" 
                    onClick={() => handleExport('pdf')}
                    style={{padding: '8px 12px', display:'flex', alignItems:'center', gap: 5}}
                >
                    <FaFilePdf /> Export PDF
                </button>
            </div>
        </div>

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