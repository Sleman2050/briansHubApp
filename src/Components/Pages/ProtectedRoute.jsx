// ✅ Full Code for Role-Based Access Control and Advisor Functionality

// 1️⃣ ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../AppContext/AppContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userData } = useContext(AuthContext);

  if (!userData) {
    return <div className="text-center mt-10">Loading...</div>;
  }
  
  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    return <Navigate to={userData.role === "advisor" ? "/advisor/dashboard" : "/"} replace />;
  }
  
  return children;
  


};

export default ProtectedRoute;