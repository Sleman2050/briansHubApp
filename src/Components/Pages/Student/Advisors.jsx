// src/pages/Advisors/Advisors.jsx

import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/firebase"; // Adjust the path as necessary
import {
  Avatar,
  Button,
  Dialog,
  Typography
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

const Advisors = () => {
  // State for advisors list and loading indicator
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  // Modal state for detailed view
  const [showModal, setShowModal] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [loadingAdvisor, setLoadingAdvisor] = useState(false);
  // (Optional) state for advisor posts if needed
  const [advisorPosts, setAdvisorPosts] = useState([]);
  
  const navigate = useNavigate();

  // Fetch all advisors from Firestore where role == "advisor"
  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const advisorsQuery = query(
          collection(db, "users"),
          where("role", "==", "advisor")
        );
        const snapshot = await getDocs(advisorsQuery);
        const advisorsList = snapshot.docs.map((docSnap) => ({
          docId: docSnap.id,
          ...docSnap.data(), // uid, name, email, image, phone, speciality, department, officeHours, about, skills, experience, etc.
        }));
        setAdvisors(advisorsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching advisors: ", error);
        setLoading(false);
      }
    };

    fetchAdvisors();
  }, []);

  // Opens modal with advisor details
  const handleAdvisorClick = async (advisor) => {
    try {
      setShowModal(true);
      setLoadingAdvisor(true);
      setSelectedAdvisor(null);
      setAdvisorPosts([]); // If you want to load posts, you can use this state
      // Since all information is expected within the advisor doc, set it immediately.
      setSelectedAdvisor(advisor);

      const postQuery = query(
        collection(db, "posts"),
        where("uid", "==", advisor.uid)
      );
      const postSnapshot = await getDocs(postQuery);
      const posts = postSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setAdvisorPosts(posts);
      
    } catch (err) {
      console.error("Error loading advisor details:", err);
    } finally {
      setLoadingAdvisor(false);
    }
  };

  // Navigate to chat route with the selected advisor
  const handleChat = (advisor) => {
    // For example: navigate to a direct chat route using advisor uid.
    navigate(`/chat/${advisor.uid}/direct`);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Typography variant="h6">Loading advisors...</Typography>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Typography variant="h2" className="font-bold mb-4">
        All Advisors
      </Typography>

      {advisors.length === 0 ? (
        <Typography className="text-gray-600">No advisors found.</Typography>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advisors.map((advisor) => (
            <div
              key={advisor.docId}
              className="p-4 bg-white border rounded shadow flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all"
              onClick={() => handleAdvisorClick(advisor)}
            >
              <div className="flex items-center space-x-4">
                <Avatar
                  src={advisor.image || "/default-avatar.png"}
                  size="lg"
                />
                <div>
                  <Typography variant="paragraph" className="font-medium text-gray-700">
                    {advisor.name}
                  </Typography>
                  <Typography variant="small" className="text-gray-500">
                    {advisor.email}
                  </Typography>
                </div>
              </div>
              {/* Chat button on card; use stopPropagation to avoid triggering the modal open */}
              <Button
                color="teal"
                variant="filled"
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChat(advisor);
                }}
              >
                Chat
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Modal with detailed advisor info using Material Tailwind Dialog */}
      <Dialog
  open={showModal}
  handler={() => setShowModal(false)}
  size="md"
  className="overflow-y-auto"
>
  <div className="p-6 relative">
    {/* Close Button */}
    <button
      type="button"
      onClick={() => setShowModal(false)}
      className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
    >
      &times;
    </button>

    {loadingAdvisor ? (
      <Typography variant="paragraph" className="text-center text-gray-500 py-8">
        Loading advisor details...
      </Typography>
    ) : selectedAdvisor ? (
      <div className="space-y-4">
        {/* Profile header with large avatar */}
        <div className="flex items-center space-x-4">
          <Avatar
            src={selectedAdvisor.image || "/default-avatar.png"}
            alt={selectedAdvisor.name || "Advisor"}
            size="xl"
          />
          <div>
            <Typography variant="h3" className="font-bold text-gray-800">
              {selectedAdvisor.name || "No Name"}
            </Typography>
            <Typography variant="small" className="text-gray-500">
              UID: {selectedAdvisor.uid}
            </Typography>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <strong>Email:</strong> {selectedAdvisor.email || "Not available"}
          </p>
          <p>
            <strong>Phone:</strong> {selectedAdvisor.phone || "N/A"}
          </p>
          <p>
            <strong>Specialty:</strong> {selectedAdvisor.speciality || "N/A"}
          </p>
          <p>
            <strong>Department:</strong> {selectedAdvisor.department || "N/A"}
          </p>
          <p>
            <strong>Office Hours:</strong> {selectedAdvisor.officeHours || "N/A"}
          </p>
          <p>
            <strong>About:</strong> {selectedAdvisor.about || "N/A"}
          </p>
          <p>
            <strong>Skills:</strong>{" "}
            {selectedAdvisor.skills ? selectedAdvisor.skills.join(", ") : "None listed"}
          </p>
          <p>
            <strong>Experience:</strong> {selectedAdvisor.experience || "N/A"}
          </p>
        </div>

        {/* Enhanced Advisor Posts Section */}
        <div className="mt-4">
          <Typography variant="h4" className="font-semibold mb-2">
            Posts
          </Typography>
          {advisorPosts.length === 0 ? (
            <Typography variant="small" className="text-gray-500">
              No posts available.
            </Typography>
          ) : (
            advisorPosts.map((post) => (
              <div
                key={post.id}
                className="border rounded px-3 py-2 text-sm bg-gray-50 shadow-sm mb-2"
              >
                <Typography variant="small" className="text-gray-700">
                  {post.text || "No content available."}
                </Typography>
                {post.media && (
                  <img
                    src={post.media}
                    alt="Post media"
                    className="mt-2 max-h-60 w-full object-cover rounded"
                  />
                )}
                {post.timestamp && (
                  <Typography variant="small" className="text-gray-500 mt-1">
                    {new Date(post.timestamp.seconds * 1000).toLocaleString()}
                  </Typography>
                )}
              </div>
            ))
          )}
        </div>

        {/* Chat Button in Modal */}
        <Button
          color="teal"
          variant="filled"
          onClick={() => {
            setShowModal(false);
            handleChat(selectedAdvisor);
          }}
        >
          Chat with {selectedAdvisor.name}
        </Button>
      </div>
    ) : (
      <Typography variant="paragraph" className="text-center text-red-500 py-8">
        Advisor not found.
      </Typography>
    )}
  </div>
</Dialog>

    </div>
  );
};

export default Advisors;
