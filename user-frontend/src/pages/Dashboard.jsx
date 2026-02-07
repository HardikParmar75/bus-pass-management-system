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
        setProfile(data.data || data);
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
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-5xl animate-spin">hourglass_empty</span>
          <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Welcome, {user?.name || profile?.name}! 👋
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold uppercase">Active Bus Pass</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">1</p>
              </div>
              <div className="w-12 h-12 bg-blue-100/50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-2xl">directions_bus</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold uppercase">Validity</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">30 Days</p>
              </div>
              <div className="w-12 h-12 bg-green-100/50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-2xl">calendar_month</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold uppercase">Journeys</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">45</p>
              </div>
              <div className="w-12 h-12 bg-purple-100/50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-2xl">route</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Journeys */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Recent Journeys
            </h3>
            <a href="#" className="text-primary text-sm font-semibold hover:underline">View All</a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">From</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">To</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Fare</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-600">Feb 5, 2026</td>
                  <td className="px-4 py-3 text-sm text-slate-600">Central Station</td>
                  <td className="px-4 py-3 text-sm text-slate-600">Airport Hub</td>
                  <td className="px-4 py-3 text-sm text-slate-600">₹50</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Completed
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-600">Feb 4, 2026</td>
                  <td className="px-4 py-3 text-sm text-slate-600">Market Square</td>
                  <td className="px-4 py-3 text-sm text-slate-600">Business Park</td>
                  <td className="px-4 py-3 text-sm text-slate-600">₹40</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Completed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-600">Feb 3, 2026</td>
                  <td className="px-4 py-3 text-sm text-slate-600">Downtown Terminal</td>
                  <td className="px-4 py-3 text-sm text-slate-600">Harbor View</td>
                  <td className="px-4 py-3 text-sm text-slate-600">₹60</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Completed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Dashboard;
