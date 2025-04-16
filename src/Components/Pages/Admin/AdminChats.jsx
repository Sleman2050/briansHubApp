// src/Components/Pages/Admin/AdminChats.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { AuthContext } from "../../AppContext/AppContext";
import { Link } from "react-router-dom";

const AdminChats = () => {
  const { userData } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.uid) return;

    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, where("members", "array-contains", userData.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatRooms = [];

      // We’ll fetch user data for each chat in parallel
      const fetchPromises = snapshot.docs.map(async (docSnap) => {
        const chatData = docSnap.data();
        const chatId = docSnap.id;

        // If this is a 2-member private chat
        if (chatData.members?.length === 2) {
          // Find the other user (non-admin) in the members array
          const otherUID = chatData.members.find((m) => m !== userData.uid);

          // Fetch the other user's doc from Firestore
          if (otherUID) {
            const userDocRef = doc(db, "users", otherUID);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const otherUserData = userDocSnap.data();
              return {
                id: chatId,
                ...chatData,
                isPrivate: true,
                otherUser: {
                  uid: otherUID,
                  name: otherUserData.name || "Unknown User",
                  image: otherUserData.image || "/default-avatar.png",
                },
              };
            }
          }
        }

        // If not a 2-member chat (e.g., group chat) or no otherUID found
        return {
          id: chatId,
          ...chatData,
          isPrivate: false,
        };
      });

      // Wait for all fetches to finish
      const results = await Promise.all(fetchPromises);
      setChats(results);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  if (loading) {
    return (
      <div className="p-6 text-lg">
        Loading Admin Chat Rooms...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Chat Rooms</h2>
      <p className="text-gray-500">
        Below is a list of your active private chats. Click <strong>Open Chat</strong> to continue the conversation.
      </p>

      {chats.length === 0 ? (
        <p className="text-gray-600 mt-4">No chats found.</p>
      ) : (
        <ul className="space-y-4">
          {chats.map((chat) => (
            <li
              key={chat.id}
              className="bg-white shadow-lg rounded p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between"
            >
              {chat.isPrivate && chat.otherUser ? (
                <div className="mb-4 sm:mb-0 flex items-center">
                  <img
                    src={chat.otherUser.image}
                    alt={chat.otherUser.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{chat.otherUser.name}</h3>
                    <p className="text-gray-600 text-sm">
                      UID: {chat.otherUser.uid}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-xl font-semibold">Chat ID: {chat.id}</h3>
                  <p className="text-gray-600 mt-1">
                    {chat.members && <span>Members: {chat.members.join(", ")}</span>}
                  </p>
                </div>
              )}

              {/* Link to the existing Chat route (assumes nested under /admin/chat/private) */}
              <Link
                to={`/admin/chat/private/${chat.id}`}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded"
              >
                Open Chat
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminChats;
