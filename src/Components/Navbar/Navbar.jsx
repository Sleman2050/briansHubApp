import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AppContext/AppContext";
import { Button } from "@material-tailwind/react";
import { FiLogOut } from "react-icons/fi"; // Import logout icon

const Navbar = () => {
  const { signOutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full flex justify-between items-center px-10 py-3 z-50 
                    bg-gradient-to-r from-[#36b36e] to-[#36c9a2] text-white shadow-md border-b border-green-700">
      {/* Logo Section */}
      <Link to="/" className="text-3xl font-bold tracking-wide font-roboto transition-all duration-300 hover:scale-105">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] to-[#e9f5ee] drop-shadow-lg">
          Brains Hub
        </span>
      </Link>

      {/* User & Logout Section */}
      <div className="flex items-center space-x-6">
        
        <Button
          className="px-4 py-2 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r 
                     from-[#1b6a42] to-[#238b5b] text-white text-sm font-semibold transition-all 
                     duration-300 hover:scale-105 hover:shadow-md hover:shadow-green-500 active:scale-95"
          onClick={handleLogout}
        >
          <FiLogOut  className="w-5 h-5 transition-all duration-300 hover:rotate-180" />
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
