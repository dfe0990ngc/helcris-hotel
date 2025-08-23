import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Bed,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Home,
  BookOpen,
} from 'lucide-react';
import { useNav } from '../../context/NavContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const adminMenuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/rooms', icon: Bed, label: 'Rooms' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    // { path: '/admin/profile', icon: Users, label: 'Profile' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const guestMenuItems = [
    { path: '/guest/dashboard', icon: Home, label: 'Home' },
    { path: '/guest/rooms', icon: Bed, label: 'Browse Rooms' },
    { path: '/guest/bookings', icon: BookOpen, label: 'My Bookings' },
    { path: '/guest/profile', icon: Users, label: 'Profile' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : guestMenuItems;

  const {isShowNav} = useNav();

  return (
    <aside className={`${isShowNav ? 'flex':'hidden'} flex-col bg-gray-900 w-64 min-h-screen text-white transition-all duration-300`}>
      <div className="p-6">
        <h2 className="font-bold text-[#008ea2] text-xl">Hotel Management</h2>
      </div>
      
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#008ea2] text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;