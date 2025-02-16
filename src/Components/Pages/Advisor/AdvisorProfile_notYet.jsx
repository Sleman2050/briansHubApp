import React, { useState, useEffect } from "react";
import { Avatar, Button } from "@material-tailwind/react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";

import { FiCamera } from "react-icons/fi";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/drofrhntv/image/upload";
const UPLOAD_PRESET = "brainsHubUploudPresetName_2025";

const AdvisorProfile = () => {
  const [advisor, setAdvisor] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchAdvisorProfile = async () => {
      const q = query(collection(db, "users"), where("uid", "==", auth.currentUser?.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setAdvisor(snapshot.docs[0].data());
      }
    };
    fetchAdvisorProfile();
  }, []);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      const imageUrl = data.secure_url;

      const q = query(collection(db, "users"), where("uid", "==", auth.currentUser?.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        await updateDoc(doc(db, "users", userDoc.id), { image: imageUrl });
        setAdvisor((prev) => ({ ...prev, image: imageUrl }));
      }
      setUploading(false);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-[60%] bg-white p-6 rounded-lg shadow-lg text-center">
        <div className="relative inline-block group">
          <Avatar
            size="xxl"
            variant="circular"
            src={advisor.image || "https://via.placeholder.com/150"}
            alt="Advisor Avatar"
            className="border-4 border-gray-300 shadow-lg transition-all duration-300 hover:opacity-70"
          />
          <input
            type="file"
            id="avatarUpload"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <label
            htmlFor="avatarUpload"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-2/3 bg-black/60 p-3 rounded-full shadow-lg cursor-pointer group-hover:scale-110 transition-transform"
          >
            <FiCamera className="text-white text-2xl" />
          </label>
          <p className="text-sm text-gray-600 mt-4 group-hover:text-gray-800 transition">
            Click to change profile picture
          </p>
        </div>

        <h2 className="text-2xl font-bold mt-6">{advisor.name || "Advisor Name"}</h2>
        <p className="text-gray-600">{advisor.email || "Advisor Email"}</p>

        <div className="mt-6">
          <p className="text-gray-800">Speciality: {advisor.speciality || "Not specified"}</p>
          <p className="text-gray-800">Phone: {advisor.phone || "Not provided"}</p>
        </div>

        <Button className="mt-6 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
          Edit Profile
        </Button>
      </div>
    </div>
  );
};

export default AdvisorProfile;
