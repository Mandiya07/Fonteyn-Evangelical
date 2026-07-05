import React, { useState, useEffect } from "react";
import {
  Search,
  Heart,
  MessageSquare,
  Clock,
  ArrowLeft,
  Check,
  Send,
  Sparkles,
  BookOpen,
  Share2,
  Shield,
  Trash2,
  Plus,
  X,
  Globe,
  User,
  Tag,
  Lock,
  CheckCircle,
  Copy,
  Link,
  Mail,
  AlertTriangle
} from "lucide-react";
import { BlogPost, Comment } from "../types";
import { translations } from "../lib/translations";
import { motion, AnimatePresence } from "motion/react";

interface NewsBlogProps {
  language: "en" | "ss";
}

const CATEGORIES = [
  "Church Announcements",
  "Pastor Articles",
  "Testimonies",
  "Ministry Updates",
  "Community News"
];

const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  "Church Announcements": { en: "Church Announcements", ss: "Timemetelo teLisontfo" },
  "Pastor Articles": { en: "Pastor Articles", ss: "Tihloko teMfundisi" },
  "Testimonies": { en: "Testimonies", ss: "Bufakazi beKholo" },
  "Ministry Updates": { en: "Ministry Updates", ss: "Tindzaba teTingaba" },
  "Community News": { en: "Community News", ss: "Tindzaba tePhakathi" }
};

