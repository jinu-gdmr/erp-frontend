import React, { useEffect, useState, useRef } from "react";
import {
  FaCamera,
  FaSignOutAlt,
  FaCalendarPlus,
  FaCalendarCheck,
  FaHistory,
  FaArrowLeft,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaTimes
} from "react-icons/fa";

export default function EmployeeDashboard({ token, api }) {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [view, setView] = useState("dashboard"); 
  
  // Leave Form State
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("full");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Camera State
  const [cameraOpen, setCameraOpen] = useState(false);
  const [actionType, setActionType] = useState(null); 
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // --- Modal State for Leave Details ---
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalList, setModalList] = useState([]);

  // Derived Stats
  const pendingLeaves = leaves.filter(l => l.status === 'Pending');
  const approvedLeaves = leaves.filter(l => l.status === 'Approved');
  const rejectedLeaves = leaves.filter(l => l.status === 'Rejected');

  async function load() {
    setLoading(true);
    try {
      const a = await api.myAttendance(token);
      const l = await api.myLeaves(token);
      setAttendance(a);
      setLeaves(l);
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // -------------- CAMERA HANDLERS --------------
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
      if (actionType === "checkin") {
        await api.checkinWithPhoto(token, imageData);
      } else {
        await api.checkoutWithPhoto(token, imageData);
      }
      alert(`${actionType === "checkin" ? "Checked in" : "Checked out"} successfully!`);
      await load();
      closeCamera();
    } catch (err) {
      alert("Error submitting attendance: " + (err.message || ""));
    }
  }

  function closeCamera() {
    setCameraOpen(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
  }

  // -------------- LEAVE FORM HANDLER --------------
  async function applyLeave(e) {
    e.preventDefault();
    try {
      await api.applyLeaveWithFile({ date, type, reason }, file, token);
      setDate("");
      setReason("");
      setFile(null);
      await load();
      alert("Leave applied successfully!");
      setView("my-leaves"); 
    } catch (err) {
      alert("Error applying leave: " + (err.message || ""));
    }
  }

  // -------------- STAT CLICK HANDLER --------------
  function handleStatClick(title, list) {
    setModalTitle(title);
    setModalList(list);
    setLeaveModalOpen(true);
  }

  // -------------- SUB-COMPONENTS --------------
  const QuickLaunchItem = ({ icon, label, onClick, color = "var(--red)" }) => (
    <div className="quick-launch-item" onClick={onClick}>
      <div className="quick-launch-icon" style={{ color: color }}>{icon}</div>
      <div className="quick-launch-label">{label}</div>
    </div>
  );

  const StatItem = ({ icon, label, count, colorClass, onClick }) => (
    <div 
      className="stat-row clickable-stat" 
      onClick={onClick}
      title="Click to view details"
    >
      <div className={`stat-icon-box ${colorClass}`}>{icon}</div>
      <div className="stat-info">
        <span className="stat-count">{count}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );

  // -------------- MAIN RENDER --------------
  return (
    <div>
      {/* ---------------- CSS Styles ---------------- */}
      <style>{`
        .clickable-stat {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .clickable-stat:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          background: #fff;
          border-color: #e5e5e5;
        }
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.5); z-index: 3000;
          display: flex; justify-content: center; align-items: center;
          animation: fadeIn 0.2s;
        }
        .modal-card {
          background: white; width: 400px; max-width: 90%;
          border-radius: 12px; padding: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          display: flex; flex-direction: column; max-height: 80vh;
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;
        }
        .modal-list {
          overflow-y: auto; flex: 1;
        }
        .modal-item {
          padding: 10px; border-bottom: 1px solid #f9f9f9;
          display: flex; flex-direction: column; gap: 4px;
        }
        .modal-item:last-child { border-bottom: none; }
        .item-date { font-weight: 600; color: #333; }
        .item-reason { font-size: 13px; color: #666; font-style: italic; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* HEADER */}
      {view === "dashboard" ? (
        <div className="dashboard-header-card card">
          <h2 style={{ color: "var(--red)", margin: 0 }}>My Dashboard</h2>
          <p className="small">Manage your attendance and leaves</p>
        </div>
      ) : (
        <div className="dashboard-header-card card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="btn ghost" onClick={() => setView("dashboard")} style={{padding: '8px 12px'}}>
            <FaArrowLeft /> Back
          </button>
          <h3 style={{ margin: 0, color: "var(--red)", textTransform: 'capitalize' }}>
            {view.replace("-", " ")}
          </h3>
        </div>
      )}

      {/* DASHBOARD WIDGETS */}
      {view === "dashboard" && (
        <div className="dashboard-grid-container">
          
          {/* Widget 1: Quick Actions */}
          <div className="card dashboard-widget">
            <h4 className="widget-title">Quick Actions</h4>
            <div className="quick-launch-grid">
              <QuickLaunchItem 
                icon={<FaCamera />} 
                label="Check In" 
                onClick={() => openCamera("checkin")}
                color="green"
              />
              <QuickLaunchItem 
                icon={<FaSignOutAlt />} 
                label="Check Out" 
                onClick={() => openCamera("checkout")}
                color="#b91c1c"
              />
              <QuickLaunchItem 
                icon={<FaCalendarPlus />} 
                label="Apply Leave" 
                onClick={() => setView("apply-leave")}
              />
              <QuickLaunchItem 
                icon={<FaCalendarCheck />} 
                label="My Leaves" 
                onClick={() => setView("my-leaves")}
              />
              <QuickLaunchItem 
                icon={<FaHistory />} 
                label="Attendance Log" 
                onClick={() => setView("attendance-log")}
              />
            </div>
          </div>

          {/* Widget 2: Leave Stats */}
          <div className="card dashboard-widget">
            <h4 className="widget-title">My Leave Stats</h4>
            <div className="stats-list">
              <StatItem 
                icon={<FaHourglassHalf />} 
                label="Pending Requests" 
                count={pendingLeaves.length} 
                colorClass="text-orange" 
                onClick={() => handleStatClick("Pending Requests", pendingLeaves)}
              />
              <StatItem 
                icon={<FaCheckCircle />} 
                label="Approved Leaves" 
                count={approvedLeaves.length} 
                colorClass="text-green" 
                onClick={() => handleStatClick("Approved Leaves", approvedLeaves)}
              />
              <StatItem 
                icon={<FaTimesCircle />} 
                label="Rejected Leaves" 
                count={rejectedLeaves.length} 
                colorClass="text-red" 
                onClick={() => handleStatClick("Rejected Leaves", rejectedLeaves)}
              />
            </div>
          </div>

        </div>
      )}

      {/* --- LEAVE DETAILS MODAL --- */}
      {leaveModalOpen && (
        <div className="modal-overlay" onClick={() => setLeaveModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: 'var(--red)' }}>{modalTitle}</h3>
              <button className="btn ghost" onClick={() => setLeaveModalOpen(false)} style={{padding:'4px 8px'}}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-list">
              {modalList.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No records found.</p>
              ) : (
                modalList.map((l) => (
                  <div key={l._id} className="modal-item">
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <span className="item-date">{l.date}</span>
                        <span className="small" style={{background:'#eee', padding:'2px 6px', borderRadius:4}}>{l.type}</span>
                    </div>
                    <div className="item-reason">"{l.reason || "No reason provided"}"</div>
                    {l.attachment_url && (
                        <a 
                            href={`http://localhost:5000${l.attachment_url}`} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{fontSize:12, color:'blue', textDecoration:'none'}}
                        >
                            View Attachment
                        </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CAMERA MODAL (Available globally) */}
      {cameraOpen && (
        <div className="camera-modal">
          <div className="camera-box">
            <h4 style={{marginBottom: 10, color: '#333'}}>
              {actionType === 'checkin' ? 'Check In' : 'Check Out'}
            </h4>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: "100%", borderRadius: "8px", background:'#000' }}
            ></video>
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
            <div style={{ marginTop: 15, display:'flex', justifyContent:'center', gap: 10 }}>
              <button className="btn" onClick={capturePhoto}>
                Capture & Submit
              </button>
              <button className="btn ghost" onClick={closeCamera}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- INNER VIEWS --- */}

      {/* 1. APPLY LEAVE */}
      {view === "apply-leave" && (
        <div className="card" style={{ marginTop: 16 }}>
          <form onSubmit={applyLeave}>
            <div className="form-row">
              <div style={{flex:1}}>
                <label>Date</label>
                <input
                  className="input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div style={{flex:1}}>
                <label>Type</label>
                <select
                  className="input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="full">Full-day</option>
                  <option value="half">Half-day</option>
                </select>
              </div>
            </div>

            <label>Reason</label>
            <textarea
              className="input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="Why are you taking leave?"
            />

            <label>Attachment (optional)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="input"
              style={{padding: 8}}
            />

            <div style={{ marginTop: 15, display:'flex', justifyContent:'flex-end' }}>
              <button className="btn" type="submit">Submit Request</button>
            </div>
          </form>
        </div>
      )}

      {/* 2. MY LEAVES */}
      {view === "my-leaves" && (
        <div className="card" style={{ marginTop: 16 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Attachment</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan="4">No leaves applied yet.</td></tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l._id}>
                    <td>{l.date}</td>
                    <td>{l.type}</td>
                    <td>
                      <span style={{
                        color: l.status === 'Approved' ? 'green' : l.status === 'Rejected' ? 'red' : 'orange',
                        fontWeight: 600
                      }}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      {l.attachment_url ? (
                        <a href={`http://localhost:5000${l.attachment_url}`} target="_blank" rel="noreferrer">
                          View
                        </a>
                      ) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. ATTENDANCE LOG */}
      {view === "attendance-log" && (
        <div className="card" style={{ marginTop: 16 }}>
           {loading ? <p>Loading...</p> : (
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date / Time</th>
                  <th>Photo</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan="3">No attendance records yet.</td></tr>
                ) : (
                  attendance.map((a) => (
                    <tr key={a._id}>
                      <td style={{ color: a.type === "checkin" ? "green" : "#b91c1c", fontWeight: 600 }}>
                        {a.type === 'checkin' ? 'Check In' : 'Check Out'}
                      </td>
                      <td>{new Date(a.time).toLocaleString()}</td>
                      <td>
                        {a.photo_url ? (
                          <a href={`http://localhost:5000${a.photo_url}`} target="_blank" rel="noreferrer">View Photo</a>
                        ) : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
           )}
        </div>
      )}

    </div>
  );
}