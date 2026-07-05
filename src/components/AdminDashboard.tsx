import React, { useState, useEffect } from "react";
import {
  Shield, Key, Check, Plus, Trash2, Edit2, AlertTriangle,
  Database, BookOpen, Calendar, Heart, FileText, DollarSign, Settings,
  Users, Video, ShieldAlert, Sparkles, HelpCircle, CheckCircle, MessageSquare,
  Search
} from "lucide-react";

import { Sermon, Event, BlogPost, PrayerRequest, DonationReceipt, Ministry, Member, PhotoAlbum, Video as VideoType, Livestream } from "../types";

import SermonsEventsManager from "./admin/SermonsEventsManager";
import MinistriesMediaManager from "./admin/MinistriesMediaManager";
import DonationsPrayersManager from "./admin/DonationsPrayersManager";
import MembersUsersManager from "./admin/MembersUsersManager";
import SecurityManager from "./admin/SecurityManager";

interface AdminDashboardProps {
  language: "en" | "ss";
}

type AdminRole = "Pastor" | "Admin" | "Elder";

export default function AdminDashboard({ language }: AdminDashboardProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole>("Admin");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginStep, setLoginStep] = useState<"pin" | "totp">("pin");
  const [loginTotp, setLoginTotp] = useState("");
  const [helperTotp, setHelperTotp] = useState("");

  const [activeTab, setActiveTab] = useState<
    "sermons_events" | "ministries_media" | "donations_prayers" | "memberships_users" | "blogs" | "settings" | "security"
  >("sermons_events");

  // Database resources
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [donations, setDonations] = useState<DonationReceipt[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [livestreams, setLivestreams] = useState<Livestream[]>([]);

  // Blog Management State
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogAuthor, setBlogAuthor] = useState("");
  const [blogCategory, setBlogCategory] = useState("Faith");
  const [blogContent, setBlogContent] = useState("");
  const [blogTags, setBlogTags] = useState("");

  const [blogSearch, setBlogSearch] = useState("");
  const [blogSuccess, setBlogSuccess] = useState("");

  // Comment Moderation Target
  const [selectedBlogComments, setSelectedBlogComments] = useState<BlogPost | null>(null);

  // Configuration System alert
  const [announcementText, setAnnouncementText] = useState("Welcome to Fonteyn Evangelical Church's official portal. Services begin at 09:00 AM.");
  const [alertSuccess, setAlertSuccess] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      loadAllResources();
      loadAnnouncements();
    }
  }, [isLoggedIn]);

  const loadAllResources = async () => {
    try {
      const [resSermons, resEvents, resPrayers, resBlogs, resDonations, resMinistries, resMembers, resAlbums, resVideos, resLivestreams] = await Promise.all([
        fetch("/api/sermons"),
        fetch("/api/events"),
        fetch("/api/prayer-requests"),
        fetch("/api/blog-posts"),
        fetch("/api/donations"),
        fetch("/api/ministries"),
        fetch("/api/members"),
        fetch("/api/media/photo-albums"),
        fetch("/api/media/videos"),
        fetch("/api/media/livestreams")
      ]);

      if (resSermons.ok) setSermons(await resSermons.json());
      if (resEvents.ok) setEvents(await resEvents.json());
      if (resPrayers.ok) setPrayers(await resPrayers.json());
      if (resBlogs.ok) {
        const posts = await resBlogs.json();
        setBlogs(posts);
        // Sync selected comments blog in real-time
        if (selectedBlogComments) {
          const fresh = posts.find((p: BlogPost) => p.id === selectedBlogComments.id);
          if (fresh) setSelectedBlogComments(fresh);
        }
      }
      if (resDonations.ok) setDonations(await resDonations.json());
      if (resMinistries.ok) setMinistries(await resMinistries.json());
      if (resMembers.ok) setMembers(await resMembers.json());
      if (resAlbums.ok) setAlbums(await resAlbums.json());
      if (resVideos.ok) setVideos(await resVideos.json());
      if (resLivestreams.ok) setLivestreams(await resLivestreams.json());
    } catch (err) {
      console.error("Error synchronizing admin databases:", err);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const list = await res.json();
        if (list.length > 0) {
          setAnnouncementText(list[0].text);
        }
      }
    } catch (err) {}
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== "1234") {
      setLoginError("Incorrect administrative PIN. Hint: Use 1234");
      return;
    }

    try {
      const res = await fetch("/api/security/settings");
      if (res.ok) {
        const settings = await res.json();
        if (settings.enable2fa && loginStep === "pin") {
          setLoginStep("totp");
          setLoginError("");
          // Load helper code
          const epochSeconds = Math.floor(Date.now() / 1000);
          const intervalIndex = Math.floor(epochSeconds / 30);
          const calculatedCode = ((intervalIndex * 14753) % 900000 + 100000).toString();
          setHelperTotp(calculatedCode);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not check 2FA status, bypassing:", err);
    }

    if (loginStep === "totp") {
      try {
        const res = await fetch("/api/security/2fa/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: loginTotp })
        });
        const data = await res.json();
        if (!data.success) {
          setLoginError("Invalid Authenticator OTP Code. Please verify rolling code.");
          return;
        }
      } catch (err) {
        setLoginError("Failed to verify Two-Factor Token. Bypass if server error.");
        return;
      }
    }

    setIsLoggedIn(true);
    setLoginError("");
    setLoginStep("pin");
    setLoginTotp("");
  };

  // --- BLOGS CRUD & COMMENTS ---
  const handleEditBlogInit = (p: BlogPost) => {
    setEditingBlogId(p.id);
    setBlogTitle(p.title);
    setBlogAuthor(p.author);
    setBlogCategory(p.category);
    setBlogContent(p.content);
    setBlogTags(p.tags?.join(", ") || "");
  };

  const handleResetBlogForm = () => {
    setEditingBlogId(null);
    setBlogTitle("");
    setBlogAuthor("");
    setBlogCategory("Faith");
    setBlogContent("");
    setBlogTags("");
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogAuthor || !blogContent) return;

    const payload = {
      title: blogTitle,
      author: blogAuthor,
      category: blogCategory,
      content: blogContent,
      tags: blogTags.split(",").map(t => t.trim()).filter(Boolean)
    };

    try {
      const url = editingBlogId ? `/api/blog-posts/${editingBlogId}` : "/api/blog-posts";
      const method = editingBlogId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setBlogSuccess(editingBlogId ? "Publication updated successfully!" : "New blog post published!");
        handleResetBlogForm();
        loadAllResources();
        setTimeout(() => setBlogSuccess(""), 4000);
      }
    } catch (err) {}
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm("Delete this blog post permanently? This also deletes associated comments.")) return;
    try {
      const res = await fetch(`/api/blog-posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogSuccess("Publication successfully deleted.");
        if (selectedBlogComments?.id === id) {
          setSelectedBlogComments(null);
        }
        loadAllResources();
        setTimeout(() => setBlogSuccess(""), 4000);
      }
    } catch (err) {}
  };

  // Comments Moderation Actions
  const handleApproveComment = async (postId: string, commentId: string) => {
    try {
      const res = await fetch(`/api/blog-posts/${postId}/comments/${commentId}/approve`, {
        method: "PUT"
      });
      if (res.ok) {
        loadAllResources();
      }
    } catch (err) {}
  };

  const handleRejectComment = async (postId: string, commentId: string) => {
    try {
      const res = await fetch(`/api/blog-posts/${postId}/comments/${commentId}/reject`, {
        method: "PUT"
      });
      if (res.ok) {
        loadAllResources();
      }
    } catch (err) {}
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!window.confirm("Permanently erase this comment?")) return;
    try {
      const res = await fetch(`/api/blog-posts/${postId}/comments/${commentId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadAllResources();
      }
    } catch (err) {}
  };

  // --- ANNOUNCEMENT SAVE ---
  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: announcementText })
      });
      if (res.ok) {
        setAlertSuccess(true);
        setTimeout(() => setAlertSuccess(false), 4000);
      }
    } catch (err) {}
  };

  // Blog Search filters
  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
    b.author.toLowerCase().includes(blogSearch.toLowerCase()) ||
    b.category.toLowerCase().includes(blogSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!isLoggedIn ? (
        /* ADMIN SECURE LOGIN GATE */
        <div className="max-w-md mx-auto bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-center">
          <div className="bg-gold-500 text-slate-950 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto border border-gold-400/20">
            <Shield className="h-6 w-6 animate-pulse" />
          </div>

          <h2 className="font-heading font-extrabold text-xl mb-1 tracking-tight">FONTEYN FEC ADMINISTRATIVE PORTAL</h2>
          <p className="text-slate-400 font-sans text-xs mb-6 px-4">Authorized Pastor, Elder or System Administrator credentialed access only.</p>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            {loginStep === "pin" ? (
              <>
                {/* Role Select */}
                <div>
                  <label className="block text-slate-300 font-heading text-[10px] font-bold uppercase tracking-wider mb-1.5">Select Active Board Identity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Pastor", "Admin", "Elder"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`py-1.5 rounded-lg text-[11px] font-heading font-bold uppercase border tracking-wider text-center transition-all ${
                          selectedRole === role
                            ? "bg-gold-500 border-gold-500 text-slate-950 font-extrabold shadow-md"
                            : "bg-slate-850 border-slate-750 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <label className="block text-slate-300 font-heading text-[10px] font-bold uppercase tracking-wider mb-1.5">Administrative Authorization PIN *</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
                    <input
                      type="password"
                      placeholder="Enter secure access PIN"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-850 border border-slate-750 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold-500 font-mono"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-1.5">Preview hint: PIN is <span className="font-mono text-gold-400 font-bold">1234</span></p>
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-slate-850 border border-slate-750 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-heading font-extrabold text-gold-400 tracking-wider">Two-Factor Authentication Active</span>
                    <span className="bg-emerald-950 text-emerald-400 font-mono font-bold text-[8px] px-1.5 py-0.5 rounded uppercase">Shield Active</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    Enter the rotating 6-digit verification code from your simulated Authenticator App.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-heading text-[10px] font-bold uppercase tracking-wider mb-1.5">Authenticator Verification Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={loginTotp}
                    onChange={(e) => setLoginTotp(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-3 bg-slate-850 border border-slate-750 rounded-xl text-center text-lg font-mono text-white focus:outline-none focus:ring-1 focus:ring-gold-500 tracking-[0.5em] font-extrabold"
                    required
                  />
                  <div className="mt-2.5 p-2 bg-amber-950/40 border border-amber-900/35 rounded-lg text-[9.5px] text-amber-300/85 text-center flex justify-between items-center">
                    <span>Simulated Current Code:</span>
                    <span className="font-mono font-black tracking-widest">{helperTotp}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLoginStep("pin");
                    setLoginTotp("");
                    setLoginError("");
                  }}
                  className="w-full text-slate-400 hover:text-white text-center text-[10px] uppercase tracking-wider font-heading font-bold py-1"
                >
                  Go Back to PIN Login
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gold-500 hover:bg-gold-400 text-slate-950 font-heading font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-lg mt-2"
            >
              {loginStep === "pin" ? "Sign In to Secure Panel" : "Confirm Authenticator Code"}
            </button>
          </form>

          {loginError && (
            <p className="text-rose-400 font-sans text-xs mt-3 flex items-center justify-center space-x-1">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </p>
          )}
        </div>
      ) : (
        /* ADMIN DASHBOARD CONSOLE ACTIVE */
        <div className="space-y-8 text-slate-700 animate-fade-in">
          {/* Header Bar */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gold-500 text-slate-950 w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-extrabold text-xl border border-gold-400 shadow shrink-0">
                {selectedRole[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-extrabold text-lg">FONTEYN FEC CONTROL CENTER</h3>
                  <span className="bg-gold-500 text-slate-950 text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full">
                    {selectedRole} Mode
                  </span>
                </div>
                <p className="text-slate-400 font-sans text-xs mt-0.5">Fidelity Database: active. High-precision administrative controls are operational.</p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsLoggedIn(false);
                setPassword("");
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-heading font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-colors border border-slate-750"
            >
              Lock Console
            </button>
          </div>

          {/* Quick Metrics Statistics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Church Registry</span>
              <p className="font-heading font-extrabold text-xl text-slate-900 mt-0.5">{members.length} members</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Funds Catalogued</span>
              <p className="font-heading font-extrabold text-xl text-slate-900 mt-0.5">E {donations.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Prayer Petitions</span>
              <p className="font-heading font-extrabold text-xl text-slate-900 mt-0.5">{prayers.length} requests</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Publications & News</span>
              <p className="font-heading font-extrabold text-xl text-slate-900 mt-0.5">{blogs.length} articles</p>
            </div>
          </div>

          {/* Master Tabs */}
          <div className="flex border-b border-slate-200 pb-px overflow-x-auto scrollbar-thin">
            <button
              onClick={() => setActiveTab("sermons_events")}
              className={`pb-3 px-4 font-heading font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === "sermons_events" ? "border-slate-900 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-850"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Sermons & Events</span>
            </button>

            <button
              onClick={() => setActiveTab("ministries_media")}
              className={`pb-3 px-4 font-heading font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === "ministries_media" ? "border-slate-900 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-850"
              }`}
            >
              <Video className="h-4 w-4" />
              <span>Ministries & Media</span>
            </button>

            <button
              onClick={() => setActiveTab("donations_prayers")}
              className={`pb-3 px-4 font-heading font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === "donations_prayers" ? "border-slate-900 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-850"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span>Financials & Prayers</span>
            </button>

            <button
              onClick={() => setActiveTab("memberships_users")}
              className={`pb-3 px-4 font-heading font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === "memberships_users" ? "border-slate-900 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-850"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Members & Roles</span>
            </button>

            <button
              onClick={() => setActiveTab("blogs")}
              className={`pb-3 px-4 font-heading font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === "blogs" ? "border-slate-900 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-850"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>News & Blog Posts</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`pb-3 px-4 font-heading font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === "security" ? "border-slate-900 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-850"
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Security Center</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-3 px-4 font-heading font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === "settings" ? "border-slate-900 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-850"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Alert Settings</span>
            </button>
          </div>

          {/* ACTIVE TAB CONTAINER */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
            {activeTab === "sermons_events" && (
              <SermonsEventsManager
                sermons={sermons}
                events={events}
                onRefresh={loadAllResources}
              />
            )}

            {activeTab === "ministries_media" && (
              <MinistriesMediaManager
                ministries={ministries}
                albums={albums}
                videos={videos}
                livestreams={livestreams}
                onRefresh={loadAllResources}
              />
            )}

            {activeTab === "donations_prayers" && (
              <DonationsPrayersManager
                donations={donations}
                prayers={prayers}
                adminRole={selectedRole}
                onRefresh={loadAllResources}
              />
            )}

            {activeTab === "memberships_users" && (
              <MembersUsersManager
                members={members}
                onRefresh={loadAllResources}
              />
            )}

            {/* --- NEWS & BLOGS MANAGER --- */}
            {activeTab === "blogs" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form */}
                <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
                  <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                    <Plus className="h-4 w-4 text-gold-600" />
                    <span>{editingBlogId ? "Edit Publication" : "Write New Publication"}</span>
                  </h4>

                  {blogSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-1.5 font-medium mb-3">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>{blogSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveBlog} className="space-y-3">
                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Post Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Winter Clothes Outreach Outreach"
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Author Name *</label>
                        <input
                          type="text"
                          placeholder="Elder Thabo"
                          value={blogAuthor}
                          onChange={(e) => setBlogAuthor(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Category</label>
                        <select
                          value={blogCategory}
                          onChange={(e) => setBlogCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-650 focus:outline-none"
                        >
                          <option value="Faith">Faith</option>
                          <option value="Community">Community</option>
                          <option value="Announcements">Announcements</option>
                          <option value="Outreach">Outreach</option>
                          <option value="Youth">Youth</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Tags (Comma Separated)</label>
                      <input
                        type="text"
                        placeholder="Mbabane, Youth, Giving"
                        value={blogTags}
                        onChange={(e) => setBlogTags(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Article Body Content *</label>
                      <textarea
                        rows={5}
                        placeholder="Write the full publication content..."
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none font-sans leading-relaxed"
                        required
                      ></textarea>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-heading font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg transition-colors"
                      >
                        {editingBlogId ? "Save Changes" : "Publish Post"}
                      </button>
                      {editingBlogId && (
                        <button
                          type="button"
                          onClick={handleResetBlogForm}
                          className="px-3 bg-slate-200 text-slate-600 font-heading font-bold text-[10px] uppercase py-2.5 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Listing */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search publications by title or category..."
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {filteredBlogs.length === 0 ? (
                      <p className="text-center py-8 text-xs text-slate-400">No blog posts found.</p>
                    ) : (
                      filteredBlogs.map((b) => (
                        <div key={b.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="bg-slate-200 text-slate-700 font-heading font-bold text-[8px] px-1.5 py-0.5 rounded uppercase">
                                {b.category}
                              </span>
                              <p className="font-heading font-extrabold text-slate-800">{b.title}</p>
                            </div>
                            <p className="text-slate-400 font-mono text-[9px] mt-0.5">{b.date} • By: {b.author}</p>
                          </div>

                          <div className="flex items-center space-x-1.5 self-end sm:self-center">
                            <button
                              onClick={() => setSelectedBlogComments(b)}
                              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-heading font-bold uppercase transition-all flex items-center space-x-1"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>Comments ({b.comments?.length || 0})</span>
                            </button>
                            <button
                              onClick={() => handleEditBlogInit(b)}
                              className="p-1.5 bg-white text-slate-500 hover:text-slate-900 rounded border border-slate-200 transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(b.id)}
                              className="p-1.5 bg-white text-slate-400 hover:text-rose-500 rounded border border-slate-200 hover:border-rose-200 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment Moderation Drawer */}
                  {selectedBlogComments && (
                    <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 animate-fade-in space-y-4">
                      <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-gold-400 font-mono font-bold">Post Comment Moderator</span>
                          <h5 className="font-heading font-bold text-sm text-white">{selectedBlogComments.title}</h5>
                        </div>
                        <button
                          onClick={() => setSelectedBlogComments(null)}
                          className="text-slate-400 hover:text-white text-xs font-bold font-mono px-2 py-1 bg-slate-800 rounded-md"
                        >
                          Close
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {!selectedBlogComments.comments || selectedBlogComments.comments.length === 0 ? (
                          <p className="text-[10px] text-slate-500 italic">No comments written yet.</p>
                        ) : (
                          selectedBlogComments.comments.map((comm) => (
                            <div key={comm.id} className="p-3 bg-slate-850 rounded-lg border border-slate-800 text-[11px] flex justify-between items-center gap-3">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-200">{comm.author}</span>
                                  <span className="text-[9px] text-slate-500 font-mono">{comm.date}</span>
                                  <span className={`text-[8px] uppercase font-bold px-1 rounded ${
                                    comm.approved ? "bg-emerald-900 text-emerald-300" : "bg-amber-900 text-amber-300"
                                  }`}>
                                    {comm.approved ? "Approved" : "Pending Approval"}
                                  </span>
                                </div>
                                <p className="text-slate-300 leading-relaxed">{comm.text}</p>
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                {!comm.approved && (
                                  <button
                                    onClick={() => handleApproveComment(selectedBlogComments.id, comm.id)}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] uppercase rounded"
                                    title="Approve Comment"
                                  >
                                    Approve
                                  </button>
                                )}
                                {comm.approved && (
                                  <button
                                    onClick={() => handleRejectComment(selectedBlogComments.id, comm.id)}
                                    className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[9px] uppercase rounded"
                                    title="Reject Comment"
                                  >
                                    Reject
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteComment(selectedBlogComments.id, comm.id)}
                                  className="p-1 bg-slate-800 hover:bg-red-900 text-slate-400 hover:text-white rounded border border-slate-700"
                                  title="Erase"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <SecurityManager
                onRefresh={loadAllResources}
                adminRole={selectedRole}
              />
            )}

            {activeTab === "settings" && (
              /* ALERTS & BANNER SETTINGS TAB */
              <div className="animate-fade-in text-slate-700 max-w-xl mx-auto space-y-6">
                <h4 className="font-heading font-bold text-base text-slate-900 pb-2 border-b border-slate-100">Official Announcement Settings</h4>
                <p className="text-slate-500 font-sans text-xs">Edit system-wide alerts that appear in the high-prominence notification marquee at the top of the app's home dashboard.</p>

                {alertSuccess && (
                  <p className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-200 text-xs font-sans flex items-center space-x-1 font-medium animate-pulse">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Church alert banner configuration updated successfully!</span>
                  </p>
                )}

                <form onSubmit={handleSaveAlert} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1.5">Announcement alert text *</label>
                    <textarea
                      rows={4}
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans text-slate-700 leading-relaxed"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-heading font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg transition-colors shadow-sm"
                  >
                    Save & Publish Announcement Alert Banner
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
