import React from 'react';

export const UIOverlay: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-end p-6 md:p-10">
      
      {/* Only keeping the bottom right attribution, removing Title and Controls */}
      <div className="w-full flex justify-end pointer-events-auto">
         <span className="text-xs text-gray-500 text-right">
           Veri Kaynağı: NASA Visible Earth<br/>
           Render Motoru: Three.js R3F
         </span>
      </div>
    </div>
  );
};