// src/pages/Advisor/AdvisorGroups.jsx

import React, { useEffect, useState, useContext } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AppContext/AppContext";

const AdvisorGroups = () => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const q = query(collection(db, "groups"), where("advisorId", "==", user.uid));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setGroups(list);
      } catch (err) {
        console.error("Error fetching advisor groups:", err);
      }
    };

    fetchGroups();
  }, [user.uid]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#0B5ED7] mb-6">My Supervised Groups</h1>

      {groups.length === 0 ? (
        <p className="text-gray-500">You are not supervising any groups yet.</p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white p-5 rounded shadow">
              <h3 className="text-xl font-semibold mb-2">Group ID: {group.id}</h3>
              <p><strong>Final Idea:</strong> {group.idea || "Not decided yet"}</p>
              <p className="mt-2 font-semibold">Members:</p>
              <div className="flex flex-wrap gap-3 mt-1">
                {group.members?.map((member, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(`/admin/users/${member.id}`)}
                    className="text-blue-600 underline"
                  >
                    {member.name || "Unknown"}
                  </button>
                ))}
              </div>

              {/* Chat with Group */}
              <button
                onClick={() => navigate(`/chat/${group.id}/advisor-group`)}
                className="mt-4 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Chat With Group
              </button>

              {/* Progress Placeholder */}
              <div className="mt-4 bg-gray-100 p-3 rounded">
                <p className="font-medium">Project Progress:</p>
                <p className="text-sm text-gray-600">Milestones tracking coming soon...</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvisorGroups;
