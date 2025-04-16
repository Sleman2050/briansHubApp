import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

const AdvisorNotifications = () => {
  const [message, setMessage] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      const snapshot = await getDocs(collection(db, "groups"));
      const groupList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupList);
    };
    fetchGroups();
  }, []);

  const sendNotification = async () => {
    if (!message || !selectedGroup) {
      alert("Please enter a message and select a group.");
      return;
    }
    await addDoc(collection(db, "notifications"), {
      groupId: selectedGroup,
      message,
      timestamp: new Date(),
    });
    alert("Notification sent!");
    setMessage("");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Send Notifications</h2>
      <select
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
        className="w-full mb-4 p-2 border border-gray-300 rounded"
      >
        <option value="" >Select a group</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.groupName}
          </option>
        ))}
      </select>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message"
        className="w-full p-2 border border-gray-300 rounded mb-4"
        rows="4"
      />
      <button
        onClick={sendNotification}
        className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
      >
        🚀 Send Notification
      </button>
    </div>
  );
};

export default AdvisorNotifications;
