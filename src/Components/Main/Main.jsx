import React, { useState, useRef, useContext, useReducer, useEffect } from "react";
import { Avatar, Button, Alert } from "@material-tailwind/react";
import { AuthContext } from "../AppContext/AppContext";
import { doc, setDoc, collection, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { PostsReducer, postActions, postsStates } from "../AppContext/PostReducer";
import PostCard from "./PostCard";
import { FiUploadCloud, FiXCircle } from "react-icons/fi"; // Import close icon

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/drofrhntv/upload";
const UPLOAD_PRESET = "brainsHubUploudPresetName_2025";

const Main = () => {
  const { user, userData } = useContext(AuthContext);
  const text = useRef("");
  const scrollRef = useRef("");
  const [media, setMedia] = useState([]);
  const [state, dispatch] = useReducer(PostsReducer, postsStates);
  const { SUBMIT_POST, HANDLE_ERROR } = postActions;
  const [selectedFiles, setSelectedFiles] = useState([]);

  /** 🔹 Fetch Posts - Ensuring No Infinite Loop */
  useEffect(() => {
    const collectionRef = collection(db, "posts");
    const q = query(collectionRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map((doc) => doc.data());
      dispatch({ type: SUBMIT_POST, posts });
      scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsubscribe(); // Properly unsubscribe to prevent infinite calls
  }, []);

  /** 🔹 Handle File Upload to Cloudinary */
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setSelectedFiles([...selectedFiles, ...files.map(file => ({ name: file.name, file }))]);

    const uploadedFiles = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      if (file.type.startsWith("video/")) {
        formData.append("resource_type", "video");
      } else if (file.type.startsWith("application/pdf") || file.type.includes("msword") || file.type.includes("officedocument")) {
        formData.append("resource_type", "raw");
      } else {
        formData.append("resource_type", "auto");
      }

      try {
        const response = await fetch(CLOUDINARY_URL, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        uploadedFiles.push({ url: data.secure_url, type: file.type });
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
    setMedia([...media, ...uploadedFiles]);
  };

  /** 🔹 Handle File Removal */
  const handleRemoveFile = (fileName) => {
    setSelectedFiles(selectedFiles.filter(file => file.name !== fileName));
  };

  /** 🔹 Handle Post Submission */
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (text.current.value.trim() === "" && media.length === 0) return;

    try {
      const postRef = doc(collection(db, "posts"));
      await setDoc(postRef, {
        documentId: postRef.id,
        uid: user?.uid || userData?.uid,
        logo: user?.photoURL || userData?.image || "https://via.placeholder.com/50",
        name: user?.displayName || userData?.name,
        email: user?.email || userData?.email,
        text: text.current.value,
        media: media,
        timestamp: serverTimestamp(),
      });
      text.current.value = "";
      setMedia([]);
      setSelectedFiles([]);
    } catch (err) {
      dispatch({ type: HANDLE_ERROR });
      console.error("Post submission error:", err);
    }
  };

  return (
<div className="flex flex-col items-center px-6 py-6 w-[100%] mx-auto bg-gray-100 min-h-screen">


<div className="w-[90%] max-w-3xl bg-gray-100 pt-10 rounded-xl  mx-auto flex flex-col space-y-0 mt-4">
  {/* Post Input Section */}

  
  <form
  onSubmit={handleSubmitPost}
  className="bg-white shadow-lg rounded-xl p-4 mb-6 w-full max-w-4xl mx-auto"
>
  <div className="flex items-start gap-4">
    <img
      src={userData?.image}
      alt="avatar"
      className="w-12 h-12 rounded-full object-cover"
    />

    <div className="flex-1">
     
    <div className="flex items-center gap-2 bg-gray-200 p-3 rounded-lg shadow-inner">
  <input
    type="text"
    name="text"
    placeholder={`What's on your mind, ${user?.displayName || userData?.name}?`}
    className="flex-1 bg-transparent outline-none text-gray-1000 placeholder-gray-700"
    ref={text}
  />
  <label htmlFor="fileUpload" className="cursor-pointer">
    <FiUploadCloud className="text-[#23B0A5] w-6 h-6 hover:text-customCyan" />
  </label>
  <input
    id="fileUpload"
    type="file"
    className="hidden"
    multiple
    accept="image/*, video/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    onChange={handleUpload}
  />
  <button
    type="submit"
    className="bg-[#23B0A5] hover:bg-[#1f9e96] text-white text-md px-4 py-1 rounded-md font-medium"
  >
    Share
  </button>
</div>


      {/* Optional: Selected File Names */}
      {selectedFiles.length > 0 && (
        <div className="text-sm text-gray-600 mt-2 space-y-1">
          <strong>Attached:</strong>
          <ul className="pl-4 list-disc">
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
</form>




  {/* Selected Files Preview */}
  {selectedFiles.length > 0 && (
    <div className="px-6 py-2 text-gray-700 text-sm">
      <strong>Selected Files:</strong>
      <ul className="mt-2">
        {selectedFiles.map((file, index) => (
          <li key={index} className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg shadow-sm mt-2">
            <span>{file.name}</span>
            <FiXCircle className="text-red-500 cursor-pointer hover:text-red-700" onClick={() => handleRemoveFile(file.name)} />
          </li>
        ))}
      </ul>
    </div>
  )}
</div>


<br />
{/* Posts Section */}
<div className="flex flex-col py-6 w-full max-w-4xl bg-gray-100 rounded-lg shadow-[0_2px_8px_rgba(9,124,124,0.1)]">
  {state?.error ? (
    <div className="flex justify-center items-center px-4 mb-6 ">
      <Alert color="red" className="border-l-4 border-red-500 bg-red-50 text-red-700 p-4 rounded">
        Something went wrong. Refresh and try again...
      </Alert>
    </div>
  ) : (
    <div className="space-y-6 px-4 ">
      {state?.posts?.length > 0 ? (
        state?.posts?.map((post, index) => (
          <PostCard
            key={index}
            className="border-l-4 border-[#097C7C] hover:border-opacity-80 transition-all "
            logo={post?.logo}
            id={post?.documentId}
            uid={post?.uid}
            name={post?.name}
            email={post?.email}
            media={post?.media}
            text={post?.text}
            timestamp={new Date(post?.timestamp?.toDate()).toUTCString()}
          />
        ))
      ) : (
        <div className="flex flex-col items-center py-12 space-y-4  ">
          <div className="text-[#097C7C]">
            {/* Choose one of these alternatives */}
            {/* Text-based icon */}
            <span className="text-4xl font-bold">!</span>
            
            {/* Or SVG icon */}
            {/* <svg 
              className="h-12 w-12" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg> */}
          </div>
          <p className="text-xl font-semibold text-[#097C7C] text-center">
            No posts yet. Be the first to share something!
          </p>
          <p className="text-gray-600 text-sm">Your post could start the conversation</p>
        </div>
      )}
    </div>
  )}
</div>

<div ref={scrollRef} className="h-8 bg-gradient-to-t from-[#097C7C]/10 to-transparent "></div>
</div>

  );

};

export default Main;
