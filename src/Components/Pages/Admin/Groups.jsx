import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { AuthContext } from "../../AppContext/AppContext";
import { Button, Card, Typography, Avatar } from "@material-tailwind/react";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const snapshot = await getDocs(collection(db, "groups"));
        const groupList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(groupList);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGroup(null);
  };

  const handleAdminGroupChat = async (group) => {
    try {
      const chatRef = doc(db, "adminGroupMessages", group.id);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          createdAt: serverTimestamp(),
          members: [...(group.members || []).map((m) => m.id), user.uid],
        });
      }
      navigate(`/chat/${group.id}/admin-group`);
    } catch (error) {
      console.error("Error starting admin group chat:", error);
    }
  };

  // Compute status text based on group's data:
  // 1. If group has fewer than 5 non-empty ideas => "Group just created"
  // 2. If 5 ideas exist but finalIdea is missing => "Need final idea approval"
  // 3. If finalIdea exists but no advisor assigned => "Need advisor"
  // 4. If an advisor is assigned => "Under work"
  const getStatusText = (group) => {
    if (!group) return "Group just created";

    // Count non-empty ideas.
    const ideaValues =
      group.ideas && typeof group.ideas === "object"
        ? Object.values(group.ideas).filter(
            (idea) => idea && idea.trim() !== ""
          )
        : [];
    if (ideaValues.length < 5) {
      return "Group just created";
    } else if (!group.finalIdea || !group.finalIdea.trim()) {
      return "Need final idea approval";
    } else if (!group.advisor) {
      return "Need advisor";
    } else {
      return "Under work";
    }
  };

  const statusText = selectedGroup ? getStatusText(selectedGroup) : "";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Groups Management</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border border-gray-300 text-gray-700">Group Name</th>
              <th className="p-3 border border-gray-300 text-gray-700">Is Full?</th>
              <th className="p-3 border border-gray-300 text-gray-700">Members Count</th>
              <th className="p-3 border border-gray-300 text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr
                key={group.id}
                className="text-center hover:bg-gray-100 transition"
              >
                <td
                  className="p-3 border border-gray-300 cursor-pointer text-gray-700 hover:underline"
                  onClick={() => handleGroupClick(group)}
                >
                  {group.name ?? group.id}
                </td>
                <td className="p-3 border border-gray-300">
                  {group.isFull ? "✅ Yes" : "❌ No"}
                </td>
                <td className="p-3 border border-gray-300">
                  {group.members?.length || 0}
                </td>
                <td className="p-3 border border-gray-300">
                  <Button color="teal" onClick={() => handleAdminGroupChat(group)}>
                    Chat With Group
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Group Details */}
      {showModal && selectedGroup && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={handleCloseModal}
        >
          <Card
            className="w-11/12 max-w-3xl p-6 relative bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h4" className="text-gray-800 mb-4">
              {selectedGroup.name ?? "Group Details"}
            </Typography>

            {/* Group ID */}
            <div className="mb-4">
              <Typography variant="small" className="text-gray-600">
                <strong>Group ID:</strong> {selectedGroup.id}
              </Typography>
            </div>

            {/* Advisor Section and Chat Button */}
            {selectedGroup.advisor && selectedGroup.advisor.name && (
              <div className="mb-4">
                <Typography variant="small" className="font-medium text-gray-700">
                  Advisor:
                </Typography>
                <div className="flex items-center space-x-2 mt-1">
                  <Typography variant="small" className="text-gray-800">
                    {selectedGroup.advisor.name}
                  </Typography>
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={async () => {
                      try {
                        const currentUserId = user.uid;
                        const advisorId = selectedGroup.advisor.id;
                        const chatId = [currentUserId, advisorId].sort().join("_");
                        const chatRef = doc(db, "messages", chatId);
                        const chatSnap = await getDoc(chatRef);
                        if (!chatSnap.exists()) {
                          await setDoc(chatRef, {
                            participants: [currentUserId, advisorId],
                            createdAt: serverTimestamp(),
                          });
                        }
                        navigate(`/chat/${chatId}/private`);
                      } catch (error) {
                        console.error("Error starting chat with advisor:", error);
                      }
                    }}
                  >
                    CHAT WITH ADVISOR
                  </Button>
                </div>
              </div>
            )}

            {/* Status as Text */}
            <div className="mb-4">
              <Typography variant="small" className="font-medium text-gray-700">
                Status:
              </Typography>
              <Typography variant="small" className="text-gray-800 mt-1">
                {statusText}
              </Typography>
            </div>

            {/* Members */}
            <div className="mb-4">
              <Typography variant="small" className="font-medium text-gray-700">
                Members:
              </Typography>
              {selectedGroup.members && selectedGroup.members.length > 0 ? (
                <div className="flex flex-wrap gap-4 mt-2">
                  {selectedGroup.members.map((m, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Avatar src={m.image || "/default-avatar.png"} size="sm" />
                      <span className="text-sm text-gray-700">
                        {m.name || `Member ${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <Typography variant="small" className="text-gray-500">
                  No members found.
                </Typography>
              )}
            </div>

            {/* Final Approved Idea */}
            {selectedGroup.finalIdea && (
              <div className="mb-4 bg-green-50 border border-green-200 p-3 rounded">
                <Typography variant="small" className="font-medium text-green-900">
                  Final Approved Idea:
                </Typography>
                <Typography variant="small" className="text-gray-800 mt-1">
                  {selectedGroup.finalIdea}
                </Typography>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-3 mt-6">
              <Button color="gray" onClick={handleCloseModal}>
                Close
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => {
                  handleCloseModal();
                  handleAdminGroupChat(selectedGroup);
                }}
              >
                Chat with Group
              </Button>
             
            </div>

            {/* Close (x) Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Groups;
