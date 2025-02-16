import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

const AdvisorRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const snapshot = await getDocs(collection(db, "advisorRequests"));
      const requestsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(requestsList);
    };
    fetchRequests();
  }, []);

  const handleRequest = async (id, status) => {
    const requestRef = doc(db, "advisorRequests", id);
    await updateDoc(requestRef, { status });
    if (status === "accepted") {
      alert("Request accepted!");
    } else {
      alert("Request rejected!");
      await deleteDoc(requestRef);
    }
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Advisor Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-600">No pending requests.</p>
      ) : (
        requests.map((request) => (
          <div key={request.id} className="border p-4 mb-3 bg-white shadow-md rounded-lg">
            <p><strong>Group:</strong> {request.groupName}</p>
            <p><strong>Status:</strong> {request.status}</p>
            {request.status === "pending" && (
              <div className="flex gap-4 mt-3">
                <button
                  onClick={() => handleRequest(request.id, "accepted")}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  ✅ Accept
                </button>
                <button
                  onClick={() => handleRequest(request.id, "rejected")}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AdvisorRequests;
