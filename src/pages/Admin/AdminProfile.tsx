import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Calendar, Lock, Save, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { updateUserProfile, updateUserImage, updateUserPassword } from '../../api/api.js';

const AdminProfile: React.FC = () => {
  const { user, loading, setLoading, setUser, hotelInfo } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showImageUrlModal,setShowImageUrlModal] = useState(false);
  const [saving,setSaving] = useState(false);

  const handleSave = async () => {

    setLoading(true);

    try{
      const { data } = await updateUserProfile(user?.id, formData);

      setUser(data.user);

      // In a real app, this would make an API call to update the user
      toast.success(data?.message || 'Profile updated successfully');
    }catch(error){
      toast.error(error?.response?.data?.message || 'Failed to update your record!');
    }finally{
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handleUpdateImageUrl = async (e) => {
    e.preventDefault();

    setSaving(true);

    try{
      const { data } = await updateUserImage(user?.id, {profile_url: user?.profile_url});

      setUser(data.user);

      // In a real app, this would make an API call to update the user
      toast.success(data?.message || 'Profile image url has been updated successfully');

      setShowImageUrlModal(false);
    }catch(error){
      toast.error(error?.response?.data?.message || 'Failed to update your record profile image url!');
    }finally{
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try{
      const { data } = await updateUserPassword(user?.id, {
        password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.confirmPassword,
      });

      // In a real app, this would make an API call to update the user
      toast.success(data?.message || 'Password has been updated successfully');
      setShowPasswordForm(false);
    }catch(error){
      toast.error(error?.response?.data?.message || 'Failed to update your password!');
    }finally{
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-gray-900 text-3xl">My Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Profile Information */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#008ea2] to-[#006b7a] p-6">
          <div className="flex items-center space-x-4">
            <div onClick={() => setShowImageUrlModal(true)} className="flex justify-center items-center bg-white bg-opacity-20 hover:opacity-75 rounded-full w-20 h-20 cursor-pointer">
              {user?.profile_url && <img src={user?.profile_url} className="rounded-full w-20 h-20 object-cover" />}
              {!user?.profile_url && <span className="font-bold text-white text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </span>}
            </div>
            <div className="text-white">
              <h2 className="font-bold text-2xl">{user.name}</h2>
              <p className="opacity-90 text-sm">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full bg-white bg-opacity-20`}>
                  {user.role}
                </span>
                {user.created_at && <span className="opacity-90 text-sm">
                  Member since {format(new Date(user.created_at), 'MMMM yyyy')}
                </span>}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 text-lg">Personal Information</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 text-[#008ea2] hover:text-[#006b7a] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
          </div>

          <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                />
              ) : (
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{user.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                />
              ) : (
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{user.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                />
              ) : (
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Account Created
              </label>
              <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-500" />
                {user.created_at &&
                  <span className="text-gray-900">
                    {format(new Date(user.created_at), 'MMMM dd, yyyy')}
                  </span>}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                className={`flex items-center space-x-2 bg-[#008ea2] hover:bg-[#006b7a] px-6 py-2 rounded-lg text-white transition-colors ${loading ? 'cursor-pointer opacity-75' : ''}`}
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="p-6">
          <h3 className="mb-6 font-semibold text-gray-900 text-lg">Security Settings</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="font-medium text-gray-900">Password</h4>
                  {user.updated_at && <p className="text-gray-500 text-sm">Last updated {format(new Date(user.updated_at), 'MMM dd, yyyy')}</p>}
                </div>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="font-medium text-[#008ea2] hover:text-[#006b7a] text-sm transition-colors"
              >
                Change Password
              </button>
            </div>

            {showPasswordForm && (
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="block mb-2 font-medium text-gray-700 text-sm">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700 text-sm">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700 text-sm">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className={`bg-[#008ea2] hover:bg-[#006b7a] px-4 py-2 rounded-lg text-white transition-colors ${loading ? 'cursor-not-allowed opacity-75' : ''}`}
                  >
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </button>
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    disabled={loading}
                    className={`hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors ${loading ? 'cursor-not-allowed opacity-75' : ''}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="p-6">
          <h3 className="mb-6 font-semibold text-gray-900 text-lg">Account Statistics</h3>
          
          <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
            <div className="bg-[#008ea2] bg-opacity-10 p-4 rounded-lg text-center">
              <div className="font-bold text-[#008ea2] text-2xl">{user?.total_bookings || 0}</div>
              <div className="text-gray-600 text-sm">Total Bookings</div>
            </div>
            
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="font-bold text-green-600 text-2xl">{hotelInfo?.currency_symbol}{(+user?.total_spent).toFixed(2)}</div>
              <div className="text-gray-600 text-sm">Total Spent</div>
            </div>
            
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <div className="font-bold text-blue-600 text-2xl">{user?.total_nights}</div>
              <div className="text-gray-600 text-sm">Nights Stayed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageUrlModal && (
        <div className="-top-[25px] z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 font-bold text-gray-900 text-xl">Update Profile Image URL</h2>
            
            <form onSubmit={handleUpdateImageUrl} className="space-y-4">
              
                <div className="w-full">
                  <label htmlFor="url" className="block mb-2 font-medium text-gray-700 text-sm">Image URL</label>
                  <input
                  type="url"
                  id="url"
                  name="url"
                  value={user?.profile_url}
                  onChange={(e) => setUser({...user,profile_url: e.target.value})}
                  className="px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
                  placeholder="Enter Image URL"
                  />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowImageUrlModal(false);
                  }}
                  className="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 bg-[#008ea2] hover:bg-[#006b7a] px-4 py-2 rounded-lg text-white transition-colors ${saving ? 'cursor-not-allowed opacity-75' : ''}`}
                  disabled={saving}
                >{saving ? 'Submitting...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;