import { useEffect, useState } from 'react';
import { getCurrentUser, getProfile } from '../auth/authService';

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
  const [busStops, setBusStops] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedPassType, setSelectedPassType] = useState(null);

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

  const fetchBusStops = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/bus-pass/stops`);
      const data = await res.json();
      if (data.success) setBusStops(data.data);
    } catch (err) {
      console.error('Error fetching bus stops:', err);
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
    fetchBusStops();
  }, []);

  useEffect(() => {
    if (!loading) fetchPasses();
  }, [loading]);

  const buyPass = async (passType) => {
    if (!source || !destination) {
      alert('Please select both source and destination');
      return;
    }
    if (source === destination) {
      alert('Source and destination cannot be the same');
      return;
    }
    setBuying(true);
    try {
      const res = await fetch(`${API_URL}/api/user/bus-pass/buy`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ passType, source, destination }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to buy pass');
      setSource('');
      setDestination('');
      setSelectedPassType(null);
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
      <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
        <span className="material-symbols-outlined text-sm">{s.icon}</span>
        <span className="hidden sm:inline">{s.label}</span>
        <span className="sm:hidden">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background-light">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-3 sm:mb-4 truncate">
                Welcome, {user?.name || profile?.name}!
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-primary text-lg sm:text-xl">mail</span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Email</p>
                    <p className="font-medium text-sm sm:text-base truncate">{user?.email || profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-primary text-lg sm:text-xl">phone</span>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Phone</p>
                    <p className="font-medium text-sm sm:text-base">{user?.phone || profile?.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-primary text-lg sm:text-xl">cake</span>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Age</p>
                    <p className="font-medium text-sm sm:text-base">{user?.age || profile?.age || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-primary text-lg sm:text-xl">check_circle</span>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Account Status</p>
                    <p className="font-medium text-sm sm:text-base text-green-600">
                      {user?.isActive || profile?.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block ml-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-5xl">account_circle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Pass Card */}
        {activePass && (
          <div className="bg-white rounded-lg border-2 border-green-200 shadow-sm p-4 sm:p-6 md:p-8 mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-green-600 text-2xl">verified</span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Your Active Bus Pass</h3>
              {statusBadge('active')}
            </div>

            {/* Route Banner */}
            {activePass.source && activePass.destination && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 justify-center flex-wrap">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 font-semibold uppercase">From</p>
                    <p className="font-bold text-primary text-sm sm:text-lg">{activePass.source}</p>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <span className="hidden sm:inline border-t-2 border-dashed border-primary/40 w-8 sm:w-16"></span>
                    <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_forward</span>
                    <span className="hidden sm:inline border-t-2 border-dashed border-primary/40 w-8 sm:w-16"></span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 font-semibold uppercase">To</p>
                    <p className="font-bold text-primary text-sm sm:text-lg">{activePass.destination}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
              {/* QR Code */}
              {activePass.qrImage && (
                <div className="flex flex-col items-center flex-shrink-0">
                  <img src={activePass.qrImage} alt="Pass QR Code" className="w-36 h-36 sm:w-48 sm:h-48 rounded-lg border border-slate-200 p-1" />
                  <p className="text-xs text-slate-500 mt-2">Scan this QR for verification</p>
                </div>
              )}
              {/* Pass Details */}
              <div className="flex-1 w-full space-y-3">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Pass Type</p>
                    <p className="font-semibold text-slate-900 capitalize text-sm sm:text-base">{activePass.passType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Price</p>
                    <p className="font-semibold text-slate-900 text-sm sm:text-base">{activePass.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Valid From</p>
                    <p className="font-semibold text-slate-900 text-sm sm:text-base">{new Date(activePass.validFrom).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Valid Till</p>
                    <p className="font-semibold text-slate-900 text-sm sm:text-base">{new Date(activePass.validTill).toLocaleDateString()}</p>
                  </div>
                </div>
                {activePass.code16 && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Verification Code</p>
                    <div className="bg-slate-100 rounded-lg p-2 sm:p-3 font-mono text-sm sm:text-lg tracking-widest text-slate-800 select-all break-all">
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
          <div className="bg-white rounded-lg border-2 border-yellow-200 shadow-sm p-4 sm:p-6 md:p-8 mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-yellow-600 text-2xl">schedule</span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Pass Request Pending</h3>
              {statusBadge('pending')}
            </div>

            {/* Route info for pending pass */}
            {pendingPass.source && pendingPass.destination && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 flex items-center gap-2 sm:gap-3 justify-center flex-wrap">
                <span className="font-semibold text-yellow-800 text-sm">{pendingPass.source}</span>
                <span className="material-symbols-outlined text-yellow-600 text-lg">arrow_forward</span>
                <span className="font-semibold text-yellow-800 text-sm">{pendingPass.destination}</span>
              </div>
            )}

            <p className="text-slate-600 mb-4 text-sm sm:text-base">
              Your <strong className="capitalize">{pendingPass.passType}</strong> pass request ({pendingPass.price}) has been submitted.
              Waiting for admin approval.
            </p>
            <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-yellow-600 mt-0.5 flex-shrink-0">info</span>
              <p className="text-sm text-yellow-800">
                Once approved, your QR code and verification code will appear here. Please check back later.
              </p>
            </div>
          </div>
        )}

        {/* Buy Pass Section */}
        {!activePass && !pendingPass && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Buy a Bus Pass</h3>
            <p className="text-sm text-slate-600 mb-6">Select your route and pass type to purchase. After buying, an admin will review and approve your request.</p>

            {/* Route Selection */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-5 mb-6">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">route</span>
                Select Your Route
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Source (From)
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full p-2.5 sm:p-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                  >
                    <option value="">-- Select source --</option>
                    {busStops.map((stop) => (
                      <option key={stop} value={stop} disabled={stop === destination}>
                        {stop}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Destination (To)
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full p-2.5 sm:p-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                  >
                    <option value="">-- Select destination --</option>
                    {busStops.map((stop) => (
                      <option key={stop} value={stop} disabled={stop === source}>
                        {stop}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {source && destination && source !== destination && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-2 sm:gap-3 justify-center flex-wrap">
                  <span className="font-semibold text-primary text-sm">{source}</span>
                  <span className="material-symbols-outlined text-primary text-lg">arrow_forward</span>
                  <span className="font-semibold text-primary text-sm">{destination}</span>
                </div>
              )}
            </div>

            {/* Pass Type Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PASS_OPTIONS.map((opt) => (
                <div
                  key={opt.type}
                  className={`border rounded-lg p-4 sm:p-5 transition-all cursor-pointer ${
                    selectedPassType === opt.type
                      ? 'border-primary ring-2 ring-primary/20 shadow-md bg-primary/5'
                      : 'border-slate-200 hover:border-primary hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPassType(opt.type)}
                >
                  <h4 className="font-bold text-slate-900 text-base sm:text-lg">{opt.label}</h4>
                  <p className="text-2xl sm:text-3xl font-bold text-primary mt-2">{opt.price}</p>
                  <p className="text-sm text-slate-500 mt-1">{opt.days} days validity</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      buyPass(opt.type);
                    }}
                    disabled={buying || !source || !destination || source === destination}
                    className="mt-4 w-full px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {buying ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
              ))}
            </div>

            {(!source || !destination) && (
              <p className="text-xs text-slate-400 mt-3 text-center flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                Please select source and destination before buying a pass
              </p>
            )}
          </div>
        )}

        {/* Pass History */}
        {passes.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">history</span>
              Pass History
            </h3>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Route</th>
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
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {pass.source && pass.destination ? (
                          <span className="inline-flex items-center gap-1">
                            {pass.source}
                            <span className="material-symbols-outlined text-xs text-slate-400">arrow_forward</span>
                            {pass.destination}
                          </span>
                        ) : '—'}
                      </td>
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

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {passes.map((pass) => (
                <div key={pass._id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 capitalize text-sm">{pass.passType}</span>
                    {statusBadge(pass.status)}
                  </div>
                  {pass.source && pass.destination && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2 bg-slate-50 rounded px-2 py-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                      <span>{pass.source}</span>
                      <span className="material-symbols-outlined text-xs text-slate-400">arrow_forward</span>
                      <span>{pass.destination}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">Price: </span>
                      <span className="font-medium">{pass.price}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Requested: </span>
                      <span className="font-medium">{new Date(pass.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">From: </span>
                      <span className="font-medium">{pass.validFrom ? new Date(pass.validFrom).toLocaleDateString() : '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Till: </span>
                      <span className="font-medium">{pass.validTill ? new Date(pass.validTill).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
