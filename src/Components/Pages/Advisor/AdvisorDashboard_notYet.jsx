import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { MdRequestPage, MdGroups, MdChat, MdNotificationsActive } from "react-icons/md";


const AdvisorDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="grid grid-cols-2 gap-6 w-[60%]">
        <Button
          className="p-6 bg-blue-500 text-white flex items-center justify-center space-x-2 rounded-lg shadow-lg hover:bg-blue-600"
          onClick={() => navigate("/advisor/requests")}
        >
          <MdRequestPage className="text-3xl" />
          <span>Requests</span>
        </Button>

        <Button
          className="p-6 bg-green-500 text-white flex items-center justify-center space-x-2 rounded-lg shadow-lg hover:bg-green-600"
          onClick={() => navigate("/advisor/groups")}
        >
          <MdGroups className="text-3xl" />
          <span>Groups</span>
        </Button>

        <Button
          className="p-6 bg-purple-500 text-white flex items-center justify-center space-x-2 rounded-lg shadow-lg hover:bg-purple-600"
          onClick={() => navigate("/advisor/notifications")}
        >
          <MdNotificationsActive className="text-3xl" />
          <span>Send Notifications</span>
        </Button>

        <Button
          className="p-6 bg-teal-500 text-white flex items-center justify-center space-x-2 rounded-lg shadow-lg hover:bg-teal-600"
          onClick={() => navigate("/advisor/chat")}
        >
          <MdChat className="text-3xl" />
          <span>Chat</span>
        </Button>
      </div>
    </div>
  );
};

export default AdvisorDashboard;
