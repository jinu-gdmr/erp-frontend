import React from "react";

export default function Navbar({ user, onLogout }) {
  return (
    <div className="navbar">
      <div className="brand">
        <div className="logo">A</div>
        <div>
          <div style={{fontWeight:700}}>Attendance App</div>
          <div className="small">Simple attendance & leave management</div>
        </div>
      </div>
      <div className="nav-actions">
        {user ? (
          <>
            <div className="small">Hello, {user.name}</div>
            <button className="btn ghost" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <div className="small">Not logged</div>
        )}
      </div>
    </div>
  );
}
