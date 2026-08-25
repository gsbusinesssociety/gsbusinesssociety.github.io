"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { withTimeout } from "../app/lib/firestoreTimeout";

/**
 * `applicant` is not stored in the `members` collection — it is what a verified
 * Columbia account resolves to when it has no membership record yet. That is the
 * normal state for someone applying during a recruiting cycle.
 */
export type UserRole = "admin" | "board" | "recruiter" | "member" | "applicant";

const MEMBER_ROLES: readonly string[] = ["admin", "board", "recruiter", "member"];

// Covers @columbia.edu and its aliases (@lionmail.columbia.edu, @gsb.columbia.edu, ...).
const COLUMBIA_DOMAIN = "columbia.edu";

// Long-polling makes lookups slow, not absent. Give them room before giving up.
const LOOKUP_TIMEOUT_MS = 10000;

type AuthErrorKind = "lookup-failed" | "wrong-domain" | "not-authorized";

export interface AuthError {
  kind: AuthErrorKind;
  message: string;
  /** Only a failed lookup is worth retrying; the other two are settled answers. */
  retryable: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  /** Can see applicant data: admins and board reviewers. Never recruiters. */
  isBoard: boolean;
  authError: AuthError | null;
  retry: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
  isAdmin: false,
  isBoard: false,
  authError: null,
  retry: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function isColumbiaEmail(email: string): boolean {
  const domain = email.toLowerCase().trim().split("@")[1] ?? "";
  return domain === COLUMBIA_DOMAIN || domain.endsWith(`.${COLUMBIA_DOMAIN}`);
}

/** Recruiters are external partners who sign in with a password, not a Columbia account. */
function signedInWithGoogle(user: User): boolean {
  return user.providerData.some((p) => p.providerId === "google.com");
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Bumped on every auth change and every retry, so a slow in-flight lookup that
  // resolves after the user has already switched accounts is discarded.
  const generation = useRef(0);

  // Turning someone away signs them out, which fires another auth change and would
  // otherwise wipe the explanation before it reached the screen. Parking it here
  // lets the resulting signed-out pass re-publish the reason.
  const rejectionReason = useRef<AuthError | null>(null);

  const [retryCount, setRetryCount] = useState(0);
  const retry = useCallback(() => {
    rejectionReason.current = null;
    setRetryCount((n) => n + 1);
  }, []);

  useEffect(() => {
    const resolve = async (currentUser: User | null, myGeneration: number) => {
      const isStale = () => generation.current !== myGeneration;

      const accept = (role: UserRole) => {
        if (isStale()) return;
        setUser(currentUser);
        setUserRole(role);
        setAuthError(null);
        setLoading(false);
      };

      const reject = async (error: AuthError) => {
        rejectionReason.current = error;
        if (!isStale()) {
          setUser(null);
          setUserRole(null);
          setAuthError(error);
          setLoading(false);
        }
        // If this fails (offline), the state above already stands on its own.
        await firebaseSignOut(auth).catch(() => {});
      };

      if (!currentUser || !currentUser.email) {
        if (isStale()) return;
        const carried = rejectionReason.current;
        rejectionReason.current = null;
        setUser(null);
        setUserRole(null);
        setAuthError(carried);
        setLoading(false);
        return;
      }

      const email = currentUser.email.toLowerCase().trim();
      const viaGoogle = signedInWithGoogle(currentUser);

      // Enforced here rather than only at the login screen, so it holds for every
      // entry point into the app — including a restored session.
      if (viaGoogle && !isColumbiaEmail(email)) {
        await reject({
          kind: "wrong-domain",
          message: "Please sign in with your @columbia.edu email address.",
          retryable: false,
        });
        return;
      }

      try {
        const memberDoc = await withTimeout(
          getDoc(doc(db, "members", email)),
          LOOKUP_TIMEOUT_MS
        );
        if (isStale()) return;

        if (memberDoc.exists()) {
          const role = memberDoc.data().role;
          if (!MEMBER_ROLES.includes(role)) {
            await reject({
              kind: "not-authorized",
              message:
                "Your account has an unrecognized role. Please contact the club admins.",
              retryable: false,
            });
            return;
          }
          accept(role as UserRole);
          return;
        }

        // No membership record. A verified Columbia account is still a legitimate
        // applicant; a password account with no record is not anyone we know.
        if (viaGoogle) {
          accept("applicant");
          return;
        }

        await reject({
          kind: "not-authorized",
          message: "This account is not authorized. Please contact the club admins.",
          retryable: false,
        });
      } catch (err) {
        // Deliberately does NOT fall back to granting access. A failed lookup means
        // we do not know who this is, and "we don't know" must never resolve upward.
        console.error("Could not resolve member role", err);
        if (isStale()) return;
        setUser(null);
        setUserRole(null);
        setAuthError({
          kind: "lookup-failed",
          message:
            "We couldn't verify your access. This is usually a slow connection rather than a problem with your account.",
          retryable: true,
        });
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      generation.current += 1;
      const myGeneration = generation.current;
      setLoading(true);
      void resolve(currentUser, myGeneration);
    });

    return () => unsubscribe();
  }, [retryCount]);

  const signOut = async () => {
    rejectionReason.current = null;
    await firebaseSignOut(auth);
    setUserRole(null);
    setAuthError(null);
    router.push("/");
  };

  const isAdmin = userRole === "admin";
  const isBoard = userRole === "admin" || userRole === "board";

  return (
    <AuthContext.Provider
      value={{ user, loading, userRole, isAdmin, isBoard, authError, retry, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
