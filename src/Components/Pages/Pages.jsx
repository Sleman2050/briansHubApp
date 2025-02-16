// 2️⃣ Pages.jsx with Role-Based Routing
import React from "react";
import Home from "./Home";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Regsiter";
import Reset from "./Reset_notYet";
import FriendProfile from "./Student/profile";
import FriendsList from "./Student/FriendsList";



import ChatsList from '../Chat/ChatsList';  // Import the new ChatsList component
import Chat from '../Chat/Chat';






// Advisor Components
import AdvisorProfile from "./Advisor/AdvisorProfile_notYet";
import AdvisorDashboard from "./Advisor/AdvisorDashboard_notYet";
import AdvisorRequests from "./Advisor/AdvisorRequests_notYet";
import AdvisorNotifications from "./Advisor/AdvisorNotifications_notYet";
import AdvisorGroups from "./Advisor/AdvisorGroups_notYet";
import AdvisorChat from "./Advisor/AdvisorChat_notYet";

// Protected Route
import ProtectedRoute from "./ProtectedRoute";

const Pages = () => {
  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<Reset />} />

        {/* Student Routes */}

        <Route path="/" element={<ProtectedRoute allowedRoles={["student"]}><Home /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute allowedRoles={["student"]}><FriendsList /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute allowedRoles={["student"]}><FriendProfile /></ProtectedRoute>} />


      
<Route path="/chats" element={<ProtectedRoute allowedRoles={["student"]}><ChatsList /></ProtectedRoute>} />
<Route path="/chat/private/:chatId" element={<ProtectedRoute allowedRoles={["student"]}><Chat chatType="private" /></ProtectedRoute>} />
<Route path="/chat/group/:chatId" element={<ProtectedRoute allowedRoles={["student"]}><Chat chatType="group" /></ProtectedRoute>} />



        {/* Advisor Routes */}
        <Route
          path="/advisor/profile"
          element={<ProtectedRoute allowedRoles={["advisor"]}><AdvisorProfile /></ProtectedRoute>}
        />
        <Route
          path="/advisor/dashboard"
          element={<ProtectedRoute allowedRoles={["advisor"]}><AdvisorDashboard /></ProtectedRoute>}
        />
        <Route
          path="/advisor/requests"
          element={<ProtectedRoute allowedRoles={["advisor"]}><AdvisorRequests /></ProtectedRoute>}
        />
        <Route
          path="/advisor/notifications"
          element={<ProtectedRoute allowedRoles={["advisor"]}><AdvisorNotifications /></ProtectedRoute>}
        />
        <Route
          path="/advisor/groups"
          element={<ProtectedRoute allowedRoles={["advisor"]}><AdvisorGroups /></ProtectedRoute>}
        />
        <Route
          path="/advisor/chat"
          element={<ProtectedRoute allowedRoles={["advisor"]}><AdvisorChat /></ProtectedRoute>}
        />
      </Routes>
    </div>
  );
};

export default Pages;