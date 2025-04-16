import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@material-tailwind/react";

const AdminGroupIdeas = () => {
  const [groups, setGroups] = useState([]);
  const [selectedIdeas, setSelectedIdeas] = useState({}); // groupId -> selected idea numbers
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserPosts, setSelectedUserPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      const snapshot = await getDocs(collection(db, "groups"));
      const groupList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setGroups(groupList);
    };

    fetchGroups();
  }, []);

  const handleSelect = (groupId, ideaNum) => {
    setSelectedIdeas((prev) => {
      const current = prev[groupId] || [];
      const isSelected = current.includes(ideaNum);
      return {
        ...prev,
        [groupId]: isSelected
          ? current.filter((n) => n !== ideaNum)
          : [...current, ideaNum],
      };
    });
  };

  const handleApprove = async (groupId, ideas) => {
    const selected = selectedIdeas[groupId];
    if (!selected || selected.length === 0) {
      alert("Please select at least one idea to approve.");
      return;
    }

    const sorted = [...selected].sort(); // Ensures lowest-numbered is chosen
    const finalIdea = ideas[`idea${sorted[0]}`];

    await updateDoc(doc(db, "groups", groupId), {
      finalIdea,
    });

    alert("Final idea approved!");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Approve Group Ideas
      </h2>

      {groups.map((group) =>
        group.ideas ? (
          <div
            key={group.id}
            className="mb-6 border rounded-lg p-4 shadow-sm bg-white"
          >
            {/* Display Group Name or Fall Back to ID */}
            <h3 className="text-lg mb-2">
  {/* Label */}
  <span className="font-semibold text-gray-700">Group Name:</span>

  {/* Actual Group Name */}
  <span className="ml-2 text-xl text-teal-800 font-bold">
    {group.name ? group.name : group.id}
  </span>
</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {Object.entries(group.ideas).map(([key, value], idx) => (
                <div
                  key={key}
                  className={`p-3 rounded border ${
                    selectedIdeas[group.id]?.includes(idx + 1)
                      ? "bg-green-100 border-green-500"
                      : "bg-gray-50"
                  }`}
                  onClick={() => handleSelect(group.id, idx + 1)}
                >
                  <strong>{key.toUpperCase()}:</strong>
                  <p>{value}</p>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Group Members:</h4>
              <div className="flex gap-4 flex-wrap">
                {group.members?.map((member, idx) => (
                  <div
                    key={idx}
                    onClick={async () => {
                      const uid = member.id;
                      setShowModal(true);
                      setLoadingUser(true);
                      setSelectedUser(null);
                      setSelectedUserPosts([]);

                      try {
                        // Fetch user
                        const userQ = query(
                          collection(db, "users"),
                          where("uid", "==", uid)
                        );
                        const snapshot = await getDocs(userQ);
                        if (!snapshot.empty) {
                          setSelectedUser(snapshot.docs[0].data());
                        }

                        // Fetch posts
                        const postQ = query(
                          collection(db, "posts"),
                          where("uid", "==", uid)
                        );
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
                    }}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded border"
                  >
                    <img
                      src={member.image || "https://via.placeholder.com/40"}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="font-medium">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleApprove(group.id, group.ideas)}
              className="px-4 py-2 mt-3 bg-teal-700 text-white rounded"
            >
              Approve Selected
            </button>
          </div>
        ) : null
      )}

      <Dialog open={showModal} handler={() => setShowModal(false)} size="md">
        <div className="p-6 relative max-h-[90vh] overflow-y-auto">
          {/* ❌ Close Button */}
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
          >
            &times;
          </button>

          {/* 🔄 Loading State */}
          {loadingUser ? (
            <p className="text-center text-gray-500 py-8">Loading profile...</p>
          ) : selectedUser ? (
            <div className="space-y-4">
              {/* Profile Header */}
              <div className="flex items-center space-x-4">
                <img
                  src={selectedUser.image || "https://via.placeholder.com/80"}
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-full border"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedUser.name}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {selectedUser.uid}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <strong>Email:</strong>{" "}
                  {selectedUser.email || "Not available"}
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  {selectedUser.phone || "Not available"}
                </p>
                <p>
                  <strong>Speciality:</strong>{" "}
                  {selectedUser.speciality || "N/A"}
                </p>
                <p>
                  <strong>About:</strong> {selectedUser.about || "N/A"}
                </p>
                <p>
                  <strong>Skills:</strong>{" "}
                  {selectedUser.skills?.join(", ") || "None listed"}
                </p>
                <p>
                  <strong>Experience:</strong>{" "}
                  {selectedUser.experience || "N/A"}
                </p>
              </div>

              {/* 📝 Posts Section */}
              <div className="mt-6 space-y-2">
                <h4 className="text-lg font-semibold mb-2">Posts</h4>
                {selectedUserPosts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No posts available.</p>
                ) : (
                  selectedUserPosts.map((post) => (
                    <div
                      key={post.id}
                      className="border rounded px-3 py-2 text-sm bg-gray-50 shadow-sm"
                    >
                      <p className="font-semibold text-blue-600">{post.name}</p>
                      <p>{post.text}</p>
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
    </div>
  );
};

export default AdminGroupIdeas;
