import React from 'react';
import ImgLogo from '../../images/logo.webp';

const Logo: React.FC = () => {
  return (
    <div className="inline-flex justify-center items-center mb-4">
        <img src={ImgLogo} alt="PCDS Logo" className="rounded-full w-16 h-16"/>
    </div>
  );
};

export default Logo;