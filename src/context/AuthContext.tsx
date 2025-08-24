import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, AuthState, HotelInfo } from '../types';

import { 
  login as apiLogin, 
  logout as apiLogout,
  register as apiRegister,
  info
} from '../api/api.js';

import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  logout: () => void;
  setLoading: ( flg: boolean ) => void;
  setUser: (User: User) => void;
  hotelInfo: HotelInfo;
  fetchInfo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const infoRef = useRef(null);
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>({
    hotel_name: '',
    currency: '',
    currency_symbol: '',
    hotel_address: '',
    phone: '',
    email: '',
    check_in: '',
    check_out: '',
  });

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    // Check for stored auth data
    const storedInfo = localStorage.getItem('hotelInfo');
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setAuthState({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        loading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }

    if(storedInfo){
      setHotelInfo(JSON.parse(storedInfo));
    }else{
      if(!infoRef.current){
        infoRef.current = true;
        fetchInfo();
      }
    }
  }, []);

  useEffect(() => {
    document.title = 'PCDS - '+(hotelInfo?.hotel_name || "HILL CREST SUITES");
  },[hotelInfo]);

  const fetchInfo = async () => {
    try{
      const { data } = await info();

      setHotelInfo(data);
      localStorage.setItem('hotelInfo', JSON.stringify(data));
    }catch(error){
      console.log(error);

      setHotelInfo({
        hotel_name: 'HelCris Hotel',
        currency: 'PHP',
        currency_symbol: '₱',
        hotel_address: 'Digos City',
        phone: '',
        email: '',
        check_in: '15:00',
        check_out: '11:00',
      });
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data } = await apiLogin({
        email,
        password,
      });

      localStorage.setItem('user', JSON.stringify(data?.user));
      localStorage.setItem('token', data?.token);
      setAuthState({
        user: data?.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await apiRegister(userData);

      return response;
      
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { data } = await apiLogout();
    
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });

      toast.removeAll("toast-login-alert");
      toast.success(data?.message || 'Logout Successfully!');

    } catch (error) {

      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });

      toast.removeAll("toast-login-alert");
      toast.success('Logout Successfully!');

      throw error;
    }
  };

  const setLoading = async (flg) => {
      setAuthState(prev => ({ ...prev, loading: flg }));
  }

  const setUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState((prev) => ({...prev, user: user}));
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, setLoading, setUser, hotelInfo, fetchInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};