import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, getProfile } from '../auth/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PASS_OPTIONS = [
  { type: 'monthly', label: 'Monthly', price: 500, days: 30 },
  { type: 'quarterly', label: 'Quarterly', price: 1200, days: 90 },
  { type: 'half-yearly', label: 'Half-Yearly', price: 2000, days: 180 },
  { type: 'yearly', label: 'Yearly', price: 3500, days: 365 },
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passes, setPasses] = useState([]);
  const [buying, setBuying] = useState(false);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const u = getCurrentUser();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${u?.token}`,
    };
  };

  const fetchPasses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/bus-pass/my-passes`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setPasses(data.data);
    } catch (err) {
      console.error('Error fetching passes:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      try {
        const data = await getProfile();
        setProfile(data.data || data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) fetchPasses();
  }, [loading]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const buyPass = async (passType) => {
    setBuying(true);
    try {
      const res = await fetch(`${API_URL}/api/user/bus-pass/buy`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ passType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to buy pass');
      fetchPasses();
    } catch (err) {
      console.error('Buy pass error', err);
      alert(err.message || 'Failed to buy pass');
    } finally {
      setBuying(false);
    }
  };

  const activePass = passes.find((p) => p.status === 'active');
  const pendingPass = passes.find((p) => p.status === 'pending');

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-5xl animate-spin">hourglass_empty</span>
          <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const statusBadge = (status) => {
    const map = {
      pending: { bg: 'bg-yellow-100 text-yellow-800', icon: 'schedule', label: 'Pending Approval' },
      active: { bg: 'bg-green-100 text-green-800', icon: 'check_circle', label: 'Active' },
      rejected: { bg: 'bg-red-100 text-red-800', icon: 'cancel', label: 'Rejected' },
      expired: { bg: 'bg-gray-100 text-gray-800', icon: 'timer_off', label: 'Expired' },
    };
    const s = map[status] || { bg: 'bg-gray-100 text-gray-600', icon: 'help', label: status };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
        <span className="material-symbols-outlined text-sm">{s.icon}</span>
        {s.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background-light">
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Welcome, {user?.name || profile?.name}!
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-primary text-xl">mail</span>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Email</p>
                    <p className="font-medium">{user?.email || profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-primary text-xl">phone</span>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Phone</p>
                    <p className="font-medium">{user?.phone || profile?.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-primary text-xl">cake</span>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Age</p>
                    <p className="font-medium">{user?.age || profile?.age || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Account Status</p>
                    <p className="font-medium text-green-600">
                      {user?.isActive || profile?.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-5xl">account_circle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Pass Card */}
        {activePass && (
          <div className="bg-white rounded-lg border-2 border-green-200 shadow-sm p-6 md:p-8 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-green-600 text-2xl">verified</span>
              <h3 className="text-xl font-bold text-slate-900">Your Active Bus Pass</h3>
              {statusBadge('active')}
            </div>
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* QR Code */}
              {activePass.qrImage && (
                <div className="flex flex-col items-center">
                  <img src={activePass.qrImage} alt="Pass QR Code" className="w-48 h-48 rounded-lg border border-slate-200 p-1" />
                  <p className="text-xs text-slate-500 mt-2">Scan this QR for verification</p>
                </div>
              )}
              {/* Pass Details */}
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Pass Type</p>
                    <p className="font-semibold text-slate-900 capitalize">{activePass.passType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Price</p>
                    <p className="font-semibold text-slate-900">{activePass.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Valid From</p>
                    <p className="font-semibold text-slate-900">{new Date(activePass.validFrom).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Valid Till</p>
                    <p className="font-semibold text-slate-900">{new Date(activePass.validTill).toLocaleDateString()}</p>
                  </div>
                </div>
                {activePass.code16 && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Verification Code</p>
                    <div className="bg-slate-100 rounded-lg p-3 font-mono text-lg tracking-widest text-slate-800 select-all">
                      {activePass.code16}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Show this code to the conductor for manual verification</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pending Pass Card */}
        {pendingPass && !activePass && (
          <div className="bg-white rounded-lg border-2 border-yellow-200 shadow-sm p-6 md:p-8 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-yellow-600 text-2xl">schedule</span>
              <h3 className="text-xl font-bold text-slate-900">Pass Request Pending</h3>
              {statusBadge('pending')}
            </div>
            <p className="text-slate-600 mb-4">
              Your <strong className="capitalize">{pendingPass.passType}</strong> pass request ({pendingPass.price}) has been submitted.
              Waiting for admin approval.
            </p>
            <div className="bg-yellow-50 rounded-lg p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-yellow-600 mt-0.5">info</span>
              <p className="text-sm text-yellow-800">
                Once approved, your QR code and verification code will appear here. Please check back later.
              </p>
            </div>
          </div>
        )}

        {/* Buy Pass Section — show only if no active or pending pass */}
        {!activePass && !pendingPass && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Buy a Bus Pass</h3>
            <p className="text-sm text-slate-600 mb-6">Select a pass type to purchase. After buying, an admin will review and approve your request.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PASS_OPTIONS.map((opt) => (
                <div key={opt.type} className="border border-slate-200 rounded-lg p-5 hover:border-primary hover:shadow-md transition-all">
                  <h4 className="font-bold text-slate-900 text-lg">{opt.label}</h4>
                  <p className="text-3xl font-bold text-primary mt-2">{opt.price}</p>
                  <p className="text-sm text-slate-500 mt-1">{opt.days} days validity</p>
                  <button
                    onClick={() => buyPass(opt.type)}
                    disabled={buying}
                    className="mt-4 w-full px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {buying ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pass History */}
        {passes.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">history</span>
              Pass History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Price</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Valid From</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Valid Till</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Requested</th>
                  </tr>
                </thead>
                <tbody>
                  {passes.map((pass) => (
                    <tr key={pass._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-800 font-medium capitalize">{pass.passType}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{pass.price}</td>
                      <td className="px-4 py-3 text-sm">{statusBadge(pass.status)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {pass.validFrom ? new Date(pass.validFrom).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {pass.validTill ? new Date(pass.validTill).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{new Date(pass.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