export default function NewsBlog({ language }: NewsBlogProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"feed" | "publish" | "moderation">("feed");

  // Selection states
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [sharePost, setSharePost] = useState<BlogPost | null>(null);

  // New Post Submission form
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Church Announcements");
  const [newPostAuthor, setNewPostAuthor] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [selectedCoverPreset, setSelectedCoverPreset] = useState("community");
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Comments state
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Moderation Console states
  const [moderatorCode, setModeratorCode] = useState("");
  const [isModeratorUnlocked, setIsModeratorUnlocked] = useState(false);
  const [moderationError, setModerationError] = useState("");
  const [moderatorFilter, setModeratorFilter] = useState<"all" | "pending" | "approved">("pending");

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blog-posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLike = async (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/blog-posts/${post.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: data.likes } : p));
        if (selectedPost?.id === post.id) {
          setSelectedPost(prev => prev ? { ...prev, likes: data.likes } : null);
        }
        triggerToast(language === "en" ? "Reflected your support! ♥" : "Ukhombise lutsandvo! ♥");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentName || !commentText) return;

    try {
      const res = await fetch(`/api/blog-posts/${selectedPost.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: commentName, content: commentText })
      });

      if (res.ok) {
        const data = await res.json();
        // Comment is created (default approved: true for manual additions unless altered)
        setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, comments: data.comments } : p));
        setSelectedPost(prev => prev ? { ...prev, comments: data.comments } : null);
        setCommentName("");
        setCommentText("");
        setCommentSuccess(true);
        triggerToast(language === "en" ? "Comment posted successfully!" : "Umlayeto utfunyelwe ngemphumelelo!");
        setTimeout(() => setCommentSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostAuthor || !newPostContent) return;

    const parsedTags = newPostTags
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      const res = await fetch("/api/blog-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPostTitle,
          author: newPostAuthor,
          category: newPostCategory,
          tags: parsedTags.length > 0 ? parsedTags : ["Church"],
          content: newPostContent
        })
      });

      if (res.ok) {
        setPublishSuccess(true);
        triggerToast("New publication published on the altar of Fonteyn!");
        setNewPostTitle("");
        setNewPostAuthor("");
        setNewPostContent("");
        setNewPostTags("");
        fetchPosts();
        setTimeout(() => {
          setPublishSuccess(false);
          setActiveTab("feed");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Moderation APIs
  const handleUnlockModerator = (e: React.FormEvent) => {
    e.preventDefault();
    if (moderatorCode === "1234") {
      setIsModeratorUnlocked(true);
      setModerationError("");
      triggerToast("Unlocked FEC Media Moderation Console!");
    } else {
      setModerationError("Invalid Staff Code. Please check the credentials.");
    }
  };

  const handleApproveComment = async (postId: string, commentId: string) => {
    try {
      const res = await fetch(`/api/blog-posts/${postId}/comments/${commentId}/approve`, {
        method: "PUT"
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: data.comments } : p));
        if (selectedPost?.id === postId) {
          setSelectedPost(prev => prev ? { ...prev, comments: data.comments } : null);
        }
        triggerToast("Comment approved and visible publicly!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectComment = async (postId: string, commentId: string) => {
    try {
      const res = await fetch(`/api/blog-posts/${postId}/comments/${commentId}/reject`, {
        method: "PUT"
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: data.comments } : p));
        if (selectedPost?.id === postId) {
          setSelectedPost(prev => prev ? { ...prev, comments: data.comments } : null);
        }
        triggerToast("Comment rejected / held back from public view.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this comment?")) return;
    try {
      const res = await fetch(`/api/blog-posts/${postId}/comments/${commentId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: data.comments } : p));
        if (selectedPost?.id === postId) {
          setSelectedPost(prev => prev ? { ...prev, comments: data.comments } : null);
        }
        triggerToast("Comment permanently deleted.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this blog post?")) return;
    try {
      const res = await fetch(`/api/blog-posts/${postId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        if (selectedPost?.id === postId) {
          setSelectedPost(null);
        }
        triggerToast("Blog post deleted from the system.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Social Sharing Logic
  const handleSocialShare = (platform: string, post: BlogPost) => {
    const text = `Read "${post.title}" under ${post.category} - Fonteyn Evangelical Church`;
    const shareUrl = `${window.location.origin}/blog/${post.id}`;
    let link = "";

    switch (platform) {
      case "whatsapp":
        link = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + shareUrl)}`;
        break;
      case "facebook":
        link = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        link = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "email":
        link = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(text + "\n\nRead here: " + shareUrl)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        triggerToast("Shareable link copied to clipboard!");
        setSharePost(null);
        return;
      default:
        break;
    }

    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
      triggerToast(`Redirecting to share on ${platform.toUpperCase()}...`);
      setSharePost(null);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = activeCategory === "All" || post.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const getPresetImage = (category: string) => {
    switch (category) {
      case "Church Announcements":
        return "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=70&w=600&fm=webp";
      case "Pastor Articles":
        return "https://images.unsplash.com/photo-1504052434569-70ad585e5151?auto=format&fit=crop&q=70&w=600&fm=webp";
      case "Testimonies":
        return "https://images.unsplash.com/photo-1511180590220-bb06972294ba?auto=format&fit=crop&q=70&w=600&fm=webp";
      case "Ministry Updates":
        return "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=70&w=600&fm=webp";
      case "Community News":
        return "https://images.unsplash.com/photo-1464692805480-a69dfafdcd05?auto=format&fit=crop&q=70&w=600&fm=webp";
      default:
        return "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=70&w=600&fm=webp";
    }
  };

  // Flatten comments across posts for global moderator screen
  const allCommentsWithPost = posts.flatMap(post =>
    (post.comments || []).map(comm => ({
      ...comm,
      postTitle: post.title,
      postId: post.id
    }))
  ).sort((a, b) => b.id.localeCompare(a.id));

  const filteredModeratorComments = allCommentsWithPost.filter(comm => {
    if (moderatorFilter === "pending") return !comm.approved;
    if (moderatorFilter === "approved") return comm.approved;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="news-blog-section">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white font-heading font-medium text-xs tracking-wide px-5 py-3 rounded-full shadow-2xl flex items-center space-x-2 border border-slate-700"
          >
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-950 tracking-tight flex items-center justify-center space-x-2">
          <BookOpen className="h-8 w-8 text-gold-500" />
          <span>{translations.newsBlog[language]}</span>
        </h2>
        <p className="text-slate-500 font-sans text-sm mt-2">
          {language === "en"
            ? "Stay updated with announcements, pastoral messages, local stories, and announcements."
            : "Tfola kwatiswa lokusha, imilayeto yemfundisi, netindzaba teFonteyn."}
        </p>
        <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full mt-3"></div>
      </div>

      {/* Tabs Menu */}
      <div className="flex justify-center border-b border-slate-200 mb-8 max-w-md mx-auto">
        <button
          onClick={() => {
            setActiveTab("feed");
            setSelectedPost(null);
          }}
          className={`flex-1 py-3 text-xs uppercase tracking-wider font-heading font-bold transition-all border-b-2 ${
            activeTab === "feed"
              ? "border-primary-800 text-primary-800"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          {language === "en" ? "Publications" : "Tindzaba"}
        </button>
        <button
          onClick={() => {
            setActiveTab("publish");
            setSelectedPost(null);
          }}
          className={`flex-1 py-3 text-xs uppercase tracking-wider font-heading font-bold transition-all border-b-2 flex items-center justify-center space-x-1 ${
            activeTab === "publish"
              ? "border-primary-800 text-primary-800"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{language === "en" ? "Write Post" : "Bhala"}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("moderation");
            setSelectedPost(null);
          }}
          className={`flex-1 py-3 text-xs uppercase tracking-wider font-heading font-bold transition-all border-b-2 flex items-center justify-center space-x-1 ${
            activeTab === "moderation"
              ? "border-primary-800 text-primary-800"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>{language === "en" ? "Moderation" : "Kuhlunga"}</span>
        </button>
      </div>

      {activeTab === "feed" && (
        <AnimatePresence mode="wait">
          {selectedPost ? (
            /* BLOG DETAIL VIEW */
            <motion.div
              key="post-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100"
            >
              {/* Back to archive */}
              <button
                onClick={() => setSelectedPost(null)}
                className="flex items-center space-x-1.5 text-slate-500 hover:text-primary-800 font-heading font-bold text-xs uppercase tracking-wider mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{language === "en" ? "Back to Feed" : "Buyela Emvakwentfo"}</span>
              </button>

              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs font-heading font-bold text-slate-400">
                <span className="bg-primary-50 text-primary-800 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-primary-100">
                  {CATEGORY_TRANSLATIONS[selectedPost.category]?.[language] || selectedPost.category}
                </span>
                <span className="flex items-center space-x-1 font-mono text-[11px]">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{selectedPost.date}</span>
                </span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary-950 mb-3 leading-tight">
                {selectedPost.title}
              </h2>

              <p className="text-slate-500 text-xs sm:text-sm font-sans mb-6 flex items-center space-x-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Published by</span>
                <span className="font-heading font-bold text-slate-700">{selectedPost.author}</span>
              </p>

              {/* Cover Image */}
              <div className="h-60 sm:h-80 bg-slate-100 rounded-2xl overflow-hidden mb-8 border border-slate-200">
                <img
                  src={getPresetImage(selectedPost.category)}
                  alt={selectedPost.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-1.5 mb-8">
                {selectedPost.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-heading font-medium flex items-center space-x-1"
                  >
                    <Tag className="h-3 w-3 text-slate-400" />
                    <span>#{tag}</span>
                  </span>
                ))}
              </div>

              {/* Main Text Content */}
              <article className="prose max-w-none text-slate-700 font-sans text-sm sm:text-base leading-relaxed space-y-4 mb-8 whitespace-pre-line pb-8 border-b border-slate-100">
                {selectedPost.content}
              </article>

              {/* Interaction Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                <button
                  onClick={(e) => handleLike(selectedPost, e)}
                  className="flex items-center space-x-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100/60 text-rose-600 px-5 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all"
                >
                  <Heart className="h-4.5 w-4.5 fill-rose-500 text-rose-500" />
                  <span>{language === "en" ? "Like Article" : "Tsandza"} ({selectedPost.likes})</span>
                </button>

                <button
                  onClick={() => setSharePost(selectedPost)}
                  className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all"
                >
                  <Share2 className="h-4.5 w-4.5 text-slate-500" />
                  <span>{language === "en" ? "Share Altar" : "Yabelana"}</span>
                </button>
              </div>

              {/* Comments Section */}
              <div className="space-y-6">
                <h4 className="font-heading font-bold text-lg text-primary-950 flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-gold-500" />
                  <span>{language === "en" ? "Comments" : "Imibono"} ({selectedPost.comments.filter(c => c.approved !== false).length})</span>
                </h4>

                <div className="space-y-3.5">
                  {selectedPost.comments.filter(c => c.approved !== false).length > 0 ? (
                    selectedPost.comments
                      .filter(c => c.approved !== false)
                      .map((comm) => (
                        <div key={comm.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <p className="flex justify-between font-heading font-bold text-xs text-slate-800 mb-1">
                            <span className="flex items-center space-x-1">
                              <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center font-bold">
                                {comm.author[0]?.toUpperCase() || "M"}
                              </span>
                              <span>{comm.author}</span>
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">{comm.date}</span>
                          </p>
                          <p className="text-slate-600 font-sans text-xs leading-relaxed pl-6">
                            {comm.text || comm.content}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-slate-400 text-xs font-sans italic">
                      {language === "en"
                        ? "No comments yet. Write the first constructive reflection!"
                        : "Kute mbono okwamanje. Bhala wekucala!"}
                    </p>
                  )}
                </div>

                {/* Write Comment Form */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h5 className="font-heading font-bold text-xs uppercase tracking-wide text-slate-700 mb-3 flex items-center space-x-1">
                    <Sparkles className="h-3.5 w-3.5 text-gold-500" />
                    <span>{language === "en" ? "Add your reflection" : "Bhala luvo lakho"}</span>
                  </h5>

                  {commentSuccess ? (
                    <p className="text-emerald-700 font-sans text-xs flex items-center space-x-1.5 font-medium bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                      <Check className="h-4 w-4" />
                      <span>{language === "en" ? "Reflection added successfully!" : "Luvo lwakho lungezwe ngemphumelelo!"}</span>
                    </p>
                  ) : (
                    <form onSubmit={handleAddComment} className="space-y-3">
                      <input
                        type="text"
                        placeholder={language === "en" ? "Your name" : "Ligama lakho"}
                        value={commentName}
                        onChange={(e) => setCommentName(e.target.value)}
                        className="w-full sm:w-1/2 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-800"
                        required
                      />
                      <textarea
                        rows={3}
                        placeholder={language === "en" ? "Write a warm reflection..." : "Bhala luvo lwakho ngenhlonipho..."}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-800 font-sans"
                        required
                      ></textarea>
                      <button
                        type="submit"
                        className="bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{language === "en" ? "Submit Reflection" : "Tfumela"}</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* ARCHIVE GRID VIEW */
            <motion.div
              key="archive-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Search & Categories Box */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col lg:flex-row gap-4 items-center">
                {/* Search field */}
                <div className="relative w-full lg:flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                  <input
                    type="text"
                    placeholder={
                      language === "en"
                        ? "Search articles by category, tags or words..."
                        : "Hlwaya ngetindzaba lapha..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-800 transition-all font-sans text-xs sm:text-sm"
                  />
                </div>

                {/* Categories selector horizontal bar */}
                <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
                  <button
                    onClick={() => setActiveCategory("All")}
                    className={`px-3 py-2 rounded-xl text-[10px] sm:text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                      activeCategory === "All"
                        ? "bg-primary-800 border-primary-800 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {translations.filterAll[language]}
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-2 rounded-xl text-[10px] sm:text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                        activeCategory === cat
                          ? "bg-primary-800 border-primary-800 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {CATEGORY_TRANSLATIONS[cat]?.[language] || cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Grid */}
              {loading ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800 mx-auto mb-2"></div>
                  <p className="text-slate-400 font-sans text-xs">Fetching latest community journals...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                  <AlertTriangle className="h-10 w-10 text-gold-500 mx-auto mb-2.5" />
                  <p className="text-slate-500 font-heading font-bold text-sm">No matches found</p>
                  <p className="text-slate-400 font-sans text-xs mt-1">Try using a different search query or selecting another category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post, idx) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedPost(post)}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200/60 hover:shadow-lg hover:border-gold-500/30 transition-all cursor-pointer flex flex-col justify-between group relative"
                    >
                      <div>
                        {/* Cover image */}
                        <div className="h-44 bg-slate-100 overflow-hidden relative">
                          <img
                            src={getPresetImage(post.category)}
                            alt={post.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                          />
                          <span className="absolute top-3 left-3 bg-primary-900 text-white font-heading font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
                            {CATEGORY_TRANSLATIONS[post.category]?.[language] || post.category}
                          </span>
                        </div>

                        {/* Text Block */}
                        <div className="p-5">
                          <div className="flex items-center space-x-2 text-slate-400 font-mono text-[10px] mb-2.5">
                            <span>{post.date}</span>
                            <span>•</span>
                            <span className="flex items-center space-x-0.5">
                              <User className="h-3 w-3" />
                              <span className="line-clamp-1">{post.author}</span>
                            </span>
                          </div>

                          <h4 className="font-heading font-bold text-base text-primary-950 mb-2 leading-tight group-hover:text-primary-800 transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-slate-500 font-sans text-xs leading-relaxed line-clamp-3">
                            {post.content}
                          </p>
                        </div>
                      </div>

                      {/* Footer bar */}
                      <div className="p-5 pt-0 mt-4">
                        {/* Tags line */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.slice(0, 3).map((tag, tIdx) => (
                            <span key={tIdx} className="text-[10px] text-primary-800 font-medium bg-primary-50 px-2 py-0.5 rounded-md">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-slate-400 text-xs border-t border-slate-100 pt-3">
                          <button
                            onClick={(e) => handleLike(post, e)}
                            className="flex items-center space-x-1 hover:text-rose-600 transition-colors py-1 px-1.5 rounded hover:bg-rose-50"
                          >
                            <Heart className="h-3.5 w-3.5 text-rose-400 hover:fill-rose-500" />
                            <span className="font-mono text-xs font-bold">{post.likes}</span>
                          </button>

                          <span className="flex items-center space-x-1 font-mono text-[11px]">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>{(post.comments || []).filter(c => c.approved !== false).length} Comments</span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {activeTab === "publish" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xl"
        >
          <div className="text-center mb-8">
            <h3 className="font-heading font-extrabold text-2xl text-primary-950">
              {language === "en" ? "Publish on the Altar" : "Faka Tindzaba teLisontfo"}
            </h3>
            <p className="text-slate-500 text-xs font-sans mt-1">
              Add a testimony, report a ministry milestone, list community events, or share pastoral revelations.
            </p>
          </div>

          {publishSuccess ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4"
            >
              <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
              <h4 className="font-heading font-extrabold text-xl text-emerald-950">Published with Grace</h4>
              <p className="text-emerald-800 text-sm font-sans max-w-sm mx-auto">
                Your post is uploaded successfully to the News and Community Feed for readers to witness.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handlePublishPost} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-heading font-bold text-slate-500 uppercase tracking-wider block">
                    Author / Ministry Altar
                  </label>
                  <input
                    type="text"
                    value={newPostAuthor}
                    onChange={(e) => setNewPostAuthor(e.target.value)}
                    placeholder="e.g. Sister Nomsa, Youth Ministry, Admin"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-800 text-xs sm:text-sm font-sans"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-heading font-bold text-slate-500 uppercase tracking-wider block">
                    Category Type
                  </label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-800 text-xs sm:text-sm font-sans"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-heading font-bold text-slate-500 uppercase tracking-wider block">
                  Publication Title
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Provide an inspirational or informative headline"
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-800 text-xs sm:text-sm font-sans font-bold text-primary-950"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-heading font-bold text-slate-500 uppercase tracking-wider block">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  placeholder="e.g. Hope, Prayer, Youth, Miracle, Fonteyn"
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-800 text-xs sm:text-sm font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-heading font-bold text-slate-500 uppercase tracking-wider block">
                  Content Body
                </label>
                <textarea
                  rows={8}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Write the complete report or sharing in details..."
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-800 text-xs sm:text-sm font-sans leading-relaxed"
                  required
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Publish Article</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      )}

      {activeTab === "moderation" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {!isModeratorUnlocked ? (
            /* PIN SECURITY LOCK BOX */
            <div className="max-w-md mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-xl text-center">
              <div className="h-14 w-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-primary-950">🔒 Media Moderation</h3>
              <p className="text-slate-400 text-xs font-sans mt-1.5 max-w-sm mx-auto">
                Access is restricted to pastoral and administrative coordinators. 
                Enter the system passcode below to authorize.
              </p>

              {/* Secure testing hint */}
              <div className="mt-4 p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-500 text-[10px] font-mono">
                Staff Test Keycode: <span className="font-bold text-primary-800">1234</span>
              </div>

              <form onSubmit={handleUnlockModerator} className="mt-6 space-y-4">
                <input
                  type="password"
                  placeholder="🔑 Enter Passcode"
                  value={moderatorCode}
                  onChange={(e) => setModeratorCode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-800 text-center font-bold tracking-widest text-lg"
                  maxLength={6}
                  required
                />
                {moderationError && (
                  <p className="text-rose-600 text-xs font-sans font-medium">{moderationError}</p>
                )}
                <button
                  type="submit"
                  className="w-full bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow"
                >
                  Unlock Altar Desk
                </button>
              </form>
            </div>
          ) : (
            /* MODERATOR CONTROL DASHBOARD */
            <div className="space-y-6">
              {/* Header block with statistics and locking options */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-500 h-2 w-2 rounded-full animate-pulse"></span>
                    <h3 className="font-heading font-extrabold text-lg tracking-tight">Fonteyn Media Moderation</h3>
                  </div>
                  <p className="text-slate-400 text-xs font-sans mt-0.5">
                    Authorized Administrator session active. Approve reflections, moderate comments, or remove posts.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModeratorUnlocked(false);
                    setModeratorCode("");
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-heading font-bold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-slate-700 transition-colors"
                >
                  Lock Session
                </button>
              </div>

              {/* Subtab selection */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setModeratorFilter("pending")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all border ${
                      moderatorFilter === "pending"
                        ? "bg-amber-100 border-amber-200 text-amber-800"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    Hold for Review ({(allCommentsWithPost.filter(c => !c.approved).length)})
                  </button>
                  <button
                    onClick={() => setModeratorFilter("approved")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all border ${
                      moderatorFilter === "approved"
                        ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    Public Approved ({(allCommentsWithPost.filter(c => c.approved).length)})
                  </button>
                  <button
                    onClick={() => setModeratorFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all border ${
                      moderatorFilter === "all"
                        ? "bg-slate-800 border-slate-800 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    All Comments
                  </button>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Total Records: {allCommentsWithPost.length}
                </div>
              </div>

              {/* List of comments under moderation */}
              <div className="space-y-4">
                {filteredModeratorComments.length > 0 ? (
                  filteredModeratorComments.map((comm) => (
                    <motion.div
                      key={comm.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4"
                    >
                      <div className="space-y-2 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-heading font-bold text-xs text-slate-800">
                            {comm.author}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {comm.date}
                          </span>
                          <span className="text-[9px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            Post: "{comm.postTitle}"
                          </span>
                          {comm.approved ? (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
                              Approved
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase animate-pulse">
                              Pending Review
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 font-sans text-xs leading-relaxed italic">
                          "{comm.text || comm.content}"
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2 md:self-center">
                        {!comm.approved ? (
                          <button
                            onClick={() => handleApproveComment(comm.postId, comm.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center space-x-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRejectComment(comm.postId, comm.id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-heading font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center space-x-1"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Hold/Hide</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteComment(comm.postId, comm.id)}
                          className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 p-2 rounded-lg"
                          title="Delete Comment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white text-center py-12 rounded-2xl border border-slate-100">
                    <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-slate-500 font-heading font-bold text-sm">Clear Queue!</p>
                    <p className="text-slate-400 font-sans text-xs mt-0.5">
                      No comments are in this category needing attention.
                    </p>
                  </div>
                )}
              </div>

              {/* List of articles that can be deleted/moderated */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4">
                <h4 className="font-heading font-bold text-base text-primary-950 border-b border-slate-100 pb-3 flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-gold-500" />
                  <span>Moderate Blog Articles</span>
                </h4>

                <div className="divide-y divide-slate-100">
                  {posts.map(post => (
                    <div key={post.id} className="py-3 flex justify-between items-center gap-4">
                      <div>
                        <h5 className="font-heading font-bold text-sm text-slate-800 line-clamp-1">
                          {post.title}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-sans">
                          By {post.author} on {post.date} • {post.category}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-heading font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center space-x-1 border border-rose-100"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete Post</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* SOCIAL SHARING MODAL DIALOG */}
      <AnimatePresence>
        {sharePost && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-heading font-extrabold text-lg text-primary-950">Share with Fellowship</h4>
                  <p className="text-slate-400 text-xs font-sans">Spread the testimony and truth</p>
                </div>
                <button
                  onClick={() => setSharePost(null)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <p className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-600 font-sans text-xs leading-relaxed mb-6 line-clamp-2">
                "{sharePost.title}" - by {sharePost.author}
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                <button
                  onClick={() => handleSocialShare("whatsapp", sharePost)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-heading font-bold text-xs tracking-wider py-2.5 rounded-xl border border-emerald-100 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => handleSocialShare("facebook", sharePost)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-heading font-bold text-xs tracking-wider py-2.5 rounded-xl border border-blue-100 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => handleSocialShare("twitter", sharePost)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-heading font-bold text-xs tracking-wider py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-gold-400" />
                  <span>Twitter / X</span>
                </button>
                <button
                  onClick={() => handleSocialShare("email", sharePost)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-heading font-bold text-xs tracking-wider py-2.5 rounded-xl border border-rose-100 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Mail className="h-4 w-4 text-rose-600" />
                  <span>Email</span>
                </button>
              </div>

              <button
                onClick={() => handleSocialShare("copy", sharePost)}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-heading font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Link className="h-4 w-4 text-slate-500" />
                <span>Copy Shareable Link</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
