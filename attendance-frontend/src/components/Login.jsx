import React, { useState } from "react";

export default function Login({ onLogin, api }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handle(e){
    e.preventDefault();
    setErr("");
    setLoading(true);

    if (!email || !password) {
      setErr("Email and password are required");
      setLoading(false);
      return;
    }

    try{
      const data = await api.login({ email, password });
      onLogin(data); // ✅ App.jsx will handle role-based dashboard
    }catch(err){
      setErr(err.message || "Invalid email or password");
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="card" style={{maxWidth:520, margin:"40px auto"}}>
        <h2 style={{color:"#b91c1c", textAlign:"center"}}>
          Sign in to your Account
        </h2>

        {err && <div className="alert">{err}</div>}
        <br />

        <form onSubmit={handle}>
          {/* Email */}
          <label>Email</label>
          <input
            className="input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <label>Password</label>
          <div style={{position:"relative"}}>
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              style={{paddingRight: "42px"}}
              required
            />

            <span
              className="material-icons"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "35%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#b91c1c"
              }}
            >
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </div>

          {/* Submit */}
          <div style={{marginTop:12, display:"flex",justifyContent:'end', gap:8}}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
