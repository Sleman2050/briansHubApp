import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

const AdvisorChat = () => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      const snapshot = await getDocs(collection(db, "chats"));
      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatLog(chats);
    };
    fetchChats();
  }, []);

  const sendMessage = async () => {
    if (!message) {
      alert("Please enter a message");
      return;
    }
    await addDoc(collection(db, "chats"), {
      sender: "Advisor",
      message,
      timestamp: new Date(),
    });
    setMessage("");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Advisor Chat</h2>
      <div className="mb-4 h-60 overflow-y-scroll border p-4 bg-white">
        {chatLog.map((chat) => (
          <div key={chat.id} className="mb-2">
            <strong>{chat.sender}:</strong> {chat.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="w-full mb-2 p-2 border border-gray-300 rounded"
      />
      <button
        onClick={sendMessage}
        className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
      >
        ➡️ Send Message
      </button>
    </div>
  );
};

export default AdvisorChat;
