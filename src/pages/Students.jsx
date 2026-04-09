import React, { useMemo, useState } from 'react'
import Tabs from '../components/Tabs'
import { useApp } from '../context/appContext'

export default function Students() {
  const {
    students,
    addStudent,
    deleteStudent,
    courses,
    facultyList,
    frontOfficeList,
    labInstructorList,
    addUserStudent,
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

  const registrations = useMemo(() => students, [students])

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students
      .filter((s) => (filterCourse === 'All' ? true : s.course === filterCourse))
      .filter((s) => (q ? s.name.toLowerCase().includes(q) : true))
  }, [students, search, filterCourse])

  function submit() {
    if (!name.trim()) {
      alert('Enter student name')
      return
    }
    if (!username.trim()) {
      alert('Enter login username')
      return
    }
    const ok = addUserStudent({ username: username.trim(), password })
    if (!ok) {
      alert('Username exists or invalid')
      return
    }
    addStudent({
      name: name.trim(),
      course,
      faculty,
      frontOffice,
      labInstructor,
    })
    setName('')
    setUsername('')
    alert('Student added')
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <Tabs
          tabs={[
            { id: 'add', label: 'Add Student' },
            { id: 'view', label: 'View Students' },
            { id: 'regs', label: 'Registrations' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'add' ? (
        <div className="card">
          <h2 className="cardTitle">Add Student</h2>
          <div className="form">
            <div className="field">
              <label className="label">Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Login Username</label>
              <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. student3" />
            </div>
            <div className="field">
              <label className="label">Login Password</label>
              <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Course</label>
              <select className="input" value={course} onChange={(e) => setCourse(e.target.value)}>
                {courses.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Faculty</label>
              <select className="input" value={faculty} onChange={(e) => setFaculty(e.target.value)}>
                {facultyList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Front Office</label>
              <select className="input" value={frontOffice} onChange={(e) => setFrontOffice(e.target.value)}>
                {frontOfficeList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Lab Instructor</label>
              <select className="input" value={labInstructor} onChange={(e) => setLabInstructor(e.target.value)}>
                {labInstructorList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="btnRow">
              <button className="btn btnSuccess" type="button" onClick={submit}>
                Add
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'view' ? (
        <div className="card">
          <h2 className="cardTitle">All Students</h2>
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
              {filteredStudents.map((s, idx) => (
                <tr key={`${s.name}-${idx}`}>
                  <td>{s.name}</td>
                  <td>{s.course}</td>
                  <td>{s.faculty || '—'}</td>
                  <td>{s.frontOffice || '—'}</td>
                  <td>{s.labInstructor || '—'}</td>
                  <td>
                    <button className="btn btnDanger" type="button" onClick={() => deleteStudent(idx)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6}>No students</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

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
                  <td colSpan={4}>No registrations</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

