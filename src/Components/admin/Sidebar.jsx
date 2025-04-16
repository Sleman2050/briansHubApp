import React,{useContext} from "react";
import { Link, useNavigate   } from "react-router-dom";
import {
  FaChartBar,
  FaUsers,
  FaLayerGroup,
  FaFileAlt,
  FaExclamationTriangle,
  FaBullhorn,
  FaComments,
  FaRobot,
  FaBell,
  FaWpforms,
  FaCog,
  FaSignOutAlt
  
} from "react-icons/fa";
import { AuthContext } from "../AppContext/AppContext";




const Sidebar = () => {


  const navigate = useNavigate();
  const { signOutUser } = useContext(AuthContext);
  const { userData } = useContext(AuthContext);

const handleLogout = async () => {
  try {
    await signOutUser();
    navigate("/login");
  } catch (error) {
    console.error("Error logging out:", error.message);
  }
};

  return (
    <div className="bg-white w-64 min-h-screen border-r flex flex-col">
      {/* Sidebar Header */}
      <div className="p-5 border-b bg-gray-100 flex items-center space-x-3 rounded-br-lg">
  <img
    src={userData?.image || "/default-avatar.png"}
    alt="User Avatar"
    className="w-12 h-12 rounded-full object-cover border border-gray-300"
  />
  <div>
    <p className="text-sm text-gray-500">Welcome</p>
    <h1 className="text-lg font-semibold text-gray-900">
      Dr. {userData?.name || "Admin"}
    </h1>
  </div>
</div>


      {/* Sidebar Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <SidebarItem icon={<FaChartBar />} text="Dashboard" link="/admin/dashboard" />
        <SidebarItem icon={<FaUsers />} text="Users" link="/admin/users" />
        <SidebarItem icon={<FaLayerGroup />} text="Groups" link="/admin/groups" />
        <SidebarItem icon={<FaFileAlt />} text="Posts" link="/admin/posts" />
        <SidebarItem icon={<FaExclamationTriangle />} text="Track Progress" link="/admin/tracker" />

        <SidebarItem icon={<FaComments />} text="Chat" link="/chats" />
        <SidebarItem icon={<FaRobot />} text="AI Assistant" link="/admin/ai" />
        <SidebarItem icon={<FaBell />} text="Notifications" link="/admin/notifications" />
        <SidebarItem icon={<FaWpforms />} text="Group Ideas Requests" link="/admin/group-ideas" />
        <SidebarItem icon={<FaWpforms />} text="Tasks" link="/admin/define-semester" />
        

    


             {/* Logout Button */}
             <div className="text-center mt-4">
              <button
                className="flex items-center justify-center w-full bg-gray-300 text-black-800 py-2 rounded-md hover:bg-gray-300 transition"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
      </nav>

      
    </div>
  );
};

const SidebarItem = ({ icon, text, link }) => {
  return (
    <Link
      to={link}
      className="flex items-center p-3 text-gray-900 rounded-lg hover:bg-gray-200 transition"
    >
      <span className="text-lg">{icon}</span>
      <span className="ml-3 text-sm">{text}</span>
    </Link>
  );
};

export default Sidebar;
