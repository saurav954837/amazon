import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/authHook.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faAmazon } from '@fortawesome/free-brands-svg-icons';
import styles from '../../styles/Auth.module.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [formError, setFormError] = useState('')
  const [csrfToken] = useState(() => Math.random().toString(36).substr(2))
  
  const firstNameRef = useRef(null)
  const { register, loading, error, clearError } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    firstNameRef.current?.focus()
  }, [])

  useEffect(() => {
    if (error) setFormError(error)
  }, [error])

  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '')
  }

  const validateForm = () => {
    const errors = {}
    
    const sanitizedFirstName = sanitizeInput(formData.firstName)
    if (!sanitizedFirstName) {
      errors.firstName = 'First name is required'
    } else if (sanitizedFirstName.length > 50) {
      errors.firstName = 'First name is too long'
    }
    
    const sanitizedLastName = sanitizeInput(formData.lastName)
    if (!sanitizedLastName) {
      errors.lastName = 'Last name is required'
    } else if (sanitizedLastName.length > 50) {
      errors.lastName = 'Last name is too long'
    }
    
    const sanitizedEmail = sanitizeInput(formData.email)
    if (!sanitizedEmail) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      errors.email = 'Valid email is required'
    } else if (sanitizedEmail.length > 254) {
      errors.email = 'Email is too long'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 10) {
      errors.password = 'Password must be at least 10 characters'
    } else if (formData.password.length > 128) {
      errors.password = 'Password is too long'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}/.test(formData.password)) {
      errors.password = 'Include uppercase, lowercase, number, and special character'
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    if (!agreeTerms) {
      errors.terms = 'You must agree to the terms and conditions'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    clearError()
    setFormError('')
    
    if (!validateForm()) return
    
    const userData = {
      firstName: sanitizeInput(formData.firstName),
      lastName: sanitizeInput(formData.lastName),
      email: sanitizeInput(formData.email),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    }
    
    const result = await register(userData, csrfToken)
    
    if (result?.success) {
      localStorage.removeItem('rememberedEmail')
      sessionStorage.removeItem('rememberedEmail')
      navigate('/', { replace: true })
    } else {
      setFormError(result?.message || 'Registration failed')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e)
    }
  }

  return (
    <div className="bg-light">
      <div className={styles.registerContainer}>
        <div className={styles.registerHeader}>
          <Link to="/" className={styles.logo} aria-label="Amazon Home">
            <FontAwesomeIcon icon={faAmazon} className={styles.logoIcon} aria-hidden="true" />
          </Link>
          <h1 className="text-dark">Create account</h1>
        </div>

        <div className={styles.registerCard}>
          {formError && (
            <div className={styles.errorAlert} role="alert" aria-live="assertive">
              <div className={styles.errorIcon} aria-hidden="true">!</div>
              <p>{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.registerForm} noValidate aria-label="Create account form">
            <input type="hidden" name="csrf_token" value={csrfToken} />
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.label}>
                  First name
                </label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faUser} className={styles.inputIcon} aria-hidden="true" />
                  <input
                    ref={firstNameRef}
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className={`${styles.input} ${validationErrors.firstName ? styles.inputError : ''}`}
                    placeholder="Enter your first name"
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!!validationErrors.firstName}
                    aria-describedby={validationErrors.firstName ? 'firstname-error' : undefined}
                    maxLength="50"
                  />
                </div>
                {validationErrors.firstName && (
                  <span id="firstname-error" className={styles.errorText} role="alert">{validationErrors.firstName}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.label}>
                  Last name
                </label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faUser} className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className={`${styles.input} ${validationErrors.lastName ? styles.inputError : ''}`}
                    placeholder="Enter your last name"
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!!validationErrors.lastName}
                    aria-describedby={validationErrors.lastName ? 'lastname-error' : undefined}
                    maxLength="50"
                  />
                </div>
                {validationErrors.lastName && (
                  <span id="lastname-error" className={styles.errorText} role="alert">{validationErrors.lastName}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <div className={styles.inputWrapper}>
                <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                  placeholder="Enter your email"
                  disabled={loading}
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
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <FontAwesomeIcon icon={faLock} className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
                  placeholder="Minimum 10 characters"
                  disabled={loading}
                  aria-required="true"
                  aria-invalid={!!validationErrors.password}
                  aria-describedby={validationErrors.password ? 'password-error password-hint' : 'password-hint'}
                  maxLength="128"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-controls="password"
                  tabIndex={loading ? -1 : 0}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} aria-hidden="true" />
                </button>
              </div>
              {validationErrors.password && (
                <span id="password-error" className={styles.errorText} role="alert">{validationErrors.password}</span>
              )}
              <div id="password-hint" className={styles.passwordHint}>
                Password must be at least 10 characters with uppercase, lowercase, number, and special character.
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Re-enter password
              </label>
              <div className={styles.inputWrapper}>
                <FontAwesomeIcon icon={faLock} className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className={`${styles.input} ${validationErrors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Re-enter your password"
                  disabled={loading}
                  aria-required="true"
                  aria-invalid={!!validationErrors.confirmPassword}
                  aria-describedby={validationErrors.confirmPassword ? 'confirmpassword-error' : undefined}
                  maxLength="128"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.passwordToggle}
                  disabled={loading}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-controls="confirmPassword"
                  tabIndex={loading ? -1 : 0}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} aria-hidden="true" />
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <span id="confirmpassword-error" className={styles.errorText} role="alert">{validationErrors.confirmPassword}</span>
              )}
            </div>

            <div className={styles.termsAgreement}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked)
                    if (validationErrors.terms) {
                      setValidationErrors(prev => ({ ...prev, terms: '' }))
                    }
                  }}
                  className={styles.checkbox}
                  disabled={loading}
                  aria-required="true"
                  aria-invalid={!!validationErrors.terms}
                  aria-describedby={validationErrors.terms ? 'terms-error' : undefined}
                />
                <span className="text-light">
                  I agree to Amazon's{' '}
                  <Link className={styles.termsLink} tabIndex={loading ? -1 : 0}>
                    Conditions of Use
                  </Link>{' '}
                  and{' '}
                  <Link className={styles.termsLink} tabIndex={loading ? -1 : 0}>
                    Privacy Notice
                  </Link>
                  .
                </span>
              </label>
              {validationErrors.terms && (
                <span id="terms-error" className={styles.errorText} role="alert">{validationErrors.terms}</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <span className={styles.submittingText}>
                  <span className={styles.spinner} aria-hidden="true"></span>
                  Creating account...
                </span>
              ) : (
                'Create your Amazon account'
              )}
            </button>

            <div className={styles.divider}>
              <span>Already have an account?</span>
            </div>

            <Link
              to="/login"
              className={styles.loginButton}
              tabIndex={loading ? -1 : 0}
            >
              Sign in to your account
            </Link>
          </form>

          <div className={styles.footer}>
            <p className={styles.copyright}>
              © 1996-{new Date().getFullYear()}, Amazon.com, Inc. or its affiliates
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage;