import React, { createContext, useContext, useState, useEffect } from 'react';
import { NavState } from '../types';

interface NavContextType extends NavState {
  showNav: (flg: boolean) => void;
}

const NavContext = createContext<NavContextType | undefined>(undefined);

export const NavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navState, setNavState] = useState<NavState>({
    isShowNav: true,
  });

  useEffect(() => {
    // Check for stored nav data
    const storedNavState = localStorage.getItem('isShowNav');
    
    if (storedNavState) {
      setNavState(prev => ({ ...prev, isShowNav: +storedNavState === 1 }));
    } else {
      setNavState(prev => ({ ...prev, isShowNav: true }));
    }
  }, []);

  const showNav = (flg: boolean) => {
    setNavState(prev => ({...prev, isShowNav: flg}));
  };

  return (
    <NavContext.Provider value={{ ...navState, showNav }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => {
  const context = useContext(NavContext);
  if (context === undefined) {
    throw new Error('useNav must be used within an NavProvider');
  }
  return context;
};