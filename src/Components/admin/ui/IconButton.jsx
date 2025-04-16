import React from "react";

const IconButton = ({ icon, badge }) => {
  return (
    <div className="relative">
      <button className="p-2 text-gray-700 rounded-full hover:bg-gray-100">
        {icon}
      </button>
      {badge && (
        <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
};

export default IconButton;
