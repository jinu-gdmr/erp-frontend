import React, { useState } from "react";

export default function Login({ onLogin, api }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

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
          <label>Email</label>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
          <label>Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div style={{marginTop:12, display:"flex",justifyContent:'end', gap:8}}>
            <button className="btn" type="submit">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}
