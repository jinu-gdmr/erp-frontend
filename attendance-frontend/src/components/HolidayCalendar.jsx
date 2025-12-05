import React from "react";

const holidays = [
  { id: 1, date: "January 1", day: "Wednesday", name: "New Year" },
  { id: 2, date: "February 26", day: "Wednesday", name: "Shivaratri" },
  { id: 3, date: "March 14", day: "Friday", name: "Holi" },
  { id: 4, date: "March 31 (Observed)", day: "Monday", name: "Eid-ul-Fitr" },
  { id: 5, date: "April 18", day: "Friday", name: "Good Friday" },
  { id: 6, date: "May 1", day: "Thursday", name: "Labour Day" },
  { id: 7, date: "June 6 (Observed)", day: "Friday", name: "Bakrid" },
  { id: 8, date: "August 15", day: "Friday", name: "Independence Day" },
  { id: 9, date: "September 5", day: "Friday", name: "Thiruvonam" },
  { id: 10, date: "October 2", day: "Thursday", name: "Gandhi Jayanti" },
  { id: 11, date: "October 20", day: "Monday", name: "Diwali" },
  { id: 12, date: "December 25", day: "Thursday", name: "Christmas" },
];

export default function HolidayCalendar() {
  return (
    <div className="card" style={{ padding: 0, border: "none", boxShadow: "none" }}>
      <div style={{ padding: "20px", borderBottom: "1px solid #f0f0f0" }}>
        <h3 style={{ color: "#b91c1c", margin: 0 }}>Holiday Calendar 2025</h3>
      </div>
      
      <div style={{ overflowX: "auto" }}>
        <table className="styled-table">
          <thead>
            <tr>
              <th>SL No</th>
              <th>Date</th>
              <th>Day</th>
              <th>Holiday</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => (
              <tr key={h.id}>
                <td style={{ textAlign: "center", width: "80px" }}>{h.id}</td>
                <td style={{ fontWeight: 500 }}>{h.date}</td>
                <td>{h.day}</td>
                <td style={{ color: "#b91c1c", fontWeight: 600 }}>{h.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}