import React, { useMemo, useState } from 'react'
import Tabs from '../../components/Tabs'
import Modal from '../../components/Modal'
import { useApp } from '../../context/appContext'

export default function StudentsPage() {
  const {
    users,
    courses,
    faculty,
    frontOffice,
    labInstructors,
    addStudent,
    deleteStudent,
    admitStudent,
    courseRegistrations,
    updateRegistration,
  } = useApp()

  const [activeTab, setActiveTab] = useState('add')
  const [search, setSearch] = useState('')
  const [filterCourse, setFilterCourse] = useState('All')

  const [addOpen, setAddOpen] = useState(false)

  // Add student form
  const [studentName, setStudentName] = useState('')
  const [studentUsername, setStudentUsername] = useState('')
  const [studentPassword, setStudentPassword] = useState('123')
  const [studentCourse, setStudentCourse] = useState(courses[0]?.name || '')
  const [studentFaculty, setStudentFaculty] = useState(faculty[0] || '')
  const [studentFrontOffice, setStudentFrontOffice] = useState(frontOffice[0] || '')
  const [studentLab, setStudentLab] = useState(labInstructors[0] || '')

  const [assignOpen, setAssignOpen] = useState(false)
  const [assignId, setAssignId] = useState('')
  const [assignFaculty, setAssignFaculty] = useState(faculty[0] || '')
  const [assignFrontOffice, setAssignFrontOffice] = useState(frontOffice[0] || '')
  const [assignLab, setAssignLab] = useState(labInstructors[0] || '')

  const students = useMemo(() => users.filter((u) => u.role === 'student'), [users])

  const filteredRegistrations = useMemo(() => {
    const q = search.trim().toLowerCase()
    return courseRegistrations
      .filter((r) => (filterCourse === 'All' ? true : r.courseName === filterCourse))
      .filter((r) => (q ? r.studentName.toLowerCase().includes(q) : true))
  }, [courseRegistrations, filterCourse, search])

  function openAssign(reg) {
    setAssignId(reg.id)
    setAssignFaculty(reg.faculty || faculty[0] || '')
    setAssignFrontOffice(reg.frontOffice || frontOffice[0] || '')
    setAssignLab(reg.labInstructor || labInstructors[0] || '')
    setAssignOpen(true)
  }

  function saveAssign() {
    updateRegistration(assignId, {
      faculty: assignFaculty,
      frontOffice: assignFrontOffice,
      labInstructor: assignLab,
    })
    setAssignOpen(false)
  }

  function submitAddStudent() {
    const res = addStudent({ username: studentUsername, password: studentPassword })
    if (!res.ok) {
      alert(res.message)
      return
    }
    const adm = admitStudent({
      username: studentUsername,
      studentName,
      courseName: studentCourse,
      facultyName: studentFaculty,
      frontOfficeName: studentFrontOffice,
      labInstructorName: studentLab,
    })
    if (!adm.ok) {
      alert(adm.message)
      return
    }
    setAddOpen(false)
    setStudentName('')
    setStudentUsername('')
    setStudentPassword('123')
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="btnRow" style={{ justifyContent: 'space-between', width: '100%' }}>
          <Tabs
            tabs={[
              { id: 'add', label: '➕ Add Student' },
              { id: 'view', label: '📋 View Students' },
              { id: 'regs', label: '📊 Registrations' },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === 'add' ? (
            <button className="btn btnSuccess" type="button" onClick={() => setAddOpen(true)}>
              Add Student
            </button>
          ) : null}
        </div>
      </div>

      {activeTab === 'view' ? (
        <div className="card">
          <h2 className="cardTitle">Students</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.username}>
                  <td>{s.username}</td>
                  <td>
                    <button
                      className="btn btnDanger"
                      type="button"
                      onClick={() => {
                        deleteStudent(s.username)
                        alert(`Deleted: ${s.username}`)
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 ? (
                <tr>
                  <td colSpan={2}>No students</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      {activeTab === 'regs' ? (
        <div className="card">
          <div className="btnRow" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <h2 className="cardTitle" style={{ marginBottom: 4 }}>
                Course Registrations
              </h2>
              <p className="cardBody" style={{ marginBottom: 0 }}>
                Includes admin admissions + student self-registrations.
              </p>
            </div>
            <div className="btnRow">
              <input
                className="input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student by name"
                style={{ width: 220 }}
              />
              <select
                className="input"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                style={{ width: 220 }}
              >
                <option value="All">All Courses</option>
                {courses.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ height: 12 }} />
          <table className="table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Course</th>
                <th>Faculty</th>
                <th>Brought By</th>
                <th>Lab Instructor</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((r) => (
                <tr key={r.id}>
                  <td>{r.studentName}</td>
                  <td>{r.courseName}</td>
                  <td>{r.faculty || '—'}</td>
                  <td>{r.frontOffice || '—'}</td>
                  <td>{r.labInstructor || '—'}</td>
                  <td>{r.source}</td>
                  <td>
                    <button className="btn" type="button" onClick={() => openAssign(r)}>
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7}>No registrations</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      {activeTab === 'add' ? (
        <div className="card">
          <h2 className="cardTitle">Add Student</h2>
          <p className="cardBody" style={{ marginBottom: 0 }}>
            Use the “Add Student” button to open the modal form.
          </p>
        </div>
      ) : null}

      <Modal open={addOpen} title="Add Student (Admission)" onClose={() => setAddOpen(false)}>
        <div className="form">
          <div className="field">
            <label className="label">Student Name</label>
            <input className="input" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Username</label>
            <input className="input" value={studentUsername} onChange={(e) => setStudentUsername(e.target.value)} placeholder="e.g. student4" />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input className="input" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Course</label>
            <select className="input" value={studentCourse} onChange={(e) => setStudentCourse(e.target.value)}>
              {courses.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} (₹{c.fee})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label">Faculty</label>
            <select className="input" value={studentFaculty} onChange={(e) => setStudentFaculty(e.target.value)}>
              {faculty.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label">Brought By (Front Office)</label>
            <select className="input" value={studentFrontOffice} onChange={(e) => setStudentFrontOffice(e.target.value)}>
              {frontOffice.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label">Lab Instructor</label>
            <select className="input" value={studentLab} onChange={(e) => setStudentLab(e.target.value)}>
              {labInstructors.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="btnRow">
            <button className="btn btnSuccess" type="button" onClick={submitAddStudent}>
              Save Student
            </button>
            <button className="btn btnNeutral" type="button" onClick={() => setAddOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={assignOpen} title="Assign Faculty / Staff" onClose={() => setAssignOpen(false)}>
        <div className="form">
          <div className="field">
            <label className="label">Faculty</label>
            <select className="input" value={assignFaculty} onChange={(e) => setAssignFaculty(e.target.value)}>
              {faculty.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label">Front Office</label>
            <select className="input" value={assignFrontOffice} onChange={(e) => setAssignFrontOffice(e.target.value)}>
              {frontOffice.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label">Lab Instructor</label>
            <select className="input" value={assignLab} onChange={(e) => setAssignLab(e.target.value)}>
              {labInstructors.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="btnRow">
            <button className="btn btnSuccess" type="button" onClick={saveAssign}>
              Save
            </button>
            <button className="btn btnNeutral" type="button" onClick={() => setAssignOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

