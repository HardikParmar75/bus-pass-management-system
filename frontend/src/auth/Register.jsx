import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from './authService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword, role } = formData;

  // Regex patterns
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;

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
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (!passwordRegex.test(value)) {
          newErrors.password = 'Must be 6+ chars with uppercase, lowercase & number';
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Must be 6+ chars with uppercase, lowercase & number';
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
      await register({ name: name.trim(), email, password, role });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[480px]">
        {/* Logo/Crest Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-5xl">directions_bus</span>
          </div>
          <div className="text-center">
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-1">
              Bus Pass Management System
            </p>
            <div className="h-[1px] w-12 bg-primary/20 mx-auto"></div>
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-lg p-8 md:p-10 border border-gray-200 shadow-sm">
          <div className="mb-8 text-center">
            <h2 className="text-[#101318] tracking-tight text-2xl font-semibold leading-tight mb-2">
              Admin Registration
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#5c6b8a] text-sm font-normal">
              <span className="material-symbols-outlined text-sm">person_add</span>
              <span>Create New Admin Account</span>
            </div>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="flex flex-col gap-1">
              <label className="text-[#101318] text-sm font-semibold tracking-wide">
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter your full name"
                  className={`flex w-full rounded-lg text-[#101318] focus:outline-0 focus:ring-2 focus:ring-primary/20 border bg-white h-12 placeholder:text-[#a1abbd] p-[15px] text-sm font-normal transition-all ${
                    errors.name ? 'border-red-500 focus:border-red-500' : 'border-[#d4d9e2] focus:border-primary'
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label className="text-[#101318] text-sm font-semibold tracking-wide">
                Official Admin Email
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="e.g. admin@transport.gov"
                  className={`flex w-full rounded-lg text-[#101318] focus:outline-0 focus:ring-2 focus:ring-primary/20 border bg-white h-12 placeholder:text-[#a1abbd] p-[15px] text-sm font-normal transition-all ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-[#d4d9e2] focus:border-primary'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label className="text-[#101318] text-sm font-semibold tracking-wide">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="••••••••"
                  className={`flex w-full rounded-lg text-[#101318] focus:outline-0 focus:ring-2 focus:ring-primary/20 border bg-white h-12 placeholder:text-[#a1abbd] p-[15px] text-sm font-normal transition-all ${
                    errors.password ? 'border-red-500 focus:border-red-500' : 'border-[#d4d9e2] focus:border-primary'
                  }`}
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1">
              <label className="text-[#101318] text-sm font-semibold tracking-wide">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="••••••••"
                  className={`flex w-full rounded-lg text-[#101318] focus:outline-0 focus:ring-2 focus:ring-primary/20 border bg-white h-12 placeholder:text-[#a1abbd] p-[15px] text-sm font-normal transition-all ${
                    errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-[#d4d9e2] focus:border-primary'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Access Level Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[#101318] text-sm font-semibold tracking-wide">
                Access Level
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={role}
                  onChange={handleChange}
                  required
                  className="flex w-full appearance-none rounded-lg text-[#101318] focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#d4d9e2] bg-white focus:border-primary h-12 p-[10px] pr-10 text-sm font-normal transition-all"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="conductor">Conductor</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <span className="material-symbols-outlined text-lg">expand_more</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-[#0f1a30] text-white font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Creating Account...' : 'Create Admin Account'}</span>
                <span className="material-symbols-outlined text-lg">person_add</span>
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 flex justify-center gap-6">
            <Link
              to="/login"
              className="text-xs text-[#5c6b8a] hover:text-primary font-medium transition-colors"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-8 px-4 text-center">
          <p className="text-[10px] text-[#5c6b8a] leading-relaxed max-w-[320px] mx-auto uppercase tracking-widest">
            Unauthorized access is prohibited and subject to monitoring.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
