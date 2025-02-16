import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaUsers, FaComments, FaLayerGroup, FaCog } from "react-icons/fa";
import { auth } from "../../firebase/firebase";

const Dashboard = () => {
  const navigate = useNavigate();
  const currentUserId = auth?.currentUser?.uid;

  return (
    <div className="w-[95%] max-w-5xl mx-auto bg-gradient-to-br from-[#2d9270] to-[#36c9a2] 
                    shadow-lg border border-green-400 rounded-2xl p-8 mt-10"> 
      {/* ⬆️ Added "mt-16" to create space below the navbar */}

      <h3 className="text-center text-3xl font-bold text-white mb-6 tracking-wide">
        Dashboard
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Profile */}
        <button
          className="flex items-center justify-center space-x-3 p-5 bg-white text-[#2d9270] 
                     rounded-lg shadow-md hover:scale-105 transform transition duration-300"
          onClick={() => navigate(`/profile/${currentUserId}`)}
        >
          <FaUser className="text-xl" />
          <span className="font-semibold">My Profile</span>
        </button>

        {/* Friends */}
        <button
          className="flex items-center justify-center space-x-3 p-5 bg-white text-[#1e8a63] 
                     rounded-lg shadow-md hover:scale-105 transform transition duration-300"
          onClick={() => navigate("/friends")}
        >
          <FaUsers className="text-xl" />
          <span className="font-semibold">Available Groups</span>
        </button>

        {/* Chat */}
        <button
          className="flex items-center justify-center space-x-3 p-5 bg-white text-[#555555] 
                     rounded-lg shadow-md hover:scale-105 transform transition duration-300"
                     onClick={() => navigate("/chats")}

        >
          <FaComments className="text-xl" />
          <span className="font-semibold">Chat</span>
        </button>

        {/* Groups */}
        <button
          className="flex items-center justify-center space-x-3 p-5 bg-white text-[#d87a14] 
                     rounded-lg shadow-md hover:scale-105 transform transition duration-300"
          onClick={() => alert("Groups feature coming soon!")}
        >
          <FaLayerGroup className="text-xl" />
          <span className="font-semibold">My Group</span>
        </button>

        {/* Placeholder Button */}
        <button
          className="flex items-center justify-center space-x-3 p-5 bg-white text-[#333] col-span-2 
                     rounded-lg shadow-md hover:scale-105 transform transition duration-300"
          onClick={() => alert("Feature coming soon!")}
        >
          <FaCog className="text-xl text-[#36b36e]" />
          <span className="font-semibold">Coming Soon</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
