import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Bell, Settings, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNav } from '../../context/NavContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout, setLoading, hotelInfo } = useAuth();
  const { isShowNav, showNav} = useNav();

  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);

    try{
      await logout();
    }finally{
      setLoading(false);
    }
  }

  return (
    <header className="bg-white shadow-sm border-gray-200 border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
        <div className="flex justify-between items-center h-16">
          <div className="flex justify-start items-center gap-x-2">
            { isShowNav && <ArrowLeft onClick={() => showNav(false)} className="w-5 h-5 font-bold text-[#008ea2] text-2xl transition-all duration-300 cursor-pointer" /> }
            { !isShowNav && <ArrowRight onClick={() => showNav(true)} className="w-5 h-5 font-bold text-[#008ea2] text-2xl transition-all duration-300 cursor-pointer" /> }

            <h1 className="font-bold text-[#008ea2] text-2xl whitespace-nowrap"><strong className="hidden sm:inline">PCDS - </strong>{hotelInfo?.hotel_name || 'HelCris Hotel'}</h1>
          </div>
          
          <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-1">
              <div className="flex items-center space-x-1">
                <div onClick={() => navigate(`/${user?.role}/profile`)} className="flex justify-center items-center bg-[#008ea2] rounded-full w-8 h-8 cursor-pointer">
                  {!user?.profile_url && <User className="w-4 h-4 text-white" />}
                  {!!user?.profile_url && <img src={user?.profile_url} alt="Profile" className="rounded-full w-8 h-8 object-cover" />}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
                  <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
                </div>
              </div>
              
              {/* <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-4 h-4" />
              </button> */}
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;