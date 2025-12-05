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
  FaTimes,
  FaCloudUploadAlt,
  FaFileAlt
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

  // Modal State
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

  function handleStatClick(title, list) {
    setModalTitle(title);
    setModalList(list);
    setLeaveModalOpen(true);
  }

  // Helper for Status Badge Class
  const getStatusClass = (status) => (status ? status.toLowerCase() : "pending");

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
        /* Form Inputs */
        .modern-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
          background: #fff;
          color: #333;
        }
        .modern-input:focus {
          border-color: #b91c1c;
          outline: none;
          box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.1);
        }
        .modern-label {
          font-size: 13px;
          font-weight: 600;
          color: #555;
          margin-bottom: 6px;
          display: block;
        }

        /* File Upload */
        .file-upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          border: 2px dashed #ddd;
          border-radius: 8px;
          background: #fafafa;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
          gap: 10px;
        }
        .file-upload-label:hover {
          border-color: #b91c1c;
          background: #fff5f5;
          color: #b91c1c;
        }

        /* Status Badges */
        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          display: inline-block;
          text-transform: capitalize;
          min-width: 80px;
          text-align: center;
        }
        .status-badge.approved { background: #dcfce7; color: #16a34a; }
        .status-badge.rejected { background: #fee2e2; color: #dc2626; }
        .status-badge.pending { background: #fef3c7; color: #d97706; }
        .status-badge.checkin { color: #16a34a; }
        .status-badge.checkout { color: #dc2626; }

        /* Tables */
        .styled-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .styled-table thead th {
          background-color: #fff3f3;
          color: #b91c1c;
          text-align: left;
          padding: 12px 15px;
          font-weight: 600;
          border-bottom: 2px solid #fee2e2;
        }
        .styled-table tbody td {
          padding: 12px 15px;
          border-bottom: 1px solid #f2f2f2;
          color: #444;
        }
        .styled-table tbody tr:hover {
          background-color: #fafafa;
        }

        /* Modals & Stats */
        .clickable-stat { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .clickable-stat:hover { transform: translateX(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.08); background: #fff; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 3000; display: flex; justify-content: center; align-items: center; }
        .modal-card { background: white; width: 450px; max-width: 90%; border-radius: 12px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); display: flex; flex-direction: column; max-height: 80vh; }
      `}</style>

      {/* HEADER */}
      {view === "dashboard" ? (
        <div className="dashboard-header-card card">
          <h2 style={{ color: "var(--red)", margin: 0 }}>My Dashboard</h2>
          <p className="small">Manage your attendance and leaves</p>
        </div>
      ) : (
        <div className="dashboard-header-card card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="btn ghost" onClick={() => setView("dashboard")} style={{padding: '8px 12px', display:'flex', alignItems:'center', gap:6}}>
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

      {/* --- INNER VIEWS --- */}

      {/* 1. APPLY LEAVE */}
      {view === "apply-leave" && (
        <div className="card" style={{ marginTop: 16 }}>
          <form onSubmit={applyLeave}>
            <div className="form-row">
              <div style={{flex:1}}>
                <label className="modern-label">Start Date</label>
                <input
                  className="modern-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div style={{flex:1}}>
                <label className="modern-label">Leave Type</label>
                <select
                  className="modern-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="full">Full Day</option>
                  <option value="half">Half Day</option>
                </select>
              </div>
            </div>

            <div style={{marginTop: 15}}>
              <label className="modern-label">Reason for Leave</label>
              <textarea
                className="modern-input"
                style={{minHeight: "100px", resize: "vertical"}}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                placeholder="Please explain the reason..."
              />
            </div>

            <div style={{marginTop: 15}}>
              <label className="modern-label">Attachment (Optional)</label>
              <label className="file-upload-label">
                <FaCloudUploadAlt size={24} />
                <span>{file ? file.name : "Click to upload a document"}</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{display: "none"}}
                />
              </label>
            </div>

            <div style={{ marginTop: 25, display:'flex', justifyContent:'flex-end' }}>
              <button className="btn" type="submit" style={{padding: "10px 24px"}}>
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. MY LEAVES (UPDATED WITH APPROVAL STATUSES) */}
      {view === "my-leaves" && (
        <div className="card" style={{ marginTop: 16, padding:0, overflow:"hidden" }}>
          <div style={{overflowX: 'auto'}}>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Manager</th>
                  <th>HR</th>
                  <th>Overall</th>
                  <th>Attachment</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr><td colSpan="6" style={{textAlign:"center", padding:20, color:"#999"}}>No leaves found.</td></tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l._id}>
                      <td style={{fontWeight:500}}>{l.date}</td>
                      <td style={{textTransform:"capitalize"}}>{l.type}</td>
                      
                      {/* Manager Status */}
                      <td>
                        <span className={`status-badge ${getStatusClass(l.manager_status)}`}>
                          {l.manager_status || 'Pending'}
                        </span>
                      </td>

                      {/* HR Status */}
                      <td>
                        <span className={`status-badge ${getStatusClass(l.admin_status)}`}>
                          {l.admin_status || 'Pending'}
                        </span>
                      </td>

                      {/* Overall Status */}
                      <td>
                        <span className={`status-badge ${getStatusClass(l.status)}`}>
                          {l.status || 'Pending'}
                        </span>
                      </td>

                      <td>
                        {l.attachment_url ? (
                          <a 
                            href={`https://erp-backend-production-d377.up.railway.app${l.attachment_url}`} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{color:"var(--red)", display:'flex', alignItems:'center', gap:5, fontSize:13}}
                          >
                            <FaFileAlt /> View
                          </a>
                        ) : <span style={{color:"#ccc"}}>-</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ATTENDANCE LOG */}
      {view === "attendance-log" && (
        <div className="card" style={{ marginTop: 16, padding:0, overflow:"hidden" }}>
           {loading ? <p style={{padding:20}}>Loading...</p> : (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date / Time</th>
                  <th>Photo</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan="3" style={{textAlign:"center", padding:20, color:"#999"}}>No attendance records yet.</td></tr>
                ) : (
                  attendance.map((a) => (
                    <tr key={a._id}>
                      <td style={{fontWeight: 600}}>
                        <span className={`status-badge ${a.type}`}>
                          {a.type === 'checkin' ? 'Check In' : 'Check Out'}
                        </span>
                      </td>
                      <td>{new Date(a.time).toLocaleString()}</td>
                      <td>
                        {a.photo_url ? (
                          <a 
                            href={`https://erp-backend-production-d377.up.railway.app${a.photo_url}`} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{color:"var(--red)", display:'flex', alignItems:'center', gap:5, fontSize:13}}
                          >
                             <FaCamera /> View Photo
                          </a>
                        ) : <span style={{color:"#ccc"}}>-</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
           )}
        </div>
      )}

      {/* --- LEAVE DETAILS MODAL (UPDATED WITH APPROVAL STATUSES) --- */}
      {leaveModalOpen && (
        <div className="modal-overlay" onClick={() => setLeaveModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:15, borderBottom:'1px solid #eee', paddingBottom:10}}>
              <h3 style={{ margin: 0, color: 'var(--red)' }}>{modalTitle}</h3>
              <button className="btn ghost" onClick={() => setLeaveModalOpen(false)} style={{padding:'4px 8px'}}>
                <FaTimes />
              </button>
            </div>
            
            <div style={{overflowY:'auto', flex:1}}>
              {modalList.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No records found.</p>
              ) : (
                modalList.map((l) => (
                  <div key={l._id} style={{padding:12, borderBottom:'1px solid #f9f9f9', display:'flex', flexDirection:'column', gap:6}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{fontWeight:600}}>{l.date}</span>
                        <span style={{fontSize:11, background:'#eee', padding:'2px 6px', borderRadius:4}}>{l.type}</span>
                    </div>
                    
                    <div style={{fontSize:13, color:'#666', fontStyle:'italic'}}>"{l.reason || "No reason"}"</div>

                    {/* Approvals in Modal */}
                    <div style={{display:'flex', gap:10, marginTop:4, fontSize:12}}>
                        <div>
                            <span style={{color:'#888'}}>Manager:</span> 
                            <span className={`status-badge ${getStatusClass(l.manager_status)}`} style={{marginLeft:4, padding:'2px 6px', fontSize:10, minWidth:50}}>
                                {l.manager_status || 'Pending'}
                            </span>
                        </div>
                        <div>
                            <span style={{color:'#888'}}>HR:</span> 
                            <span className={`status-badge ${getStatusClass(l.admin_status)}`} style={{marginLeft:4, padding:'2px 6px', fontSize:10, minWidth:50}}>
                                {l.admin_status || 'Pending'}
                            </span>
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CAMERA MODAL */}
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
    </div>
  );
}