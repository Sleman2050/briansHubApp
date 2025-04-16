import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
} from "@material-tailwind/react";

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New state for image preview
  const [previewImage, setPreviewImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const navigate = useNavigate();

  /** 
   * Real‑time fetch of posts collection ordered by latest timestamp.
   */
  useEffect(() => {
    const collectionRef = collection(db, "posts");
    const q = query(collectionRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedPosts = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setPosts(fetchedPosts);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  /**
   * Helper to convert a Firestore Timestamp or string into a readable date.
   */
  const renderTime = (timeValue) => {
    if (!timeValue) return "N/A";
    if (typeof timeValue === "string") return timeValue;
    if (typeof timeValue === "object" && timeValue.seconds) {
      return new Date(timeValue.seconds * 1000).toLocaleString();
    }
    return "N/A";
  };

  /**
   * Opens the details dialog for the selected post.
   */
  const handleViewDetails = (post) => {
    setSelectedPost(post);
    setDialogOpen(true);
  };

  /**
   * Closes the details dialog.
   */
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPost(null);
  };

  /**
   * Opens the image preview dialog with the clicked image.
   */
  const handlePreviewImage = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  };

  /**
   * Closes the image preview dialog.
   */
  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewImage(null);
  };

  /**
   * Navigates to the edit page (ensure route exists).
   */
  const handleEditPost = (postId) => {
    navigate(`/admin/posts/edit/${postId}`);
  };

  /**
   * Deletes the specified post with confirmation.
   */
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setActionLoading(true);
      await deleteDoc(doc(db, "posts", postId));
      // Remove the post from state (real-time listener will also update)
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (selectedPost && selectedPost.id === postId) {
        handleCloseDialog();
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Typography  className="text-2xl font-bold text-gray-800 mb-4">
        Admin - Posts Feed
      </Typography>

      {error && (
        <div className="mb-4">
          <Alert color="red" className="border-l-4 border-red-500">
            {error}
          </Alert>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600 text-center">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-600 text-center">No posts found.</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="p-4 shadow-md border border-gray-300">
              {/* Post header: author info and timestamp */}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <Typography variant="h6" className="text-gray-800">
                    {post.name || "Unknown Author"}
                  </Typography>
                  <Typography variant="small" className="text-gray-500">
                    {renderTime(post.timestamp)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600">
                    UID: {post.uid || "N/A"}
                  </Typography>
                </div>
              </div>

              {/* Optional Title */}
              {post.title && (
                <Typography variant="h5" className="mb-2 text-gray-700">
                  {post.title}
                </Typography>
              )}

              {/* Post content preview */}
              <Typography variant="paragraph" className="text-gray-800">
                {post.text && post.text.length > 100
                  ? `${post.text.substring(0, 100)}...`
                  : post.text || "No content available."}
              </Typography>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" color="teal" onClick={() => handleViewDetails(post)}>
                  View Details
                </Button>
             
                <Button
                  size="sm"
                  color="red"
                  disabled={actionLoading}
                  onClick={() => handleDeletePost(post.id)}
                >
                  {actionLoading ? "Processing..." : "Delete"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for viewing full post details */}
      {selectedPost && (
        <Dialog open={dialogOpen} size="lg" handler={handleCloseDialog}>
          <DialogHeader>
            <Typography variant="h4" color="gray">
              {selectedPost.title || "Post Details"}
            </Typography>
          </DialogHeader>
          <DialogBody divider>
            <div className="space-y-4">
              <div>
                <Typography variant="small" className="font-bold text-gray-600">
                  Name:
                </Typography>
                <Typography variant="small" className="text-gray-800">
                  {selectedPost.name || "Not provided"}
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-600">
                  Email:
                </Typography>
                <Typography variant="small" className="text-gray-800">
                  {selectedPost.email || "Not provided"}
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-600">
                  UID:
                </Typography>
                <Typography variant="small" className="text-gray-800">
                  {selectedPost.uid || "Not provided"}
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-600">
                  Created Time:
                </Typography>
                <Typography variant="small" className="text-gray-800">
                  {renderTime(selectedPost.timestamp)}
                </Typography>
              </div>
              {selectedPost.title && (
                <div>
                  <Typography variant="small" className="font-bold text-gray-600">
                    Title:
                  </Typography>
                  <Typography variant="small" className="text-gray-800">
                    {selectedPost.title}
                  </Typography>
                </div>
              )}
              <div>
                <Typography variant="small" className="font-bold text-gray-600">
                  Content:
                </Typography>
                <Typography variant="small" className="text-gray-800 whitespace-pre-wrap">
                  {selectedPost.text || "No content available."}
                </Typography>
              </div>
              {selectedPost.media && selectedPost.media.length > 0 && (
                <div>
                  <Typography variant="small" className="font-bold text-gray-600">
                    Media:
                  </Typography>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPost.media.map((item, idx) => (
                      <img
                        key={idx}
                        src={item.url || item}
                        alt={`media-${idx}`}
                        className="w-120 h-60 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => handlePreviewImage(item.url || item)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter className="flex justify-end gap-3">
            <Button color="gray" onClick={handleCloseDialog}>
              Close
            </Button>
       
            <Button
              color="red"
              disabled={actionLoading}
              onClick={() => handleDeletePost(selectedPost.id)}
            >
              {actionLoading ? "Processing..." : "Delete"}
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Dialog for image preview */}
      {previewImage && (
        <Dialog open={previewOpen} size="md" handler={handleClosePreview}>
          <DialogHeader>
            <Typography variant="h5" color="gray">
              Image Preview
            </Typography>
          </DialogHeader>
          <DialogBody className="flex justify-center">
            <img
              src={previewImage}
              alt="Full Size"
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
          </DialogBody>
          <DialogFooter className="flex justify-end">
            <Button color="gray" onClick={handleClosePreview}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
};

export default AdminPosts;
