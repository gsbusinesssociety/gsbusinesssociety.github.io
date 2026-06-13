"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { FileText, Lightbulb, LogOut } from "lucide-react";

const PLACEHOLDER_TIPS = [
  { id: 1, title: "Mastering the IB Technical Interview", content: "Focus on the 400 questions guide. Don't memorize, understand the underlying accounting principles." },
  { id: 2, title: "Consulting Case Prep Frameworks", content: "Victor Cheng's LOMS is a great start. Practice structuring your thoughts aloud before diving into math." }
];

const PLACEHOLDER_NEWSLETTERS = [
  { id: 1, title: "September 2026: Recruiting Kickoff", date: "Sep 1, 2026" },
  { id: 2, title: "October 2026: Mid-Term Milestones", date: "Oct 1, 2026" }
];

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  
  const [tips, setTips] = useState<any[]>([]);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Attempt to fetch from Firestore
        const tipsSnap = await getDocs(collection(db, "tips"));
        const newsSnap = await getDocs(collection(db, "newsletters"));
        
        if (tipsSnap.empty) {
          setTips(PLACEHOLDER_TIPS);
        } else {
          setTips(tipsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        if (newsSnap.empty) {
          setNewsletters(PLACEHOLDER_NEWSLETTERS);
        } else {
          setNewsletters(newsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.warn("Firestore not configured yet or error fetching. Using placeholders.", err);
        setTips(PLACEHOLDER_TIPS);
        setNewsletters(PLACEHOLDER_NEWSLETTERS);
      } finally {
        setFetching(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

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

      <div className="grid md:grid-cols-2 gap-10">
        {/* Tips Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
          transition={{ duration: 0.5, delay: 0.1 }}
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
