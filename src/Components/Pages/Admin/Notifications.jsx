// src/pages/Notifications.js
import React, { useState, useContext } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { AuthContext } from "../../AppContext/AppContext";

const Notifications = () => {
  // حالة النماذج
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // استرجاع بيانات المستخدم من الـ Context
  const { user, userData } = useContext(AuthContext);

  // دالة التعامل مع إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    setLoading(true);

    try {
      // إضافة المستند مباشرة إلى مجموعة "notifications"
      await addDoc(collection(db, "notifications"), {
        title: title.trim(),
        message: message.trim(),
        targetRole: targetRole.trim(),
        timestamp: serverTimestamp(), // وقت الإرسال يتم تحديده تلقائيًا
        status: "unread", // حالة الإشعار كبداية (غير مقروء)
        type: "general", // يمكن تعديلها أو إضافة أنواع أخرى للإشعارات
        createdBy: user?.uid || "unknown",
        createdByName: userData?.name || "Unknown",
      });

      // إعادة تعيين الحقول عند نجاح العملية
      setTitle("");
      setMessage("");
      setTargetRole("all");
      setStatus("✅ Notification saved successfully!");
    } catch (error) {
      console.error("Error saving notification:", error);
      setStatus("❌ Failed to save notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6">📣 Create Notification</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* حقل العنوان */}
        <div>
          <label htmlFor="notification-title" className="block font-semibold mb-1">
            Title
          </label>
          <input
            id="notification-title"
            type="text"
            placeholder="Enter notification title"
            className="w-full border border-gray-300 p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* حقل الرسالة */}
        <div>
          <label htmlFor="notification-message" className="block font-semibold mb-1">
            Message
          </label>
          <textarea
            id="notification-message"
            placeholder="Enter notification message"
            className="w-full border border-gray-300 p-2 rounded"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>

        {/* حقل الدور المستهدف */}
        <div>
          <label htmlFor="notification-target-role" className="block font-semibold mb-1">
            Target Role
          </label>
          <select
            id="notification-target-role"
            className="w-full border border-gray-300 p-2 rounded"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="student">Students</option>
            <option value="advisor">Advisors</option>
          </select>
        </div>

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={loading}
          className={`bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Saving..." : "Send Notification"}
        </button>
      </form>

      {/* عرض رسالة الحالة */}
      {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
    </div>
  );
};

export default Notifications;
