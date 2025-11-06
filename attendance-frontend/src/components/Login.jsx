import React, { useState } from "react";

export default function Login({ onLogin, api }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handle(e){
    e.preventDefault();
    setErr("");
    try{
      const data = await api.login({ email, password });
      onLogin(data);
    }catch(err){
      setErr(err.message || "Login failed");
    }
  }

  return (
    <div className="app">
      <div className="card" style={{maxWidth:520, margin:"40px auto"}}>
        <h2 style={{color:"#b91c1c", textAlign:"center"}}>Sign in</h2>
        {err && <div className="alert">{err}</div>}
        <br />
        <form onSubmit={handle}>
          
          {/* Email */}
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
          />

          {/* Password */}
          <label>Password</label>
          <div style={{position:"relative"}}>
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e=>setPassword(e.target.value)}
              style={{paddingRight: "42px"}}
            />

            <span
              className="material-icons"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "38%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#555",
                userSelect: "none"
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </div>

          {/* Submit */}
          <div style={{marginTop:12, display:"flex",justifyContent:'end', gap:8}}>
            <button className="btn" type="submit">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}
