import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import LeftSide from "../../LeftSidebar/LeftSide";
import RightSide from "../../RightSidebar/RightSide";
import Navbar from "../../Navbar/Navbar";
import { Avatar, Button } from "@material-tailwind/react";
import { AuthContext } from "../../AppContext/AppContext";

const defaultAvatar = "https://via.placeholder.com/50";

const FriendsList = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
        const fetchGroups = async () => {
        try {
        const groupsCollection = collection(db, "groups");
        const groupsSnapshot = await getDocs(groupsCollection);
        const availableGroups = groupsSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((group) => group.members.length < 3);
        setGroups(availableGroups);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchUsers();
    fetchGroups();
  }, []);

  const handleJoinGroup = async (group) => {
    try {
      // Check if the user is already a member
      const isAlreadyMember = group.members.some((member) => member.id === user.uid);
      if (isAlreadyMember) {
        alert("You are already a member of this group!");
        return;
      }

      // Ensure the group has members to receive the request
      if (group.members.length === 0) {
        alert("No members found in this group. Cannot send join request.");
        return;
      }

      // Send join request to the first member of the group
      const firstMember = group.members[0];
      await addDoc(collection(db, "groupJoinRequests"), {
        senderId: user.uid,
        senderName: user.displayName || "Unknown",
        receiverId: firstMember.id,
        receiverName: firstMember.name,
        status: "pending",
        groupId: group.id,
      });

      alert(`Join request sent to ${firstMember.name}!`);
    } catch (error) {
      console.error("Error sending join request:", error);
      alert("Failed to send join request.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex px-8 mt-12">
        <div className="flex-auto w-[18%] fixed top-12">
          <LeftSide />
        </div>

        <div className="flex-auto w-[60%] absolute left-[20%] top-14 bg-gray-100 rounded-xl p-6">
          <div className="w-[90%] mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-blue-500 mb-6 text-center">
              Available Groups (Not Full)
            </h2>
            {groups.length === 0 ? (
              <p className="text-center text-gray-500">No available groups</p>
            ) : (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.id} className="p-4 border-b rounded-lg shadow-sm bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-700">Group Members:</h3>
                    <div className="flex space-x-4 mt-2">
                      {group.members.map((member, index) => (
                        <div key={index} className="flex items-center">
                          <Avatar
                            src={member.image || defaultAvatar}
                            alt={member.name}
                            size="sm"
                            className="border shadow-md"
                          />
                          <p className="ml-2">{member.name}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      color="green"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleJoinGroup(group)}
                    >
                      Join Group
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* Available Members Section */}
          <div className="w-[90%] mx-auto bg-white p-6 rounded-lg shadow-lg mt-6">
            <h2 className="text-xl font-bold text-blue-500 mb-6 text-center">
              Available Members
            </h2>
            {users.length === 0 ? (
              <p className="text-center text-gray-500">No available members</p>
            ) : (
              <div className="space-y-4">
                {users
                  .filter((userItem) => 
                    userItem.uid !== user.uid &&             // Exclude current user
                    userItem.role === "student" &&           // Only students
                    !groups.some(group => group.members.some(member => member.id === userItem.uid))  // Exclude members in any group
                  )
                  
                  .map((userItem) => (
                    <div
                      key={userItem.uid}
                      className="flex items-center p-4 border-b hover:bg-gray-100 cursor-pointer rounded-lg"
                      onClick={() => navigate(`/profile/${userItem.uid}`)}
                    >
                      <Avatar
                        src={userItem.image || defaultAvatar}
                        alt={userItem.name}
                        size="md"
                        className="border shadow-md"
                      />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold">{userItem.name || "Unknown User"}</h3>
                        <p className="text-gray-500 text-sm">
                          {userItem.about
                            ? userItem.about.slice(0, 60) + "..."
                            : "No about info available"}
                        </p>
                        <p className="text-blue-500 text-xs">
                          {userItem.skills
                            ? `Skills: ${userItem.skills.join(", ")}`
                            : "No skills added"}
                        </p>
                      </div>
                    </div>
                  ))}

        </div>)}
        </div>
        </div>
        

        

        <div className="flex-auto w-[18%] fixed right-0 top-12">
          <RightSide />
        </div>
      </div>
    </div>
  );
};

export default FriendsList;
