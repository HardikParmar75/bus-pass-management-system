import { useEffect, useState } from 'react';
import { getProfile } from '../auth/authService';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProfile();
        setProfile(data.data || data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="min-h-[200px] flex items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase">Name</p>
            <p className="font-medium">{profile?.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Email</p>
            <p className="font-medium">{profile?.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Phone</p>
            <p className="font-medium">{profile?.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Date of Birth</p>
            <p className="font-medium">{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
