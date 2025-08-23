import React, { useState, useEffect, useRef } from 'react';
import { users as apiUsers, updateUserRole} from '../../api/api.js';
import { User } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { Users, Mail, Phone, Calendar, Search, Filter, UserCheck, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { selectSmallestDistanceBetweenValues } from 'recharts/types/state/selectors/axisSelectors';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleSetting, setShowRoleSetting] = useState(false);
  const [saving, setSaving] = useState(false);

  const usersRef = useRef(null);

  useEffect(() => {
    if(!usersRef.current){
      usersRef.current = true;
      fetchUsers();
    }
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const handleShowUpdateRole = (user) => {
    setSelectedUser(user);
    setShowRoleSetting(true);
  }

  const handleUpdateRole = async (e) => {
    e.preventDefault();

    setSaving(true);
    try{
      const { data } = await updateUserRole(selectedUser?.id,{role: selectedUser?.role});

      toast.success(data?.message || 'User role update is successful!');
      fetchUsers();
      setShowRoleSetting(false);
    }catch(error){
      toast.error(error?.response?.data?.message || 'Error role updates!');
    }finally{
      setSaving(false);
    }
  }

  const fetchUsers = async () => {
    try {
      const { data } = await apiUsers();
      setUsers(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'guest': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTerm));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const getUserStats = () => {
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const guestCount = users.filter(u => u.role === 'guest').length;
    const recentUsers = users.filter(u => {
      const userDate = new Date(u.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return userDate > weekAgo;
    }).length;

    return { totalUsers, adminCount, guestCount, recentUsers };
  };

  const stats = getUserStats();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.length === 1 ? [1] : rangeWithDots;
  };

  return (
    <div className="space-y-6">
      {loading && <LoadingSpinner />}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">User Management</h1>
          <p className="text-gray-600">Manage hotel staff and guest accounts</p>
        </div>
      </div>

      {/* User Statistics */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-4">
        <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className="bg-[#008ea2] bg-opacity-10 p-3 rounded-full">
              <Users className="w-6 h-6 text-[#008ea2]" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-600 text-sm">Total Users</p>
              <p className="font-bold text-gray-900 text-2xl">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <UserCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-600 text-sm">Administrators</p>
              <p className="font-bold text-gray-900 text-2xl">{stats.adminCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <UserX className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-600 text-sm">Guests</p>
              <p className="font-bold text-gray-900 text-2xl">{stats.guestCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-600 text-sm">New This Week</p>
              <p className="font-bold text-gray-900 text-2xl">{stats.recentUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-sm p-4 border border-gray-200 rounded-lg">
        <div className="flex md:flex-row flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pr-4 pl-10 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="guest">Guests</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 text-sm">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-500 text-sm">per page</span>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600 text-sm">
          Showing {Math.min(startIndex + 1, totalItems)} to {Math.min(endIndex, totalItems)} of {totalItems} users
        </p>
        {filteredUsers.length !== users.length && (
          <p className="text-gray-500 text-sm">
            ({users.length - filteredUsers.length} hidden by filters)
          </p>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Contact Information
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex justify-center items-center bg-[#008ea2] bg-opacity-10 rounded-full w-10 h-10">
                        {user?.profile_url && <img src={user?.profile_url} alt="Profile" className="rounded-full w-full h-full object-cover"/>}
                        {!user?.profile_url && 
                        <span className="font-medium text-[#008ea2] text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </span>}

                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                        <div className="text-gray-500 text-sm">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-gray-900 text-sm">
                        <Mail className="mr-2 w-4 h-4 text-gray-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-gray-500 text-sm">
                          <Phone className="mr-2 w-4 h-4 text-gray-400" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span title="Click here to change account role..." onClick={(e) => handleShowUpdateRole(user)} className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border cursor-pointer hover:scale-105 ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="mr-2 w-4 h-4 text-gray-400" />
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                    {format(new Date(user.updated_at), 'MMM dd, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <p className="text-gray-500 text-lg">No users found</p>
            {(searchTerm || roleFilter !== 'all') && (
              <p className="mt-2 text-gray-400 text-sm">
                Try adjusting your search or filter criteria
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex sm:flex-row flex-col justify-between items-center gap-4">
          <div className="text-gray-600 text-sm">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            {getPaginationRange().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-gray-500 text-sm">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page as number)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? 'bg-[#008ea2] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
        <h3 className="mb-4 font-semibold text-gray-900 text-lg">Recent User Activity</h3>
        <div className="space-y-4">
          {users
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map((user) => (
              <div key={user.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex justify-center items-center bg-[#008ea2] bg-opacity-10 rounded-full w-8 h-8">
                    {user?.profile_url && <img src={user?.profile_url} alt="Profile" className="rounded-full w-full h-full object-cover"/>}
                    {!user?.profile_url && 
                    <span className="font-medium text-[#008ea2] text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </span>}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                    <p className="text-gray-500 text-xs">
                      Joined as {user.role} • {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
            ))}
        </div>
      </div>

      {showRoleSetting && (
        <div className="-top-[25px] z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 font-bold text-gray-900 text-xl">Change Account Role</h2>
            
            <form onSubmit={handleUpdateRole} className="space-y-4 py-6">
              
              <div className="flex justify-center items-center gap-x-8 mb-6 w-full">
                <label htmlFor="admin" className="font-medium text-gray-700 text-xl">
                  <input onChange={(e) => {
                    if(e.target.checked){
                      setSelectedUser((prev) => ({...prev,role: 'admin'}));
                    }
                  }} type="radio" name="role" id="admin" value="admin" className="inline w-5 h-5" checked={selectedUser?.role === 'admin'} />&nbsp;Admin
                </label>
                <label htmlFor="guest" className="font-medium text-gray-700 text-xl">
                  <input onChange={(e) => {
                    if(e.target.checked){
                      setSelectedUser((prev) => ({...prev,role: 'guest'}));
                    }
                  }} type="radio" name="role" id="guest" value="guest" className="inline w-5 h-5" checked={selectedUser?.role === 'guest'} />&nbsp;Guest
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleSetting(false);
                    setSelectedUser(null);
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

export default UserManagement;