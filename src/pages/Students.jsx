import React, { useMemo, useState } from 'react'
import Tabs from '../components/Tabs'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState.jsx'
import { FloatingInput, FloatingSelect } from '../components/FloatingField.jsx'
import { useApp } from '../context/appContext'

export default function Students() {
  const {
    students,
    addStudent,
    deleteStudent,
    assignStaff,
    studentsLoading,
    studentsError,
    refreshStudents,
    courses,
    facultyList,
    frontOfficeList,
    labInstructorList,
    canAdmin,
    studentUsers,
    studentUsersLoading,
    studentUsersError,
    refreshStudentUsers,
    addStudentUser,
    deleteStudentUser,
    notifySuccess,
    notifyError,
  } = useApp()

  const [tab, setTab] = useState('add')
  const [search, setSearch] = useState('')
  const [filterCourse, setFilterCourse] = useState('All')

  const [name, setName] = useState('')
  const [course, setCourse] = useState(courses[0]?.name || 'MSCIT')
  const [faculty, setFaculty] = useState(facultyList[0] || 'Teacher A')
  const [frontOffice, setFrontOffice] = useState(frontOfficeList[0] || 'Staff A')
  const [labInstructor, setLabInstructor] = useState(labInstructorList[0] || 'Staff B')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('123')
  const [saving, setSaving] = useState(false)
  const [savingUser, setSavingUser] = useState(false)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [addErrors, setAddErrors] = useState({})
  const [loginErrors, setLoginErrors] = useState({})

  const [assignOpen, setAssignOpen] = useState(false)
  const [assignId, setAssignId] = useState(null)
  const [assignFaculty, setAssignFaculty] = useState(facultyList[0] || '')
  const [assignFrontOffice, setAssignFrontOffice] = useState(frontOfficeList[0] || '')
  const [assignLabInstructor, setAssignLabInstructor] = useState(labInstructorList[0] || '')

  const registrations = useMemo(() => students, [students])

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students
      .filter((s) => (filterCourse === 'All' ? true : s.course === filterCourse))
      .filter((s) => (q ? s.name.toLowerCase().includes(q) : true))
  }, [students, search, filterCourse])

  function validateAdd() {
    const err = {}
    if (!name.trim()) err.name = 'Student name is required.'
    if (username.trim()) {
      if (!password.trim()) err.password = 'Password is required when username is set.'
      else if (password.trim().length < 3) err.password = 'Password must be at least 3 characters.'
    }
    setAddErrors(err)
    return Object.keys(err).length === 0
  }

  async function submit() {
    if (!canAdmin) {
      notifyError('Only admin can add students')
      return
    }
    if (!validateAdd()) {
      notifyError('Please fix the highlighted fields.')
      return
    }

    setSaving(true)
    try {
      const res = await addStudent({
        name: name.trim(),
        course,
        faculty,
        frontOffice,
        labInstructor,
        username: username.trim() || undefined,
        password: username.trim() ? password : undefined,
      })
      if (!res.ok) {
        notifyError(res.message || 'Failed to add student')
        return
      }
      setName('')
      setUsername('')
      setAddErrors({})
      setAddModalOpen(false)
      notifySuccess('Student added')
    } finally {
      setSaving(false)
    }
  }

  function validateLoginForm() {
    const err = {}
    const u = username.trim()
    const p = password.trim()
    if (!u) err.username = 'Username is required.'
    if (!p) err.password = 'Password is required.'
    else if (p.length < 3) err.password = 'Use at least 3 characters.'
    setLoginErrors(err)
    return Object.keys(err).length === 0
  }

  async function submitStudentLogin() {
    if (!canAdmin) return
    if (!validateLoginForm()) {
      notifyError('Please fix the highlighted fields.')
      return
    }
    setSavingUser(true)
    try {
      const res = await addStudentUser({
        studentName: name.trim(),
        username: username.trim(),
        password: password.trim(),
        course,
      })
      if (!res.ok) return notifyError(res.message || 'Failed to create login')
      notifySuccess('Student login created')
      setUsername('')
      setPassword('123')
      setLoginErrors({})
      setLoginModalOpen(false)
    } finally {
      setSavingUser(false)
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <Tabs
          tabs={[
            { id: 'add', label: 'Add Student' },
            { id: 'view', label: 'View Students' },
            { id: 'regs', label: 'Registrations' },
            { id: 'logins', label: 'Manage Student Logins' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'add' ? (
        <div className="card">
          <h2 className="cardTitle">Add Student</h2>
          <p className="cardBody">
            Create a student record and optionally provision portal credentials. All fields are validated before saving.
          </p>
          <div className="btnRow">
            <button
              className="btn btnSuccess"
              type="button"
              disabled={!canAdmin}
              onClick={() => {
                setAddErrors({})
                setAddModalOpen(true)
              }}
            >
              Open add-student form
            </button>
            <button className="btn btnNeutral" type="button" onClick={refreshStudents} disabled={studentsLoading}>
              Refresh list
            </button>
          </div>
          {studentsError ? (
            <div className="card" style={{ borderColor: 'rgba(220,53,69,0.25)', marginTop: 12 }}>
              <p style={{ margin: 0, color: '#b02a37', fontWeight: 700 }}>{studentsError}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <Modal
        open={addModalOpen}
        title="Add student"
        onClose={() => {
          setAddModalOpen(false)
          setAddErrors({})
        }}
      >
        <div className="form">
          <FloatingInput
            id="st-name"
            label="Full name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setAddErrors((p) => {
                const n = { ...p }
                delete n.name
                return n
              })
            }}
            error={addErrors.name}
            autoComplete="name"
          />
          <FloatingInput
            id="st-user"
            label="Portal username (optional)"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setAddErrors((p) => {
                const n = { ...p }
                delete n.username
                delete n.password
                return n
              })
            }}
            error={addErrors.username}
            autoComplete="off"
          />
          <FloatingInput
            id="st-pass"
            label="Portal password (optional)"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setAddErrors((p) => {
                const n = { ...p }
                delete n.password
                return n
              })
            }}
            error={addErrors.password}
            autoComplete="new-password"
          />
          <FloatingSelect
            id="st-course"
            label="Course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </FloatingSelect>
          <FloatingSelect
            id="st-faculty"
            label="Faculty"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
          >
            {facultyList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </FloatingSelect>
          <FloatingSelect
            id="st-front"
            label="Front office"
            value={frontOffice}
            onChange={(e) => setFrontOffice(e.target.value)}
          >
            {frontOfficeList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </FloatingSelect>
          <FloatingSelect
            id="st-lab"
            label="Lab instructor"
            value={labInstructor}
            onChange={(e) => setLabInstructor(e.target.value)}
          >
            {labInstructorList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </FloatingSelect>
          <div className="btnRow">
            <button className="btn btnSuccess" type="button" onClick={submit} disabled={saving || !canAdmin}>
              {saving ? 'Saving…' : 'Save student'}
            </button>
            <button
              className="btn btnNeutral"
              type="button"
              onClick={() => {
                setAddModalOpen(false)
                setAddErrors({})
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {tab === 'view' ? (
        <div className="card">
          <h2 className="cardTitle">All Students</h2>
          {studentsLoading ? <p className="cardBody">Loading…</p> : null}
          {studentsError ? (
            <div className="card" style={{ borderColor: 'rgba(220,53,69,0.25)', marginBottom: 10 }}>
              <p style={{ margin: 0, color: '#b02a37', fontWeight: 700 }}>{studentsError}</p>
            </div>
          ) : null}
          <div className="btnRow" style={{ marginBottom: 10 }}>
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name"
              style={{ maxWidth: 260 }}
            />
            <select
              className="input"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              style={{ maxWidth: 220 }}
            >
              <option value="All">All Courses</option>
              {courses.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Faculty</th>
                <th>Front Office</th>
                <th>Lab Instructor</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.course}</td>
                  <td>{s.faculty || '—'}</td>
                  <td>{s.frontOffice || '—'}</td>
                  <td>{s.labInstructor || '—'}</td>
                  <td>
                    <button
                      className="btn"
                      type="button"
                      disabled={!canAdmin}
                      onClick={() => {
                        setAssignId(s.id)
                        setAssignFaculty(s.faculty || facultyList[0] || '')
                        setAssignFrontOffice(s.frontOffice || frontOfficeList[0] || '')
                        setAssignLabInstructor(s.labInstructor || labInstructorList[0] || '')
                        setAssignOpen(true)
                      }}
                    >
                      Assign
                    </button>{' '}
                    <button
                      className="btn btnDanger"
                      type="button"
                      disabled={!canAdmin}
                      onClick={async () => {
                        if (!canAdmin) return
                        const res = await deleteStudent(s.id)
                        if (!res.ok) notifyError(res.message || 'Delete failed')
                        else notifySuccess('Student deleted')
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No students found"
                      hint={search || filterCourse !== 'All' ? 'Try another search or course filter.' : 'Add a student to see them listed here.'}
                      icon="🎓"
                    />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal open={assignOpen} title="Assign Faculty / Staff" onClose={() => setAssignOpen(false)}>
        <div className="form">
          <FloatingSelect
            id="as-faculty"
            label="Faculty"
            value={assignFaculty}
            onChange={(e) => setAssignFaculty(e.target.value)}
          >
            {facultyList.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </FloatingSelect>
          <FloatingSelect
            id="as-front"
            label="Front office"
            value={assignFrontOffice}
            onChange={(e) => setAssignFrontOffice(e.target.value)}
          >
            {frontOfficeList.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </FloatingSelect>
          <FloatingSelect
            id="as-lab"
            label="Lab instructor"
            value={assignLabInstructor}
            onChange={(e) => setAssignLabInstructor(e.target.value)}
          >
            {labInstructorList.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </FloatingSelect>

          <div className="btnRow">
            <button
              className="btn btnSuccess"
              type="button"
              onClick={async () => {
                if (!assignId) return
                const res = await assignStaff({
                  id: assignId,
                  faculty: assignFaculty,
                  frontOffice: assignFrontOffice,
                  labInstructor: assignLabInstructor,
                })
                if (!res.ok) {
                  notifyError(res.message || 'Assign failed')
                  return
                }
                notifySuccess('Staff assigned')
                setAssignOpen(false)
              }}
            >
              Save
            </button>
            <button className="btn btnNeutral" type="button" onClick={() => setAssignOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {tab === 'regs' ? (
        <div className="card">
          <h2 className="cardTitle">Registrations</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Faculty</th>
                <th>Brought By</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r, idx) => (
                <tr key={`${r.name}-${idx}`}>
                  <td>{r.name}</td>
                  <td>{r.course}</td>
                  <td>{r.faculty || '—'}</td>
                  <td>{r.frontOffice || '—'}</td>
                </tr>
              ))}
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState title="No registrations yet" hint="Student records will appear here." icon="📋" />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'logins' ? (
        <div className="card">
          <h2 className="cardTitle">Manage Student Logins</h2>
          <p className="cardBody">Create portal accounts for students and revoke access when needed.</p>
          <div className="btnRow" style={{ marginBottom: 12 }}>
            <button
              className="btn btnSuccess"
              type="button"
              disabled={!canAdmin}
              onClick={() => {
                setLoginErrors({})
                setLoginModalOpen(true)
              }}
            >
              Create student login
            </button>
            <button className="btn btnNeutral" type="button" onClick={refreshStudentUsers} disabled={studentUsersLoading}>
              Refresh
            </button>
          </div>

          {studentUsersError ? (
            <p className="cardBody" style={{ color: '#b02a37', fontWeight: 700 }}>
              {studentUsersError}
            </p>
          ) : null}

          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {studentUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      className="btn btnDanger"
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(`Delete login ${u.username}?`)) return
                        const res = await deleteStudentUser(u.id)
                        if (!res.ok) notifyError(res.message || 'Delete failed')
                        else notifySuccess('Student login deleted')
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!studentUsersLoading && studentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState title="No student logins" hint="Create a login from the button above." icon="🔐" />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal
        open={loginModalOpen}
        title="Create student login"
        onClose={() => {
          setLoginModalOpen(false)
          setLoginErrors({})
        }}
      >
        <div className="form">
          <FloatingInput
            id="lg-name"
            label="Display name (optional)"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setLoginErrors((p) => {
                const n = { ...p }
                delete n.name
                return n
              })
            }}
            error={loginErrors.name}
          />
          <FloatingInput
            id="lg-user"
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setLoginErrors((p) => {
                const n = { ...p }
                delete n.username
                return n
              })
            }}
            error={loginErrors.username}
            autoComplete="off"
          />
          <FloatingInput
            id="lg-pass"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setLoginErrors((p) => {
                const n = { ...p }
                delete n.password
                return n
              })
            }}
            error={loginErrors.password}
            autoComplete="new-password"
          />
          <FloatingSelect
            id="lg-course"
            label="Course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id ?? c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </FloatingSelect>
          <div className="btnRow">
            <button className="btn btnSuccess" type="button" disabled={savingUser} onClick={submitStudentLogin}>
              {savingUser ? 'Saving…' : 'Create login'}
            </button>
            <button
              className="btn btnNeutral"
              type="button"
              onClick={() => {
                setLoginModalOpen(false)
                setLoginErrors({})
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
