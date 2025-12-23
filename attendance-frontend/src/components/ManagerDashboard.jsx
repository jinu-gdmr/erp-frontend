import React, { useEffect, useState, useRef } from "react";
import AdminLeavePage from "./AdminLeavePage";
import HolidayCalendar from "./HolidayCalendar"; 
import {
  FaCamera, FaSignOutAlt, FaCalendarPlus, FaCalendarCheck, FaHistory,
  FaArrowLeft, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaUserCheck,
  FaTimes, FaCloudUploadAlt, FaFileAlt, FaCalendarAlt, FaUsers
} from "react-icons/fa";

export default function ManagerDashboard({ token, api }) {
  const [attendance, setAttendance] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [view, setView] = useState("dashboard");
  
  // Leave Form State
  const [leaveDuration, setLeaveDuration] = useState("single");
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState("full");
  const [file, setFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [actionType, setActionType] = useState(null); 
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalList, setModalList] = useState([]);

  const pendingLeaves = myLeaves.filter(l => l.status === 'Pending');
  const approvedLeaves = myLeaves.filter(l => l.status === 'Approved');
  const rejectedLeaves = myLeaves.filter(l => l.status === 'Rejected');

  async function load() {
    setLoading(true);
    try {
      const a = await api.myAttendance(token);
      const l = await api.myLeaves(token);
      const t = await api.getManagerEmployees(token);
      setAttendance(a);
      setMyLeaves(l);
      setTeamMembers(t);
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function openCamera(type) {
    setActionType(type);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied or unavailable.");
      setCameraOpen(false);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");
    submitAttendance(imageData);
  }

  async function submitAttendance(imageData) {
    try {
      if (actionType === "checkin") await api.checkinWithPhoto(token, imageData);
      else await api.checkoutWithPhoto(token, imageData);
      alert(`${actionType === "checkin" ? "Checked in" : "Checked out"} successfully!`);
      await load();
      closeCamera();
    } catch (err) {
      alert("Error: " + (err.message || ""));
    }
  }

  function closeCamera() {
    setCameraOpen(false);
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
  }
  
  async function applyLeave(e) {
    e.preventDefault();
    const payload = { type, reason };
    
    if (leaveDuration === "single") {
        if (!date) return alert("Please select a date.");
        payload.date = date;
    } else {
        if (!startDate || !endDate) return alert("Please select start and end dates.");
        if (new Date(startDate) > new Date(endDate)) return alert("End date cannot be before start date.");
        payload.start_date = startDate;
        payload.end_date = endDate;
    }

    try {
      await api.applyLeaveWithFile(payload, file, token);
      setDate(""); setStartDate(""); setEndDate(""); setReason(""); setFile(null);
      await load();
      alert("Leave applied successfully!");
      setView("my-leaves"); 
    } catch (err) {
      alert("Error: " + (err.message || ""));
    }
  }

  function handleStatClick(title, list) {
    setModalTitle(title);
    setModalList(list);
    setLeaveModalOpen(true);
  }

  const getStatusClass = (status) => (status ? status.toLowerCase() : "pending");

  const QuickLaunchItem = ({ icon, label, onClick, color = "var(--red)" }) => (
    <div className="quick-launch-item" onClick={onClick}>
      <div className="quick-launch-icon" style={{ color: color }}>{icon}</div>
      <div className="quick-launch-label">{label}</div>
    </div>
  );

  const StatItem = ({ icon, label, count, colorClass, onClick }) => (
    <div className="stat-row clickable-stat" onClick={onClick} title="Click to view details">
      <div className={`stat-icon-box ${colorClass}`}>{icon}</div>
      <div className="stat-info"><span className="stat-count">{count}</span><span className="stat-label">{label}</span></div>
    </div>
  );

  return (
    <div>
      <style>{`
        .modern-input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; background: #fff; }
        .modern-label { font-size: 13px; font-weight: 600; color: #555; margin-bottom: 6px; display: block; }
        .file-upload-label { display: flex; align-items: center; justify-content: center; padding: 20px; border: 2px dashed #ddd; border-radius: 8px; background: #fafafa; color: #666; cursor: pointer; gap: 10px; }
        .clickable-stat { cursor: pointer; transition: transform 0.2s; }
        .clickable-stat:hover { transform: translateX(4px); background: #fff; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 3000; display: flex; justify-content: center; align-items: center; }
        .modal-card { background: white; width: 450px; max-width: 90%; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; max-height: 80vh; }
      `}</style>

      {view === "dashboard" ? (
        <div className="dashboard-header-card card">
          <h2 style={{ color: "var(--red)", margin: 0 }}>Manager Dashboard</h2>
          <p className="small">Manage your team and your own attendance</p>
        </div>
      ) : (
        <div className="dashboard-header-card card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="btn ghost" onClick={() => setView("dashboard")} style={{padding: '8px 12px', display:'flex', alignItems:'center', gap:6}}><FaArrowLeft /> Back</button>
          <h3 style={{ margin: 0, color: "var(--red)", textTransform: 'capitalize' }}>{view.replace("-", " ")}</h3>
        </div>
      )}

      {view === "dashboard" && (
        <div className="dashboard-grid-container">
          <div className="card dashboard-widget">
            <h4 className="widget-title">Quick Actions</h4>
            <div className="quick-launch-grid">
              <QuickLaunchItem icon={<FaCamera />} label="Check In" onClick={() => openCamera("checkin")} color="green"/>
              <QuickLaunchItem icon={<FaSignOutAlt />} label="Check Out" onClick={() => openCamera("checkout")} color="#b91c1c"/>
              <QuickLaunchItem icon={<FaCalendarPlus />} label="Apply Leave" onClick={() => setView("apply-leave")}/>
              <QuickLaunchItem icon={<FaUserCheck />} label="Team Leaves" onClick={() => setView("team-leaves")} color="var(--red)"/>
              <QuickLaunchItem icon={<FaUsers />} label="Team Members" onClick={() => setView("team-members")} color="var(--red)"/>
              <QuickLaunchItem icon={<FaCalendarCheck />} label="My Leaves" onClick={() => setView("my-leaves")}/>
              <QuickLaunchItem icon={<FaHistory />} label="My Logs" onClick={() => setView("attendance-log")}/>
              <QuickLaunchItem icon={<FaCalendarAlt />} label="Holidays" onClick={() => setView("holidays")} />
            </div>
          </div>

          <div className="card dashboard-widget">
            <h4 className="widget-title">My Leave Stats</h4>
            <div className="stats-list">
              <StatItem icon={<FaHourglassHalf />} label="Pending Requests" count={pendingLeaves.length} colorClass="text-orange" onClick={() => handleStatClick("My Pending Requests", pendingLeaves)}/>
              <StatItem icon={<FaCheckCircle />} label="Approved Leaves" count={approvedLeaves.length} colorClass="text-green" onClick={() => handleStatClick("My Approved Leaves", approvedLeaves)}/>
              <StatItem icon={<FaTimesCircle />} label="Rejected Leaves" count={rejectedLeaves.length} colorClass="text-red" onClick={() => handleStatClick("My Rejected Leaves", rejectedLeaves)}/>
            </div>
          </div>
        </div>
      )}

      {view === "team-leaves" && <div style={{ marginTop: 16 }}><AdminLeavePage token={token} api={api} /></div>}

      {view === "team-members" && (
        <div className="card" style={{ marginTop: 16, padding:0, overflow:"hidden" }}>
            <div style={{overflowX: 'auto'}}>
                <table className="styled-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Position</th></tr></thead>
                    <tbody>
                        {teamMembers.length === 0 ? (
                            <tr><td colSpan="4" style={{textAlign:"center", padding:20, color:"#999"}}>No employees assigned yet.</td></tr>
                        ) : teamMembers.map((m) => (
                            <tr key={m._id}><td style={{fontWeight:500}}>{m.name}</td><td>{m.email}</td><td>{m.department}</td><td>{m.position}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
      
      {view === "apply-leave" && (
        <div className="card" style={{ marginTop: 16 }}>
          <form onSubmit={applyLeave}>
            <div style={{ marginBottom: 20, display: "flex", gap: 20 }}>
                <label style={{display:'flex', alignItems:'center', gap:5, cursor:'pointer'}}>
                    <input type="radio" name="duration" value="single" checked={leaveDuration === "single"} onChange={() => setLeaveDuration("single")}/> Single Day
                </label>
                <label style={{display:'flex', alignItems:'center', gap:5, cursor:'pointer'}}>
                    <input type="radio" name="duration" value="multiple" checked={leaveDuration === "multiple"} onChange={() => setLeaveDuration("multiple")}/> Multiple Days
                </label>
            </div>

            <div className="form-row">
              {leaveDuration === "single" ? (
                  <div style={{flex:1}}><label className="modern-label">Date</label><input className="modern-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required/></div>
              ) : (
                  <>
                    <div style={{flex:1}}><label className="modern-label">Start Date</label><input className="modern-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required/></div>
                    <div style={{flex:1}}><label className="modern-label">End Date</label><input className="modern-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required/></div>
                  </>
              )}
              <div style={{flex:1}}><label className="modern-label">Leave Type</label><select className="modern-input" value={type} onChange={(e) => setType(e.target.value)}><option value="full">Full Day</option><option value="half">Half Day</option></select></div>
            </div>

            <div style={{marginTop: 15}}><label className="modern-label">Reason</label><textarea className="modern-input" value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="Explanation..."/></div>
            <div style={{marginTop: 15}}><label className="modern-label">Attachment</label><label className="file-upload-label"><FaCloudUploadAlt size={24} /><span>{file ? file.name : "Upload Document"}</span><input type="file" onChange={(e) => setFile(e.target.files[0])} style={{display: "none"}}/></label></div>
            <div style={{ marginTop: 25, display:'flex', justifyContent:'flex-end' }}><button className="btn" type="submit">Submit Request</button></div>
          </form>
        </div>
      )}

      {view === "my-leaves" && (
        <div className="card" style={{ marginTop: 16, padding:0, overflow:"hidden" }}>
          <div style={{overflowX: 'auto'}}>
            <table className="styled-table">
              <thead><tr><th>Date</th><th>Type</th><th>Manager</th><th>HR</th><th>Overall</th><th>Attachment</th></tr></thead>
              <tbody>
                {myLeaves.length === 0 ? <tr><td colSpan="6" style={{textAlign:"center", padding:20, color:"#999"}}>No leaves found.</td></tr> : myLeaves.map((l) => (
                    <tr key={l._id}>
                      <td style={{fontWeight:500}}>{l.date}</td><td>{l.type}</td>
                      <td><span className={`status-badge ${getStatusClass(l.manager_status)}`}>{l.manager_status || 'Pending'}</span></td>
                      <td><span className={`status-badge ${getStatusClass(l.admin_status)}`}>{l.admin_status || 'Pending'}</span></td>
                      <td><span className={`status-badge ${getStatusClass(l.status)}`}>{l.status || 'Pending'}</span></td>
                      <td>{l.attachment_url ? <a href={`https://erp-backend-production-d377.up.railway.app${l.attachment_url}`} target="_blank" rel="noreferrer" style={{color:"var(--red)", fontSize:13}}>View</a> : "-"}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "attendance-log" && (
        <div className="card" style={{ marginTop: 16, padding:0, overflow:"hidden" }}>
            <table className="styled-table">
              <thead><tr><th>Type</th><th>Date / Time</th><th>Photo</th></tr></thead>
              <tbody>
                {attendance.length === 0 ? <tr><td colSpan="3" style={{textAlign:"center", padding:20, color:"#999"}}>No records.</td></tr> : attendance.map((a) => (
                    <tr key={a._id}><td style={{fontWeight: 600}}><span className={`status-badge ${a.type}`}>{a.type === 'checkin' ? 'Check In' : 'Check Out'}</span></td><td>{new Date(a.time).toLocaleString()}</td><td>{a.photo_url ? <a href={a.photo_url} target="_blank" rel="noreferrer" style={{color:"var(--red)"}}>View Photo</a> : "-"}</td></tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      {view === "holidays" && <div style={{ marginTop: "16px" }}><HolidayCalendar /></div>}
      
      {leaveModalOpen && (
        <div className="modal-overlay" onClick={() => setLeaveModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}><h3 style={{ margin: 0 }}>{modalTitle}</h3><button className="btn ghost" onClick={() => setLeaveModalOpen(false)}><FaTimes /></button></div>
            <div style={{overflowY:'auto'}}>{modalList.length === 0 ? <p>No records.</p> : modalList.map((l) => (<div key={l._id} style={{padding:12, borderBottom:'1px solid #eee'}}>{l.date} - {l.status}</div>))}</div>
          </div>
        </div>
      )}

      {cameraOpen && <div className="camera-modal"><div className="camera-box"><video ref={videoRef} autoPlay style={{ width: "100%" }}></video><button className="btn" onClick={capturePhoto}>Capture</button><button className="btn ghost" onClick={closeCamera}>Cancel</button></div></div>}
    </div>
  );
}