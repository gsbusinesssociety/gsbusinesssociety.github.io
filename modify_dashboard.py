import re

with open('app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# 1. Update useAuth destructuring
content = content.replace(
    'const { user, loading, isAdmin, signOut } = useAuth();',
    'const { user, loading, isAdmin, userRole, signOut } = useAuth();'
)

# 2. Add new states
state_injection = """
  const [internships, setInternships] = useState<any[]>([]);
  
  // Whitelist extra field
  const [roleInput, setRoleInput] = useState("member");

  // Post Internship Form
  const [internshipTitle, setInternshipTitle] = useState("");
  const [internshipCompany, setInternshipCompany] = useState("");
  const [internshipDesc, setInternshipDesc] = useState("");
  const [internshipLink, setInternshipLink] = useState("");
  const [internshipDeadline, setInternshipDeadline] = useState("");

  // My Profile Form (Member)
  const [profileMajor, setProfileMajor] = useState("");
  const [profileGradYear, setProfileGradYear] = useState("");
  const [profileLinkedIn, setProfileLinkedIn] = useState("");
  const [profileResume, setProfileResume] = useState("");
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'success'>('idle');
"""
content = content.replace(
    'const [nameInput, setNameInput] = useState("");',
    'const [nameInput, setNameInput] = useState("");\n' + state_injection
)

# 3. Add internships fetching to useEffect
fetch_injection = """
        const internshipsSnap = await Promise.race([
          getDocs(collection(db, "internships")),
          timeoutPromise
        ]) as any;
        if (!internshipsSnap.empty) {
          setInternships(internshipsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
        }

        // Also fetch my profile
        if (user?.email) {
            const myDoc = await getDoc(doc(db, "members", user.email.toLowerCase().trim()));
            if (myDoc.exists()) {
                const data = myDoc.data();
                setProfileMajor(data.major || "");
                setProfileGradYear(data.gradYear || "");
                setProfileLinkedIn(data.linkedIn || "");
                setProfileResume(data.resumeLink || "");
            }
        }
"""
content = content.replace(
    'if (newsSnap.empty) setNewsletters(PLACEHOLDER_NEWSLETTERS);\n        else setNewsletters(newsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));',
    'if (newsSnap.empty) setNewsletters(PLACEHOLDER_NEWSLETTERS);\n        else setNewsletters(newsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));\n' + fetch_injection
)

with open('app/dashboard/page.tsx', 'w') as f:
    f.write(content)
