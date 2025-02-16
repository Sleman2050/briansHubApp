import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

const AdvisorGroups = () => {
  const [groups, setGroups] = useState([]);

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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Groups Under Your Supervision</h2>
      {groups.length === 0 ? (
        <p className="text-gray-600">No groups found.</p>
      ) : (
        <ul className="list-disc list-inside">
          {groups.map((group) => (
            <li key={group.id} className="mb-3 bg-gray-100 p-4 rounded shadow">
              🛠️ {group.groupName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdvisorGroups;
