// src/pages/FriendsList.jsx

import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where
} from "firebase/firestore";
import RightSide from "../../RightSidebar/RightSide";
import Navbar from "../../Navbar/Navbar";
import { Avatar, Button,Dialog } from "@material-tailwind/react";
import { AuthContext } from "../../AppContext/AppContext";

const defaultAvatar = "https://via.placeholder.com/80";

const FriendsList = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
    const { userData } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(""); // state for skill filter
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserPosts, setSelectedUserPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({
          uid: doc.data().uid,
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
      // Check if the user is already a member.
      const isAlreadyMember = group.members.some((member) => member.id === user.uid);
      if (isAlreadyMember) {
        alert("You are already a member of this group!");
        return;
      }

      // Check if a pending join request exists for this group.
      const joinRequestQuery = query(
        collection(db, "group_join_request"),
        where("groupId", "==", group.id),
        where("senderId", "==", user.uid),
        where("status", "==", "pending")
      );
      const joinRequestSnap = await getDocs(joinRequestQuery);
      if (!joinRequestSnap.empty) {
        alert("You have already sent a join request for this group. Please wait for approval.");
        return;
      }

      // Ensure there is at least one member in the group.
      if (group.members.length === 0) {
        alert("No members found in this group. Cannot send join request.");
        return;
      }

      // Send join request to the first member.
      const firstMember = group.members[0];
      await addDoc(collection(db, "groupJoinRequests"), {
        senderId: user.uid,
        senderName: userData.name || "Unknown",
        receiverId: firstMember.id,
        receiverName: firstMember.name,
        status: "pending",
        groupId: group.id,
        timestamp: new Date(),
      });

      // Create a notification for the receiver.
      await addDoc(collection(db, "notifications"), {
        type: "group_request",
        from: user.uid,
        senderName: userData.name || "Unknown",
        to: firstMember.id,
        message: `${userData.name || "Someone"} has requested to join your group.`,
        status: "unread",
        timestamp: new Date(),
      });

      alert(`Join request sent to ${firstMember.name}!`);
    } catch (error) {
      console.error("Error sending join request:", error);
      alert("Failed to send join request.");
    }
  };
  
  const handleMemberClick = async (memberUid) => {
    try {
      setShowModal(true);
      setLoadingUser(true);
      setSelectedUser(null);
      setSelectedUserPosts([]);

      const userQ = query(collection(db, "users"), where("uid", "==", memberUid));
      const snapshot = await getDocs(userQ);
      if (!snapshot.empty) {
        setSelectedUser(snapshot.docs[0].data());
      }

      const postQ = query(collection(db, "posts"), where("uid", "==", memberUid));
      const postSnap = await getDocs(postQ);
      const posts = postSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setSelectedUserPosts(posts);
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  // Precompute all user IDs in any group for filtering.
  const groupMemberIds = new Set(
    groups.flatMap((group) => group.members.map((member) => member.id))
  );

  // Get a unique list of skills from available members.
  const uniqueSkills = Array.from(
    new Set(
      users
        .filter((userItem) => userItem.role === "student")
        .flatMap((userItem) => (userItem.skills ? userItem.skills : []))
    )
  ).sort();

  // Filter available members based on the selected skill and group membership.
  const filteredUsers = users.filter(
       (userItem) =>
          userItem.uid !== user.uid &&
          userItem.role === "student" &&
          !groupMemberIds.has(userItem.uid) &&       // not already in a group
          userItem.isJoined !== true &&               // exclude anyone who has joined
          (selectedSkill === "" || 
            (userItem.skills && userItem.skills.includes(selectedSkill)))
      );

  return (
    <div className="w-full min-h-screen bg-gradient-to-tr from-white to-gray-100  pr-5">
      <Navbar />

      <div className="flex pt-20 px-8">
        <div className="flex-grow pb-8">
          {/* Groups Section */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-2xl font-extrabold text-teal-800 mb-4 text-center">
              Available Groups (Not Full)
            </h2>
            {groups.length === 0 ? (
              <p className="text-center text-gray-500">No available groups</p>
            ) : (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 bg-gray-50 rounded-lg hover:shadow transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Group Members:
                    </h3>
                    <div className="flex flex-wrap gap-3 pl-4">
                      {group.members.map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 px-2 py-1 bg-white shadow-sm rounded cursor-pointer"
                          onClick={() => handleMemberClick(member.id)}
                        >
    <Avatar
      src={member.image || defaultAvatar}
      alt={member.name}
      size="sm"
      className="border shadow-md"
    />
    <p className="text-gray-800 text-sm">{member.name}</p>
  </div>
))}

                    </div>
                    <div className="flex justify-end">
                      <Button
                        color="teal"
                        size="sm"
                        onClick={() => handleJoinGroup(group)}
                      >
                        Join Group
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          

          {/* Available Members Section */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-extrabold text-teal-800 mb-4 text-center">
              Available Members
            </h2>

            {/* Filter Controls */}
            <div className="mb-6 flex items-center justify-center space-x-4">
              <label htmlFor="skillFilter" className="text-md font-medium text-gray-700">
                Filter by Skill:
              </label>
              <select
                id="skillFilter"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">All Skills</option>
                {uniqueSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500">
                No available members with that skill
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUsers.map((userItem) => (
                  <div
                    key={userItem.uid}
                    className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-between transform transition hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
                    onClick={() => navigate(`/profile/${userItem.uid}`)}
                  >
                    <Avatar
                      src={userItem.image || defaultAvatar}
                      alt={userItem.name}
                      size="xl"
                      className="border shadow-md"
                    />
                    <h3 className="mt-4 text-center text-xl font-bold text-gray-800">
                      {userItem.name || "Unknown User"}
                    </h3>
                    <p className="mt-2 text-center text-gray-500 text-sm">
                      {userItem.about
                        ? userItem.about.slice(0, 60) +
                          (userItem.about.length > 60 ? "..." : "")
                        : "No about info available"}
                    </p>
                    <Button
                      size="sm"
                      className="mt-4 bg-gradient-to-r from-teal-400 to-teal-800 text-white hover:from-teal-500 hover:to-teal-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${userItem.uid}`);
                      }}
                    >
                      Show Profile
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Profile Modal */}
        <Dialog
            open={showModal}
            handler={() => setShowModal(false)}
            size="md"
            className="overflow-y-auto"
          >
            <div className="p-6 relative">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
              >
                &times;
              </button>

              {loadingUser ? (
                <p className="text-center text-gray-500 py-8">
                  Loading profile...
                </p>
              ) : selectedUser ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar
                      src={selectedUser.image || defaultAvatar}
                      alt={selectedUser.name || "User"}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {selectedUser.name || "No Name"}
                      </h3>
                      <p className="text-sm text-gray-500">UID: {selectedUser.uid}</p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Email:</strong> {selectedUser.email || "Not available"}</p>
                    <p><strong>Phone:</strong> {selectedUser.phone || "N/A"}</p>
                    <p><strong>Speciality:</strong> {selectedUser.speciality || "N/A"}</p>
                    <p><strong>About:</strong> {selectedUser.about || "N/A"}</p>
                    <p><strong>Skills:</strong> {selectedUser.skills?.join(", ") || "None listed"}</p>
                    <p><strong>Experience:</strong> {selectedUser.experience || "N/A"}</p>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-2">Posts</h4>
                    {selectedUserPosts.length === 0 ? (
                      <p className="text-gray-500 text-sm">No posts available.</p>
                    ) : (
                      selectedUserPosts.map((post) => (
                        <div
                          key={post.id}
                          className="border rounded px-3 py-2 text-sm bg-gray-50 shadow-sm mb-2"
                        >
                          <p className="text-sm text-gray-800">{post.text || "No content."}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-red-500 py-8">User not found.</p>
              )}
            </div>
          </Dialog>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-[18%]">
          <RightSide />
        </div>
      </div>
    </div>
  );
};

export default FriendsList;
