import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, User as UserIcon } from 'lucide-react';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSave = () => {
    updateProfile(name, location);
    setIsEditing(false);
  };

  // If missing user data
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-4 py-6 shadow-sm mb-6 flex justify-between items-center sticky top-0 z-10 text-gray-900 border-b border-gray-100">
        <h1 className="text-2xl font-bold">My Profile</h1>
      </div>

      <div className="px-4 space-y-6 max-w-lg mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <UserIcon size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name || 'Anonymous User'}</h2>
              <p className="text-gray-500">+{user.phone}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500" 
                />
              ) : (
                <p className="text-gray-900 font-medium text-lg">{user.name}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">Location</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500" 
                />
              ) : (
                <p className="text-gray-900 font-medium text-lg text-gray-700">{user.location}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">Joined</label>
              <p className="text-gray-900">{new Date(user.joinedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mt-6">
            {isEditing ? (
              <button onClick={handleSave} className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition">Save Changes</button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="w-full bg-blue-50 text-blue-600 rounded-xl py-3 font-semibold hover:bg-blue-100 transition">Edit Profile</button>
            )}
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white text-red-600 py-4 rounded-2xl shadow-sm border border-red-100 font-semibold hover:bg-red-50 transition"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
