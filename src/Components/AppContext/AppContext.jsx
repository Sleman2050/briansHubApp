// src/AppContext/AppContext.jsx
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
  updateDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const AppContext = ({ children }) => {
  const collectionUsersRef = collection(db, "users");
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      const popup = await signInWithPopup(auth, provider);
      const firebaseUser = popup.user;
      const q = query(collectionUsersRef, where("uid", "==", firebaseUser.uid));
      const docs = await getDocs(q);
      
      if (docs.empty) {
        await addDoc(collectionUsersRef, {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "Google User",
          email: firebaseUser.email,
          image: firebaseUser.photoURL || "",
          authProvider: popup?.providerId,
          role: "student",
          createdAt: new Date(),
          phone: "",
          about: "",
          isJoined: false, // 👈 مهم جداً
        });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const loginWithEmailAndPassword = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const q = query(collectionUsersRef, where("uid", "==", firebaseUser.uid));
      const docs = await getDocs(q);
      
      if (!docs.empty) {
        const data = docs.docs[0].data();
        if (data.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/home");
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const registerWithEmailAndPassword = async (name, email, password, role = "student") => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = res.user;
      
      if (!name?.trim()) throw new Error("Name is required");
      
      await addDoc(collectionUsersRef, {
        name: name.trim(), 
        uid: firebaseUser.uid,
        email,
        role: role,
        createdAt: new Date(),
        image: "",
        phone: "",
        about: "",
        isJoined: false, // 👈 مهم جداً
      });
      
      alert(`${role} registered successfully!`);
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
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
        const currentData = userDoc.data();
        const completeUpdate = {
          ...currentData,
          ...updatedData
        };
        await updateDoc(doc(db, "users", userDoc.id), completeUpdate);
        setUserData((prev) => ({ ...prev, ...completeUpdate }));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const userStateChanged = () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const q = query(collectionUsersRef, where("uid", "==", firebaseUser.uid));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          const data = userDoc.data();

          console.log("✅ User from Firestore:", data); // 👈 يعرض isJoined

          setUserData(data); // يحتوي على isJoined وغيره
          setUser(firebaseUser);

          if (data.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/home");
          }
        } else {
          const defaultData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "New User",
            email: firebaseUser.email,
            image: firebaseUser.photoURL || "",
            role: "student",
            createdAt: new Date(),
            phone: "",
            about: "",
            isJoined: false, // 👈 افتراضيًا
          };
          
          await addDoc(collectionUsersRef, defaultData);
          setUserData(defaultData);
          setUser(firebaseUser);
          navigate("/home");
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
    userData: userData || {
      name: "",
      email: "",
      role: "",
      image: "",
      phone: "",
      about: "",
      isJoined: false, // 👈 تأكيد
    },
    signOutUser,
    updateProfile,
    getCurrentUser: () => ({
      uid: user?.uid,
      name: userData?.name,
      email: userData?.email,
      role: userData?.role,
      image: userData?.image
    })
  };

  return (
    <AuthContext.Provider value={initialState}>
      {children}
    </AuthContext.Provider>
  );
};

export default AppContext;
