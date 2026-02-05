import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, getProfile } from '../auth/authService';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Fetch profile data
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-800 text-xl font-display">Loading...</div>
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-2xl">confirmation_number</span>
              </div>
            </div>
            <h3 className="text-[#5c6b8a] text-sm font-medium mb-1">Total Bus Passes</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
              </div>
            </div>
            <h3 className="text-[#5c6b8a] text-sm font-medium mb-1">Active Passes</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600 text-2xl">pending</span>
              </div>
            </div>
            <h3 className="text-[#5c6b8a] text-sm font-medium mb-1">Pending Requests</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-2xl">group</span>
              </div>
            </div>
            <h3 className="text-[#5c6b8a] text-sm font-medium mb-1">Total Users</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 border-l-4 border-l-primary">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
            <div>
              <h3 className="text-[#101318] font-semibold mb-1">Dashboard Overview</h3>
              <p className="text-[#5c6b8a] text-sm leading-relaxed">
                This is your admin dashboard. You can manage bus passes, users, and view statistics here. 
                Use the navigation menu to access different sections of the system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;