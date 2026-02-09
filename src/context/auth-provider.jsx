import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { useEffect, useState } from "react";
import app from "../firebase/firebase.config";
import { AuthContext } from "./auth-context";
import axiosInstance from "@/lib/axios";

const auth = getAuth(app);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loader, setLoader] = useState(true);

  const signUp = (email, password) => {
    setLoader(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email, password) => {
    setLoader(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const profileUpdate = (profile) => {
    return updateProfile(auth.currentUser, profile);
  };

  const logOut = async () => {
    setLoader(true);
    localStorage.removeItem("token");
    setDbUser(null);
    return signOut(auth);
  };

  const fetchDbUser = async (email) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setDbUser(null);
      return;
    }
    try {
      const { data } = await axiosInstance.get(`/users/email/${email}`);
      setDbUser(data?.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setDbUser(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        await fetchDbUser(currentUser.email);
      } else {
        setDbUser(null);
      }
      setLoader(false);
    });
    return () => unsubscribe();
  }, []);

  const authInfo = {
    user,
    dbUser,
    loader,
    setLoader,
    setUser,
    setDbUser,
    signUp,
    signIn,
    profileUpdate,
    logOut,
    fetchDbUser,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
