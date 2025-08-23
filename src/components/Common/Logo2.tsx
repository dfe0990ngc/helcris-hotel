import React from 'react';
import ImgLogo from '../../images/logo.webp';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo2: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center justify-start ${className}`}>
      <div className="rounded-xl">
        <img src={ImgLogo} alt="PCDS Logo" className="rounded-full w-12 h-12"/>
      </div>
      {showText && (
        <div className="hidden sm:block ml-3">
          <h2 className="font-bold text-gray-600 text-xl">HelCris Hotel</h2>
          <p className="text-gray-600 text-xs">PCDS Management</p>
        </div>
      )}
    </div>
  );
};

export default Logo2;