import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from './authService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const navigate = useNavigate();

  const { name, email, phone, dateOfBirth, password, confirmPassword } = formData;

  // Regex patterns
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[6-9][0-9]{9}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Calculate password strength
  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    const feedback = [];

    if (!pwd) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return;
    }

    if (pwd.length >= 8) strength += 20;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(pwd)) strength += 20;
    else feedback.push('Add lowercase letter');

    if (/[A-Z]/.test(pwd)) strength += 20;
    else feedback.push('Add uppercase letter');

    if (/[0-9]/.test(pwd)) strength += 20;
    else feedback.push('Add number');

    if (/[@$!%*?&]/.test(pwd)) strength += 20;
    else feedback.push('Add special character (@$!%*?&)');

    setPasswordStrength(strength);
    setPasswordFeedback(feedback.join(' • '));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 20) return 'bg-red-500';
    if (passwordStrength < 40) return 'bg-orange-500';
    if (passwordStrength < 60) return 'bg-yellow-500';
    if (passwordStrength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 20) return 'Very Weak';
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 60) return 'Fair';
    if (passwordStrength < 80) return 'Good';
    return 'Strong';
  };

  // Validate individual field on blur
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (!nameRegex.test(value.trim())) {
          newErrors.name = 'Name must be 2-50 characters, letters and spaces only';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(value)) {
          newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'dateOfBirth': {
        if (!value) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else {
          const dob = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
          if (age < 5) {
            newErrors.dateOfBirth = 'You must be at least 5 years old';
          } else if (age > 120) {
            newErrors.dateOfBirth = 'Please enter a valid date of birth';
          } else if (dob > today) {
            newErrors.dateOfBirth = 'Date of birth cannot be in the future';
          } else {
            delete newErrors.dateOfBirth;
          }
        }
        break;
      }
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (!passwordRegex.test(value)) {
          newErrors.password = 'Must be 8+ chars with uppercase, lowercase, number & special character';
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!nameRegex.test(name.trim())) {
      newErrors.name = 'Name must be 2-50 characters, letters and spaces only';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 5) {
        newErrors.dateOfBirth = 'You must be at least 5 years old';
      } else if (age > 120) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      } else if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Must be 8+ chars with uppercase, lowercase, number & special character';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setError('Please fix the errors below');
      return;
    }

    setLoading(true);

    try {
      await register({ name: name.trim(), email, phone, dateOfBirth, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex flex-col bg-background-light">

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-xl overflow-hidden border border-slate-200 shadow-lg">
          {/* Left Section: Illustration */}
          <div className="hidden md:flex md:w-5/12 bg-slate-50 flex-col items-center justify-center p-12 relative overflow-hidden">
            <div className="z-10 text-center">
              <div className="mb-8 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <span className="material-symbols-outlined text-primary text-5xl">person_add</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Get Your Bus Pass</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Register now to enjoy seamless commuting with our digital bus pass system. Fast, secure, and convenient.
              </p>
            </div>
            <div className="mt-12 w-full h-48 bg-center bg-no-repeat bg-contain opacity-80" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB1S7raL9YiwlY92sKkbUTrE1zmkN0XxosQ6YN_y8antfm0oMhRqQSAJeTTbnoxFmgNuQtmO6tWJKglHnPjSi9j8yv8dpwZ7XhapiwMFdk-2XeFzKLEqyjc_E8R1y0yH_TdYMrX_Vo5slMnmlG642KHwN2RpsPrZfd1QIe3Zj6z1BkBlXl4cdysU7DyDh5eW1zZaD0yEdxjPVg1Al0wR2Z1nSaRNs_tVXgffstmU2u2tTGI3hiuZephjwzwKnQm5O25c27zBYdIBQ")' }}></div>
          </div>

          {/* Right Section: Form */}
          <div className="flex-1 flex flex-col p-8 lg:p-16">
            {/* Tabs */}
            <div className="mb-10">
              <div className="flex border-b border-slate-200 gap-8">
                <Link to="/login" className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-slate-400 pb-3 pt-2 hover:text-slate-600 transition-colors">
                  <p className="text-sm font-bold tracking-wide">Login</p>
                </Link>
                <button className="flex flex-col items-center justify-center border-b-[3px] border-primary text-slate-900 pb-3 pt-2 focus:outline-none">
                  <p className="text-sm font-bold tracking-wide">Register</p>
                </button>
              </div>
            </div>

            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Create Your Account</h1>
              <p className="text-slate-500 text-sm">Join our community and get your digital bus pass today.</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-xl mt-0.5">error</span>
                  <div>
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Input Fields */}
            <form onSubmit={handleSubmit} className="space-y-4 flex flex-col max-w-md">
              <div className="flex flex-col gap-1">
                <label className="text-slate-700 text-sm font-semibold">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="John Doe"
                    className={`w-full rounded-lg border bg-slate-50 text-slate-900 h-12 pl-11 pr-4 placeholder:text-slate-400 focus:ring-1 outline-none transition-all text-sm ${
                      errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-700 text-sm font-semibold">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="john@example.com"
                    className={`w-full rounded-lg border bg-slate-50 text-slate-900 h-12 pl-11 pr-4 placeholder:text-slate-400 focus:ring-1 outline-none transition-all text-sm ${
                      errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-700 text-sm font-semibold">Phone</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`w-full rounded-lg border bg-slate-50 text-slate-900 h-12 pl-11 pr-4 placeholder:text-slate-400 focus:ring-1 outline-none transition-all text-sm ${
                        errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-700 text-sm font-semibold">Date of Birth</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">calendar_month</span>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={dateOfBirth}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full rounded-lg border bg-slate-50 text-slate-900 h-12 pl-11 pr-4 placeholder:text-slate-400 focus:ring-1 outline-none transition-all text-sm ${
                        errors.dateOfBirth ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'
                      }`}
                    />
                  </div>
                  {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-700 text-sm font-semibold">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={`w-full rounded-lg border bg-slate-50 text-slate-900 h-12 pl-11 pr-12 placeholder:text-slate-400 focus:ring-1 outline-none transition-all text-sm ${
                      errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                {password && (
                  <div className="space-y-2 mt-1">
                    {/* Password Strength Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getPasswordStrengthColor()} transition-all`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-slate-600 min-w-fit">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    {passwordFeedback && (
                      <p className="text-xs text-slate-500 leading-relaxed">{passwordFeedback}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-700 text-sm font-semibold">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={`w-full rounded-lg border bg-slate-50 text-slate-900 h-12 pl-11 pr-12 placeholder:text-slate-400 focus:ring-1 outline-none transition-all text-sm ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : confirmPassword && password === confirmPassword
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                        : 'border-slate-200 focus:border-primary focus:ring-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {confirmPassword && (
                  <div className="flex items-center gap-2 mt-1">
                    {password === confirmPassword ? (
                      <>
                        <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                        <span className="text-xs text-green-600 font-medium">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-red-500 text-xl">cancel</span>
                        <span className="text-xs text-red-600 font-medium">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || (password && confirmPassword && password !== confirmPassword)}
                  className="w-full flex items-center justify-center rounded-lg h-12 px-5 bg-primary hover:bg-primary/90 disabled:bg-primary/60 text-white text-base font-bold leading-normal transition-colors shadow-md shadow-primary/20 gap-2 disabled:cursor-not-allowed"
                >
                  <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                  {!loading && <span className="material-symbols-outlined text-lg">check_circle</span>}
                </button>
              </div>

              {/* Already have account */}
              <div className="text-center pt-2">
                <p className="text-slate-600 text-sm">Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link></p>
              </div>
            </form>

            {/* Trust Footer */}
            <div className="mt-auto pt-8 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-center gap-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">verified_user</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Department of Transport</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">lock</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Secure SSL 256-bit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Register;
