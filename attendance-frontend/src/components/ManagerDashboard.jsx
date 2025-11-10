import React from "react";
import AdminLeavePage from "./AdminLeavePage";

export default function ManagerDashboard({ token, api }) {
  return (
    <div>
      <h2 style={{ color: "#b91c1c" }}>Manager Dashboard</h2>
      <AdminLeavePage token={token} api={api} isManager={true} />
    </div>
  );
}
