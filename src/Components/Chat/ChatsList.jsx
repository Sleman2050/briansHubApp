import React, { useState, useEffect, useContext } from 'react';
import { db } from '../firebase/firebase';
import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { AuthContext } from '../AppContext/AppContext';
import { Link } from 'react-router-dom';

const ChatsList = () => {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;

      const chatList = [];

      try {
        // Group Chats
        const groupSnapshot = await getDocs(collection(db, 'groupMessages'));
        for (const docSnap of groupSnapshot.docs) {
          const chatData = docSnap.data();
          if (chatData.members?.includes(user.uid)) {
            chatList.push({
              id: docSnap.id,
              type: 'group',
              members: chatData.members || [],
            });
          }
        }

        // Admin-Group Chats
        const adminGroupSnapshot = await getDocs(collection(db, 'adminGroupMessages'));
        for (const docSnap of adminGroupSnapshot.docs) {
          const chatData = docSnap.data();
          if (chatData.members?.includes(user.uid)) {
            chatList.push({
              id: docSnap.id,
              type: 'admin-group',
              members: chatData.members || [],
            });
          }
        }

        // Private Chats
        const privateSnapshot = await getDocs(collection(db, 'messages'));
        for (const docSnap of privateSnapshot.docs) {
          const chatData = docSnap.data();
          if (chatData.members?.includes(user.uid) && chatData.members.length === 2) {
            const otherUID = chatData.members.find((m) => m !== user.uid);

            let otherUser = {
              uid: otherUID,
              name: "Unknown User",
              image: "/default-avatar.png",
            };

            if (otherUID) {
              const q = query(collection(db, "users"), where("uid", "==", otherUID));
              const snapshot = await getDocs(q);
              if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                otherUser.name = data.name || "Unknown User";
                otherUser.image = data.image || data.photoURL || "/default-avatar.png";
              }
            }

            chatList.push({
              id: docSnap.id,
              type: 'private',
              otherUser,
            });
          }
        }

        setChats(chatList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, [user]);

  if (loading) {
    return <div className="p-6 text-lg">Loading chats...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold">My Chat Rooms</h2>
      <p className="text-gray-500">
        Below is a list of your active chats. Click <strong>Open Chat</strong> to start messaging.
      </p>

      {chats.length === 0 ? (
        <p className="text-gray-600 mt-4">No chats found.</p>
      ) : (
        <ul className="space-y-4">
          {chats.map((chat) => {
            if (chat.type === 'private' && chat.otherUser) {
              return (
                <li
                  key={chat.id}
                  className="bg-white shadow-lg rounded p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between"
                >
                  <div className="mb-4 sm:mb-0 flex items-center">
                    <img
                      src={chat.otherUser.image}
                      alt={chat.otherUser.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{chat.otherUser.name}</h3>
                      <p className="text-gray-600 text-sm">UID: {chat.otherUser.uid}</p>
                    </div>
                  </div>

                  <Link
                    to={`/chat/${chat.id}/private`}
                      className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded"
                  >
                    Open Chat
                  </Link>
                </li>
              );
            }

            return (
              <li
                key={chat.id}
                className="bg-white shadow-lg rounded p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between"
              >
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-xl font-semibold">
                    {chat.type === 'group' ? 'Group Chat' : 'Admin ↔ Group Chat'}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Members: {chat.members?.length || 0}
                  </p>
                </div>

                <Link
                  to={`/chat/${chat.id}/${chat.type}`}
                     className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded"
                >
                  Open Chat
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ChatsList;
