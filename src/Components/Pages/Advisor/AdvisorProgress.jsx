import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, getDoc, where, collection, query, getDocs } from "firebase/firestore";
import { Card, Typography } from "@material-tailwind/react";

const CURRENT_SEMESTER = "semester1"; // Change this from Admin panel later

const AdvisorProgress = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [semesterTasks, setSemesterTasks] = useState([]);

  useEffect(() => {
    const fetchGroup = async () => {
      const docRef = doc(db, "groups", groupId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setGroup({...snap.data()});
      }
      setLoading(false);
    };

    const fetchSemesterTasks = async () => {
      const q = query(collection(db, "semesterTasks"), where("semester", "==", "semester1"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data(); // extracting data from the first element of the array snapshot, the data is the tasks
        setSemesterTasks(data.tasks || []); 
      }
    };

    fetchSemesterTasks();
    fetchGroup();
  }, [groupId]);

  if (loading) return <div className="p-6">Loading group progress...</div>;

  const tasks = group?.progress?.[CURRENT_SEMESTER] || {};

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">
        Group Progress – {group?.name || {}}
      </h2>

      <div className="bg-white p-6 rounded shadow">
        <h4 className="text-lg font-semibold mb-4 text-customCyan">
          Tasks for {CURRENT_SEMESTER}
        </h4>

        {Object.keys(tasks).length === 0 ? (
          <p className="text-gray-600">No tasks uploaded yet.</p>
        ) : (
          <div className="grid gap-6">
            {Object.entries(tasks).map(([taskKey, taskData]) => {
              const uploadedDate = taskData.uploadedAt?.toDate instanceof Function
                ? taskData.uploadedAt.toDate()
                : new Date(taskData.uploadedAt);
              const taskIndex = parseInt(taskKey.replace("task", "")) - 1;

              return (
                <Card key={taskKey} className="p-4 border border-gray-200 shadow-sm">
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                     {taskKey+ " - "+semesterTasks[taskIndex].name}
                  </Typography>
                  {taskData.fileUrl ? (
                    <div className="flex justify-between items-center">
                      <a
                        href={taskData.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        View Uploaded File
                      </a>
                      <Typography variant="small" color="gray">
                        Uploaded on: {uploadedDate.toLocaleString()}
                      </Typography>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No file uploaded for this task.</p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisorProgress;
