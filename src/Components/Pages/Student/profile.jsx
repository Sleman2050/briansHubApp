import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Avatar, Button, Input, Textarea } from "@material-tailwind/react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
  addDoc
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import LeftSide from "../../LeftSidebar/LeftSide";
import Navbar from "../../Navbar/Navbar";
import RightSide from "../../RightSidebar/RightSide";
import profilePic from "../../../assets/images/profilePic.jpg";
import avatar from "../../../assets/images/avatar.jpg";
import { FaTrashAlt } from "react-icons/fa";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";
import { MdPhone, MdBusinessCenter } from "react-icons/md"; // Speciality, Phone
import { HiLightningBolt, HiOutlineAnnotation } from "react-icons/hi"; // Skills, Interests
import { FiCamera } from "react-icons/fi"; // Camera icon for avatar upload
import { useNavigate } from 'react-router-dom';


// Cloudinary config
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/drofrhntv/image/upload";
const UPLOAD_PRESET = "brainsHubUploudPresetName_2025";


const FriendProfile = () => {
  const { id } = useParams();
  const currentUserId = auth?.currentUser?.uid;
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    speciality: "",
    about: "",
    skills: "",
    urls: "",
    projects: "",
    interests: "",
    experience: "",
  });

  useEffect(() => {
    const getUserProfile = () => {
      const q = query(collection(db, "users"), where("uid", "==", id));
      onSnapshot(q, (snapshot) => {
        const data = snapshot.docs[0]?.data() || null;
        setProfile(data);

        if (data) {
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            speciality: data.speciality || "",
            about: data.about || "",
            skills: (data.skills || []).join(", "),
            urls: (data.urls || []).join(", "),
            projects: (data.projects || []).join(", "),
            interests: (data.interests || []).join(", "),
            experience: data.experience || "",
          });
        }
      });
    };

    const getUserPosts = () => {
      const postQuery = query(collection(db, "posts"), where("uid", "==", id));
      onSnapshot(postQuery, (snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
      });
    };

    getUserProfile();
    getUserPosts();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle avatar image upload
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

      if (!response.ok) throw new Error("Cloudinary upload failed");

      const data = await response.json();
      const imageUrl = data.secure_url;

      if (!imageUrl) throw new Error("Image URL missing in Cloudinary response");

      const userQuery = query(collection(db, "users"), where("uid", "==", id));
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "users", userDoc.id), { image: imageUrl });

        // Update profile immediately
        setProfile((prev) => ({ ...prev, image: imageUrl }));
      }

      setUploading(false);
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
      alert("Failed to upload image. Please try again.");
    }
  };

  const handleSaveProfile = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(db, "users", userDoc.id);

        await updateDoc(userRef, {
          ...formData,
          skills: formData.skills.split(",").map((skill) => skill.trim()),
          urls: formData.urls.split(",").map((url) => url.trim()),
          projects: formData.projects.split(",").map((project) => project.trim()),
          interests: formData.interests.split(",").map((interest) => interest.trim()),
        });

        alert("Profile updated successfully!");
        setIsEditingProfile(false);
      } else {
        alert("No user document found for the provided UID.");
      }
    } catch (err) {
      console.error("Error updating profile:", err.message);
      alert("Failed to update profile.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, "posts", postId));
    }
  };

  const sendGroupRequest = async () => {
    if (!id || id === currentUserId) return;
    await addDoc(collection(db, "groupJoinRequests"), {
      senderId: currentUserId,
      senderName: auth?.currentUser?.displayName,
      receiverId: id,
      receiverName: profile?.name,
      status: "pending",
    });
    alert("Group request sent!");
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        {/* Left Sidebar */}
        <div className="flex-auto w-[20%] fixed top-12">
          <LeftSide />
        </div>

        {/* Profile & Posts Section */}
        <div className="flex-auto w-[60%] absolute left-[20%] top-14 p-6">
          <div className="w-[90%] mx-auto bg-gradient-to-b from-[#2d9270] to-[#36c9a2] p-8 rounded-lg shadow-lg text-white">
            {/* Profile Header */}
            <div className="relative w-full">
              <img
                className="h-48 w-full rounded-md object-cover"
                src={profilePic}
                alt="Profile Background"
              />
    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
  <label htmlFor="avatarUpload" className="relative cursor-pointer group">
    {/* Avatar Image */}
    <Avatar
      size="xxl"
      variant="circular"
      src={profile?.image || avatar}
      alt="Profile Avatar"
      className="border-4 border-white shadow-lg transition-all duration-300 hover:opacity-70"
    />

    {/* Improved Camera Icon - Below Avatar */}
    {id === currentUserId && (
      <>
        <input
          type="file"
          id="avatarUpload"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />

        {/* Camera Icon Below Avatar */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
                        bg-black/70 p-3 rounded-full shadow-xl group-hover:scale-110 
                        transition-transform duration-300 animate-bounce">
          <FiCamera className="text-white text-2xl" />
        </div>

        {/* Tooltip */}
        <div className="absolute top-[4.5rem] left-1/2 transform -translate-x-1/2 mt-1 
                        bg-gray-900 text-white text-sm px-3 py-1 rounded opacity-0 
                        group-hover:opacity-100 transition-opacity duration-300">
          Click to Change Avatar
        </div>
      </>
    )}
  </label>
</div>




            </div>

            {/* Profile Info */}
            <div className="text-center mt-14">
              <h2 className="text-4xl font-extrabold text-white">{profile?.name || "Unknown User"}</h2>
              <p className="text-lg text-gray-200 mt-1">{profile?.email || "No email provided"}</p>
              <p className="text-md text-gray-300 italic">{profile?.about || "No bio available"}</p>

              <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-lg text-gray-900 bg-white p-6 rounded-lg shadow-lg">
                <div className="text-left space-y-3">
                  <p className="flex items-center">
                    <MdPhone className="text-[#7ed15a] text-3xl" />
                    <strong className="ml-2 text-gray-700">Phone:</strong> {profile?.phone || "No phone number"}
                  </p>
                  <p className="flex items-center">
                    <MdBusinessCenter className="text-[#525e09] text-3xl" />
                    <strong className="ml-2 text-gray-700">Speciality:</strong> {profile?.speciality || "Not provided"}
                  </p>
                </div>

                <div className="text-left space-y-3">
                  <div className="flex items-center space-x-2">
                    <HiLightningBolt className="text-[#f59e0b] text-2xl" />
                    <p className="font-semibold">Skills:</p>
                    <p className="text-gray-700">
                      {profile?.skills?.length > 0
                        ? profile.skills.map((skill, index) => (
                            <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md mr-2">
                              {skill}
                            </span>
                          ))
                        : "No skills listed"}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <HiOutlineAnnotation className="text-[#ef4444] text-2xl" />
                    <p className="font-semibold">Interests:</p>
                    <p className="text-gray-700">
                      {profile?.interests?.length > 0
                        ? profile.interests.map((interest, index) => (
                            <span key={index} className="bg-gray-200 text-black-700 px-2 py-1 rounded-md mr-2">
                              {interest}
                            </span>
                          ))
                        : "No interests listed"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              {profile?.urls?.length > 0 && (
                <div className="mt-6">
                  <p className="font-bold text-xl text-gray-200 flex items-center justify-center">🌐 Social Media:</p>
                  <div className="flex justify-center space-x-8 mt-3">
                    {profile.urls.map((url, index) => {
                      let icon;
                      if (url.includes("twitter") || url.includes("x")) icon = <FaTwitter className="text-white-400 text-3xl" />;
                      else if (url.includes("linkedin")) icon = <FaLinkedin className="text-white-600 text-3xl" />;
                      else if (url.includes("github")) icon = <FaGithub className="text-white-800 text-3xl" />;
                      else return null;
                      return (
                        <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                          {icon}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Send Group Request Button */}
              {id !== currentUserId && (
                <Button color="blue" onClick={sendGroupRequest} className="mt-4">
                  Send Group Request
                </Button>
              )}



<button onClick={() => navigate(`/chat/private/${profile.uid}`)} className="mt-4">
  Chat
</button>

          

              {/* Edit Profile Button */}
              {id === currentUserId && (
                <div className="mt-6">
                  <Button
                    color="white"
                    className="bg-white text-[#2d9270] font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-gray-200 transition"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    {isEditingProfile ? "Cancel Edit" : "Edit Profile"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {isEditingProfile && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-md mt-6">
              <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
              <form className="space-y-4">
                <Input label="Name" name="name" value={formData.name} onChange={handleChange} />
                <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                <Input label="Speciality" name="speciality" value={formData.speciality} onChange={handleChange} />
                <Textarea label="About" name="about" value={formData.about} onChange={handleChange} />
                <Input label="Experience" name="experience" value={formData.experience} onChange={handleChange} />
                <Input label="Skills (comma-separated)" name="skills" value={formData.skills} onChange={handleChange} />
                <Input label="Projects (comma-separated)" name="projects" value={formData.projects} onChange={handleChange} />
                <Input label="Interests (comma-separated)" name="interests" value={formData.interests} onChange={handleChange} />
                <Input label="Social Links (comma-separated)" name="urls" value={formData.urls} onChange={handleChange} />
              </form>
              <div className="mt-4 text-center">
                <Button color="green" onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </div>
          )}

          {/* Posts Section */}
          <div className="mt-10">
            <h2 className="text-center text-lg font-semibold text-[#2d9270] mb-4">Posts by {profile?.name}</h2>
            <div className="flex flex-col items-center space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="w-full p-4 border rounded-lg shadow-md bg-white">
                    <p className="text-sm font-semibold">{post.name}</p>
                    <p className="text-sm text-gray-600">{post.text}</p>
                    {post.uid === currentUserId && (
                      <Button color="red" size="sm" onClick={() => handleDeletePost(post.id)}>
                        <FaTrashAlt /> Delete
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center">No posts available</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex-auto w-[20%] fixed right-0 top-12 ">
          <RightSide />
        </div>
      </div>
    </div>
  );
};

export default FriendProfile;
