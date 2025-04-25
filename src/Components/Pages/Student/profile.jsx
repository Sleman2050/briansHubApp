// src/pages/Profile.jsx

import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  addDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import LeftSide from "../../LeftSidebar/LeftSide";
import Navbar from "../../Navbar/Navbar";
import RightSide from "../../RightSidebar/RightSide";
import profilePic from "../../../assets/images/profilePic.jpg";
import avatar from "../../../assets/images/avatar.jpg";
import {
  FaTrashAlt,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { MdPhone, MdBusinessCenter } from "react-icons/md";
import { HiLightningBolt, HiOutlineAnnotation } from "react-icons/hi";
import { FiCamera } from "react-icons/fi";
import { AuthContext } from "../../AppContext/AppContext";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/drofrhntv/image/upload";
const UPLOAD_PRESET = "brainsHubUploudPresetName_2025";

const Profile = () => {
  const { id } = useParams();
  const currentUserId = auth?.currentUser?.uid;
  const { userData } = useContext(AuthContext); // الحصول على بيانات المستخدم الحالي
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUserIsJoined, setCurrentUserIsJoined] = useState(false);

  // NEW: Track if either user is already in a group using the isJoined field.
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    speciality: "",
    about: "",
    skills: "",
    urls: "",
    projects: "",
    interests: "",
    experience: "",
    officeHours: "",      // NEW: Office Hours
    officeLocation: "",   // NEW: Office Location
  });

  // 1. جلب الملف الشخصي وتعبئة الفورم
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
            email: data.email || "",
            speciality: data.speciality || "",
            about: data.about || "",
            skills: (data.skills || []).join(", "),
            urls: (data.urls || []).join(", "),
            projects: (data.projects || []).join(", "),
            interests: (data.interests || []).join(", "),
            experience: data.experience || "",
            officeHours: data.officeHours || "",
            officeLocation: data.officeLocation || "",
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
    const fetchCurrentUserIsJoined = async () => {
      if (!currentUserId) return;
      const q = query(collection(db, "users"), where("uid", "==", currentUserId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const currentUser = snapshot.docs[0].data();
        setCurrentUserIsJoined(currentUser?.isJoined || false);
      }
    };

    fetchCurrentUserIsJoined();


    getUserProfile();
    getUserPosts();
  }, [id]);



  // 2. دالة إرسال طلب الانضمام للمجموعة تبقى كما هي
  const sendGroupRequest = async () => {
    if (!id || id === currentUserId) return;

    await addDoc(collection(db, "groupJoinRequests"), {
      senderId: currentUserId,
      senderName: auth?.currentUser?.displayName,
      receiverId: id,
      receiverName: profile?.name,
      status: "pending",
    });

    await addDoc(collection(db, "notifications"), {
      type: "group_request",
      from: currentUserId,
      to: id,
      message: `${userData.name || "Someone"} want to form a group with you `,
      senderName: userData.name || "Unknown",
      senderImage: userData.name || "",
      status: "unread",
      timestamp: new Date(),
    });

    alert("Group request and notification sent!");
  };

  // باقي دوال الملف الشخصي تبقى دون تغيير
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formDataUpload,
      });
      const data = await response.json();
      const imageUrl = data.secure_url;

      const userQuery = query(collection(db, "users"), where("uid", "==", id));
      const snapshot = await getDocs(userQuery);

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        await updateDoc(doc(db, "users", userDoc.id), { image: imageUrl });
        setProfile((prev) => ({ ...prev, image: imageUrl }));
      }

      setUploading(false);
      alert("Profile picture updated!");
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docRef = doc(db, "users", snapshot.docs[0].id);
        await updateDoc(docRef, {
          ...formData,
          skills: formData.skills.split(",").map((s) => s.trim()),
          urls: formData.urls.split(",").map((u) => u.trim()),
          projects: formData.projects.split(",").map((p) => p.trim()),
          interests: formData.interests.split(",").map((i) => i.trim()),
        });
        setIsEditingProfile(false);
        alert("Profile updated.");
      }
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Delete this post?")) {
      await deleteDoc(doc(db, "posts", postId));
    }
  };

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen">
      <Navbar />
      <RightSide />

      <div className="w-[60%] mt-20 mr-20">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4">
            <div className="flex items-center space-x-4">
              <Avatar size="xxl" src={profile?.image || avatar} alt="Profile" />
              <div>
                <h2 className="text-2xl font-bold">
                  {profile?.name || "Unknown"}
                </h2>
                <p className="text-gray-600">
                  {profile?.speciality || "No major"}
                </p>
              </div>
            </div>
            {id === currentUserId && (
              <Button
                className="bg-customCyan text-white px-4 py-2 rounded-md"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
              >
                {isEditingProfile ? "Cancel" : "Edit"}
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            {/* Full Name */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditingProfile}
                className="bg-gray-100"
              />
            </div>

            {/* ID */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">ID</p>
              <Input
                value={profile?.uid || ":id"}
                disabled
                className="bg-gray-100"
              />
            </div>

            {/* Major */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Major</p>
              <Input
                name="speciality"
                value={formData.speciality}
                onChange={handleChange}
                disabled={!isEditingProfile}
                className="bg-gray-100"
              />
            </div>

            {/* About (Full width) */}
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-600 mb-1">About</p>
              <Textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                disabled={!isEditingProfile}
                className="bg-gray-100"
              />
            </div>

            {/* Social Links */}
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Social Links (comma-separated)
              </p>
              <Input
                name="urls"
                value={formData.urls}
                onChange={handleChange}
                disabled={!isEditingProfile}
                className="bg-gray-100"
              />
            </div>

            {/* Project Interests */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Project Interests</p>
              <Input
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                disabled={!isEditingProfile}
                className="bg-gray-100"
              />
            </div>
          </div>

                      {/* Conditionally render technical skills only for students */}
                      {profile?.role === "student" && (
            <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Technical Skills</p>
            <Input
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              disabled={!isEditingProfile}
              className="bg-gray-100"
            />
          </div>
            )}

          {/* Social Media Links */}
          {profile?.urls?.length > 0 && (
            <div className="mt-6">
              <p className="font-bold text-xl text-black-200 flex items-left justify-left">
                Social Media
              </p>
              <div className="flex justify-left space-x-8 mt-3">
                {profile.urls.map((url, index) => {
                  let icon;
                  if (url.includes("twitter") || url.includes("x")) {
                    icon = <FaTwitter className="text-white-400 text-3xl" />;
                  } else if (url.includes("linkedin")) {
                    icon = <FaLinkedin className="text-white-600 text-3xl" />;
                  } else if (url.includes("github")) {
                    icon = <FaGithub className="text-white-800 text-3xl" />;
                  } else return null;
                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {icon}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="mt-6">
            <p className="font-semibold">Contact Info</p>
            <div className="flex items-center space-x-4 mt-2">
              <FaEnvelope size={20} className="text-gray-500" />
              {isEditingProfile ? (
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-md"
                />
              ) : (
                <p>{formData.email || "No email"}</p>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <FaPhone size={20} className="text-gray-500" />
              {isEditingProfile ? (
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-md"
                />
              ) : (
                <p>{formData.phone || "No phone"}</p>
              )}
            </div>
          </div>

          {/* Conditionally render Office Hours and Office Location only for advisors */}
          {profile?.role === "advisor" && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Office Hours</p>
                <Input
                  name="officeHours"
                  value={formData.officeHours}
                  onChange={handleChange}
                  disabled={!isEditingProfile}
                  className="bg-gray-100"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Office Location</p>
                <Input
                  name="officeLocation"
                  value={formData.officeLocation}
                  onChange={handleChange}
                  disabled={!isEditingProfile}
                  className="bg-gray-100"
                />
              </div>
            </>
            
          )}



          {/* Action Buttons */}
          <div className="mt-4 flex gap-4 flex-wrap">
            {id !== currentUserId && (
              <>
                {/* شرط عرض زر إرسال طلب المجموعة؛ لن يظهر إذا كان المستخدم الحالي أو الملف المعروض لديهم isJoined=true */}
                {(!currentUserIsJoined && !profile?.isJoined) && (
  <Button color="teal" onClick={sendGroupRequest}>
    Send Group Request
  </Button>
)}

                <Button
                  color="green"
                  onClick={() => {
                    const chatId = [currentUserId, profile?.uid].sort().join("_");
                    navigate(`/chat/${chatId}/private`);
                  }}
                >
                  Chat
                </Button>
              </>
            )}
          </div>

          {isEditingProfile && (
            <div className="text-center mt-6">
              <Button
                className="bg-teal-600 text-white px-6 py-2 rounded-lg"
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
            </div>
          )}

          {/* Posts Section */}
          <div className="mt-10">
            <h2 className="text-center text-lg font-semibold text-[#2d9270] mb-4">
              Posts by {profile?.name}
            </h2>
            <div className="flex flex-col items-center space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="w-full p-4 border rounded-lg shadow-md bg-gray-50"
                  >
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
                <p className="text-gray-600 text-center">
                  No posts available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
