import React, { useEffect, useState, useRef } from "react";

export default function EmployeeDashboard({ token, api }) {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("full");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Camera handling
  const [cameraOpen, setCameraOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // "checkin" or "checkout"
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load attendance and leaves
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

  // -------------- CAMERA SECTION --------------
  async function openCamera(type) {
    setActionType(type);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied or unavailable.");
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
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

  // -------------- LEAVE APPLY --------------
  async function applyLeave(e) {
    e.preventDefault();
    try {
      await api.applyLeaveWithFile({ date, type, reason }, file, token);
      setDate("");
      setReason("");
      setFile(null);
      await load();
      alert("Leave applied successfully!");
    } catch (err) {
      alert("Error applying leave: " + (err.message || ""));
    }
  }

  return (
    <div>
      {/*  Attendance Section */}
      <div className="card">
        <h3 style={{ color: "#b91c1c" }}>Attendance</h3>

        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <button className="btn" onClick={() => openCamera("checkin")}>
            Check-In 📸
          </button>
          <button className="btn ghost" onClick={() => openCamera("checkout")}>
            Check-Out 📸
          </button>
        </div>

        {/* Camera Modal */}
        {cameraOpen && (
          <div className="camera-modal">
            <div className="camera-box">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: "100%", borderRadius: "8px" }}
              ></video>
              <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
              <div style={{ marginTop: 10, textAlign: "center" }}>
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

        {loading ? (
          <div>Loading attendance...</div>
        ) : (
          <table className="table" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Date / Time</th>
                <th>Photo</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="3">No attendance records yet.</td>
                </tr>
              ) : (
                attendance.map((a) => (
                  <tr key={a._id}>
                    <td
                      style={{
                        color: a.type === "checkin" ? "green" : "#b91c1c",
                        fontWeight: 600,
                      }}
                    >
                      {a.type}
                    </td>
                    <td>{new Date(a.time).toLocaleString()}</td>
                    <td>
                      {a.photo_url ? (
                        <a
                          href={`http://localhost:5000${a.photo_url}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Photo
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/*  Leave Apply Section */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ color: "#b91c1c" }}>Apply Leave</h3>
        <form onSubmit={applyLeave}>
          <label>Date</label>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label>Type</label>
          <select
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="full">Full-day</option>
            <option value="half">Half-day</option>
          </select>

          <label>Reason</label>
          <textarea
            className="input"
            value={reason}
            onChange={(e) => setReason(e.target.value)} required
          />

          <label>Attachment (optional)</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            className="input"
          />

          <div style={{ marginTop: 10 }}>
            <button className="btn" type="submit">
              Apply Leave
            </button>
          </div>
        </form>
      </div>

      {/*  Leave History Section */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ color: "#b91c1c" }}>My Leaves</h3>
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
              <tr>
                <td colSpan="4">No leaves applied yet.</td>
              </tr>
            ) : (
              leaves.map((l) => (
                <tr key={l._id}>
                  <td>{l.date}</td>
                  <td>{l.type}</td>
                  <td>{l.status}</td>
                  <td>
                    {l.attachment_url ? (
                      <a
                        href={`http://localhost:5000${l.attachment_url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
