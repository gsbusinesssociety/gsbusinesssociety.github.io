"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
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
  const { user, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  
  const [tips, setTips] = useState<any[]>([]);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Admin Panel states
  const [emailInput, setEmailInput] = useState("");
  const [adminStatus, setAdminStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [adminMessage, setAdminMessage] = useState("");

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

        // If admin, fetch members list
        if (isAdmin) {
          const membersSnap = await Promise.race([
            getDocs(collection(db, "members")),
            timeoutPromise
          ]) as any;
          
          if (membersSnap.empty) setMembersList(PLACEHOLDER_MEMBERS);
          else setMembersList(membersSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
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
          role: "member",
          addedAt: serverTimestamp(),
          addedBy: user?.email
        }),
        timeoutPromise
      ]);
      
      setAdminStatus('success');
      setAdminMessage(`${sanitizedEmail} has been added to the whitelist!`);
      setEmailInput('');
      
      // Optimistically add to local list so they don't have to refresh
      setMembersList(prev => [...prev, { id: sanitizedEmail, email: sanitizedEmail, role: "member" }]);

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
      setMembersList(prev => [...prev, { id: sanitizedEmail, email: sanitizedEmail, role: "member" }]);
      setEmailInput('');
      
      setTimeout(() => {
        setAdminStatus('idle');
        setAdminMessage('');
      }, 5000);
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

      {/* Admin Section (Only visible to Admins) */}
      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-500 pointer-events-none">
            <ShieldCheck size={160} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-emerald-400" size={24} />
              <h2 className="text-2xl font-serif text-emerald-400">Admin Control Panel</h2>
            </div>
            <p className="text-[var(--accent-grey)] mb-8 max-w-2xl text-sm leading-relaxed">
              You have administrator privileges. Use this panel to manually approve new members to the Columbia GS Business Society platform.
            </p>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Whitelist Form */}
              <div className="glass-panel bg-black/20 p-6 rounded-2xl border border-emerald-500/10">
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-6 text-white">
                  <PlusCircle size={18} className="text-emerald-400" />
                  Whitelist a New Member
                </h3>
                <form onSubmit={handleAddMember} className="space-y-5">
                  <div>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="student@columbia.edu"
                      className="w-full bg-black/40 border border-white/5 px-4 py-3.5 focus:outline-none focus:border-emerald-500/50 text-white text-sm placeholder:text-white/20 rounded-xl transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={adminStatus === 'loading'}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium text-sm px-6 py-3.5 rounded-xl transition-all border border-emerald-500/30 hover:border-emerald-500/50"
                  >
                    {adminStatus === 'loading' ? 'Processing...' : 'Approve Member'}
                  </button>
                  {adminMessage && (
                    <p className={`text-sm text-center ${adminStatus === 'error' ? 'text-orange-400' : 'text-emerald-400'}`}>
                      {adminMessage}
                    </p>
                  )}
                </form>
              </div>

              {/* Member List */}
              <div className="glass-panel bg-black/20 p-6 rounded-2xl border border-emerald-500/10 flex flex-col h-full min-h-[250px] max-h-[350px]">
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-white">
                  <Users size={18} className="text-emerald-400" />
                  Approved Members Directory
                </h3>
                <div className="overflow-y-auto pr-2 space-y-2 flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {membersList.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center mt-10">No members found.</p>
                  ) : (
                    membersList.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-sm text-gray-300">{m.email}</span>
                        <span className={`text-[10px] px-2.5 py-1 rounded-md uppercase font-bold tracking-wider ${
                          m.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-gray-400 border border-white/10'
                        }`}>
                          {m.role || 'member'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-10">
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
      </div>
    </div>
  );
}
