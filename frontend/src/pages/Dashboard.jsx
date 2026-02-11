import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, getProfile } from '../auth/authService';
import { Html5Qrcode } from 'html5-qrcode';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passes, setPasses] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const u = getCurrentUser();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${u?.token}`,
    };
  };

  const fetchPasses = async (status) => {
    try {
      const url = status
        ? `${API_URL}/api/admin/bus-passes?status=${status}`
        : `${API_URL}/api/admin/bus-passes`;
      const res = await fetch(url, { headers: getAuthHeaders() });
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
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchPasses(activeTab === 'all' ? '' : activeTab);
    }
  }, [activeTab, loading]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleApprove = async (passId) => {
    setActionLoading(passId);
    try {
      const res = await fetch(`${API_URL}/api/admin/bus-passes/${passId}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchPasses(activeTab === 'all' ? '' : activeTab);
    } catch (err) {
      alert(err.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (passId) => {
    setActionLoading(passId);
    try {
      const res = await fetch(`${API_URL}/api/admin/bus-passes/${passId}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchPasses(activeTab === 'all' ? '' : activeTab);
    } catch (err) {
      alert(err.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const verifyByInput = async (input) => {
    setVerifyResult(null);
    try {
      const trimmed = input.trim();
      if (!trimmed) return;

      const body = trimmed.length === 16 ? { code: trimmed } : { token: trimmed };

      const res = await fetch(`${API_URL}/api/admin/bus-passes/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setVerifyResult({ ok: true, data: data.data });
    } catch (err) {
      setVerifyResult({ ok: false, error: err.message });
    }
  };

  const handleVerify = () => verifyByInput(verifyInput);

  const startScanner = () => {
    setScanning(true);
    setVerifyResult(null);
    setTimeout(() => {
      const html5Qr = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qr;
      html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          html5Qr.stop().then(() => {
            scannerRef.current = null;
            setScanning(false);
            setVerifyInput(decodedText);
            verifyByInput(decodedText);
          });
        },
        () => {},
      ).catch((err) => {
        console.error('Scanner error:', err);
        setScanning(false);
        setVerifyResult({ ok: false, error: 'Could not access camera. Please allow camera permission.' });
      });
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current = null;
        setScanning(false);
      });
    } else {
      setScanning(false);
    }
  };

  // Fetch all passes for stats (independent of tab filter)
  const [allStats, setAllStats] = useState({ total: 0, active: 0, pending: 0 });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/bus-passes`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) {
          const all = data.data;
          setAllStats({
            total: all.length,
            active: all.filter((p) => p.status === 'active').length,
            pending: all.filter((p) => p.status === 'pending').length,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (!loading) fetchStats();
  }, [loading, passes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-800 text-xl font-display">Loading...</div>
        </div>
      </div>
    );
  }

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background-light font-display">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 md:px-10 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">directions_bus</span>
            </div>
            <div>
              <h1 className="text-primary text-lg font-bold tracking-tight">Bus Pass Management</h1>
              <p className="text-[#5c6b8a] text-xs">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <span>Logout</span>
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#101318] mb-3">
                Welcome back, {user?.name || profile?.name}!
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#5c6b8a]">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  <span className="text-sm"><strong className="text-[#101318]">Email:</strong> {user?.email || profile?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#5c6b8a]">
                  <span className="material-symbols-outlined text-sm">badge</span>
                  <span className="text-sm"><strong className="text-[#101318]">Role:</strong> {user?.role || profile?.role}</span>
                </div>
                <div className="flex items-center gap-2 text-[#5c6b8a]">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span className="text-sm"><strong className="text-[#101318]">Status:</strong> <span className="text-green-600 font-semibold">Active</span></span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl">account_circle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-2xl">confirmation_number</span>
              </div>
            </div>
            <h3 className="text-[#5c6b8a] text-sm font-medium mb-1">Total Bus Passes</h3>
            <p className="text-3xl font-bold text-primary">{allStats.total}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
              </div>
            </div>
            <h3 className="text-[#5c6b8a] text-sm font-medium mb-1">Active Passes</h3>
            <p className="text-3xl font-bold text-primary">{allStats.active}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600 text-2xl">pending</span>
              </div>
            </div>
            <h3 className="text-[#5c6b8a] text-sm font-medium mb-1">Pending Requests</h3>
            <p className="text-3xl font-bold text-primary">{allStats.pending}</p>
          </div>
        </div>

        {/* Bus Passes Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#101318]">Bus Pass Requests</h3>
            <div className="flex gap-2">
              {['pending', 'active', 'rejected', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {passes.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
              <p>No {activeTab === 'all' ? '' : activeTab} pass requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Price</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Requested</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passes.map((pass) => (
                    <tr key={pass._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{pass.user?.name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{pass.user?.email || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{pass.passType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-medium">{pass.price}</td>
                      <td className="px-4 py-3 text-sm">{statusBadge(pass.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(pass.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        {pass.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(pass._id)}
                              disabled={actionLoading === pass._id}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold disabled:opacity-50"
                            >
                              {actionLoading === pass._id ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(pass._id)}
                              disabled={actionLoading === pass._id}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : pass.status === 'active' && pass.validTill ? (
                          <span className="text-xs text-gray-500">Valid till {new Date(pass.validTill).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Verify Pass Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-[#101318]">Verify Bus Pass</h3>
          <p className="text-sm text-gray-500 mb-4">Enter a 16-character code, paste a JWT token, or scan the QR code to verify a pass.</p>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm text-slate-600 block mb-1">Code or Token</label>
              <input
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                placeholder="Enter 16-char code or JWT token..."
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <button
              onClick={handleVerify}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Verify
            </button>
            <button
              onClick={scanning ? stopScanner : startScanner}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                scanning
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-800 hover:bg-gray-900 text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{scanning ? 'stop' : 'qr_code_scanner'}</span>
              {scanning ? 'Stop' : 'Scan QR'}
            </button>
          </div>

          {/* QR Scanner View */}
          {scanning && (
            <div className="mt-4 flex justify-center">
              <div id="qr-reader" className="w-[320px] h-[320px] rounded-lg overflow-hidden border-2 border-gray-300"></div>
            </div>
          )}

          {verifyResult && (
            <div className={`mt-4 p-4 rounded-lg ${verifyResult.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {verifyResult.ok ? (
                <div className="space-y-1">
                  <p className="text-green-800 font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">verified</span>
                    Pass Verified Successfully
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <p><strong>Name:</strong> {verifyResult.data.userName}</p>
                    <p><strong>Email:</strong> {verifyResult.data.userEmail}</p>
                    <p><strong>Type:</strong> <span className="capitalize">{verifyResult.data.passType}</span></p>
                    <p><strong>Valid Till:</strong> {new Date(verifyResult.data.validTill).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {verifyResult.data.status}</p>
                    <p><strong>Phone:</strong> {verifyResult.data.userPhone || '—'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-red-700 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {verifyResult.error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
