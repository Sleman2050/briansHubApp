// d7db108c-c6f6-4aa3-bc7a-73efcfefa133.jsx

import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../AppContext/AppContext";
import { FaUserCircle, FaBell, FaEnvelope } from "react-icons/fa";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  updateDoc,
  addDoc,
  doc,
  or,
} from "firebase/firestore";

const Navbar = () => {
  const { userData } = useContext(AuthContext);
  console.log("✅ Logged in user UID:", userData?.uid);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  // Fetch real-time notifications for this user
  useEffect(() => {
    if (!userData?.uid || !userData?.role) return;

    const notifQuery = query(
      collection(db, "notifications"),
      or(
        where("to", "==", userData.uid),
        where("targetRole", "in", ["all", userData.role])
      )
    );

    const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
      const allNotifications = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Filter join requests so that only those meant for the current user are shown.
      const filteredNotifications = allNotifications.filter((notif) => {
        if (notif.type === "group_join_request") {
          return notif.to === userData.uid;
        }
        return true;
      });

      setNotifications(filteredNotifications);
    });

    return () => unsubscribe();
  }, [userData?.uid, userData?.role]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  // Accept handler – updated to mark both users as joined
  const handleAcceptRequest = async (notif) => {
    try {
      // Get sender user info from users collection
      const senderQuery = query(
        collection(db, "users"),
        where("uid", "==", notif.from)
      );
      const senderSnapshot = await getDocs(senderQuery);
      const senderData = senderSnapshot.docs[0]?.data();

      const sender = {
        id: notif.from,
        name: senderData?.name || "Unknown",
        image: senderData?.image || "",
      };

      // Check if current user already has a group by querying groups
      const groupQuery = query(
        collection(db, "groups"),
        where("members", "array-contains", {
          id: userData.uid,
          name: userData.name,
          image: userData.image || "",
        })
      );
      const snapshot = await getDocs(groupQuery);

      if (!snapshot.empty) {
        // Add sender to existing group if not already present
        const groupDoc = snapshot.docs[0];
        const groupRef = doc(db, "groups", groupDoc.id);
        const currentMembers = groupDoc.data().members || [];

        const alreadyExists = currentMembers.some((m) => m.id === notif.from);
        if (!alreadyExists) {
          await updateDoc(groupRef, {
            members: [...currentMembers, sender],
          });
        }
      } else {
        // No group exists — create one with both current user and sender
        await addDoc(collection(db, "groups"), {
          members: [
            {
              id: userData.uid,
              name: userData.name,
              image: userData.image || "",
            },
            sender,
          ],
          // Optionally, store a separate field for member IDs
          memberIds: [userData.uid, notif.from],
        });
      }

      // Update notification status
      await updateDoc(doc(db, "notifications", notif.id), {
        status: "accepted",
      });

      // Now update both the current user and the sender in Firestore to mark them as joined
      const currentUserQuery = query(
        collection(db, "users"),
        where("uid", "==", userData.uid)
      );
      const currentUserSnap = await getDocs(currentUserQuery);
      if (!currentUserSnap.empty) {
        const currentUserDocId = currentUserSnap.docs[0].id;
        await updateDoc(doc(db, "users", currentUserDocId), {
          isJoined: true,
        });
      }

      const senderQuery2 = query(
        collection(db, "users"),
        where("uid", "==", notif.from)
      );
      const senderSnap = await getDocs(senderQuery2);
      if (!senderSnap.empty) {
        const senderDocId = senderSnap.docs[0].id;
        await updateDoc(doc(db, "users", senderDocId), {
          isJoined: true,
        });
      }
    } catch (err) {
      console.error("Error accepting group request:", err);
    }
  };

  // Decline handler remains unchanged
  const handleDeclineRequest = async (notifId) => {
    await updateDoc(doc(db, "notifications", notifId), {
      status: "declined",
    });
  };

  return (
    <div className="fixed top-0 left-0 w-[82.8%] bg-white shadow-md border-b border-gray-300 z-50 flex justify-between px-10 h-[8%]">
      <div className="w-[100%] flex justify-between items-center px-6 py-3">
        {/* Left Side – User Info */}
        <div className="flex items-center space-x-1 px-4 py-2">
          <FaUserCircle className="text-black-900 text-l" />
          <span className="text-black-800 font-semibold text-lg pr-10">
            Hello {userData?.name || "Unknown User"}
          </span>

          <div className="flex items-center space-x-6 -ml-10">
            <div className="relative" ref={dropdownRef}>
              <button
                className="relative bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition"
                onClick={async () => {
                  setShowDropdown((prev) => !prev);
                  // Mark all unread notifications as read
                  if (!showDropdown) {
                    const unread = notifications.filter(
                      (n) => n.status === "unread"
                    );
                    for (const notif of unread) {
                      const notifRef = doc(db, "notifications", notif.id);
                      await updateDoc(notifRef, { status: "read" });
                    }
                  }
                }}
              >
                <FaBell className="text-black-700 text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-2 font-semibold border-b text-sm">
                    Notifications
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 text-sm hover:bg-gray-100 border-b"
                      >
                        <p className="font-medium">{notif.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            notif.timestamp?.toDate()
                          ).toLocaleString()}
                        </p>

                        {/* Show buttons only for group requests that are still pending */}
                        {notif.type === "group_request" &&
                          notif.status !== "accepted" &&
                          notif.status !== "declined" && (
                            <div className="mt-2 flex space-x-2">
                              <button
                                className="text-white bg-teal-600 px-2 py-1 text-xs rounded"
                                onClick={() => handleAcceptRequest(notif)}
                              >
                                Accept
                              </button>
                              <button
                                className="text-white bg-red-400 px-2 py-1 text-xs rounded"
                                onClick={() => handleDeclineRequest(notif.id)}
                              >
                                Decline
                              </button>
                            </div>
                          )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition">
              <FaEnvelope className="text-black-700 text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
