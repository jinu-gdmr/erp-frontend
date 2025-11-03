import React from "react";
import Logo from "../assets/GDMR-LOGO-unit.png"; // ✅ import your logo

export default function Navbar({ user, onLogout }) {
  return (
    <div className="navbar">
      <div className="brand">
        <img src={Logo} alt="GDMR Logo" className="logo-img" /> 
        <div>
          <div style={{ fontWeight: 700 }}>Gdmr Connect</div>
          <div className="small">Simple attendance & leave management</div>
        </div>
      </div>
      <div className="nav-actions">
        {user ? (
          <>
            <div className="small">Hello, {user.name}</div>
            <button className="btn ghost" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <div className="small">Not logged</div>
        )}
      </div>
    </div>
  );
}
