import re

with open('app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# 4. Update handleAddMember
content = content.replace(
    'role: "member",',
    'role: roleInput,'
)

# 5. Add new handlers
handlers_injection = """
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
"""
content = content.replace(
    'if (loading || fetching || !user) {',
    handlers_injection + '\n  if (loading || fetching || !user) {'
)

# 6. Add UI forms
whitelist_injection = """
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 mb-4 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm rounded-xl transition-all shadow-inner"
                  >
                    <option value="member" className="bg-gray-800">Member</option>
                    <option value="admin" className="bg-gray-800">Admin</option>
                    <option value="recruiter" className="bg-gray-800">Recruiter</option>
                  </select>
"""
content = content.replace(
    'type="email"',
    whitelist_injection + 'type="email"'
)

with open('app/dashboard/page.tsx', 'w') as f:
    f.write(content)
