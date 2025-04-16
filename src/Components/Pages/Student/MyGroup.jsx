// src/pages/Student/MyGroup.jsx

import React, { useEffect, useState, useContext } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { AuthContext } from "../../AppContext/AppContext";
import { Avatar, Input, Button, Typography } from "@material-tailwind/react";
import { Navigate, useNavigate } from "react-router-dom";
import GroupProgressTracker from "./GroupProgressTracker";
import { onSnapshot } from "firebase/firestore";




const MyGroup = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  const { userData } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [ideas, setIdeas] = useState({
    idea1: "",
    idea2: "",
    idea3: "",
    idea4: "",
    idea5: "",
  });
  const [saving, setSaving] = useState(false);
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [semesterTasks, setSemesterTasks] = useState([]);

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/drofrhntv/upload";
  const UPLOAD_PRESET = "brainsHubUploudPresetName_2025";
  const uploadFileToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("resource_type", "auto");

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const handleUploadProgressFile = async (semester, task, file) => {
    if (!group?.id || !file) return;

    const fileUrl = await uploadFileToCloudinary(file);
    const groupRef = doc(db, "groups", group.id);

    await updateDoc(groupRef, {
      [`progress.${semester}.${task}`]: {
        fileUrl,
        uploadedAt: new Date().toISOString(),
      },
    });

    alert(`✅ Uploaded ${task} of ${semester}`);
  };


  useEffect(() => {
    if (!userData) return;
  
    const q = query(
      collection(db, "groups"),
      where("members", "array-contains", {
        id: userData.uid,
        name: userData.name,
        image: userData.image || "",
      })
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const docData = doc.data();
  
        setGroup({ id: doc.id, ...docData });
  
        if (docData.ideas) setIdeas(docData.ideas);
        if (docData.name) setGroupName(docData.name);
      }
    });
  
    // ✅ Cleanup listener when component unmounts
    return () => unsubscribe();
  }, [userData]);

  useEffect(() => {
    const loadAdvisors = async () => {
      const q = query(collection(db, "users"), where("role", "==", "advisor"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        docId: doc.id,
        uid: doc.data().uid,
        name: doc.data().name,
        image: doc.data().image || "/default-avatar.png",
      }));
      setAdvisors(list);
    };

    const fetchSemesterTasks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "semesterTasks"));
        const tasksList = snapshot.docs.map((doc) => doc.data());
        setSemesterTasks(tasksList);
      } catch (error) {
        console.error("Error fetching semester tasks:", error);
      }
    };
  
    fetchSemesterTasks();

    loadAdvisors();
  }, []);

  const handleChange = (e) => {
    setIdeas((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveIdeas = async () => {
    if (!group?.id) return;
    setSaving(true);
    await updateDoc(doc(db, "groups", group.id), {
      ideas: { ...ideas },
    });
    setGroup(prev => ({
      ...prev,
      ideas: { ...ideas },
    }));
    setSaving(false);
    alert("Ideas submitted successfully.");
  };

  const handleSendAdvisorRequest = async () => {
    if (!selectedAdvisor || !group?.id) return;
  
    const selected = advisors.find((a) => a.docId === selectedAdvisor);
    if (!selected) return;
  
    const requestRef = doc(collection(db, "advisorRequests"));
    await setDoc(requestRef, {
      advisorId: selected.uid,  // now storing the advisor's UID
      groupId: group.id,
      groupName: group.name || "Unnamed Group",
      status: "pending",
      timestamp: serverTimestamp(),
    });
  
    alert("Advisor request sent successfully.");
    setSelectedAdvisor("");
  };
  

  const handleSaveGroupName = async () => {
    if (!group?.id || !groupName.trim()) return;
    setNameSaving(true);
    await updateDoc(doc(db, "groups", group.id), {
      name: groupName.trim(),
    });
    setGroup((prev) => ({ ...prev, name: groupName.trim() }));
    setNameSaving(false);
    alert("Group name saved.");
  };

  const getCurrentStep = () => {
    if (!group) return 0;
    if (group.advisor) return 4; // Supervision Approved
    if (group.finalIdea) return 3; // Finding Supervisor
    if (group.status === "approved") return 2; // Admin approved
    if (group.ideas && Object.values(group.ideas).some(val => val.trim() !== "")) return 1; // Ideas sent
    return 0; // Searching
  };
  

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {group?.name && (
          <p className="text-center text-lg text-teal-700 mb-6 font-bold">
            <span className="font-medium text-gray-800">Group Name:</span> {group.name}
          </p>
        )}

{group && (!group.name || group.name.trim() === "") && (
  <div className=" p-4 rounded mb-6">
    <p className="mb-2 font-medium text-teal-800">
      Please enter your group name:
    </p>
    <input
      type="text"
      value={groupName}
      onChange={(e) => setGroupName(e.target.value)}
      className="border border-teal-700 p-2 rounded w-full mb-2 focus:outline-none focus:border-teal-700"
    />
   
                <Button
          variant="gradient"
          fullWidth
          className="mb-4 flex items-center justify-center"
          color="teal"
      onClick={handleSaveGroupName}
      disabled={nameSaving || !groupName.trim()}
    >
      {nameSaving ? "Saving..." : "Save Group Name"}
    </Button>
  </div>
)}


        {group && <GroupProgressTracker currentStep={getCurrentStep()} />}

        {group ? (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <Typography variant="h6" className="mb-3">Group Members</Typography>
              <div className="flex gap-4 flex-wrap">
                {group.members.map((member, index) => (
                  <div key={index} className="flex items-center space-x-2 border p-2 rounded">
                    <Avatar src={member.image || "/default-avatar.png"} size="sm" />
                    <span>{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
  <Typography variant="h6" className="mb-3">Advisor</Typography>
  {group ? (
    group.advisor ? (
      // If the group already has an advisor, show the advisor info.
      <p className="text-gray-700 font-bold text-xl" >
        {group.advisor.name}
        <Button
          size="sm"
          color="teal"
          className="ml-3"
          onClick={() => navigate(`/chat/${group.id}/advisor-group`)}
        >
          Chat with Group
        </Button>
      </p>
    ) : group.finalIdea ? (
      // If no advisor yet and finalIdea exists, show advisor selection.
      <div>
        <p className="text-yellow-600 mb-2">No advisor assigned yet.</p>
        <select
          value={selectedAdvisor}
          onChange={(e) => setSelectedAdvisor(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Select an advisor</option>
          {advisors.map((a) => (
            <option key={a.docId} value={a.docId}>
              {a.name}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          color="blue"
          className="ml-3"
          onClick={handleSendAdvisorRequest}
          disabled={!selectedAdvisor}
        >
          Send Request
        </Button>
      </div>
    ) : (
      // If group data is loaded but finalIdea isn't set, show this message.
      <p className="text-red-600">
        You cannot select an advisor until you submit all 5 ideas and get your final idea approved by admin.
      </p>
    )
  ) : (
    // If group is not loaded yet, you can optionally show a loading message.
    <p>Loading group data...</p>
  )}
</div>


            {group.finalIdea && (
              <div className="mb-6 p-4 bg-green-50 border border-teal-300 rounded">
                <h4 className="font-semibold text-teal-800">Final Approved Idea:</h4>
                <p className="mt-1">{group.finalIdea}</p>
              </div>
            )}

            {!group.finalIdea && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <Typography variant="h6" className="mb-4">Submit Project Ideas</Typography>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="mb-3">
                    <Input
                      label={`Idea ${n}`}
                      name={`idea${n}`}
                      value={ideas[`idea${n}`]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
                <Button color="green" onClick={handleSaveIdeas} disabled={saving}>
                  {saving ? "Saving..." : "Save Ideas"}
                </Button>
              </div>
            )}

            {/* Track Progress */}
            {semesterTasks.length > 0 && (
              <div className="bg-white shadow-md rounded-xl p-6 mt-10">
             <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
  <span className="text-2xl">📁</span> Deliverables – {semesterTasks[0]?.semester || "N/A"}
</h3>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {semesterTasks[0].tasks.map((task, index) => {
                    const semester = semesterTasks[0].semester;
                    const taskKey = `task${index + 1}`;
                    const taskProgress = group?.progress?.[semester]?.[taskKey];

                    return (
                      <div key={taskKey} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                        <p className="font-semibold text-gray-800 mb-2">
                          {task.name || `Task ${index + 1}`}
                        </p>

                        {taskProgress?.fileUrl ? (
  <div className="bg-white border border-teal-600 rounded-lg p-3 shadow-sm space-y-2">
    <p className="text-sm text-gray-700 font-semibold">
      ✅ File Uploaded
    </p>
    <a
 href={`${taskProgress.fileUrl}?fl_attachment=true`}

  download
  className="text-teal-700 underline hover:text-teal-900 text-sm font-medium"
>
  Download File
</a>

    <p className="text-xs text-gray-500 italic">
      Uploaded on:{" "}
      {new Date(taskProgress.uploadedAt).toLocaleString()}
    </p>
  </div>
                        ) : <div className="relative w-full">
                        <input
                          type="file"
                          accept=".pdf,.ppt,.pptx"
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          onChange={(e) =>
                            handleUploadProgressFile(semester, taskKey, e.target.files[0])
                          }
                        />
                        <div className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded shadow text-center transition-colors z-0">
                          📁 Upload File
                        </div>
                      </div>
                      }
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <p>You are not currently part of any group.</p>
        )}
      </div>
    </div>
  );
};

export default MyGroup;
