// src/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../AppContext/AppContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userData } = useContext(AuthContext);
  
  if (!userData) {
    return <div className="text-center mt-10">Loading...</div>;
  }
  
  // If the user role is not allowed, redirect accordingly.
  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    // For admin, redirect to /admin; otherwise to /home.
    const redirectPath = userData.role === "admin" ? "/admin" : "/home";
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

export default ProtectedRoute;
