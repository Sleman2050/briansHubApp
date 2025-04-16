import React, { useState, useContext, useEffect, useReducer } from "react";
import { Avatar } from "@material-tailwind/react";
import avatar from "../../assets/images/avatar.jpg";
import like from "../../assets/images/like.png";
import comment from "../../assets/images/comment.png";
import remove from "../../assets/images/delete.png";
import addFriend from "../../assets/images/add-friend.png";
import { AuthContext } from "../AppContext/AppContext";
import {
  PostsReducer,
  postActions,
  postsStates,
} from "../AppContext/PostReducer";
import {
  doc,
  setDoc,
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import CommentSection from "./CommentSection";

const PostCard = ({ uid, id, logo, name, email, text, media, timestamp }) => {
  const { user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(PostsReducer, postsStates);
  const likesRef = doc(collection(db, "posts", id, "likes"));
  const likesCollection = collection(db, "posts", id, "likes");
  const singlePostDocument = doc(db, "posts", id);
  const { ADD_LIKE, HANDLE_ERROR } = postActions;
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOpen = (e) => {
    e.preventDefault();
    setOpen(true);
  };

  const handleLike = async (e) => {
    e.preventDefault();
    const q = query(likesCollection, where("id", "==", user?.uid));
    const querySnapshot = await getDocs(q);
    const likesDocId = querySnapshot?.docs[0]?.id;
    try {
      if (likesDocId) {
        const deleteId = doc(db, "posts", id, "likes", likesDocId);
        await deleteDoc(deleteId);
      } else {
        await setDoc(likesRef, { id: user?.uid });
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const deletePost = async (e) => {
    e.preventDefault();
    try {
      if (user?.uid === uid) {
        await deleteDoc(singlePostDocument);
      } else {
        alert("You can't delete other users' posts!");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  return (
    
    <div className="mb-6 max-w-3xl mx-auto bg-white shadow-md rounded-xl border border-customCyan overflow-hidden">
      <div className="flex items-center p-4 border-b ">
        <Avatar size="md" variant="circular" src={logo || avatar} alt="avatar" />
        <div className="ml-4">
          <p className="text-sm font-semibold text-gray-800">{email}</p>
          <p className="text-xs text-gray-500">Published: {timestamp}</p>
        </div>
      </div>
  
      <div className="px-6 py-4 ">
        <p className="text-gray-800 text-base mb-4">{text}</p>
  
        {Array.isArray(media) && media.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            {media.map((file, index) => (
              <div key={index} className="flex justify-center">
                {file.type && file.url ? (
                  file.type.startsWith("video/") ? (
                    <video controls src={file.url} className="rounded-lg shadow max-h-64" />
                  ) : file.type.startsWith("image/") ? (
                    <img
                      src={file.url}
                      alt="Uploaded"
                      className="rounded-lg shadow max-h-64 cursor-pointer"
                      onClick={() => setSelectedImage(file.url)}
                    />
                  ) : file.type.includes("pdf") || file.type.includes("msword") || file.type.includes("officedocument") ? (
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      View Document
                    </a>
                  ) : (
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Download File
                    </a>
                  )
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center">No media attached</p>
        )}
      </div>
  
      <div className="px-6 pb-4 flex justify-between items-center border-t">
  <button
    onClick={() => setOpen(!open)}
    className="text-sm text-cyan-700 hover:underline font-medium"
  >
    {open ? "Hide Comments" : "View Comments"}
  </button>
</div>



      {open && <CommentSection postId={id} />}
  
      {selectedImage && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-80 z-50" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Full View" className="max-w-3xl max-h-screen rounded-lg shadow-lg" />
        </div>
      )}
    </div>

  );
  
};

export default PostCard;
