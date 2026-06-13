"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { collection, getDocs, getDoc, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { FileText, Lightbulb, LogOut, ShieldCheck, Users, PlusCircle } from "lucide-react";

const PLACEHOLDER_TIPS = [
  { id: 1, title: "Mastering the IB Technical Interview", content: "Focus on the 400 questions guide. Don't memorize, understand the underlying accounting principles." },
  { id: 2, title: "Consulting Case Prep Frameworks", content: "Victor Cheng's LOMS is a great start. Practice structuring your thoughts aloud before diving into math." }
];

const PLACEHOLDER_NEWSLETTERS = [
  { id: 1, title: "September 2026: Recruiting Kickoff", date: "Sep 1, 2026" },
  { id: 2, title: "October 2026: Mid-Term Milestones", date: "Oct 1, 2026" }
];

const PLACEHOLDER_MEMBERS = [
  { id: "test@columbia.edu", email: "test@columbia.edu", role: "member" },
  { id: "admin@columbia.edu", email: "admin@columbia.edu", role: "admin" }
];

export default function DashboardPage() {
  const { user, loading, isAdmin, userRole, signOut } = useAuth();
  const router = useRouter();
  
  const [tips, setTips] = useState<any[]>([]);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Admin Panel states
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");

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

  const [adminStatus, setAdminStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [adminMessage, setAdminMessage] = useState("");

  const [tipTitle, setTipTitle] = useState("");
  const [tipContent, setTipContent] = useState("");
  
  const [newsTitle, setNewsTitle] = useState("");
  const [newsDate, setNewsDate] = useState("");

  const [eventTitle, setEventTitle] = useState("");
  const [eventDisplayDate, setEventDisplayDate] = useState("");
  const [eventDayOfWeek, setEventDayOfWeek] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventRSVPLink, setEventRSVPLink] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Attempt to fetch from Firestore with a 3-second timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Database timeout")), 3000)
        );
        
        const tipsSnap = await Promise.race([
          getDocs(collection(db, "tips")),
          timeoutPromise
        ]) as any;
        
        const newsSnap = await Promise.race([
          getDocs(collection(db, "newsletters")),
          timeoutPromise
        ]) as any;
        
        if (tipsSnap.empty) setTips(PLACEHOLDER_TIPS);
        else setTips(tipsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));

        if (newsSnap.empty) setNewsletters(PLACEHOLDER_NEWSLETTERS);
        else setNewsletters(newsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));

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


        // If admin, fetch members list and contact messages
        if (isAdmin) {
          const membersSnap = await Promise.race([
            getDocs(collection(db, "members")),
            timeoutPromise
          ]) as any;
          
          if (membersSnap.empty) setMembersList(PLACEHOLDER_MEMBERS);
          else setMembersList(membersSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));

          const messagesSnap = await Promise.race([
            getDocs(collection(db, "contact_messages")),
            timeoutPromise
          ]) as any;
          
          if (!messagesSnap.empty) {
            setMessages(messagesSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
          }
        }

      } catch (err) {
        console.warn("Firestore not configured yet or error fetching. Using placeholders.", err);
        setTips(PLACEHOLDER_TIPS);
        setNewsletters(PLACEHOLDER_NEWSLETTERS);
        if (isAdmin) setMembersList(PLACEHOLDER_MEMBERS);
      } finally {
        setFetching(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, isAdmin]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setAdminStatus('error');
      setAdminMessage('Please enter a valid email address.');
      return;
    }

    setAdminStatus('loading');
    
    try {
      const sanitizedEmail = emailInput.toLowerCase().trim();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Database timeout")), 3000)
      );

      await Promise.race([
        setDoc(doc(db, "members", sanitizedEmail), {
          email: sanitizedEmail,
          name: nameInput.trim(),
          role: roleInput,
          addedAt: serverTimestamp(),
          addedBy: user?.email
        }),
        timeoutPromise
      ]);
      
      setAdminStatus('success');
      setAdminMessage(`${sanitizedEmail} has been added to the whitelist!`);
      setEmailInput('');
      setNameInput('');
      
      // Optimistically add to local list so they don't have to refresh
      setMembersList(prev => [...prev, { id: sanitizedEmail, email: sanitizedEmail, name: nameInput.trim(), role: roleInput }]);

      setTimeout(() => {
        setAdminStatus('idle');
        setAdminMessage('');
      }, 5000);
      
    } catch (err: any) {
      console.error("Error adding member:", err);
      setAdminStatus('error');
      // Show graceful fallback message for offline testing
      setAdminMessage("Database offline. In production, this would add the member.");
      
      // Still optimistically add to local list just for visual feedback during offline testing
      const sanitizedEmail = emailInput.toLowerCase().trim();
      setMembersList(prev => [...prev, { id: sanitizedEmail, email: sanitizedEmail, name: nameInput.trim(), role: roleInput }]);
      setEmailInput('');
      
      setTimeout(() => {
        setAdminStatus('idle');
        setAdminMessage('');
      }, 5000);
    }
  };

  const handleAddTip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "tips"), {
        title: tipTitle,
        content: tipContent,
        createdAt: serverTimestamp()
      });
      setTips(prev => [...prev, { id: docRef.id, title: tipTitle, content: tipContent }]);
      setTipTitle('');
      setTipContent('');
    } catch (err) {
      console.error("Error adding tip:", err);
    }
  };

  const handleAddNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "newsletters"), {
        title: newsTitle,
        date: newsDate,
        createdAt: serverTimestamp()
      });
      setNewsletters(prev => [...prev, { id: docRef.id, title: newsTitle, date: newsDate }]);
      setNewsTitle('');
      setNewsDate('');
    } catch (err) {
      console.error("Error adding newsletter:", err);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "events"), {
        title: eventTitle,
        displayDate: eventDisplayDate,
        dayOfWeek: eventDayOfWeek,
        time: eventTime,
        location: eventLocation,
        category: eventCategory,
        description: eventDescription,
        rsvpLink: eventRSVPLink,
        // Fallbacks for calendar link
        date: "20260101T000000",
        endDate: "20260101T000000",
        fullAddress: eventLocation,
        createdAt: serverTimestamp()
      });
      setEventTitle(''); setEventDisplayDate(''); setEventDayOfWeek(''); setEventTime(''); setEventLocation(''); setEventCategory(''); setEventDescription(''); setEventRSVPLink('');
      setAdminMessage('Event added successfully!');
      setTimeout(() => setAdminMessage(''), 3000);
    } catch (err) {
      console.error("Error adding event:", err);
      setAdminMessage('Error adding event');
    }
  };

  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setProfileStatus('loading');
    try {
      await setDoc(doc(db, "members", user.email.toLowerCase().trim()), {
        major: profileMajor,
        gradYear: profileGradYear,
        linkedIn: profileLinkedIn,
        resumeLink: profileResume,
      }, { merge: true });
      setProfileStatus('success');
      setTimeout(() => setProfileStatus('idle'), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setProfileStatus('idle');
    }
  };

  const handleAddInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "internships"), {
        title: internshipTitle,
        company: internshipCompany,
        description: internshipDesc,
        link: internshipLink,
        deadline: internshipDeadline,
        createdAt: serverTimestamp()
      });
      setInternships(prev => [...prev, { id: docRef.id, title: internshipTitle, company: internshipCompany, description: internshipDesc, link: internshipLink, deadline: internshipDeadline }]);
      setInternshipTitle(''); setInternshipCompany(''); setInternshipDesc(''); setInternshipLink(''); setInternshipDeadline('');
    } catch (err) {
      console.error("Error adding internship:", err);
    }
  };

  if (loading || fetching || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 bg-[var(--columbia-blue)] rounded-full"></div>
          <div className="w-3 h-3 bg-[var(--columbia-blue)] rounded-full animation-delay-200"></div>
          <div className="w-3 h-3 bg-[var(--columbia-blue)] rounded-full animation-delay-400"></div>
        </div>
      </div>
    );
  }

  if (userRole === 'recruiter') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 min-h-screen">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-6">
          <div>
            <h1 className="font-serif text-4xl text-[var(--foreground)] mb-2">Recruiter Portal</h1>
            <p className="text-[var(--accent-grey)]">Welcome back, {user.displayName || user.email}</p>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-[var(--accent-grey)] hover:text-white transition-colors glass-panel px-4 py-2 rounded-lg"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
        
        <div className="glass-panel p-6 rounded-xl">
            <h2 className="text-2xl font-serif mb-6 text-white">GSBS Resume Book</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[var(--columbia-blue-light)] uppercase tracking-wider text-xs">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 px-4">Email</th>
                    <th className="pb-3 px-4">Major</th>
                    <th className="pb-3 px-4">Grad Year</th>
                    <th className="pb-3 px-4 text-right">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {membersList.filter(m => m.role === 'member').map((m, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 pr-4 font-medium text-white">{m.name || 'N/A'}</td>
                      <td className="py-4 px-4 text-gray-300">{m.email || m.id}</td>
                      <td className="py-4 px-4 text-gray-300">{m.major || '-'}</td>
                      <td className="py-4 px-4 text-gray-300">{m.gradYear || '-'}</td>
                      <td className="py-4 px-4 text-right space-x-3">
                        {m.linkedIn ? <a href={m.linkedIn} target="_blank" rel="noreferrer" className="text-[var(--columbia-blue-light)] hover:text-white transition-colors">LinkedIn</a> : <span className="text-gray-600">No LinkedIn</span>}
                        {m.resumeLink ? <a href={m.resumeLink} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-white transition-colors">Resume</a> : <span className="text-gray-600">No Resume</span>}
                      </td>
                    </tr>
                  ))}
                  {membersList.filter(m => m.role === 'member').length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">No members found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-6">
        <div>
          <h1 className="font-serif text-4xl text-[var(--foreground)] mb-2">Member Dashboard</h1>
          <p className="text-[var(--accent-grey)]">Welcome back, {user.displayName || user.email}</p>
        </div>
        <button 
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-[var(--accent-grey)] hover:text-white transition-colors glass-panel px-4 py-2 rounded-lg"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* My Profile Section (For all members) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h2 className="text-2xl font-serif">My Profile</h2>
        </div>
        <div className="glass-panel p-6 rounded-xl max-w-3xl">
          <p className="text-[14px] text-[var(--accent-grey)] mb-6 font-light">
            Keep your profile updated. This information is shared securely with our partner recruiters in the GSBS Resume Book.
          </p>
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={profileMajor} onChange={(e) => setProfileMajor(e.target.value)} placeholder="Major (e.g. Economics)" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
            <input type="text" value={profileGradYear} onChange={(e) => setProfileGradYear(e.target.value)} placeholder="Graduation Year (e.g. 2026)" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
            <input type="url" value={profileLinkedIn} onChange={(e) => setProfileLinkedIn(e.target.value)} placeholder="LinkedIn URL" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
            <input type="url" value={profileResume} onChange={(e) => setProfileResume(e.target.value)} placeholder="Resume Link (Google Drive, Dropbox, etc.)" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
            <div className="col-span-1 md:col-span-2 mt-2">
              <button type="submit" disabled={profileStatus === 'loading'} className="bg-[var(--columbia-blue)] text-[#0a192f] hover:bg-[var(--columbia-blue-light)] font-semibold text-sm px-6 py-3 rounded-xl transition-all w-full md:w-auto min-w-[150px]">
                {profileStatus === 'loading' ? 'Saving...' : profileStatus === 'success' ? 'Saved!' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Admin Section (Only visible to Admins) */}
      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-2xl font-serif">Admin Control Panel</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Whitelist Form */}
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-4 text-white">Whitelist a Member</h3>
              <p className="text-[14px] text-[var(--accent-grey)] mb-6 font-light">
                Enter the exact Columbia email address of the student to grant them access.
              </p>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Student Name"
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 mb-4 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner"
                  />
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 mb-4 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm rounded-xl transition-all shadow-inner"
                  >
                    <option value="member" className="bg-gray-800">Member</option>
                    <option value="admin" className="bg-gray-800">Admin</option>
                    <option value="recruiter" className="bg-gray-800">Recruiter</option>
                  </select>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="student@columbia.edu"
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={adminStatus === 'loading'}
                  className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] disabled:opacity-50"
                >
                  {adminStatus === 'loading' ? 'Processing...' : 'Approve Member'}
                </button>
                {adminMessage && (
                  <p className={`text-sm text-center mt-2 ${adminStatus === 'error' ? 'text-red-400' : 'text-[var(--columbia-blue-light)]'}`}>
                    {adminMessage}
                  </p>
                )}
              </form>
            </div>

            {/* Member List */}
            <div className="glass-panel p-6 rounded-xl flex flex-col h-full max-h-[300px]">
              <h3 className="font-semibold text-lg mb-4 text-white">Approved Directory</h3>
              <div className="overflow-y-auto pr-2 space-y-2 flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {membersList.length === 0 ? (
                  <p className="text-sm text-[var(--accent-grey)] text-center mt-10">No members found.</p>
                ) : (
                  membersList.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors overflow-hidden gap-2">
                      <span className="text-sm text-gray-200 truncate flex-1">{m.email || m.id}</span>
                      <span className={`shrink-0 text-[10px] px-2 py-1 rounded-md uppercase font-semibold tracking-wider ${
                        m.role === 'admin' ? 'bg-[var(--columbia-blue-light)]/20 text-[var(--columbia-blue-light)]' : 
                        m.role === 'recruiter' ? 'bg-purple-500/20 text-purple-400' : 
                        'bg-white/10 text-gray-400'
                      }`}>
                        {m.role || 'member'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 glass-panel p-6 rounded-xl">
            <h3 className="font-semibold text-lg mb-4 text-white">Contact Messages Inbox</h3>
            <div className="overflow-y-auto max-h-[400px] pr-2 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <p className="text-sm text-[var(--accent-grey)] text-center mt-4 mb-4">No messages yet.</p>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">{msg.name} <span className="text-sm text-gray-400 font-normal">({msg.email})</span></p>
                        {msg.organization && <p className="text-[12px] text-[var(--columbia-blue-light)]">{msg.organization}</p>}
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--accent-grey)] whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mt-10">
            {/* Add Tip Form */}
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-4 text-white">Add Interview Tip</h3>
              <form onSubmit={handleAddTip} className="space-y-4">
                <input
                  type="text"
                  required
                  value={tipTitle}
                  onChange={(e) => setTipTitle(e.target.value)}
                  placeholder="Tip Title"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner"
                />
                <textarea
                  required
                  value={tipContent}
                  onChange={(e) => setTipContent(e.target.value)}
                  placeholder="Tip Content"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner resize-none"
                />
                <button
                  type="submit"
                  className="w-full bg-white/10 text-white hover:bg-white/20 font-semibold text-sm px-6 py-3 rounded-xl transition-all"
                >
                  Publish Tip
                </button>
              </form>
            </div>

            {/* Add Newsletter Form */}
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-4 text-white">Add Newsletter</h3>
              <form onSubmit={handleAddNewsletter} className="space-y-4">
                <input
                  type="text"
                  required
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="e.g. October 2026: Mid-Term Milestones"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner"
                />
                <input
                  type="text"
                  required
                  value={newsDate}
                  onChange={(e) => setNewsDate(e.target.value)}
                  placeholder="e.g. Oct 1, 2026"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner"
                />
                <button
                  type="submit"
                  className="w-full bg-white/10 text-white hover:bg-white/20 font-semibold text-sm px-6 py-3 rounded-xl transition-all"
                >
                  Publish Newsletter
                </button>
              </form>
            </div>
          </div>

          <div className="mt-10">
            {/* Add Event Form */}
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-4 text-white">Add Upcoming Event</h3>
              <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" required value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Event Title" className="col-span-1 md:col-span-2 w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
                <input type="text" required value={eventDisplayDate} onChange={(e) => setEventDisplayDate(e.target.value)} placeholder="Display Date (e.g. Wednesday, April 22, 2026)" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
                <input type="text" required value={eventDayOfWeek} onChange={(e) => setEventDayOfWeek(e.target.value)} placeholder="Day of Week (e.g. Wednesday)" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
                <input type="text" required value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="Time (e.g. 7:00 PM - 9:00 PM)" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
                <input type="text" required value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Location (e.g. MLK 610)" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
                <input type="text" required value={eventCategory} onChange={(e) => setEventCategory(e.target.value)} placeholder="Category (e.g. Panel)" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
                <input type="url" required value={eventRSVPLink} onChange={(e) => setEventRSVPLink(e.target.value)} placeholder="RSVP Link (e.g. Luma, Google Form)" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
                <textarea required value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Event Description" rows={3} className="col-span-1 md:col-span-2 w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner resize-none" />
                <button type="submit" className="col-span-1 md:col-span-2 w-full bg-white/10 text-white hover:bg-white/20 font-semibold text-sm px-6 py-3 rounded-xl transition-all">
                  Publish Event
                </button>
              </form>
            </div>

            {/* Add Internship Form */}
            <div className="glass-panel p-6 rounded-xl mt-10 md:mt-0">
              <h3 className="font-semibold text-lg mb-4 text-white">Post Internship</h3>
              <form onSubmit={handleAddInternship} className="space-y-4">
                <input type="text" required value={internshipTitle} onChange={(e) => setInternshipTitle(e.target.value)} placeholder="Job Title (e.g. Summer Analyst)" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
                <input type="text" required value={internshipCompany} onChange={(e) => setInternshipCompany(e.target.value)} placeholder="Company (e.g. Goldman Sachs)" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
                <input type="url" required value={internshipLink} onChange={(e) => setInternshipLink(e.target.value)} placeholder="Application Link" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
                <input type="text" required value={internshipDeadline} onChange={(e) => setInternshipDeadline(e.target.value)} placeholder="Deadline (e.g. Oct 15, 2026)" className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner" />
                <textarea required value={internshipDesc} onChange={(e) => setInternshipDesc(e.target.value)} placeholder="Brief Description" rows={2} className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner resize-none" />
                <button type="submit" className="w-full bg-white/10 text-white hover:bg-white/20 font-semibold text-sm px-6 py-3 rounded-xl transition-all">
                  Post Internship
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-10">
        {/* Tips Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg text-[var(--columbia-blue-light)]">
              <Lightbulb size={20} />
            </div>
            <h2 className="text-2xl font-serif">Interview Tips & Tricks</h2>
          </div>
          <div className="flex flex-col gap-4">
            {tips.map((tip) => (
              <div key={tip.id} className="glass-panel p-6 rounded-xl hover:border-blue-500/30 transition-all duration-300 group">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--columbia-blue-light)] transition-colors">{tip.title}</h3>
                <p className="text-[var(--accent-grey)] text-sm leading-relaxed">{tip.content}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Newsletters Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <FileText size={20} />
            </div>
            <h2 className="text-2xl font-serif">Monthly Newsletters</h2>
          </div>
          <div className="flex flex-col gap-4">
            {newsletters.map((nl) => (
              <div key={nl.id} className="glass-panel p-6 rounded-xl flex justify-between items-center hover:border-purple-500/30 transition-all cursor-pointer group">
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-purple-400 transition-colors">{nl.title}</h3>
                  <p className="text-[var(--accent-grey)] text-xs mt-1">{nl.date}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <span className="text-xl">→</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Internships Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </div>
            <h2 className="text-2xl font-serif">Exclusive Internships</h2>
          </div>
          <div className="flex flex-col gap-4">
            {internships.map((job) => (
              <a href={job.link} target="_blank" rel="noreferrer" key={job.id} className="glass-panel p-6 rounded-xl block hover:border-emerald-500/30 transition-all group">
                <h3 className="font-semibold text-lg group-hover:text-emerald-400 transition-colors">{job.title}</h3>
                <p className="text-[var(--columbia-blue-light)] text-sm mb-2">{job.company}</p>
                <p className="text-[var(--accent-grey)] text-xs mb-3">{job.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Deadline: {job.deadline}</span>
                  <span className="text-emerald-400 group-hover:underline">Apply &rarr;</span>
                </div>
              </a>
            ))}
            {internships.length === 0 && (
              <div className="glass-panel p-6 rounded-xl text-center">
                <p className="text-[var(--accent-grey)] text-sm">No internships posted yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
