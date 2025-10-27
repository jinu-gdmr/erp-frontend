import React, {useState, useEffect} from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";
import api from "./api";

export default function App(){
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));

  useEffect(()=>{
    if(token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
    }
  }, [token, role, user]);

  function onLogout(){ setToken(null); setRole(null); setUser(null); }

  async function handleLogin(data){
    setToken(data.token);
    setRole(data.role);
    setUser(data.user);
  }

  if(!token) {
    return (
      <>
        <Navbar user={null} />
        <Login onLogin={handleLogin} api={api} />
      </>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={onLogout}/>
      <div className="app">
        {role === "admin" ? (
          <AdminDashboard token={token} api={api} />
        ) : (
          <EmployeeDashboard token={token} api={api} />
        )}
        <div className="footer">
          &copy; {new Date().getFullYear()} Attendance App — red theme
        </div>
      </div>
    </>
  );
}
