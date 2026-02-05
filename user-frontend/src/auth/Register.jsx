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
  const navigate = useNavigate();

  const { name, email, phone, age, password, confirmPassword } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, phone, age: parseInt(age), password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background-light">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-6 md:px-20 py-3">
        <div className="flex items-center gap-4 text-primary">
          <div className="w-8 h-8">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em]">Transport Department</h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden md:flex items-center gap-9">
            <a className="text-slate-600 text-sm font-medium hover:text-primary transition-colors" href="#">Home</a>
            <a className="text-slate-600 text-sm font-medium hover:text-primary transition-colors" href="#">Routes</a>
            <a className="text-slate-600 text-sm font-medium hover:text-primary transition-colors" href="#">Contact</a>
          </div>
          <button className="cursor-pointer rounded-lg h-10 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold leading-normal transition-colors">
            <span>Help</span>
          </button>
        </div>
      </header>

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
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-12 pl-11 pr-4 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-700 text-sm font-semibold">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock_check</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-12 pl-11 pr-4 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
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

      {/* Footer */}
      <footer className="py-6 text-center border-t border-slate-200 bg-white">
        <p className="text-xs text-slate-400">© 2024 National Transport Authority. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Register;
