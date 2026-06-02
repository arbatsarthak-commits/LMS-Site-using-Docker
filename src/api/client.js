function defaultBaseUrl() {
  // Prefer explicit Vite env.
  const fromEnv = (import.meta?.env?.VITE_API_BASE_URL || '').trim()
  if (fromEnv) return fromEnv

  // Safe default for Docker + Vite proxy.
  return '/api'
}

const API_BASE_URL = defaultBaseUrl()

function buildUrl(path) {
  const base = API_BASE_URL.replace(/\/+$/, '')
  const p = String(path || '').replace(/^\/+/, '')
  return `${base}/${p}`
}

async function parseJsonSafe(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { ok: false, error: text }
  }
}

export async function apiRequest(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(buildUrl(path), {
    method,
    headers,
    credentials: 'include',
    body: body == null ? undefined : JSON.stringify(body),
  })

  const data = await parseJsonSafe(res)

  if (!res.ok) {
    const msg = data?.message || data?.error || `Request failed (${res.status})`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

export const api = {
  getCaptcha: () => apiRequest('captcha.php', { method: 'GET' }),
  login: ({ username, password, role, captchaAnswer }) =>
    apiRequest('login.php', { method: 'POST', body: { username, password, role, captchaAnswer } }),
  verifyOtp: ({ otp }) => apiRequest('verifyOtp.php', { method: 'POST', body: { otp } }),

  addUser: (token, payload) => apiRequest('addUser.php', { method: 'POST', token, body: payload }),
  getUsers: (token) => apiRequest('getUsers.php', { method: 'GET', token }),
  deleteUser: (token, id) => apiRequest('deleteUser.php', { method: 'POST', token, body: { id } }),

  getCourses: () => apiRequest('getCourses.php', { method: 'GET' }),
  addCourse: (token, { name, fee }) => apiRequest('addCourse.php', { method: 'POST', token, body: { name, fee } }),
  deleteCourse: (token, id) => apiRequest('deleteCourse.php', { method: 'POST', token, body: { id } }),

  getStaff: (token) => apiRequest('getStaff.php', { method: 'GET', token }),
  addStaff: (token, payload) => apiRequest('addStaff.php', { method: 'POST', token, body: payload }),
  deleteStaff: (token, id) => apiRequest('deleteStaff.php', { method: 'POST', token, body: { id } }),

  getNotices: (token) => apiRequest('getNotices.php', { method: 'GET', token }),
  addNotice: (token, payload) => apiRequest('addNotice.php', { method: 'POST', token, body: payload }),
  deleteNotice: (token, id) => apiRequest('deleteNotice.php', { method: 'POST', token, body: { id } }),

  myCourses: (token) => apiRequest('myCourses.php', { method: 'GET', token }),
  registerCourse: (token, courseId) =>
    apiRequest('registerCourse.php', { method: 'POST', token, body: { courseId } }),
  registerCourseWithName: (token, { courseId, studentName }) =>
    apiRequest('registerCourse.php', { method: 'POST', token, body: { courseId, studentName } }),
  payCourse: (token, { courseId, amount }) =>
    apiRequest('payCourse.php', { method: 'POST', token, body: { courseId, amount } }),

  getPayments: (token) => apiRequest('getPayments.php', { method: 'GET', token }),
  myPayments: (token) => apiRequest('myPayments.php', { method: 'GET', token }),

  getStudents: (token) => apiRequest('getStudents.php', { method: 'GET', token }),
  addStudent: (token, payload) => apiRequest('addStudent.php', { method: 'POST', token, body: payload }),
  deleteStudent: (token, id) => apiRequest('deleteStudent.php', { method: 'POST', token, body: { id } }),
  assignStaff: (token, payload) => apiRequest('assignStaff.php', { method: 'POST', token, body: payload }),

  personalSalary: (token, { baseSalary } = {}) => {
    const qs = baseSalary != null ? `?base=${encodeURIComponent(String(baseSalary))}` : ''
    return apiRequest(`personal_salary.php${qs}`, { method: 'GET', token })
  },

  /** Monthly / all-time incentive breakdown from student assignments (Docker: proxied to backend). */
  calculateSalary: (token, { month, role } = {}) => {
    const p = new URLSearchParams()
    if (month) p.set('month', month)
    if (role) p.set('role', role)
    const qs = p.toString()
    return apiRequest(`calculate_salary.php${qs ? `?${qs}` : ''}`, { method: 'GET', token })
  },

  /** Single payload for admin analytics (Docker: /api → backend). */
  dashboardOverview: (token) => apiRequest('dashboard_overview.php', { method: 'GET', token }),
  dashboardStats: (token) => apiRequest('dashboard_stats.php', { method: 'GET', token }),
  monthlyData: (token, { months } = {}) => {
    const qs = months != null ? `?months=${encodeURIComponent(String(months))}` : ''
    return apiRequest(`monthly_data.php${qs}`, { method: 'GET', token })
  },
  revenueData: (token) => apiRequest('revenue_data.php', { method: 'GET', token }),
}

