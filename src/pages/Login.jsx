import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/appContext'
import { api } from '../api/client'
import { FloatingInput, FloatingInputIconRow, FloatingSelect } from '../components/FloatingField.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login, verifyAdminOtp, instituteName, authLoading, pendingOtp, notifySuccess, notifyError } = useApp()
  const [role, setRole] = useState('student')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const isOtpStage = useMemo(() => Boolean(pendingOtp?.role === 'admin'), [pendingOtp])

  function clearField(key) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  async function loadCaptcha() {
    setCaptchaLoading(true)
    try {
      const res = await api.getCaptcha()
      setCaptchaQuestion(res?.question || '')
    } catch {
      setCaptchaQuestion('')
    } finally {
      setCaptchaLoading(false)
    }
  }

  useEffect(() => {
    if (!isOtpStage) loadCaptcha()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOtpStage])

  function validateLoginFields() {
    const next = {}
    const u = username.trim()
    const p = password.trim()
    if (!u) next.username = 'Username is required.'
    if (!p) next.password = 'Password is required.'
    else if (p.length < 3) next.password = 'Password must be at least 3 characters.'
    if (!captchaAnswer.trim()) next.captcha = 'Solve the captcha to continue.'
    setFieldErrors(next)
    if (Object.keys(next).length) {
      setError('Please fix the highlighted fields.')
      return false
    }
    return true
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!validateLoginFields()) return

    const u = username.trim()
    const p = password.trim()

    setLoading(true)
    try {
      const res = await login({ username: u, password: p, role, captchaAnswer: captchaAnswer.trim() })
      if (!res.ok) {
        setError('Invalid credentials')
        notifyError('Invalid credentials')
        setFieldErrors({
          username: 'Does not match our records.',
          password: 'Does not match our records.',
        })
        await loadCaptcha()
        setCaptchaAnswer('')
        return
      }
      if (res.otpRequired) {
        setSuccess('OTP sent for admin login.')
        notifySuccess('OTP generated for admin login')
        if (res.otp) alert(`Demo OTP: ${res.otp}`)
        return
      }
      setSuccess('Login successful.')
      notifySuccess('Login successful')
      navigate(res.user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard', {
        replace: true,
      })
    } catch (e2) {
      setError(e2?.message || 'Login failed')
      notifyError(e2?.message || 'Login failed')
      await loadCaptcha()
      setCaptchaAnswer('')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const o = otp.trim()
    if (!o) {
      setFieldErrors({ otp: 'Enter the 6-digit OTP.' })
      setError('Enter OTP.')
      return
    }
    if (o.length < 6) {
      setFieldErrors({ otp: 'OTP must be 6 digits.' })
      return
    }
    setFieldErrors({})
    setLoading(true)
    try {
      const res = await verifyAdminOtp({ otp: o })
      if (!res.ok) {
        setError(res.message || 'Invalid OTP')
        notifyError(res.message || 'Invalid OTP')
        setFieldErrors({ otp: res.message || 'Invalid OTP' })
        return
      }
      setSuccess('Admin login successful.')
      notifySuccess('Admin login successful')
      navigate('/admin-dashboard', { replace: true })
    } catch (e2) {
      setError(e2?.message || 'OTP verification failed')
      notifyError(e2?.message || 'OTP verification failed')
      setFieldErrors({ otp: e2?.message || 'Verification failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="loginPage">
      <div className="loginLeft">
        <div className="loginHeroArt" aria-hidden>
          <svg className="loginHeroSvg" viewBox="0 0 520 340" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
              </linearGradient>
            </defs>
            <rect x="40" y="48" width="200" height="140" rx="16" fill="url(#lg)" opacity="0.9" />
            <rect x="260" y="72" width="200" height="180" rx="18" fill="url(#lg)" opacity="0.65" />
            <rect x="72" y="200" width="160" height="100" rx="14" fill="url(#lg)" opacity="0.55" />
            <path
              d="M320 220h120v8H320zm0 24h88v8h-88zm0 24h104v8H320z"
              fill="rgba(255,255,255,0.85)"
            />
            <circle cx="120" cy="118" r="28" fill="rgba(255,255,255,0.25)" />
            <path
              d="M108 118h24v4h-24zm12-16v32"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <rect x="300" y="110" width="120" height="64" rx="10" fill="rgba(255,255,255,0.2)" />
            <path d="M316 138h88M316 154h64" stroke="rgba(255,255,255,0.85)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <p className="loginKicker">Learning Management System</p>
        <h1 className="loginBrand">{instituteName}</h1>
        <p className="loginTagline">Learn smarter. Teach with confidence.</p>
        <p className="loginSub">
          Secure sign-in with verification — built for institutes that want a Coursera / Classroom-grade experience.
        </p>
      </div>

      <div className="loginRight">
        <div className="loginCard glassLoginCard loginCardEnter">
          <h2 className="cardTitle">{isOtpStage ? 'Verify OTP' : 'Sign in'}</h2>
          <p className="cardBody">
            {isOtpStage
              ? 'Enter 6-digit OTP to continue as Admin.'
              : 'Use your username and password to continue.'}
          </p>

          {error ? <p className="loginError">{error}</p> : null}
          {success ? <p className="loginSuccess">{success}</p> : null}

          {!isOtpStage ? (
            <form className="form" onSubmit={handleSubmit} noValidate>
              <FloatingSelect
                id="role"
                label="Role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value)
                  clearField('role')
                }}
                error={fieldErrors.role}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </FloatingSelect>

              <FloatingInputIconRow
                id="username"
                label="Username"
                icon="👤"
                error={fieldErrors.username}
                inputProps={{
                  value: username,
                  onChange: (e) => {
                    setUsername(e.target.value)
                    clearField('username')
                  },
                  autoComplete: 'username',
                }}
              />

              <div className="floatPasswordRow">
                <div className="floatPasswordRowInput">
                  <FloatingInputIconRow
                    id="password"
                    label="Password"
                    icon="🔒"
                    error={fieldErrors.password}
                    inputProps={{
                      type: showPassword ? 'text' : 'password',
                      value: password,
                      onChange: (e) => {
                        setPassword(e.target.value)
                        clearField('password')
                      },
                      autoComplete: 'current-password',
                    }}
                  />
                </div>
                <button
                  className="btn btnNeutral"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ whiteSpace: 'nowrap', alignSelf: 'start', marginTop: 2 }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="field">
                <span className="label" style={{ marginBottom: 6, display: 'block' }}>
                  Verification
                </span>
                <div className="btnRow" style={{ alignItems: 'center' }}>
                  <div className="captchaBadge">
                    {captchaLoading ? 'Loading…' : captchaQuestion || 'Tap refresh'}
                  </div>
                  <button className="btn btnNeutral" type="button" onClick={loadCaptcha} disabled={captchaLoading}>
                    ↻
                  </button>
                </div>
                <FloatingInput
                  id="captchaAnswer"
                  label="Captcha answer"
                  value={captchaAnswer}
                  onChange={(e) => {
                    setCaptchaAnswer(e.target.value)
                    clearField('captcha')
                  }}
                  inputMode="numeric"
                  autoComplete="off"
                  error={fieldErrors.captcha}
                />
              </div>

              <div className="btnRow">
                <button
                  className="btn btnGradient btnRipple"
                  type="submit"
                  disabled={authLoading || loading || captchaLoading}
                >
                  {authLoading || loading ? 'Signing in…' : 'Sign in'}
                </button>
              </div>
            </form>
          ) : (
            <form className="form" onSubmit={handleVerifyOtp} noValidate>
              <FloatingInput
                id="otp"
                label="One-time password"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  clearField('otp')
                }}
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                error={fieldErrors.otp}
              />
              <div className="btnRow">
                <button className="btn btnGradient btnRipple" type="submit" disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
