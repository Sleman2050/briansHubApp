import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../AppContext/AppContext";
import { Button } from "@material-tailwind/react";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const RightSide = () => {
  const { user } = useContext(AuthContext);
  const [joinRequests, setJoinRequests] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      const fetchJoinRequests = async () => {
        const joinQuery = query(collection(db, "groupJoinRequests"));
        const joinSnapshot = await getDocs(joinQuery);
        const joinList = joinSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((request) => request.receiverId === user.uid);

        setJoinRequests(joinList);
      };

      fetchJoinRequests();
    }
  }, [user?.uid]);

  const acceptJoinRequest = async (request) => {
    try {
      const groupRef = doc(db, "groups", request.groupId);
      const groupSnapshot = await getDoc(groupRef);
  
      if (!groupSnapshot.exists()) {
        alert("Group not found.");
        return;
      }
  
      const groupData = groupSnapshot.data();
      let members = groupData.members || [];
  
      if (members.some((m) => m.id === request.senderId)) {
        alert(`${request.senderName} is already a member.`);
        await deleteDoc(doc(db, "groupJoinRequests", request.id));
        setJoinRequests((prev) => prev.filter((req) => req.id !== request.id));
        return;
      }
  
      if (members.length >= 3) {
        alert("The group is already full.");
        return;
      }
  
      const updatedMembers = [...members, { id: request.senderId, name: request.senderName }];
      await updateDoc(groupRef, { members: updatedMembers, isFull: updatedMembers.length === 3 });
  
      // Update groupMessages with new member
      const groupChatRef = doc(db, "groupMessages", request.groupId);
      const chatSnapshot = await getDoc(groupChatRef);
      if (chatSnapshot.exists()) {
        const chatData = chatSnapshot.data();
        const updatedChatMembers = [...chatData.members, { id: request.senderId, name: request.senderName }];
        await updateDoc(groupChatRef, { members: updatedChatMembers });
      }
  
      await deleteDoc(doc(db, "groupJoinRequests", request.id));
      setJoinRequests((prev) => prev.filter((req) => req.id !== request.id));
  
      alert(`${request.senderName} has been added to the group!`);
    } catch (error) {
      console.error("Error accepting join request:", error);
      alert("Failed to accept the request.");
    }
  };
  

  return (
    <div className="w-[95%] max-w-[300px] bg-gradient-to-br from-[#2d9270] to-[#36c9a2] 
                    text-white shadow-lg rounded-xl p-6 mt-16">
      <h2 className="text-xl font-bold text-center border-b pb-2 mb-4">🔔 Notifications</h2>

      {joinRequests.length === 0 ? (
        <p className="text-gray-200 text-center">No new requests</p>
      ) : (
        joinRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white text-gray-800 flex items-center justify-between p-3 rounded-lg mb-3 shadow-md"
          >
            <p className="font-semibold">{request.senderName} wants to join your group</p>
            <Button
              onClick={() => acceptJoinRequest(request)}
              size="sm"
              className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-all"
            >
              ✅ Accept
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export default RightSide;
