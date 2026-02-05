import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from './authService';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
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

        {/* Login Card */}
        <div className="bg-white rounded-lg p-8 md:p-10 border border-gray-200 shadow-sm">
          <div className="mb-8 text-center">
            <h2 className="text-[#101318] tracking-tight text-2xl font-semibold leading-tight mb-2">
              Admin Secure Login
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#5c6b8a] text-sm font-normal">
              <span className="material-symbols-outlined text-sm">shield_lock</span>
              <span>Secure Admin Gateway</span>
            </div>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[#101318] text-sm font-semibold tracking-wide flex items-center gap-2">
                Official Admin Email
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  required
                  placeholder="e.g. admin@transport.gov"
                  className="flex w-full rounded-lg text-[#101318] focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#d4d9e2] bg-white focus:border-primary h-12 placeholder:text-[#a1abbd] p-[15px] text-sm font-normal transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[#101318] text-sm font-semibold tracking-wide">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="flex w-full rounded-lg text-[#101318] focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#d4d9e2] bg-white focus:border-primary h-12 placeholder:text-[#a1abbd] p-[15px] text-sm font-normal transition-all"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-[#0f1a30] text-white font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
                <span className="material-symbols-outlined text-lg">login</span>
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-8 flex justify-center gap-6">
            <Link
              to="/register"
              className="text-xs text-[#5c6b8a] hover:text-primary font-medium transition-colors"
            >
              Create New Account
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

export default Login;
