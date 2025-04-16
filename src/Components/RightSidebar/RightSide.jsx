// src/RightSidebar/RightSide.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  FaHome,
  FaUser,
  FaUsers,
  FaComments,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import brainsHubLogo from "../../assets/images/brainsHubLogo.png";
import { AuthContext } from "../AppContext/AppContext";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const RightSide = () => {
  const navigate = useNavigate();
  const { signOutUser, userData } = useContext(AuthContext);
  const currentUserId = auth?.currentUser?.uid;

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchUnread = async () => {
      let count = 0;

      // Private Chat
      const messagesQuery = query(
        collection(db, "messages"),
        where("members", "array-contains", currentUserId)
      );
      const privateSnapshot = await getDocs(messagesQuery);

      for (const docSnap of privateSnapshot.docs) {
        const chatId = docSnap.id;
        const messagesRef = collection(db, "messages", chatId, "chats");

        const q = query(messagesRef);
        const messagesSnap = await getDocs(q);

        const readDoc = await getDocs(
          query(
            collection(db, "chatReads"),
            where("chatId", "==", chatId),
            where("uid", "==", currentUserId)
          )
        );

        let lastReadTime = 0;
        if (!readDoc.empty) {
          lastReadTime = readDoc.docs[0].data()?.lastRead?.toMillis() || 0;
        }

        messagesSnap.forEach((msgDoc) => {
          const msg = msgDoc.data();
          if (
            msg.uid !== currentUserId &&
            msg.timestamp?.toMillis() > lastReadTime
          ) {
            count++;
          }
        });
      }

      // Group Chat
      const groupQuery = query(collection(db, "groupMessages"));
      const groupSnapshot = await getDocs(groupQuery);

      for (const docSnap of groupSnapshot.docs) {
        const chatId = docSnap.id;
        const chatData = docSnap.data();

        if (!chatData.members?.includes(currentUserId)) continue;

        const messagesRef = collection(db, "groupMessages", chatId, "chats");
        const q = query(messagesRef);
        const messagesSnap = await getDocs(q);

        const readDoc = await getDocs(
          query(
            collection(db, "chatReads"),
            where("chatId", "==", chatId),
            where("uid", "==", currentUserId)
          )
        );

        let lastReadTime = 0;
        if (!readDoc.empty) {
          lastReadTime = readDoc.docs[0].data()?.lastRead?.toMillis() || 0;
        }

        messagesSnap.forEach((msgDoc) => {
          const msg = msgDoc.data();
          if (
            msg.uid !== currentUserId &&
            msg.timestamp?.toMillis() > lastReadTime
          ) {
            count++;
          }
        });
      }

      setUnreadCount(count);
    };

    fetchUnread();
  }, [currentUserId]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-[260px] bg-white border-l shadow-md flex flex-col justify-between py-6 px-4">
      {/* Logo */}
      <div className="flex items-center justify-center space-x-3">
        <img src={brainsHubLogo} alt="BrainsHub" className="h-12 w-auto" />
        <span className="text-gray-900 font-bold text-lg">BrainsHub</span>
      </div>

      {/* Nav */}
      <nav className="mt-8 flex-1">
        <ul className="space-y-4">
          {/* Home */}
          <li
            className="flex items-center space-x-3 p-3 rounded-md cursor-pointer hover:bg-gray-300"
            onClick={() => navigate("/home")}
          >
            <FaHome className="text-black-600 text-lg" />
            <span className="text-black-800 font-medium">Home</span>
          </li>

          {/* My Profile */}
          <li
            className="flex items-center space-x-3 p-3 rounded-md cursor-pointer hover:bg-gray-300"
            onClick={() => navigate(`/profile/${currentUserId}`)}
          >
            <FaUser className="text-black-600 text-lg" />
            <span className="text-black-800 font-medium">My Profile</span>
          </li>

          <li
  className="flex items-center space-x-3 p-3 rounded-md cursor-pointer hover:bg-gray-300"
  onClick={() => {
    if (userData?.role === "advisor") {
      navigate("/advisor/dashboard");
    } else {
      navigate("/my-group");
    }
  }}
>
  <FaUsers className="text-black-600 text-lg" />
  <span className="text-black-800 font-medium">
    {userData?.role === "advisor" ? "Advisor Dashboard" : "My Group"}
  </span>
</li>


          {/* Conditional Navigation Item for Friend List or Advisor Group Requests */}
          {userData?.role === "student" ? (
            <li
              className="flex items-center space-x-3 p-3 rounded-md cursor-pointer hover:bg-gray-300"
              onClick={() => navigate("/friends")}
            >
              <FaUsers className="text-black-600 text-lg" />
              <span className="text-black-800 font-medium">Available Groups</span>
            </li>
          ) : (
            <li
              className="flex items-center space-x-3 p-3 rounded-md cursor-pointer hover:bg-gray-300"
              onClick={() => navigate("/advisor/requests")}
            >
              <FaUsers className="text-black-600 text-lg" />
              <span className="text-black-800 font-medium">Group Requests</span>
            </li>
          )}

          {/* Chat */}
          <li
            className="flex items-center space-x-3 p-3 rounded-md cursor-pointer hover:bg-gray-300 relative"
            onClick={() => navigate("/chats")}
          >
            <FaComments className="text-black-600 text-lg" />
            <span className="text-black-800 font-medium">Chat</span>
            {unreadCount > 0 && (
              <span className="absolute right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </li>

          {/* For Advisors: Additional Nav Item */}
          {userData?.role === "advisor" && (
            <li
              className="flex items-center space-x-3 p-3 rounded-md cursor-pointer hover:bg-gray-300"
              onClick={() => navigate("/advisor/notifications")}
            >
              <FaCog className="text-black-600 text-lg" />
              <span className="text-black-800 font-medium">Send Notifications</span>
            </li>
          )}

             {/* For Advisors: Additional Nav Item */}
             {userData?.role === "student" && (
            <li
              className="flex items-center space-x-3 p-3 rounded-md cursor-pointer hover:bg-gray-300"
              onClick={() => navigate("/advisors")}
            >
              <FaCog className="text-black-600 text-lg" />
              <span className="text-black-800 font-medium">Advisors</span>
            </li>
          )}
        </ul>
        
      </nav>

      {/* Logout */}
      <div className="text-center mt-4">
        <button
          className="flex items-center justify-center w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default RightSide;
