// src/components/Navbar.js

import React, { useEffect, useState, useContext, useRef } from "react";
import { FaBell } from "react-icons/fa";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { AuthContext } from "../AppContext/AppContext";

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  // Fetch notifications in real-time
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("to", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center justify-between px-4 py-2 border-b shadow-sm bg-white relative">
      <div className="flex items-center space-x-4">
        <button
          className="lg:hidden p-2"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>
        <span className="text-xl font-bold">Admin Panel</span>
      </div>

      <div className="flex items-center space-x-4 relative">
        {/* Notification Icon */}
        <div className="relative cursor-pointer" ref={dropdownRef}>
          <FaBell size={20} onClick={() => setShowDropdown(!showDropdown)} />
          {notifications.some(n => n.status === "unread") && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {
                notifications.filter(n => n.status === "unread").length
              }
            </span>
          )}

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white border rounded shadow-lg z-50">
              <div className="p-2 font-semibold border-b text-sm">Notifications</div>
              {notifications.length === 0 ? (
                <div className="p-2 text-gray-500 text-sm">No notifications</div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-2 hover:bg-gray-100 text-sm">
                    <p className="font-medium">{notif.message}</p>
                    <p className="text-xs text-gray-500">{new Date(notif.timestamp?.toDate()).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

     
      </div>
    </nav>
  );
};

export default Navbar;
