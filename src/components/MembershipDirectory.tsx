import React, { useState, useEffect, useMemo } from "react";
import { 
  User, Shield, Check, Lock, Calendar, ClipboardList, BookOpen, 
  Award, Download, Search, Users, EyeOff, Edit3, Megaphone, 
  Sparkles, FileText, Play, ExternalLink, ChevronRight, Info, AlertCircle 
} from "lucide-react";
import { Member, Event, Ministry } from "../types";
import { translations } from "../lib/translations";

interface MembershipDirectoryProps {
  language: "en" | "ss";
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  author: string;
}

export default function MembershipDirectory({ language }: MembershipDirectoryProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<
    "profile" | "announcements" | "exclusive" | "documents" | "ministries" | "events" | "roster" | "giving" | "directory"
  >("profile");

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState("");

  // Directory Search states
  const [dirSearch, setDirSearch] = useState("");
  const [dirGroup, setDirGroup] = useState("All");

  // Profile update fields
  const [profileName, setProfileName] = useState("");
  const [profileDistrict, setProfileDistrict] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileFamilyGroup, setProfileFamilyGroup] = useState("");
  const [profileFamilyRelation, setProfileFamilyRelation] = useState("");
  const [profileHidden, setProfileHidden] = useState(false);
  const [profileHideEmail, setProfileHideEmail] = useState(false);
  const [profileHideDistrict, setProfileHideDistrict] = useState(false);
  const [profileHideEntireProfile, setProfileHideEntireProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Directory layout mode
  const [directoryMode, setDirectoryMode] = useState<"individuals" | "families">("individuals");

  // Dynamic portal lists & loaders
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loadingMinistries, setLoadingMinistries] = useState(false);
  const [joinedMinistries, setJoinedMinistries] = useState<string[]>([]);

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  // Exclusive Video modal player state
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Fetch initial member list for logins
  useEffect(() => {
    fetchMembers();
  }, []);

  // Fetch portals resource whenever user logs in
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchAnnouncements();
      fetchMinistries();
      fetchEvents();
    }
  }, [isLoggedIn, currentUser?.email]);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members");
      if (res.ok) {
        const data = await res.json();
        setAllMembers(data);
      }
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  };

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const fetchMinistries = async () => {
    setLoadingMinistries(true);
    try {
      const res = await fetch("/api/ministries");
      if (res.ok) {
        const data = await res.json();
        setMinistries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMinistries(false);
    }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
        
        if (currentUser) {
          // Identify which events the logged in user is already registered for
          const registered = data
            .filter((ev: Event) => ev.registeredUsers?.includes(currentUser.email))
            .map((ev: Event) => ev.id);
          setRegisteredEvents(registered);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const populateProfileStates = (member: Member) => {
    setProfileName(member.name);
    setProfileDistrict(member.district);
    setProfilePhone(member.phone);
    setProfileBio(member.bio || "");
    setProfileFamilyGroup(member.familyGroup || "General Circle");
    setProfileFamilyRelation(member.familyRelation || "Member");
    setProfileHidden(member.privacySettings?.hideContact || false);
    setProfileHideEmail(member.privacySettings?.hideEmail || false);
    setProfileHideDistrict(member.privacySettings?.hideDistrict || false);
    setProfileHideEntireProfile(member.privacySettings?.hideEntireProfile || false);
  };

  const handleQuickLogin = (email: string) => {
    const found = allMembers.find((m) => m.email === email);
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
      populateProfileStates(found);
      setLoginError("");
    }
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = allMembers.find((m) => m.email.toLowerCase() === loginEmail.toLowerCase());
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
      populateProfileStates(found);
      setLoginError("");
    } else {
      setLoginError(
        language === "en" 
          ? "Member credentials not recognized. Try Quick-Login below!" 
          : "Livi lekungena alikhonjwa. Sicela ucinge Quick-Login ngentansi!"
      );
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentUser.id,
          name: profileName,
          district: profileDistrict,
          phone: profilePhone,
          bio: profileBio,
          familyGroup: profileFamilyGroup,
          familyRelation: profileFamilyRelation,
          hideContact: profileHidden,
          hideEmail: profileHideEmail,
          hideDistrict: profileHideDistrict,
          hideEntireProfile: profileHideEntireProfile
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        populateProfileStates(updated);
        setProfileSuccess(true);
        fetchMembers(); // refresh private directory
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadGivingStatement = () => {
    if (!currentUser) return;
    const history = currentUser.givingHistory || [];
    const listStr = history
      .map((g) => `Date: ${g.date} | Purpose: ${g.purpose} | Amount: E${g.amount} | Ref: ${g.txId}`)
      .join("\n");

    const total = history.reduce((acc, curr) => acc + curr.amount, 0);

    const content = `FONTEYN EVANGELICAL CHURCH
OFFICIAL ANNUAL TITHES & DONATIONS STATEMENT

Member Name: ${currentUser.name}
Email: ${currentUser.email}
Phone: ${currentUser.phone}
District: ${currentUser.district}
Tax Fiscal Year: 2026

Giving breakdown:
----------------------------------------
${listStr || "No donations registered for this year yet."}
----------------------------------------
TOTAL CONTRIBUTIONS REGISTERED: E${total}

This certifies that the donations registered above were received in full. Members in Eswatini may present this certificate for potential charity tax rebate computations.

© 2026 Fonteyn Evangelical Church Governance Board, Mbabane.`;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentUser.name.replace(/\s+/g, "_")}_Giving_Statement_2026.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Join ministry handler
  const handleJoinMinistry = async (ministryId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/ministries/${ministryId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone
        })
      });
      if (res.ok) {
        setJoinedMinistries(prev => [...prev, ministryId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Register event handler
  const handleRegisterEvent = async (eventId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email
        })
      });
      if (res.ok) {
        setRegisteredEvents(prev => [...prev, eventId]);
        fetchEvents(); // update dynamic seat counters
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Church document downloads (real plain-text downloads)
  const handleDownloadDocument = (docId: string, title: string) => {
    let content = "";
    if (docId === "doc1") {
      content = `FONTEYN EVANGELICAL CHURCH
OFFICIAL CONSTITUTION & COVENANT VOWS

This document establishes the official governance, doctrinal statement, and covenant guidelines of Fonteyn Evangelical Church, set in Mbabane, Eswatini.

I. DOCTRINAL STATEMENT
- We believe the scriptures to be the fully inspired, infallible, and sovereign Word of God.
- We believe in the Father, Son, and Holy Spirit as the triune representation of divine love.
- We declare the salvation of mankind through Christ's work on Calvary's cross.

II. THE COVENANT VOW
As registered covenantal members of FEC, we vow to:
1. Support the assembly in daily intercessions and weekly fellowship worship.
2. Honor God with our tithes, offerings, and proactive volunteerism in the hills of Fonteyn.
3. Live as representatives of Christ's peace, keeping our families grounded in devotion.

Certified by: FEC Governance Trust Board, 2026.`;
    } else if (docId === "doc2") {
      content = `FONTEYN EVANGELICAL CHURCH
2026 MINISTRY ACTION PLAN & BLUEPRINT

Our mission for the year 2026 is marked by 'Deeper Faith, Wider Reach' inside the Mbabane region.

KEY MILESTONES:
1. Mbabane Central Outreach Campaign: Reaching 5,000 households with the Gospel of Calvary.
2. Fonteyn Family Counseling Center: Establishing our physical support center for marital counseling and youth development.
3. Youth & Siswati Leaders Mentoring Academy: Enrolling 100 students in practical church leadership frameworks.
4. Campus Expansion: Finalizing the flooring and solar backup array in our Main Sanctuary.

Partner with us in prayer and continuous monthly support.`;
    } else if (docId === "doc3") {
      content = `FONTEYN EVANGELICAL CHURCH
CELL GROUP WEEKLY STUDY GUIDE - THE BOOK OF ROMANS

Theme: Justified by Faith, Living in Grace
Reading Assignment: Romans Chapter 8, verses 1-18.

DISCUSSION QUESTIONS FOR YOUR CELL FELLOWSHIP:
1. Verse 1 declares 'There is therefore now no condemnation for those who are in Christ Jesus.' How does this truth alter your personal perspective on past failures?
2. In Verse 14, we are told that 'those who are led by the Spirit of God are the sons of God.' How can we actively listen for and surrender to the promptings of the Holy Spirit throughout our workweek in Mbabane?
3. How can our cell group practically support members currently navigating heavy burdens or emotional trials this week?

Prayer Focus: Strengthening families, employment security, and national peace in Eswatini.`;
    } else if (docId === "doc4") {
      content = `FONTEYN EVANGELICAL CHURCH
STEWARDSHIP & COVENANT TITHING PLEDGE CARD

'Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this,' says the Lord Almighty... - Malachi 3:10

COVENANT COMMITMENT:
Knowing that God is the provider of all that I possess, and desiring to partner with Him in bringing the Gospel of grace to the Fonteyn hills, I prayerfully pledge to dedicate:
- My Tithes (10% of my monthly income/harvest)
- Support Offerings for local missions
- My spiritual gifts inside our ministries

Name: _______________________
Email: ______________________
Target Department: _________________
Signature: __________________

Please print this pledge form, complete it prayerfully, and return it to any pastor or drop it in the sanctuary offering boxes.`;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Directory filter logic
  const filteredDirectory = allMembers.filter((mem) => {
    // Enforce entire profile privacy: do not show if hideEntireProfile is true,
    // unless the current user is looking at their own profile.
    if (mem.privacySettings?.hideEntireProfile && mem.id !== currentUser?.id) {
      return false;
    }

    const matchesSearch =
      mem.name.toLowerCase().includes(dirSearch.toLowerCase()) ||
      (mem.district && mem.district.toLowerCase().includes(dirSearch.toLowerCase())) ||
      (mem.familyGroup && mem.familyGroup.toLowerCase().includes(dirSearch.toLowerCase())) ||
      (mem.email && mem.email.toLowerCase().includes(dirSearch.toLowerCase())) ||
      (mem.phone && mem.phone.includes(dirSearch));

    const matchesGroup = dirGroup === "All" || mem.familyGroup === dirGroup;

    return matchesSearch && matchesGroup;
  });

  const familyGroups = useMemo(() => {
    const groups = new Set<string>();
    groups.add("All");
    allMembers.forEach((m) => {
      // Exclude hidden profiles from the group filter list
      if (m.privacySettings?.hideEntireProfile && m.id !== currentUser?.id) {
        return;
      }
      if (m.familyGroup) {
        groups.add(m.familyGroup);
      }
    });
    return Array.from(groups);
  }, [allMembers, currentUser?.id]);

  // Documents list
  const churchDocs: any[] = [];
  const exclusiveVideos: any[] = [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {!isLoggedIn ? (
        /* LOGIN PANEL */
        <div className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 animate-fade-in text-center">
          <div className="bg-primary-100 text-primary-900 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto border border-primary-800/5">
            <Lock className="h-6 w-6 text-primary-800" />
          </div>
          
          <h2 className="font-heading font-extrabold text-xl text-primary-950 mb-1">
            {translations.portalTitle[language]}
          </h2>
          <p className="text-slate-500 font-sans text-xs mb-6 px-4">
            {language === "en"
              ? "Access your personal profiles, view internal announcements, access exclusive content, download documents, and register for events."
              : "Ngena ukutfola sikhundla sakho sasesontfweni, simemetelo sangekhatsi, tincwadzi, nemicimbi leyingcondvo."}
          </p>

          <form onSubmit={handleFormLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1.5">Registered Email *</label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-800"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors shadow-md"
            >
              {language === "en" ? "Access Member Portal" : "Ngena kwi-Portal"}
            </button>
          </form>

          {loginError && (
            <p className="text-red-500 font-sans text-xs mt-3">{loginError}</p>
          )}

          {/* Quick Member Selector */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-left">
            <p className="text-[10px] font-heading font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
              {language === "en" ? "Demo Member Quick-Login" : "Khetfa Lilunga Lekulingisa"}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleQuickLogin("siphom.yati@gmail.com")}
                className="bg-slate-50 hover:bg-gold-50 border border-slate-200 hover:border-gold-300 text-slate-700 hover:text-primary-950 p-2.5 rounded-xl text-left transition-all"
              >
                <span className="block font-heading font-bold text-xs">Sipho Maseko</span>
                <span className="block text-[9px] text-slate-400 font-sans italic mt-0.5">Primary • Fonteyn</span>
              </button>

              <button
                onClick={() => handleQuickLogin("nomsa.shongwe@test.com")}
                className="bg-slate-50 hover:bg-gold-50 border border-slate-200 hover:border-gold-300 text-slate-700 hover:text-primary-950 p-2.5 rounded-xl text-left transition-all"
              >
                <span className="block font-heading font-bold text-xs">Nomsa Shongwe</span>
                <span className="block text-[9px] text-slate-400 font-sans italic mt-0.5">Youth Leader • Fonteyn</span>
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* PORTAL ACTIVE DASHBOARD */
        <div className="space-y-8 animate-fade-in">
          
          {/* Member Banner header */}
          {currentUser && (
            <div className="bg-primary-900 rounded-3xl p-6 sm:p-8 text-white border border-primary-850 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-white text-primary-900 flex items-center justify-center font-heading font-extrabold text-2xl border-2 border-gold-400 shadow overflow-hidden shrink-0">
                  <img 
                    src={currentUser.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300"} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-extrabold text-xl">{currentUser.name}</h3>
                    <span className="bg-gold-500 text-primary-950 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs mt-0.5">{currentUser.email} • {currentUser.district || "Fonteyn"}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setCurrentUser(null);
                  }}
                  className="bg-slate-800/50 hover:bg-slate-800 text-xs font-heading font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all border border-slate-700 text-slate-200"
                >
                  {language === "en" ? "Log Out" : "Phuma"}
                </button>
              </div>
            </div>
          )}

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-200 pb-px overflow-x-auto scrollbar-thin space-x-1">
            {[
              { id: "profile", label: language === "en" ? "My Profile" : "Lifayela Lami", icon: User },
              { id: "announcements", label: language === "en" ? "Announcements" : "Timemetelo", icon: Megaphone },
              { id: "exclusive", label: language === "en" ? "Exclusive Content" : "Tingcondvo Letikhetsiwe", icon: Sparkles },
              { id: "documents", label: language === "en" ? "Documents" : "Tincwadzi", icon: FileText },
              { id: "ministries", label: language === "en" ? "Ministries" : "Tingaba", icon: Users },
              { id: "events", label: language === "en" ? "Register Events" : "Bhalisa Imicimbi", icon: Calendar },
              { id: "roster", label: language === "en" ? "Roster & Attendance" : "Roster neKukhona", icon: ClipboardList },
              { id: "giving", label: language === "en" ? "Giving Statements" : "Titatimende", icon: BookOpen },
              { id: "directory", label: language === "en" ? "Member Directory" : "Ibhadi Lamalunga", icon: Search },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 pb-3 px-4 font-heading font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary-800 text-primary-900 font-extrabold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENTS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
            
            {activeTab === "profile" && currentUser && (
              /* MY PROFILE TAB */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-fade-in">
                
                {/* Form column */}
                <div>
                  <h4 className="font-heading font-bold text-base text-primary-950 mb-4 pb-2 border-b border-slate-50 flex items-center space-x-1.5">
                    <Edit3 className="h-4.5 w-4.5 text-gold-500" />
                    <span>{language === "en" ? "Update Contact Profile" : "Kuhlela Kabusha Lifayela"}</span>
                  </h4>

                  {profileSuccess && (
                    <p className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-200 text-xs font-sans mb-4 flex items-center space-x-1 font-medium animate-pulse">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>{language === "en" ? "Profile updated successfully!" : "Ulwazi lubuyeketiwe ngalokuphelele!"}</span>
                    </p>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Your Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-800 font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">District (Mbabane)</label>
                        <input
                          type="text"
                          value={profileDistrict}
                          onChange={(e) => setProfileDistrict(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Mobile Contact</label>
                        <input
                          type="text"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Family Household</label>
                        <select
                          value={profileFamilyGroup === "Maseko Household" || profileFamilyGroup === "Shongwe Household" || profileFamilyGroup === "Dlamini Household" || profileFamilyGroup === "General Circle" ? profileFamilyGroup : "Other"}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== "Other") {
                              setProfileFamilyGroup(val);
                            } else {
                              setProfileFamilyGroup("");
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-800 font-medium"
                        >
                          <option value="Maseko Household">Maseko Household</option>
                          <option value="Shongwe Household">Shongwe Household</option>
                          <option value="Dlamini Household">Dlamini Household</option>
                          <option value="General Circle">General Circle</option>
                          <option value="Other">Custom Household...</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Household Role / Relation</label>
                        <input
                          type="text"
                          placeholder="e.g. Father, Mother, Son"
                          value={profileFamilyRelation}
                          onChange={(e) => setProfileFamilyRelation(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-800"
                        />
                      </div>
                    </div>

                    {!(profileFamilyGroup === "Maseko Household" || profileFamilyGroup === "Shongwe Household" || profileFamilyGroup === "Dlamini Household" || profileFamilyGroup === "General Circle") && (
                      <div className="animate-fade-in">
                        <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Custom Household Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Simelane Household"
                          value={profileFamilyGroup}
                          onChange={(e) => setProfileFamilyGroup(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-850 font-semibold"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Spiritual Bio / Testament</label>
                      <textarea
                        rows={3}
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-800 font-sans"
                        placeholder="Write a brief statement of faith, your service story or testimonies..."
                      />
                    </div>

                    {/* Privacy Settings box */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <p className="font-heading font-extrabold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <Shield className="h-4 w-4 text-primary-800" />
                        <span>Privacy & Visibility Controls</span>
                      </p>
                      <div className="space-y-2">
                        <label className="flex items-start space-x-2.5 text-xs text-slate-600 font-sans cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={profileHidden}
                            onChange={(e) => setProfileHidden(e.target.checked)}
                            className="mt-0.5 h-4 w-4 text-primary-800 focus:ring-primary-800 rounded border-slate-300"
                          />
                          <span>Hide my phone number in the directory.</span>
                        </label>

                        <label className="flex items-start space-x-2.5 text-xs text-slate-600 font-sans cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={profileHideEmail}
                            onChange={(e) => setProfileHideEmail(e.target.checked)}
                            className="mt-0.5 h-4 w-4 text-primary-800 focus:ring-primary-800 rounded border-slate-300"
                          />
                          <span>Hide my email address in the directory.</span>
                        </label>

                        <label className="flex items-start space-x-2.5 text-xs text-slate-600 font-sans cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={profileHideDistrict}
                            onChange={(e) => setProfileHideDistrict(e.target.checked)}
                            className="mt-0.5 h-4 w-4 text-primary-800 focus:ring-primary-800 rounded border-slate-300"
                          />
                          <span>Hide my district location in the directory.</span>
                        </label>

                        <label className="flex items-start space-x-2.5 text-xs text-slate-600 font-sans cursor-pointer select-none border-t border-slate-200/50 pt-2.5 mt-1">
                          <input
                            type="checkbox"
                            checked={profileHideEntireProfile}
                            onChange={(e) => setProfileHideEntireProfile(e.target.checked)}
                            className="mt-0.5 h-4 w-4 text-rose-600 focus:ring-rose-500 rounded border-slate-300"
                          />
                          <span className="text-slate-700 font-medium">Invisible Mode (Do not show my profile in directory).</span>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all shadow"
                    >
                      Save Profile Changes
                    </button>
                  </form>
                </div>

                {/* Info summary Column */}
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/55">
                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-primary-900 mb-3 flex items-center space-x-1.5">
                      <Shield className="h-4 w-4" />
                      <span>Membership Verification Badge</span>
                    </h4>
                    
                    <div className="space-y-3 font-sans text-xs text-slate-600">
                      <p className="flex justify-between border-b border-slate-200/50 pb-2">
                        <span>Status</span>
                        <span className="font-bold text-emerald-600 uppercase tracking-wide">Active Covenantal Member</span>
                      </p>
                      <p className="flex justify-between border-b border-slate-200/50 pb-2">
                        <span>Family Household Group</span>
                        <span className="font-heading font-bold text-slate-800">{currentUser.familyGroup || "General Circle"}</span>
                      </p>
                      <p className="flex justify-between border-b border-slate-200/50 pb-2">
                        <span>Household Relationship</span>
                        <span className="font-heading font-bold text-slate-800">{currentUser.familyRelation || "Member"}</span>
                      </p>
                      <p className="flex justify-between border-b border-slate-200/50 pb-2">
                        <span>Serving Office</span>
                        <span className="font-heading font-bold text-slate-800">{currentUser.servingDepartment || "Intercessor / Choir"}</span>
                      </p>
                      <p className="flex justify-between pb-1">
                        <span>Cell Group Unit</span>
                        <span className="font-heading font-bold text-slate-800">{(currentUser.district || "Fonteyn") + " Central Cell"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100 flex items-start space-x-3 text-amber-900 text-xs leading-relaxed">
                    <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[10px] mb-1">Covenant Member Guarantee</p>
                      <p className="text-slate-600">
                        Fonteyn Evangelical Church secures your personal profile data. Your private information is exclusively shared with authorized pastors and elders to support your faith path and family prayer targets.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "announcements" && (
              /* ANNOUNCEMENTS TAB */
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h4 className="font-heading font-bold text-base text-primary-950 flex items-center space-x-1.5">
                      <Megaphone className="h-4.5 w-4.5 text-gold-500" />
                      <span>{language === "en" ? "Internal Announcements" : "Timemetelo Tasekhaya"}</span>
                    </h4>
                    <p className="text-slate-400 font-sans text-xs mt-0.5">Stay up to date with urgent notices and updates from the pastorate.</p>
                  </div>
                </div>

                {loadingAnnouncements ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-mono animate-pulse">
                    Loading announcements feed...
                  </div>
                ) : announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-150 hover:border-gold-500/25 hover:bg-slate-50/85 transition-all">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className={`inline-block text-[9px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 ${
                              ann.category === "Youth" 
                                ? "bg-amber-100 text-amber-800" 
                                : ann.category === "Prayer" 
                                ? "bg-primary-100 text-primary-800" 
                                : "bg-teal-100 text-teal-800"
                            }`}>
                              {ann.category}
                            </span>
                            <h5 className="font-heading font-extrabold text-sm sm:text-base text-slate-900">{ann.title}</h5>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 shrink-0">{ann.date}</span>
                        </div>
                        <p className="text-slate-600 font-sans text-xs sm:text-sm mt-2 leading-relaxed whitespace-pre-wrap">
                          {ann.content}
                        </p>
                        <div className="border-t border-slate-200/50 mt-4 pt-2 flex items-center text-[10px] text-slate-400 font-mono">
                          <span>Authorized by: {ann.author}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 italic text-xs font-sans">
                    No active internal announcements registered at this time. Check back later!
                  </div>
                )}
              </div>
            )}

            {activeTab === "exclusive" && (
              /* EXCLUSIVE CONTENT TAB */
              <div className="space-y-8 animate-fade-in text-slate-700">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-heading font-bold text-base text-primary-950 flex items-center space-x-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-gold-500" />
                    <span>Covenant Members Exclusive Studies</span>
                  </h4>
                  <p className="text-slate-400 font-sans text-xs mt-0.5">Deeper spiritual teaching frameworks and unlisted streams reserved for committed covenant members.</p>
                </div>

                {/* Video Lesson Grid */}
                <div>
                  <h5 className="font-heading font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Masterclass Video Teachings</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {exclusiveVideos.map((vid) => (
                      <div key={vid.id} className="bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2.5">
                            <span className="bg-primary-900 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                              {vid.length}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">Speaker: {vid.speaker}</span>
                          </div>
                          <h6 className="font-heading font-bold text-sm text-slate-900 mb-1.5">{vid.title}</h6>
                          <p className="text-slate-500 font-sans text-xs leading-relaxed">{vid.desc}</p>
                        </div>
                        
                        <div className="p-5 pt-0">
                          <button
                            onClick={() => setActiveVideoUrl(vid.embedId)}
                            className="w-full bg-primary-100 hover:bg-gold-500 hover:text-primary-950 text-primary-900 font-heading font-bold text-[10px] uppercase tracking-wider py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5"
                          >
                            <Play className="h-3 w-3 fill-current shrink-0" />
                            <span>Stream Lesson Online</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Video Modal Player */}
                {activeVideoUrl && (
                  <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-slate-200">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <span className="font-heading font-bold text-xs text-primary-900 uppercase tracking-widest">Exclusive Video Broadcast</span>
                        <button 
                          onClick={() => setActiveVideoUrl(null)}
                          className="text-slate-400 hover:text-slate-700 font-heading text-xs uppercase font-extrabold"
                        >
                          Close
                        </button>
                      </div>
                      <div className="aspect-video w-full bg-black">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${activeVideoUrl}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  </div>
                )}

                {/* Exclusive Text Studies */}
                <div className="pt-4 border-t border-slate-100">
                  <h5 className="font-heading font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Pastoral Devotional Archives</h5>
                  <div className="space-y-3.5">
                    <div className="bg-gold-50/30 p-4 rounded-xl border border-gold-100 text-xs">
                      <p className="font-heading font-bold text-primary-900 mb-1">Weekly Focus: Rooted on Calvary's Grace</p>
                      <p className="text-slate-600 leading-relaxed">
                        "Eswatini's mountains are beautiful, but they can isolate us in our storms. As covenant partners, let us continually lift our eyes to Jesus. True spiritual stability comes when your morning routine starts at the cross, surrendering each burden in Siswati or English prayer."
                      </p>
                      <span className="block font-mono text-[9px] text-primary-800 font-bold mt-2">— Rev. L. S. Mnisi</span>
                    </div>

                    <div className="bg-teal-50/25 p-4 rounded-xl border border-teal-100 text-xs">
                      <p className="font-heading font-bold text-teal-950 mb-1">Cell Leader Devotional: Unity in Action</p>
                      <p className="text-slate-600 leading-relaxed">
                        "Leading a home fellowship requires extreme spiritual patience. You are not only teaching; you are listening. Keep your hearts open to the unspoken concerns of widows and youth inside Mbabane districts."
                      </p>
                      <span className="block font-mono text-[9px] text-teal-800 font-bold mt-2">— Associate Pastor Lindifa Nxumalo</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "documents" && (
              /* CHURCH DOCUMENTS TAB */
              <div className="space-y-6 animate-fade-in text-slate-700">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-heading font-bold text-base text-primary-950 flex items-center space-x-1.5">
                    <FileText className="h-4.5 w-4.5 text-gold-500" />
                    <span>Church Downloads Repository</span>
                  </h4>
                  <p className="text-slate-400 font-sans text-xs mt-0.5">Securely download official church constitutions, weekly fellowship study worksheets, and tithing pledge forms.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {churchDocs.map((doc) => (
                    <div key={doc.id} className="bg-slate-50 border border-slate-150 p-4 rounded-2xl hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="bg-gold-500/10 text-primary-900 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                            {doc.type} • {doc.size}
                          </span>
                        </div>
                        <h5 className="font-heading font-bold text-xs sm:text-sm text-slate-900 mb-1">{doc.title}</h5>
                        <p className="text-slate-500 text-[11px] leading-relaxed mb-4">{doc.desc}</p>
                      </div>

                      <button
                        onClick={() => handleDownloadDocument(doc.id, doc.title)}
                        className="w-full bg-white hover:bg-primary-900 hover:text-white border border-slate-200 text-primary-950 font-heading font-bold text-[10px] uppercase tracking-wider py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5"
                      >
                        <Download className="h-3.5 w-3.5 shrink-0" />
                        <span>Download Resource</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "ministries" && (
              /* JOIN MINISTRIES TAB */
              <div className="space-y-6 animate-fade-in text-slate-700">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-heading font-bold text-base text-primary-950 flex items-center space-x-1.5">
                    <Users className="h-4.5 w-4.5 text-gold-500" />
                    <span>Join Ministry Groups</span>
                  </h4>
                  <p className="text-slate-400 font-sans text-xs mt-0.5">Find a family circle to grow, share your spiritual gifts, and serve Mbabane communities.</p>
                </div>

                {loadingMinistries ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-mono animate-pulse">
                    Loading ministries...
                  </div>
                ) : ministries.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ministries.map((min) => {
                      const hasJoined = joinedMinistries.includes(min.id);
                      return (
                        <div key={min.id} className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center mb-2.5">
                              <span className="text-[10px] text-slate-400 font-mono">🕒 {min.schedule}</span>
                            </div>
                            <h5 className="font-heading font-bold text-sm text-slate-900 mb-1.5">{min.name}</h5>
                            <p className="text-slate-500 text-xs leading-relaxed mb-4">{min.description}</p>
                          </div>

                          <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <img src={min.leader?.photo} alt={min.leader?.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                              <div>
                                <p className="text-[10px] font-heading font-bold text-slate-800">{min.leader?.name}</p>
                                <p className="text-[8px] text-slate-400 font-mono uppercase">{min.leader?.role}</p>
                              </div>
                            </div>

                            {hasJoined ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-heading font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center space-x-1">
                                <Check className="h-3 w-3" />
                                <span>Request Sent</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleJoinMinistry(min.id)}
                                className="bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-colors shadow-sm"
                              >
                                Join Group
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-xs">No ministries found.</p>
                )}
              </div>
            )}

            {activeTab === "events" && (
              /* REGISTER FOR EVENTS TAB */
              <div className="space-y-6 animate-fade-in text-slate-700">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-heading font-bold text-base text-primary-950 flex items-center space-x-1.5">
                    <Calendar className="h-4.5 w-4.5 text-gold-500" />
                    <span>Register for Events & Conferences</span>
                  </h4>
                  <p className="text-slate-400 font-sans text-xs mt-0.5">Register for upcoming conferences and worship nights with seat-reservation updates.</p>
                </div>

                {loadingEvents ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-mono animate-pulse">
                    Loading upcoming events...
                  </div>
                ) : events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((ev) => {
                      const isRegistered = registeredEvents.includes(ev.id);
                      const currentCapacity = ev.registeredUsers ? ev.registeredUsers.length : 0;
                      const seatsLeft = Math.max(0, (ev.maxCapacity || 100) - currentCapacity);

                      return (
                        <div key={ev.id} className="bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden flex flex-col justify-between">
                          <div className="aspect-video w-full relative bg-slate-200 overflow-hidden shrink-0">
                            <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                            <span className="absolute top-3 right-3 bg-primary-950/85 backdrop-blur-md text-white text-[8px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
                              {ev.category}
                            </span>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h5 className="font-heading font-extrabold text-sm text-slate-900 mb-1.5">{ev.title}</h5>
                              <p className="text-slate-500 text-xs leading-relaxed mb-4">{ev.description}</p>
                              
                              <div className="space-y-1.5 text-[10px] font-mono text-slate-500 mb-4 pt-3 border-t border-slate-200/50">
                                <p>🗓️ Date: {ev.date} at {ev.time}</p>
                                <p>📍 Venue: {ev.location}</p>
                                <p>🎟️ Seats Left: {seatsLeft} / {ev.maxCapacity || 100}</p>
                              </div>
                            </div>

                            {isRegistered ? (
                              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-heading font-bold uppercase tracking-wider py-2.5 rounded-xl text-center flex items-center justify-center space-x-1">
                                <Check className="h-4 w-4" />
                                <span>Seat Registered</span>
                              </div>
                            ) : seatsLeft === 0 ? (
                              <div className="bg-slate-100 text-slate-400 text-xs font-heading font-bold uppercase py-2.5 rounded-xl text-center">
                                Fully Booked
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRegisterEvent(ev.id)}
                                className="w-full bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-colors shadow-sm"
                              >
                                Reserve My Seat
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-xs">No upcoming events listed.</p>
                )}
              </div>
            )}

            {activeTab === "roster" && currentUser && (
              /* SERVING ROSTER & ATTENDANCE TAB */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-fade-in">
                
                {/* Serve Rosters */}
                <div>
                  <h4 className="font-heading font-bold text-base text-primary-950 mb-4 pb-2 border-b border-slate-50 flex items-center space-x-1.5">
                    <ClipboardList className="h-4.5 w-4.5 text-gold-500" />
                    <span>My Serve Engagements</span>
                  </h4>

                  {currentUser.serviceRegistry && currentUser.serviceRegistry.length > 0 ? (
                    <div className="space-y-3">
                      {currentUser.serviceRegistry.map((reg, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                          <span className="bg-primary-900 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                            {reg.role}
                          </span>
                          <h5 className="font-heading font-bold text-sm text-slate-900 mt-2">{reg.title}</h5>
                          <p className="text-slate-500 font-mono text-[10px] mt-1">{reg.date} • {reg.time}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 font-sans text-xs italic">You are not currently rostered for immediate upcoming services.</p>
                  )}
                </div>

                {/* Attendance Tracker */}
                <div>
                  <h4 className="font-heading font-bold text-base text-primary-950 mb-4 pb-2 border-b border-slate-50 flex items-center space-x-1.5">
                    <Award className="h-4.5 w-4.5 text-gold-500" />
                    <span>Active Faith Fellowship Attendance</span>
                  </h4>
                  <p className="text-slate-500 font-sans text-xs mb-4">A visual registry of Sunday worship attendance logs tracked by our ushers.</p>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center font-heading font-extrabold text-2xl text-primary-900 border border-primary-800/10 shrink-0">
                      92%
                    </div>
                    <div>
                      <p className="font-heading font-extrabold text-sm text-slate-850">Outstanding Consistency</p>
                      <p className="text-slate-500 font-sans text-xs mt-1">Checked in for 11 out of the past 12 Sunday Services.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "giving" && currentUser && (
              /* GIVING HISTORY STATEMENTS */
              <div className="animate-fade-in text-slate-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-50 pb-3">
                  <div>
                    <h4 className="font-heading font-bold text-base text-primary-950 flex items-center space-x-1.5">
                      <BookOpen className="h-4.5 w-4.5 text-gold-500" />
                      <span>Tithes & Support Statement</span>
                    </h4>
                    <p className="text-slate-400 font-sans text-xs mt-0.5">Track your recorded family giving securely for transparency audits.</p>
                  </div>

                  <button
                    onClick={handleDownloadGivingStatement}
                    className="bg-primary-100 hover:bg-gold-500 hover:text-primary-950 text-primary-900 font-heading font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all border border-primary-800/10 flex items-center space-x-1.5 shadow"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download statement</span>
                  </button>
                </div>

                {currentUser.givingHistory && currentUser.givingHistory.length > 0 ? (
                  <div className="space-y-3">
                    {currentUser.givingHistory.map((giv, idx) => (
                      <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-heading font-bold text-slate-800">{giv.purpose}</p>
                          <p className="text-slate-400 font-mono text-[9px] mt-0.5">{giv.date} • Ref: {giv.txId}</p>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">E{giv.amount}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 font-sans text-xs italic">No contributions recorded for the current tax quarter.</p>
                )}
              </div>
            )}

            {activeTab === "directory" && (
              /* DIRECTORY TAB */
              <div className="space-y-6 animate-fade-in text-slate-700">
                
                {/* Header & View Mode Switcher */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-heading font-bold text-base text-primary-950 flex items-center space-x-1.5">
                      <Users className="h-5 w-5 text-gold-500" />
                      <span>{language === "en" ? "Secure Church Directory" : "Luhlobo LwemaLunga Luvikelekile"}</span>
                    </h4>
                    <p className="text-slate-400 font-sans text-xs mt-0.5">
                      {language === "en" 
                        ? "Authorized covenantal members registry. Fully respects personal privacy choices." 
                        : "Luhlu lwemalunga luvikelekile futsi luyatihlonipha tincumo teyimfihlo."}
                    </p>
                  </div>

                  {/* Mode Buttons */}
                  <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/60 flex items-center gap-1 self-stretch sm:self-auto shadow-inner">
                    <button
                      onClick={() => setDirectoryMode("individuals")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-heading font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1 ${
                        directoryMode === "individuals"
                          ? "bg-white text-primary-950 shadow-sm border border-slate-200/40"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span>Individuals</span>
                    </button>
                    <button
                      onClick={() => setDirectoryMode("families")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-heading font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1 ${
                        directoryMode === "families"
                          ? "bg-white text-primary-950 shadow-sm border border-slate-200/40"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span>Family Profiles</span>
                    </button>
                  </div>
                </div>

                {/* Search filters */}
                <div className="flex flex-col sm:flex-row gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search member name, phone, email or district..."
                      value={dirSearch}
                      onChange={(e) => setDirSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-300"
                    />
                  </div>

                  {directoryMode === "individuals" && (
                    <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-thin">
                      {familyGroups.map((grp) => (
                        <button
                          key={grp}
                          onClick={() => setDirGroup(grp)}
                          className={`px-3 py-2 rounded-lg text-[10px] font-heading font-bold uppercase tracking-wider border transition-colors whitespace-nowrap ${
                            dirGroup === grp
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {grp}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {directoryMode === "individuals" ? (
                  /* Individuals list Grid */
                  filteredDirectory.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {filteredDirectory.map((mem) => {
                        const hidePhone = mem.privacySettings?.hideContact;
                        const hideEmail = mem.privacySettings?.hideEmail;
                        const hideDistrict = mem.privacySettings?.hideDistrict;

                        return (
                          <div
                            key={mem.id}
                            className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150/70 hover:shadow-md hover:border-gold-500/20 transition-all flex flex-col justify-between"
                          >
                            <div className="flex items-start space-x-3.5 mb-3">
                              <div className="w-11 h-11 bg-primary-100 rounded-xl overflow-hidden text-primary-900 flex items-center justify-center font-heading font-extrabold text-sm border shrink-0">
                                <img 
                                  src={mem.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300"} 
                                  alt={mem.name} 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                  <h5 className="font-heading font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[125px]" title={mem.name}>
                                    {mem.name}
                                  </h5>
                                  <span className="bg-primary-900/10 text-primary-900 text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded">
                                    {mem.role}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 text-slate-400 text-[10px] font-sans font-medium">
                                  <span>{mem.familyGroup || "General Circle"}</span>
                                  {mem.familyRelation && (
                                    <span className="bg-slate-200/75 text-slate-600 text-[8px] px-1 py-0.1 rounded">
                                      {mem.familyRelation}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-[10px] font-sans text-slate-500 border-t border-slate-100 pt-2.5">
                              <p className="truncate flex items-center space-x-1.5">
                                <span className="text-slate-400 shrink-0">📍 Location:</span>
                                {hideDistrict ? (
                                  <span className="text-slate-400 italic flex items-center gap-1 text-[9px]">
                                    <EyeOff className="h-2.5 w-2.5 text-slate-400" /> Hidden
                                  </span>
                                ) : (
                                  <span className="font-semibold text-slate-700">{mem.district || "Fonteyn"}</span>
                                )}
                              </p>

                              <p className="truncate flex items-center space-x-1.5">
                                <span className="text-slate-400 shrink-0">✉️ Email:</span>
                                {hideEmail ? (
                                  <span className="text-slate-400 italic flex items-center gap-1 text-[9px]">
                                    <EyeOff className="h-2.5 w-2.5 text-slate-400" /> Hidden
                                  </span>
                                ) : (
                                  <span className="font-semibold text-slate-700">{mem.email}</span>
                                )}
                              </p>

                              <p className="truncate flex items-center space-x-1.5">
                                <span className="text-slate-400 shrink-0">📞 Phone:</span>
                                {hidePhone ? (
                                  <span className="text-slate-400 italic flex items-center gap-1 text-[9px]">
                                    <EyeOff className="h-2.5 w-2.5 text-slate-400" /> Hidden
                                  </span>
                                ) : (
                                  <span className="font-semibold text-slate-700">{mem.phone || "+268"}</span>
                                )}
                              </p>
                            </div>

                            {mem.bio && (
                              <p className="text-slate-400 italic text-[9px] font-sans border-t border-slate-50 mt-2.5 pt-1.5 line-clamp-2">
                                "{mem.bio}"
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400 italic">
                      No members matched your search criteria.
                    </div>
                  )
                ) : (
                  /* Family Profiles View */
                  (() => {
                    // Group filtered members by familyGroup
                    const map = new Map<string, Member[]>();
                    filteredDirectory.forEach((mem) => {
                      const group = mem.familyGroup || "General Circle";
                      if (!map.has(group)) {
                        map.set(group, []);
                      }
                      map.get(group)!.push(mem);
                    });
                    const familyProfiles = Array.from(map.entries());

                    return familyProfiles.length > 0 ? (
                      <div className="space-y-8">
                        {familyProfiles.map(([familyName, members]) => {
                          // Compile some aggregate info
                          const departments = Array.from(
                            new Set(members.map((m) => m.servingDepartment).filter(Boolean))
                          );
                          const activeDistrict = members.find((m) => m.district)?.district || "Fonteyn";

                          return (
                            <div
                              key={familyName}
                              className="bg-slate-50/45 rounded-3xl border border-slate-150 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                            >
                              {/* Family Card Header */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-200/55">
                                <div>
                                  <h5 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                                    <Users className="h-4.5 w-4.5 text-primary-800" />
                                    <span>{familyName}</span>
                                  </h5>
                                  <p className="text-slate-400 text-[10px] mt-0.5 font-sans">
                                    📍 Household District Base: <span className="font-semibold text-slate-600">{activeDistrict}</span>
                                  </p>
                                </div>
                                <span className="bg-primary-900 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                                  {members.length} {members.length === 1 ? "Member" : "Members"}
                                </span>
                              </div>

                              {/* Family Members Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                                {members.map((mem) => {
                                  const hidePhone = mem.privacySettings?.hideContact;
                                  const hideEmail = mem.privacySettings?.hideEmail;

                                  return (
                                    <div
                                      key={mem.id}
                                      className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-start space-x-3 hover:border-gold-500/20 transition-all shadow-sm"
                                    >
                                      <div className="w-10 h-10 bg-primary-100 rounded-lg overflow-hidden shrink-0 border">
                                        <img
                                          src={mem.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300"}
                                          alt={mem.name}
                                          className="w-full h-full object-cover"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-sans font-bold text-xs text-slate-850 truncate max-w-[100px]" title={mem.name}>
                                            {mem.name}
                                          </span>
                                          {mem.familyRelation && (
                                            <span className="bg-primary-100 text-primary-950 font-bold text-[7px] uppercase tracking-wide px-1.5 py-0.5 rounded">
                                              {mem.familyRelation}
                                            </span>
                                          )}
                                        </div>

                                        <p className="text-slate-400 text-[9px] mt-0.5 font-medium">⚙️ {mem.servingDepartment || "General Congregation"}</p>

                                        <div className="mt-1.5 pt-1.5 border-t border-slate-50 space-y-0.5 font-mono text-[8px] text-slate-500">
                                          {hidePhone ? (
                                            <p className="italic text-slate-400">📞 Phone: Hidden</p>
                                          ) : (
                                            <p>📞 {mem.phone || "+268"}</p>
                                          )}
                                          {hideEmail ? (
                                            <p className="italic text-slate-400">✉️ Email: Hidden</p>
                                          ) : (
                                            <p className="truncate">✉️ {mem.email}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Family Footer Summary details */}
                              {departments.length > 0 && (
                                <div className="bg-slate-100/60 rounded-xl p-3 border border-slate-150 flex items-center space-x-2 text-[10px] text-slate-600 font-sans">
                                  <Sparkles className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                                  <span>
                                    Serving departments in this house:{" "}
                                    <span className="font-semibold text-slate-850">{departments.join(", ")}</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-400 italic">
                        No family households found.
                      </div>
                    );
                  })()
                )}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
