import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography
} from "@material-tailwind/react";
import { db } from "../../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";

const AdminSemesterTasks = () => {
  const [semester, setSemester] = useState("semester1");
  const [numTasks, setNumTasks] = useState(4);
  const [taskNames, setTaskNames] = useState(["", "", "", ""]);
  const [saving, setSaving] = useState(false);

  const handleChangeTaskName = (index, value) => {
    const updated = [...taskNames];
    updated[index] = value;
    setTaskNames(updated);
  };

  const handleSubmit = async () => {
    if (!semester || taskNames.some((t) => !t.trim())) {
      alert("Please fill all task names.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "semesterTasks"), {
        semester,
        tasks: taskNames.map((name) => ({ name })),
      });
      alert("Tasks saved successfully!");
    } catch (err) {
      console.error("Error saving tasks:", err);
      alert("Failed to save tasks.");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card className="p-6 border border-gray-300 shadow">
        <Typography variant="h5" className="text-xl font-bold mb-4 text-black">
          📚 Define Semester Tasks
        </Typography>

        <div className="mb-4">
          <Input
            label="Semester Name (e.g. semester1)"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <Input
            label="Number of Tasks"
            type="number"
            value={numTasks}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setNumTasks(val);
              setTaskNames(Array(val).fill(""));
            }}
          />
        </div>

        {taskNames.map((task, index) => (
          <div key={index} className="mb-2">
            <Input
              label={`Task ${index + 1} Name`}
              value={task}
              onChange={(e) => handleChangeTaskName(index, e.target.value)}
            />
          </div>
        ))}

        <Button
          onClick={handleSubmit}
          color="teal"
          className="mt-4"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Tasks"}
        </Button>
      </Card>
    </div>
  );
};

export default AdminSemesterTasks;
