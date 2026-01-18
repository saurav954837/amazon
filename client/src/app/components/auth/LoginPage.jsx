import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/authHook.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faAmazon } from '@fortawesome/free-brands-svg-icons';
import styles from '../../styles/Auth.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [csrfToken] = useState(() => Math.random().toString(36).substr(2))
  
  const formRef = useRef(null)
  const emailRef = useRef(null)
  const { login, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    emailRef.current?.focus()
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  useEffect(() => {
    if (error) setFormError(error)
  }, [error])

  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '')
  }

  const validateForm = () => {
    const errors = {}
    
    const sanitizedEmail = sanitizeInput(email)
    if (!sanitizedEmail) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      errors.email = 'Valid email is required'
    } else if (sanitizedEmail.length > 254) {
      errors.email = 'Email is too long'
    }
    
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (password.length > 128) {
      errors.password = 'Password is too long'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    clearError()
    setFormError('')
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const sanitizedEmail = sanitizeInput(email)
      const result = await login(sanitizedEmail, password, csrfToken)
      
      if (result?.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', sanitizedEmail)
        } else {
          localStorage.removeItem('rememberedEmail')
        }
        sessionStorage.removeItem('rememberedEmail')
        
        navigate(from, { replace: true })
      } else {
        setFormError(result?.message || 'Login failed')
      }
    } catch (err) {
      setFormError('Network error. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit(e)
    }
  }

  return (
    <div className="bg-light">
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <Link to="/" className={styles.logo} aria-label="Amazon Home">
            <FontAwesomeIcon icon={faAmazon} className={styles.logoIcon} aria-hidden="true" />
          </Link>
          <h1 className="text-dark">Sign in</h1>
        </div>

        <div className={styles.loginCard}>
          {(formError || error) && (
            <div className={styles.errorAlert} role="alert" aria-live="assertive">
              <div className={styles.errorIcon} aria-hidden="true">!</div>
              <p>{formError || error}</p>
            </div>
          )}

          <form 
            ref={formRef}
            onSubmit={handleSubmit} 
            className={styles.loginForm}
            noValidate
            aria-label="Sign in form"
          >
            <input type="hidden" name="csrf_token" value={csrfToken} />
            
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email or mobile phone number
              </label>
              <div className={styles.inputWrapper}>
                <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} aria-hidden="true" />
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: '' }))
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={!!validationErrors.email}
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                  maxLength="254"
                />
              </div>
              {validationErrors.email && (
                <span id="email-error" className={styles.errorText} role="alert">{validationErrors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.passwordHeader}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <Link to="/forgot-password" className={styles.forgotPassword} tabIndex={isSubmitting ? -1 : 0}>
                  Forgot password?
                </Link>
              </div>
              <div className={styles.inputWrapper}>
                <FontAwesomeIcon icon={faLock} className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (validationErrors.password) {
                      setValidationErrors(prev => ({ ...prev, password: '' }))
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={!!validationErrors.password}
                  aria-describedby={validationErrors.password ? 'password-error' : undefined}
                  maxLength="128"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  disabled={isSubmitting}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-controls="password"
                  tabIndex={isSubmitting ? -1 : 0}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} aria-hidden="true" />
                </button>
              </div>
              {validationErrors.password && (
                <span id="password-error" className={styles.errorText} role="alert">{validationErrors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className={styles.submittingText}>
                  <span className={styles.spinner} aria-hidden="true"></span>
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
              tabIndex={isSubmitting ? -1 : 0}
            >
              Create your Amazon account
            </Link>
          </form>

          <div className={styles.terms}>
            <p className={styles.termsText}>
              By continuing, you agree to Amazon's{' '}
              <Link className={styles.termsLink} tabIndex={isSubmitting ? -1 : 0}>
                Conditions of Use
              </Link>{' '}
              and{' '}
              <Link className={styles.termsLink} tabIndex={isSubmitting ? -1 : 0}>
                Privacy Notice
              </Link>
              .
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.copyright}>
            © 1996-{new Date().getFullYear()}, Amazon.com, Inc. or its affiliates
          </p>
        </div>
      </div>
    </div>
  )
};

export default LoginPage;