import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from './authService';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter reset code & new password
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const navigate = useNavigate();

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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await requestPasswordReset({ email });
      setSuccess('Password reset code has been sent to your email address. Please check your inbox.');
      setTimeout(() => {
        setStep(2);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetCode || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must contain uppercase, lowercase, and numbers');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ email, resetCode, newPassword });
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background-light">

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-xl overflow-hidden border border-slate-200 shadow-lg">
          {/* Left Section: Illustration */}
          <div className="hidden md:flex md:w-5/12 bg-slate-50 flex-col items-center justify-center p-12 relative overflow-hidden">
            <div className="z-10 text-center">
              <div className="mb-8 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <span className="material-symbols-outlined text-primary text-5xl">
                    {step === 1 ? 'mail_lock' : 'lock_reset'}
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                {step === 1 ? 'Reset Your Password' : 'Create New Password'}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {step === 1
                  ? 'Enter your email address and we\'ll send you a code to reset your password.'
                  : 'Enter the reset code from your email and create a new password.'}
              </p>
            </div>
            <div className="mt-12 w-full h-48 bg-center bg-no-repeat bg-contain opacity-80" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB1S7raL9YiwlY92sKkbUTrE1zmkN0XxosQ6YN_y8antfm0oMhRqQSAJeTTbnoxFmgNuQtmO6tWJKglHnPjSi9j8yv8dpwZ7XhapiwMFdk-2XeFzKLEqyjc_E8R1y0yH_TdYMrX_Vo5slMnmlG642KHwN2RpsPrZfd1QIe3Zj6z1BkBlXl4cdysU7DyDh5eW1zZaD0yEdxjPVg1Al0wR2Z1nSaRNs_tVXgffstmU2u2tTGI3hiuZephjwzwKnQm5O25c27zBYdIBQ")' }}></div>
          </div>

          {/* Right Section: Form */}
          <div className="flex-1 flex flex-col p-8 lg:p-16">
            {/* Back Button */}
            <div className="mb-6">
              <Link to="/login" className="flex items-center gap-2 text-primary text-sm font-semibold hover:underline">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span>Back to Login</span>
              </Link>
            </div>

            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {step === 1 ? 'Forgot Password' : 'Reset Password'}
              </h1>
              <p className="text-slate-500 text-sm">
                {step === 1
                  ? 'We\'ll help you recover your account access.'
                  : 'Enter your reset code and create a new password.'}
              </p>
            </div>

            {/* Error Message */}
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

            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg text-sm">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-xl mt-0.5">check_circle</span>
                  <div>
                    <p className="font-semibold">Success</p>
                    <p>{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-6 flex flex-col max-w-md">
                <div className="flex flex-col gap-2">
                  <label className="text-slate-700 text-sm font-semibold">Email Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="your.email@example.com"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-12 pl-11 pr-4 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center rounded-lg h-12 px-5 bg-primary hover:bg-primary/90 disabled:bg-primary/60 text-white text-base font-bold leading-normal transition-colors shadow-md shadow-primary/20 gap-2 disabled:cursor-not-allowed"
                  >
                    <span>{loading ? 'Sending Code...' : 'Send Reset Code'}</span>
                    {!loading && <span className="material-symbols-outlined text-lg">mail_outline</span>}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Reset Code & New Password */}
            {step === 2 && (
              <form onSubmit={handlePasswordReset} className="space-y-4 flex flex-col max-w-md">
                <div className="flex flex-col gap-2">
                  <label className="text-slate-700 text-sm font-semibold">Reset Code</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">vpn_key</span>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => {
                        setResetCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-12 pl-11 pr-4 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm tracking-widest"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-slate-700 text-sm font-semibold">New Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        calculatePasswordStrength(e.target.value);
                        setError('');
                      }}
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
                  {newPassword && (
                    <div className="space-y-2">
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
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="••••••••"
                      className={`w-full rounded-lg border bg-slate-50 text-slate-900 h-12 pl-11 pr-12 placeholder:text-slate-400 focus:ring-1 outline-none transition-all text-sm ${
                        confirmPassword && newPassword !== confirmPassword
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : confirmPassword && newPassword === confirmPassword
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
                      {newPassword === confirmPassword ? (
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || (newPassword && confirmPassword && newPassword !== confirmPassword)}
                    className="w-full flex items-center justify-center rounded-lg h-12 px-5 bg-primary hover:bg-primary/90 disabled:bg-primary/60 text-white text-base font-bold leading-normal transition-colors shadow-md shadow-primary/20 gap-2 disabled:cursor-not-allowed"
                  >
                    <span>{loading ? 'Resetting Password...' : 'Reset Password'}</span>
                    {!loading && <span className="material-symbols-outlined text-lg">lock_reset</span>}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setResetCode('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordStrength(0);
                      setPasswordFeedback('');
                    }}
                    className="text-primary text-sm font-semibold hover:underline"
                  >
                    Didn't receive a code? Try again
                  </button>
                </div>
              </form>
            )}

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

export default ForgotPassword;
