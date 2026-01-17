import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/authHook.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLock, faEye, faEyeSlash, faAmazon } from '@fortawesome/free-solid-svg-icons'
import styles from '../../styles/LoginPage.module.css'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { login, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/'

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  const validateForm = () => {
    const errors = {}
    
    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid'
    }
    
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const result = await login(email, password)
      
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email)
        } else {
          localStorage.removeItem('rememberedEmail')
        }
        
        navigate(from, { replace: true })
      }
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemoLogin = async (role = 'user') => {
    const demoCredentials = {
      user: { email: 'user@demo.com', password: 'demo123' },
      admin: { email: 'admin@demo.com', password: 'admin123' }
    }
    
    const creds = demoCredentials[role]
    setEmail(creds.email)
    setPassword(creds.password)
    
    const result = await login(creds.email, creds.password)
    
    if (result.success) {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <Link to="/" className={styles.logo}>
            <FontAwesomeIcon icon={faAmazon} className={styles.logoIcon} />
            <span className={styles.logoText}>amazon</span>
            <span className={styles.domain}>.eg</span>
          </Link>
          <h1 className={styles.title}>Sign in</h1>
        </div>

        <div className={styles.loginCard}>
          {error && (
            <div className={styles.errorAlert}>
              <div className={styles.errorIcon}>!</div>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email or mobile phone number
              </label>
              <div className={styles.inputWrapper}>
                <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => {
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: '' }))
                    }
                  }}
                  className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
              {validationErrors.email && (
                <span className={styles.errorText}>{validationErrors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => {
                    if (validationErrors.password) {
                      setValidationErrors(prev => ({ ...prev, password: '' }))
                    }
                  }}
                  className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  disabled={isSubmitting}
                  tabIndex={-1}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {validationErrors.password && (
                <span className={styles.errorText}>{validationErrors.password}</span>
              )}
            </div>

            <div className={styles.rememberMe}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                  disabled={isSubmitting}
                />
                <span className={styles.checkboxText}>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className={styles.submittingText}>
                  <span className={styles.spinner}></span>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>

            <div className={styles.divider}>
              <span className={styles.dividerText}>New to Amazon?</span>
            </div>

            <Link
              to="/register"
              className={styles.createAccountButton}
              state={{ from }}
            >
              Create your Amazon account
            </Link>
          </form>

          <div className={styles.demoSection}>
            <p className={styles.demoTitle}>Try demo accounts:</p>
            <div className={styles.demoButtons}>
              <button
                type="button"
                onClick={() => handleDemoLogin('user')}
                className={styles.demoButton}
                disabled={isSubmitting}
              >
                Demo User
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className={styles.demoButtonAdmin}
                disabled={isSubmitting}
              >
                Demo Admin
              </button>
            </div>
          </div>

          <div className={styles.helpLinks}>
            <Link to="/forgot-password" className={styles.helpLink}>
              Forgot your password?
            </Link>
            <span className={styles.dividerDot}>•</span>
            <Link to="/help" className={styles.helpLink}>
              Need help?
            </Link>
          </div>

          <div className={styles.terms}>
            <p className={styles.termsText}>
              By continuing, you agree to Amazon's{' '}
              <Link to="/conditions" className={styles.termsLink}>
                Conditions of Use
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className={styles.termsLink}>
                Privacy Notice
              </Link>
              .
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerLinks}>
            <Link to="/conditions" className={styles.footerLink}>
              Conditions of Use
            </Link>
            <Link to="/privacy" className={styles.footerLink}>
              Privacy Notice
            </Link>
            <Link to="/help" className={styles.footerLink}>
              Help
            </Link>
          </div>
          <p className={styles.copyright}>
            © 1996-2026, Amazon.com, Inc. or its affiliates
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage;