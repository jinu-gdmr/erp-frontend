const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/";
// const API_BASE = import.meta.env.VITE_API_URL || "https://erp-backend-6wd5.onrender.com/api";

// Reusable JSON request helper
async function request(path, method = "GET", body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export default {
  // Authentication
  login: (payload) => request("/login", "POST", payload),
  registerAdmin: (payload, token) =>
    request("/register-admin", "POST", payload, token),

  registerManager: (payload, token) =>
    request("/register-manager", "POST", payload, token),

  // Employees
  addEmployee: (payload, token) =>
    request("/admin/employees", "POST", payload, token),
  listEmployees: (token) => request("/admin/employees", "GET", null, token),
  deleteEmployee: (id, token) =>
    request(`/admin/employees/${id}`, "DELETE", null, token),
  editEmployee: (id, payload, token) =>
    request(`/admin/employees/${id}`, "PUT", payload, token),

  // Attendance
  checkin: (token) => request("/attendance/checkin", "POST", null, token),
  checkout: (token) => request("/attendance/checkout", "POST", null, token),
  myAttendance: (token) => request("/my/attendance", "GET", null, token),
  adminAttendance: (token) => request("/admin/attendance", "GET", null, token),
  employeeAttendance: (id, token) =>
    request(`/admin/attendance/${id}`, "GET", null, token),

  // Attendance with Photo
  checkinWithPhoto: async (token, imageData) => {
    const res = await fetch(`${API_BASE}/attendance/checkin-photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageData }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  checkoutWithPhoto: async (token, imageData) => {
    const res = await fetch(`${API_BASE}/attendance/checkout-photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageData }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // Leaves
  applyLeave: (payload, token) => request("/leaves", "POST", payload, token),
  adminLeaves: (token) => request("/admin/leaves", "GET", null, token),
  updateLeave: (id, payload, token) =>
    request(`/admin/leaves/${id}`, "PUT", payload, token),
  myLeaves: (token) => request("/my/leaves", "GET", null, token),

  // Leave with file
  applyLeaveWithFile: async (payload, file, token) => {
    const formData = new FormData();
    formData.append("date", payload.date);
    formData.append("type", payload.type);
    formData.append("reason", payload.reason);
    if (file) formData.append("attachment", file);

    const res = await fetch(`${API_BASE}/leaves`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

    // Attendance Summary (Admin Dashboard)
  getAttendanceSummary: async (month, token) => {
    const res = await fetch(
      `${API_BASE}/admin/attendance-summary?month=${month}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },


  getManagers: async (token) => {
    const res = await fetch(`${API_BASE}/admin/managers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  

  deleteManager: async (id, token) => {
    const res = await fetch(`${API_BASE}/admin/managers/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
};

