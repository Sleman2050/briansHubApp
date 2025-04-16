// src/pages/Admin/AdminTrackProgress.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  doc,
  getDoc,
} from "firebase/firestore";
import { Card, Typography, Select, Option } from "@material-tailwind/react";

const AdminTrackProgress = () => {
  const [groups, setGroups] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [semesters, setSemesters] = useState([]);
  const [semesterTasks, setSemesterTasks] = useState([]);

  // 🔹 Load all semesters
  useEffect(() => {
    const fetchSemesters = async () => {
      const snap = await getDocs(collection(db, "semesterTasks"));
      const options = snap.docs.map((doc) => ({
        id: doc.id,
        semester: doc.data().semester,
        tasks: doc.data().tasks,
      }));
      setSemesters(options);
    };

    fetchSemesters();
  }, []);

  // 🔹 Load groups after semester is selected
  useEffect(() => {
    const fetchGroups = async () => {
      if (!selectedSemester) return;

      const groupSnap = await getDocs(collection(db, "groups"));
      const groupList = groupSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupList);

      const semesterData = semesters.find((s) => s.semester === selectedSemester);
      setSemesterTasks(semesterData?.tasks || []);
    };

    fetchGroups();
  }, [selectedSemester, semesters]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Group Progress Tracker</h2>

      {/* Semester Selection */}
      <div className="mb-6 max-w-xs ">
        <Select
          label="Select Semester"
          value={selectedSemester}
          variant="outlined"
  color="gray"
  className="focus:outline-none focus:ring-0 "
          onChange={(val) => setSelectedSemester(val)}
        >
          {semesters.map((s) => (
            <Option key={s.id} value={s.semester}>
              {s.semester}
            </Option>
          ))}
        </Select>
      </div>

      {selectedSemester ? (
        groups.map((group) => {
          const progress = group?.progress?.[selectedSemester] || {};
          return (
            <Card key={group.id} className="mb-6 p-5 shadow-md">
              <Typography variant="h5" className="text-blue-700 mb-2">
              Group: {group.name || group.id}

              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {semesterTasks.map((task, idx) => {
                  const taskKey = `task${idx + 1}`;
                  const taskData = progress?.[taskKey] || {};

                  return (
                    <div key={taskKey} className="bg-gray-100 p-3 rounded border">
                      <Typography className="font-medium">{task.name || taskKey}</Typography>
                      {taskData?.fileUrl ? (
                        <div className="mt-1 text-sm text-gray-600">
                          <a
                            href={taskData.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View File
                          </a>
                          <p className="text-xs">
                            Uploaded:{" "}
                            {taskData.uploadedAt
                              ? new Date(taskData.uploadedAt).toLocaleString()
                              : "Unknown"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm mt-1">No file uploaded</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })
      ) : (
        <p className="text-gray-500 mt-4">Please select a semester to view progress.</p>
      )}
    </div>
  );
};

export default AdminTrackProgress;
