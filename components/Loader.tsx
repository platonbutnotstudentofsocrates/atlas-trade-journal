import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-blue-900/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-blue-400 text-sm font-medium animate-pulse tracking-widest">
        YÜKLENİYOR...
      </p>
    </div>
  );
};