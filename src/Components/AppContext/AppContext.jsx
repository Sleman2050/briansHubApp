// 3️⃣ AppContext.jsx Role Persistence Fix
import React, { createContext, useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth, db, onAuthStateChanged } from "../firebase/firebase";
import {
  query,
  where,
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const AppContext = ({ children }) => {
  const collectionUsersRef = collection(db, "users");
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState();
  const [userData, setUserData] = useState();

  const navigate = useNavigate();

  

  const signInWithGoogle = async () => {
    try {
      const popup = await signInWithPopup(auth, provider);
      const user = popup.user;
      const q = query(collectionUsersRef, where("uid", "==", user.uid));
      const docs = await getDocs(q);
      if (docs.docs.length === 0) {
        await addDoc(collectionUsersRef, {
          uid: user?.uid,
          name: user?.displayName,
          email: user?.email,
          image: user?.photoURL,
          authProvider: popup?.providerId,
          role: "student",
        });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const loginWithEmailAndPassword = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const q = query(collectionUsersRef, where("uid", "==", user.uid));
      const docs = await getDocs(q);
      if (!docs.empty) {
        const userData = docs.docs[0].data();
        if (userData.role === "advisor") {
          navigate("/advisor/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const registerWithEmailAndPassword = async (name, email, password, role = "student") => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name,
        email,
        role: role,
        createdAt: new Date(),
      });
      alert(`${role} registered successfully!`);
      if (role === "advisor") {
        navigate("/advisor/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      alert("Error during registration: " + err.message);
    }
  };
  const signOutUser = async () => {
    await signOut(auth);
  };
  const updateProfile = async (updatedData) => {
    if (!user?.uid) return;
  
    try {
      const userQuery = query(collectionUsersRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(userQuery);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "users", userDoc.id), updatedData);
        setUserData((prev) => ({ ...prev, ...updatedData })); // Update React State
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  

  const userStateChanged = async () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(collectionUsersRef, where("uid", "==", user?.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setUserData(userData);  // ✅ Always set correct role
          setUser(user);
        } else {
          const defaultData = {
            uid: user.uid,
            name: user.displayName || "Unknown",
            email: user.email,
            role: "student",  // ✅ Default to student
            createdAt: new Date(),
          };
          await addDoc(collectionUsersRef, defaultData);
          setUserData(defaultData);
          setUser(user);
        }
      } else {
        setUser(null);
        setUserData(null);
        navigate("/login");
      }
    });
  };
  

  useEffect(() => {
    userStateChanged();
  }, []);

  const initialState = {
    signInWithGoogle,
    loginWithEmailAndPassword,
    registerWithEmailAndPassword,
    user,
    userData,
    signOutUser,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={initialState}>{children}</AuthContext.Provider>
  );
};

export default AppContext;
