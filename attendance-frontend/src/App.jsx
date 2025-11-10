import React, {useState, useEffect} from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";
import SplashScreen from "./components/SplashScreen";
import api from "./api";
import ManagerDashboard from "./components/ManagerDashboard";



export default function App(){
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [showSplash, setShowSplash] = useState(true);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // Show splash screen for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  function onLogout(){ setToken(null); setRole(null); setUser(null); }

  async function handleLogin(data){
    setToken(data.token);
    setRole(data.role);
    setUser(data.user);
  }

  if (showSplash) {
    return <SplashScreen />;
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
    <Navbar user={user} onLogout={onLogout} />
    <div className="app">
      {role === "admin" ? (
        <AdminDashboard token={token} api={api} />
      ) : role === "manager" ? (
        <ManagerDashboard token={token} api={api} />
      ) : (
        <EmployeeDashboard token={token} api={api} />
      )}

      <div className="footer">
        &copy; {new Date().getFullYear()} ERP App — GDMR
      </div>
    </div>
  </>
);

}
