import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from './authService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const navigate = useNavigate();

  const { name, email, phone, age, password, confirmPassword } = formData;

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
    else if (pwd.length >= 6) strength += 10;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(pwd)) strength += 20;
    else feedback.push('Add lowercase letter');

    if (/[A-Z]/.test(pwd)) strength += 20;
    else feedback.push('Add uppercase letter');

    if (/[0-9]/.test(pwd)) strength += 20;
    else feedback.push('Add number');

    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 20;
    else feedback.push('Add special character');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name || !email || !phone || !age || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain uppercase, lowercase, and numbers');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setError('Phone number must be 10 digits');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
      setError('Please enter a valid age between 5 and 120');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, phone, age: ageNum, password });
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
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 text-sm font-semibold">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-12 pl-11 pr-4 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-700 text-sm font-semibold">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-12 pl-11 pr-4 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-slate-700 text-sm font-semibold">Phone</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-12 pl-11 pr-4 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-slate-700 text-sm font-semibold">Age</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">cake</span>
                    <input
                      type="number"
                      name="age"
                      value={age}
                      onChange={handleChange}
                      placeholder="25"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-12 pl-11 pr-4 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-700 text-sm font-semibold">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-12 pl-11 pr-12 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
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
                {password && (
                  <div className="space-y-2">
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

              <div className="flex flex-col gap-2">
                <label className="text-slate-700 text-sm font-semibold">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
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
                  <div className="flex items-center gap-2">
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
