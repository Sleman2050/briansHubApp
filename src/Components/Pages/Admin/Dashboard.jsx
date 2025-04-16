// src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

import { motion } from "framer-motion";
import StudentGroupChart from "../../admin/charts/StudentGroupChart";


import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);
  const [roleData, setRoleData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [groupPieData, setGroupPieData] = useState([]);
  const [postsPerDayData, setPostsPerDayData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      setTotalUsers(usersSnap.size);

      const roleCounts = {};
      const dailyUsers = {};
      usersSnap.forEach((doc) => {
        const data = doc.data();
        const role = data.role || "unknown";
        roleCounts[role] = (roleCounts[role] || 0) + 1;

        const createdAt = data.createdAt?.toDate();
        if (createdAt) {
          const date = createdAt.toISOString().split("T")[0];
          dailyUsers[date] = (dailyUsers[date] || 0) + 1;
        }
      });

      setRoleData(
        Object.entries(roleCounts).map(([role, count]) => ({ role, count }))
      );
      setUserGrowthData(
        Object.entries(dailyUsers).map(([date, count]) => ({ date, count }))
      );

      const postsSnap = await getDocs(collection(db, "posts"));
      setTotalPosts(postsSnap.size);

      const dailyPosts = {};
      postsSnap.forEach((doc) => {
        const createdAt = doc.data().timestamp?.toDate();
        if (createdAt) {
          const date = createdAt.toISOString().split("T")[0];
          dailyPosts[date] = (dailyPosts[date] || 0) + 1;
        }
      });
      setPostsPerDayData(
        Object.entries(dailyPosts).map(([date, count]) => ({ date, count }))
      );

      const groupsSnap = await getDocs(collection(db, "groups"));
      setTotalGroups(groupsSnap.size);

      let full = 0,
        notFull = 0;
      groupsSnap.forEach((doc) => {
        const isFull = doc.data().isFull;
        isFull ? full++ : notFull++;
      });

      setGroupPieData([
        { name: "Full Groups", value: full },
        { name: "Not Full", value: notFull },
      ]);
    };

    fetchData();
  }, []);

  const pieColors = ["#6366F1", "#10B981"];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">📊 Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className="bg-white shadow p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-base font-semibold">👥 Users</h2>
          <p className="text-2xl text-blue-600">{totalUsers}</p>
        </motion.div>

        <motion.div
          className="bg-white shadow p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-base font-semibold">📝 Posts</h2>
          <p className="text-2xl text-green-600">{totalPosts}</p>
        </motion.div>

        <motion.div
          className="bg-white shadow p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-base font-semibold">👨‍👩‍👧‍👦 Groups</h2>
          <p className="text-2xl text-purple-600">{totalGroups}</p>
        </motion.div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white shadow p-4">
          <h2 className="text-base font-semibold mb-2">👤 Users by Role</h2>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={roleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow p-4">
          <h2 className="text-base font-semibold mb-2">
            📈 New Users Over Time
          </h2>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="count"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow p-4">
          <h2 className="text-base font-semibold mb-2">
            🥧 Groups: Full vs Not Full
          </h2>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={groupPieData}
                dataKey="value"
                nameKey="name"
                outerRadius={60}
                label
              >
                {groupPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <StudentGroupChart />
        </div>
        <div className="bg-white shadow p-4">
          <h2 className="text-base font-semibold mb-2">📆 Posts Per Day</h2>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={postsPerDayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
