import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="top-0 left-0 z-50 fixed flex justify-center items-center bg-gray-900 opacity-45 p-8 w-full min-h-svh">
      <div className="border-[#008ea2] border-b-8 rounded-full w-12 h-12 animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;