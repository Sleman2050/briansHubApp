import React, { useContext } from "react";
import { Tooltip, Avatar } from "@material-tailwind/react";
import { AuthContext } from "../AppContext/AppContext";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";
import { MdSchool } from "react-icons/md"; // Blackboard Icon

const LeftSide = () => {
  const { userData } = useContext(AuthContext);

  // Extract URLs from Firestore
  const twitterUrl = userData?.urls?.[0] || null;
  const linkedinUrl = userData?.urls?.[1] || null;
  const githubUrl = userData?.urls?.[2] || null;
  const blackboardUrl = userData?.urls?.[3] || null;

  return (
    <div className="flex flex-col items-center h-screen bg-gradient-to-b from-[#2d9270] to-[#36c9a2] text-white shadow-lg rounded-r-xl p-6">
      {/* Profile Header with Background */}
      <div className="relative w-full h-36 bg-gradient-to-b from-gray-300 to-gray-100 rounded-xl shadow-md">
        {/* Large Profile Avatar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10">
          <Tooltip content="Profile" placement="top">
            <Avatar
              className="w-28 h-28 border-4 border-white shadow-md hover:scale-105 transition"
              src={userData?.image || "https://via.placeholder.com/150"}
            />
          </Tooltip>
        </div>
      </div>

      {/* User Info */}
      <div className="text-center mt-16">
        <h2 className="text-2xl font-bold">{userData?.name || "Unknown User"}</h2>
        <p className="text-sm text-gray-200">
          {userData?.speciality ? userData.speciality : "Speciality not listed"}
        </p>
        <p className="text-sm font-semibold text-yellow-300 mt-1">
          {userData?.role ? userData.role : "No Role Assigned"}
        </p>
      </div>

      {/* Social Media Links */}
      <div className="flex space-x-6 mt-6">
        {twitterUrl && (
          <Tooltip content="Twitter">
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
              <FaTwitter className="text-white text-3xl hover:text-blue-400 transition" />
            </a>
          </Tooltip>
        )}
        {linkedinUrl && (
          <Tooltip content="LinkedIn">
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="text-white text-3xl hover:text-blue-500 transition" />
            </a>
          </Tooltip>
        )}
        {githubUrl && (
          <Tooltip content="GitHub">
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              <FaGithub className="text-white text-3xl hover:text-gray-300 transition" />
            </a>
          </Tooltip>
        )}
        {blackboardUrl && (
          <Tooltip content="Blackboard">
            <a href={blackboardUrl} target="_blank" rel="noopener noreferrer">
              <MdSchool className="text-white text-3xl hover:text-yellow-400 transition" />
            </a>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default LeftSide;
