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
    <div className="flex flex-col items-center px-6 py-8 w-full bg-gray-50 min-h-screen">
      {/* Post Input Section */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center border-b border-gray-300 pb-4">
          <Avatar
            size="lg"
            variant="circular"
            src={user?.photoURL || userData?.image || "https://via.placeholder.com/50"}
            alt="avatar"
            className="shadow-md border-2 border-gray-400"
          />
          <form className="w-full flex items-center bg-gray-100 p-3 rounded-xl shadow-inner mx-4" onSubmit={handleSubmitPost}>
            <div className="flex w-full items-center bg-white p-2 rounded-lg border border-gray-300">
              <input
                type="text"
                name="text"
                placeholder={`What's on your mind, ${user?.displayName || userData?.name}?`}
                className="outline-none w-full bg-transparent p-2 text-gray-700 placeholder-gray-500"
                ref={text}
              />
              <Button variant="gradient" color="green" className="ml-3 px-6 py-2 text-white rounded-lg shadow-md" type="submit">
                Share
              </Button>
            </div>
          </form>
        </div>
        {/* Upload Section */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 shadow-md rounded-b-xl mt-2">
          <label htmlFor="fileUpload" className="cursor-pointer flex items-center text-green-600 hover:text-green-800 transition-all">
            <FiUploadCloud className="w-6 h-6 mr-2" />
            <span className="text-sm font-semibold">Upload File</span>
          </label>
          <input id="fileUpload" type="file" className="hidden" multiple accept="image/*, video/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleUpload} />
        </div>
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

      {/* Posts Section */}
      <div className="flex flex-col py-4 w-full max-w-2xl">
        {state?.error ? (
          <div className="flex justify-center items-center">
            <Alert color="red">Something went wrong. Refresh and try again...</Alert>
          </div>
        ) : (
          <div>
            {state?.posts?.length > 0 ? (
              state?.posts?.map((post, index) => (
                <PostCard
                  key={index}
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
              <p className="text-gray-600 text-center">No posts yet. Be the first to share something!</p>
            )}
          </div>
        )}
      </div>

      <div ref={scrollRef}></div>
    </div>
  );
};

export default Main;
