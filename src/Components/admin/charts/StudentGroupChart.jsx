import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const StudentGroupChart = () => {
  const [studentGroupData, setStudentGroupData] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      let withGroup = 0;
      let withoutGroup = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "student") {
          if (data.isJoined) {
            withGroup++;
          } else {
            withoutGroup++;
          }
        }
      });

      setStudentGroupData([
        { name: "In Group", value: withGroup },
        { name: "Not in Group", value: withoutGroup },
      ]);
    };

    fetchStudents();
  }, []);

  const COLORS = ["#10B981", "#EF4444"]; // green, red

  return (
    <div className="bg-white shadow p-4 rounded-lg">
      <h2 className="text-md font-semibold mb-4 text-center">
        🎓 Students In vs Not In Groups
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={studentGroupData}
            dataKey="value"
            nameKey="name"
            outerRadius={70}
            label
          >
            {studentGroupData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentGroupChart;
