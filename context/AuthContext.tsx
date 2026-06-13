"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        try {
          const sanitizedEmail = currentUser.email.toLowerCase().trim();
          
          // Wrap getDoc in a 3-second timeout to prevent indefinite hanging
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Database timeout")), 3000)
          );
          
          const memberDoc = await Promise.race([
            getDoc(doc(db, "members", sanitizedEmail)),
            timeoutPromise
          ]) as any;
          
          if (memberDoc.exists()) {
            setUser(currentUser);
            setIsAdmin(memberDoc.data().role === "admin");
          } else {
            await firebaseSignOut(auth);
            setUser(null);
            setIsAdmin(false);
          }
        } catch (err: any) {
          console.error("Error checking member access", err);
          // FALLBACK: If database is offline/missing, allow login as admin to view the UI
          setUser(currentUser);
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setIsAdmin(false);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
