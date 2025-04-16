import React from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="hidden lg:flex relative max-w-xs">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        <FaSearch className="w-5 h-5" />
      </span>
      <input
        type="search"
        placeholder="Type to search"
        value={value}
        onChange={(e) => onChange(e.target.value)} // ✅ safe now
        className="w-full border border-gray-300 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm rounded-lg pl-10 pr-3 py-2"
      />
    </div>
  );
};

export default SearchBar;
