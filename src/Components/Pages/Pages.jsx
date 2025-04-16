// src/Pages.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// Public Pages
import Login from "./Login";
import Register from "./Regsiter";
import Reset from "./Reset";

// Shared Home for Students and Advisors
import Home from "./Home";

// Shared Components for Students/Advisors
import FriendProfile from "./Student/profile"; // shared for both roles
import MyGroup from "./Student/MyGroup";

// Student-Only Components
import FriendsList from "./Student/FriendsList";
import Advisors from "./Student/Advisors";

// Chat Pages (Shared for Student, Advisor, and Admin)
import ChatsList from "../Chat/ChatsList";
import Chat from "../Chat/Chat";

// Advisor-Only Components
import AdvisorDashboard from "./Advisor/AdvisorDashboard";
import AdvisorRequests from "./Advisor/AdvisorRequests";
import AdvisorNotifications from "./Advisor/AdvisorNotifications";
import AdvisorGroups from "./Advisor/AdvisorGroups";
import AdvisorProgress from "./Advisor/AdvisorProgress";


// Admin Pages (without AdminLayout)
import AdminDashboard from "./Admin/Dashboard";
import AdminGroups from "./Admin/Groups";
import AdminNotifications from "./Admin/Notifications";

import AdminUsers from "./Admin/Users";
import AdminUsersProfile from "./Admin/UsersProfile";
import AdminGroupIdeas from "./Admin/AdminGroupIdeas";
import AdminSemesterTasks from "./Admin/AdminSemesterTasks";
import AdminTrackProgress from "./Admin/AdminTrackProgress";
import AdminPosts from "./Admin/AdminPosts";
import AdminLayout from "./Admin/AdminLayout";
// Protected Route Wrapper
import ProtectedRoute from "./ProtectedRoute";

const Pages = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<Reset />} />

      {/* Shared Home for Students & Advisors */}
      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={["student", "advisor"]}>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Student-Only Routes */}
      <Route
        path="/friends"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <FriendsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute allowedRoles={["student", "advisor"]}>
            <FriendProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-group"
        element={
          <ProtectedRoute allowedRoles={["student", "advisor"]}>
            <MyGroup />
          </ProtectedRoute>
        }
      />
         <Route
        path="/advisors"
        element={
          <ProtectedRoute allowedRoles={["student","admin"]}>
            <Advisors/>
          </ProtectedRoute>
        }
      />

      {/* Chat Routes (Common) */}
      <Route
        path="/chats"
        element={
          <ProtectedRoute allowedRoles={["student", "advisor", "admin"]}>
            <ChatsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:chatId/:chatType"
        element={
          <ProtectedRoute allowedRoles={["student", "advisor", "admin"]}>
            <Chat />
          </ProtectedRoute>
        }
      />

      {/* Advisor-Only Routes */}
      <Route
        path="/advisor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["advisor"]}>
            <AdvisorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advisor/requests"
        element={
          <ProtectedRoute allowedRoles={["advisor"]}>
            <AdvisorRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advisor/notifications"
        element={
          <ProtectedRoute allowedRoles={["advisor"]}>
            <AdvisorNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advisor/groups"
        element={
          <ProtectedRoute allowedRoles={["advisor"]}>
            <AdvisorGroups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advisor/progress/:groupId"
        element={
          <ProtectedRoute allowedRoles={["advisor"]}>
            <AdvisorProgress />
          </ProtectedRoute>
        }
      />
  

 {/* Admin Routes */}
 <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="groups" element={<AdminGroups />} />
        <Route path="notifications" element={<AdminNotifications />} />
     
        <Route path="users" element={<AdminUsers />} />
        <Route path="define-semester" element={<AdminSemesterTasks />} />
        <Route path="tracker" element={<AdminTrackProgress />} />
        <Route path="group-ideas" element={<AdminGroupIdeas />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="users/:id" element={<AdminUsersProfile />} />
      </Route>
    </Routes>
  );
};

export default Pages;
