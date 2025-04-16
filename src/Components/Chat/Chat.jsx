import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { AuthContext } from "../AppContext/AppContext";

const Chat = () => {
  const { chatId, chatType } = useParams();
  const { user, userData } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatPartner, setChatPartner] = useState(null);
  const bottomRef = useRef();

  const messagesCollection =
    chatType === "group"
      ? "groupMessages"
      : chatType === "admin-group"
      ? "adminGroupMessages"
      : "messages";

  useEffect(() => {
    const chatRef = collection(db, messagesCollection, chatId, "chats");

    const createChatIfNotExists = async () => {
      const chatDocRef = doc(db, messagesCollection, chatId);
      const docSnap = await getDoc(chatDocRef);
      if (!docSnap.exists()) {
        const members =
          chatType === "group"
            ? (await getDoc(doc(db, "groups", chatId))).data().members
            : chatId.split("_");

        await setDoc(chatDocRef, {
          createdAt: serverTimestamp(),
          members,
        });
      }
    };

    createChatIfNotExists();

    const q = query(chatRef, orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(loadedMessages);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId, chatType, messagesCollection]);

  // Fetch private chat partner info
  useEffect(() => {
    const loadPartner = async () => {
      if (chatType === "private") {
        const [uid1, uid2] = chatId.split("_");
        const otherUID = uid1 === user.uid ? uid2 : uid1;
        const userDoc = await getDoc(doc(db, "users", otherUID));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setChatPartner({
            name: data.name || "Unknown User",
            image: data.image || data.photoURL || "/default-avatar.png",
          });
        }
      }
    };
    loadPartner();
  }, [chatId, chatType, user.uid]);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      await addDoc(collection(db, messagesCollection, chatId, "chats"), {
        text: newMessage,
        uid: user.uid,
        displayName: user.displayName || userData?.name || "Unknown",
        photoURL: user.photoURL || userData?.image || "/default-avatar.png",
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {chatType === "group"
            ? "Group Chat"
            : chatType === "admin-group"
            ? "Admin ↔ Group Chat"
            : "Private Chat"}
        </h2>
        {chatType === "private" && chatPartner && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">{chatPartner.name}</span>
            <img
              src={chatPartner.image}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 bg-gray-100 p-4 rounded">
        {messages.map((msg) => {
          const isSelf = msg.uid === user.uid;
          return (
            <div
              key={msg.id}
              className={`mb-4 flex items-start ${isSelf ? "justify-end" : "justify-start"}`}
            >
              {!isSelf && (
                <img
                  src={msg.photoURL || "/default-avatar.png"}
                  alt={msg.displayName}
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}

              <div className="max-w-xs">
                <p className={`text-xs mb-1 ${isSelf ? "text-black-800 text-right" : "text-gray-700"}`}>
                  {msg.displayName}
                </p>
                <div
                  className={`p-2 rounded shadow ${
                    isSelf
                      ? "bg-gray-700 text-white rounded-tr-none"
                      : "bg-white text-black rounded-tl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>

              {isSelf && (
                <img
                  src={msg.photoURL || "/default-avatar.png"}
                  alt={msg.displayName}
                  className="w-8 h-8 rounded-full ml-2"
                />
              )}
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="flex">
        <input
          className="flex-1 border border-gray-300 rounded-l px-2 py-1"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-1 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;

