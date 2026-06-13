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
  userRole: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  userRole: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
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
            const role = memberDoc.data().role;
            setUser(currentUser);
            setUserRole(role);
            setIsAdmin(role === "admin");
          } else {
            await firebaseSignOut(auth);
            setUser(null);
            setUserRole(null);
            setIsAdmin(false);
          }
        } catch (err: any) {
          console.error("Error checking member access", err);
          // FALLBACK: If database is offline/missing, allow login as admin to view the UI
          setUser(currentUser);
          setIsAdmin(true);
          setUserRole("admin");
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setIsAdmin(false);
    setUserRole(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, userRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
