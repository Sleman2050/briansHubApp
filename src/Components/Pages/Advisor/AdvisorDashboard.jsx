// src/pages/Advisor/AdvisorDashboard.jsx

import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../AppContext/AppContext";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { Button, Card, Typography, Avatar } from "@material-tailwind/react";

const AdvisorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdvisorGroups = async () => {
      const advisorSnap = await getDocs(
        query(collection(db, "users"), where("uid", "==", user.uid))
      );
      if (advisorSnap.empty) return;
      const advisorDocId = advisorSnap.docs[0].id;

      const allGroupsSnap = await getDocs(collection(db, "groups"));
      // Iterating through all groups document and create a new array object contains all the DOCUMENTS
      const Allgroups = allGroupsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      // Filtering the groups we accessed to come with the groups that contains the advisorID.
      const advisorGroups = Allgroups.filter((group) => group.advisor?.id === advisorDocId);

      setGroups(advisorGroups);
    };

    fetchAdvisorGroups();
  }, [user.uid]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 border-b pb-2">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Advisor Dashboard</h1>

</div>


      {groups.length === 0 ? (
        <p className="text-gray-600 text-center">You have no assigned groups yet.</p>
      ) : (
        <div className="grid gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="p-6 shadow-lg border border-gray-300 rounded">
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h5" className="text-blue-600">
                  Group Name: {group.name}
                </Typography>
                <Typography variant="small" color="gray">
                  Members: {group.members?.length}
                </Typography>
              </div>

              
              <div className="mb-4">
                <Typography variant="small" className="font-medium">Members:</Typography>
                <div className="flex flex-wrap gap-4 mt-2">
                  {group.members?.map((m, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Avatar src={m.image || "/default-avatar.png"} size="sm" />
                      <span className="text-sm">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Idea */}
              {group.finalIdea && (
                <div className="mb-4 bg-green-50 border border-green-300 p-3 rounded">
                  <strong className="text-green-800">Final Approved Idea:</strong>
                  <p className="text-sm text-gray-800 mt-1">{group.finalIdea}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 mt-4">
                <Button
                  color="blue"
                  onClick={() => navigate(`/chat/${group.id}/advisor-group`)}
                >
                  Chat with Group
                </Button>

                <Button
                  color="gray"
                  onClick={() => navigate(`/advisor/progress/${group.id}`)}
                >
                  Track Progress
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvisorDashboard;
