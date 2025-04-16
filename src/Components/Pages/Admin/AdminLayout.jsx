// src/App.js (or AdminLayout.jsx, renamed as needed)
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../admin/Navbar";
import Sidebar from "../../admin/Sidebar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1">
        <Navbar onToggleSidebar={toggleSidebar} />
        <div className="p-4">
          {/* Instead of rendering AdminDashboard directly, use Outlet */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
