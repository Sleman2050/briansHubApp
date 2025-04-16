// src/pages/Advisor/AdvisorRequests.jsx

import React, { useContext, useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { AuthContext } from "../../AppContext/AppContext";
import {
  Card,
  Button,
  Typography,
  Avatar,
  Dialog,
} from "@material-tailwind/react";

const AdvisorRequests = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: For profile modal
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserPosts, setSelectedUserPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Query advisorRequests with advisorId == user.uid
        const reqSnap = await getDocs(
          query(collection(db, "advisorRequests"), where("advisorId", "==", user.uid))
        );

        const result = [];
        for (const reqDoc of reqSnap.docs) {
          const data = reqDoc.data();
          const groupSnap = await getDoc(doc(db, "groups", data.groupId));
          const groupData = groupSnap.exists() ? groupSnap.data() : {};

          result.push({
            id: reqDoc.id,
            ...data,
            groupData,
            members: groupData.members || [],
            status: data.status || "pending",
          });
        }

        setRequests(result);
        setLoading(false);
      } catch (err) {
        console.error("Error loading advisor requests:", err);
      }
    };

    fetchRequests();
  }, [user.uid]);

  // Approve / Reject request
  const handleAction = async (reqId, groupId, action, groupData) => {
    // 1) Update the request status
    await updateDoc(doc(db, "advisorRequests", reqId), {
      status: action,
    });

    if (action === "approved") {
      // 2) Retrieve the advisor doc from Firestore
      const advisorSnap = await getDocs(
        query(collection(db, "users"), where("uid", "==", user.uid))
      );
      if (advisorSnap.empty) {
        console.error("No Firestore user doc found for this advisor.");
        return;
      }

      const advisorDoc = advisorSnap.docs[0];
      const advisorData = advisorDoc.data();

      // 3) Assign advisor to the group, making sure name is not undefined
      await updateDoc(doc(db, "groups", groupId), {
        advisor: {
          id: advisorDoc.id,
          uid: advisorData.uid || user.uid,  // ensure a fallback
          name: advisorData.name || "No Name", 
          image: advisorData.image || "",
        },
      });

      // 4) Create advisor-group chat if it doesn’t exist
      const chatRef = doc(db, "advisorGroupMessages", groupId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          createdAt: serverTimestamp(),
          members: [...(groupData.members || []).map((m) => m.id), advisorDoc.id],
        });
      }
    }

    // 5) Update local state so the UI shows the new status
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: action } : r))
    );
  };

  // Handler when clicking on a member to view profile in a modal
  const handleMemberClick = async (memberUid) => {
    try {
      setShowModal(true);
      setLoadingUser(true);
      setSelectedUser(null);
      setSelectedUserPosts([]);

      // 1) Fetch user from "users"
      const userQ = query(collection(db, "users"), where("uid", "==", memberUid));
      const snapshot = await getDocs(userQ);
      if (!snapshot.empty) {
        setSelectedUser(snapshot.docs[0].data());
      }

      // 2) Fetch that user’s posts from "posts" (optional)
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

  if (loading) return <div className="p-6">Loading requests...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-[#0B5ED7] mb-6">Advisor Requests</h1>

      {requests.length === 0 ? (
        <p className="text-gray-600 text-center">No advisor requests found.</p>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <Card key={req.id} className="p-5 border shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-600">
                  Group: {req.groupData?.name || req.groupId}
                </h3>
                <span className="text-sm text-gray-600">
                  Status: <strong>{req.status}</strong>
                </span>
              </div>

              {/* Final Approved Idea (if any) */}
              {req.groupData?.finalIdea && (
                <div className="mb-3 p-3 bg-green-50 border border-green-300 rounded">
                  <Typography variant="small" className="text-green-800 font-medium">
                    Final Approved Idea:
                  </Typography>
                  <p className="text-sm text-gray-700">{req.groupData.finalIdea}</p>
                </div>
              )}

              <div className="mb-3">
                <h4 className="font-medium text-sm mb-1">Members:</h4>
                <div className="flex flex-wrap gap-4">
                  {req.members.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded border"
                      onClick={() => handleMemberClick(m.id)} // open modal
                    >
                      <Avatar src={m.image || "/default-avatar.png"} size="sm" />
                      <span className="text-sm">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  color="green"
                  onClick={() =>
                    handleAction(req.id, req.groupId, "approved", req.groupData)
                  }
                  disabled={req.status !== "pending"}
                >
                  Approve
                </Button>
                <Button
                  color="red"
                  onClick={() =>
                    handleAction(req.id, req.groupId, "rejected", req.groupData)
                  }
                  disabled={req.status !== "pending"}
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ---------- MODAL FOR USER PROFILE ---------- */}
      <Dialog
        open={showModal}
        handler={() => setShowModal(false)}
        size="md"
        className="overflow-y-auto"
      >
        <div className="p-6 relative">
          {/* Close Button */}
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
              {/* Profile Header */}
              <div className="flex items-center space-x-4">
                <Avatar
                  src={selectedUser.image || "/default-avatar.png"}
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

              {/* Info Section */}
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

              {/* Posts Section */}
              <div className="mt-4 space-y-2">
                <h4 className="text-lg font-semibold mb-2">Posts</h4>
                {selectedUserPosts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No posts available.</p>
                ) : (
                  selectedUserPosts.map((post) => (
                    <div
                      key={post.id}
                      className="border rounded px-3 py-2 text-sm bg-gray-50 shadow-sm"
                    >
                      <p className="font-semibold text-blue-600">
                        {post.name}
                      </p>
                      <p>{post.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-red-500 py-8">
              User not found.
            </p>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default AdvisorRequests;
