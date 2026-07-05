import React, { useState } from "react";
import { Plus, Edit2, Trash2, Calendar, BookOpen, Check, Search, Users, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import { Sermon, Event } from "../../types";

interface SermonsEventsManagerProps {
  sermons: Sermon[];
  events: Event[];
  onRefresh: () => void;
}

export default function SermonsEventsManager({ sermons, events, onRefresh }: SermonsEventsManagerProps) {
  // Tabs
  const [subTab, setSubTab] = useState<"sermons" | "events">("sermons");

  // Search & Filter
  const [sermonSearch, setSermonSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("all");

  // State Feedback
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Editing state
  const [editingSermonId, setEditingSermonId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Sermon Form Fields
  const [sermonTitle, setSermonTitle] = useState("");
  const [sermonSpeaker, setSermonSpeaker] = useState("");
  const [sermonDate, setSermonDate] = useState("");
  const [sermonTopic, setSermonTopic] = useState("Faith");
  const [sermonScripture, setSermonScripture] = useState("");
  const [sermonNotes, setSermonNotes] = useState("");
  const [sermonVideo, setSermonVideo] = useState("");
  const [sermonAudio, setSermonAudio] = useState("");
  const [sermonSummary, setSermonSummary] = useState("");
  const [sermonBibleReferences, setSermonBibleReferences] = useState<string[]>([]);
  const [sermonDiscussionQuestions, setSermonDiscussionQuestions] = useState<string[]>([]);
  const [sermonSocialPosts, setSermonSocialPosts] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Event Form Fields
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventCategory, setEventCategory] = useState<Event["category"]>("General");
  const [eventMaxCap, setEventMaxCap] = useState("100");
  const [eventVolSpots, setEventVolSpots] = useState("Ushers, Sound Crew, Hospitality");

  // Selection for RSVP/Volunteer Viewer
  const [selectedEventDetails, setSelectedEventDetails] = useState<Event | null>(null);

  // Helper trigger messages
  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };
  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  // --- SERMONS CRUD ---
  const handleEditSermonInit = (s: Sermon) => {
    setEditingSermonId(s.id);
    setSermonTitle(s.title);
    setSermonSpeaker(s.speaker);
    setSermonDate(s.date);
    setSermonTopic(s.topic);
    setSermonScripture(s.scripture);
    setSermonNotes(s.notes);
    setSermonVideo(s.videoUrl || "");
    setSermonAudio(s.audioUrl || "");
    setSermonSummary(s.summary || "");
    setSermonBibleReferences(s.bibleReferences || []);
    setSermonDiscussionQuestions(s.discussionQuestions || []);
    setSermonSocialPosts(s.socialPosts || []);
  };

  const handleResetSermonForm = () => {
    setEditingSermonId(null);
    setSermonTitle("");
    setSermonSpeaker("");
    setSermonDate("");
    setSermonTopic("Faith");
    setSermonScripture("");
    setSermonNotes("");
    setSermonVideo("");
    setSermonAudio("");
    setSermonSummary("");
    setSermonBibleReferences([]);
    setSermonDiscussionQuestions([]);
    setSermonSocialPosts([]);
  };

  const handleSaveSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sermonTitle || !sermonSpeaker || !sermonDate || !sermonScripture || !sermonNotes) {
      triggerError("Please fill out all required sermon fields.");
      return;
    }

    const payload = {
      title: sermonTitle,
      speaker: sermonSpeaker,
      date: sermonDate,
      topic: sermonTopic,
      scripture: sermonScripture,
      notes: sermonNotes,
      videoUrl: sermonVideo || undefined,
      audioUrl: sermonAudio || undefined,
      summary: sermonSummary || undefined,
      bibleReferences: sermonBibleReferences,
      discussionQuestions: sermonDiscussionQuestions,
      socialPosts: sermonSocialPosts
    };

    try {
      const url = editingSermonId ? `/api/sermons/${editingSermonId}` : "/api/sermons";
      const method = editingSermonId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        triggerSuccess(editingSermonId ? "Sermon updated successfully!" : "Sermon guide uploaded successfully!");
        handleResetSermonForm();
        onRefresh();
      } else {
        const data = await res.json();
        triggerError(data.error || "Failed to save sermon.");
      }
    } catch (err) {
      triggerError("Network error. Could not connect to server.");
    }
  };

  const handleRunAiAssistant = async () => {
    if (!sermonNotes) {
      triggerError("Please enter detailed sermon notes first so the AI can analyze them.");
      return;
    }
    
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/sermon-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: sermonNotes,
          title: sermonTitle || "Untitled Sermon",
          scripture: sermonScripture || "Various"
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSermonSummary(data.summary || "");
        setSermonBibleReferences(data.bibleReferences || []);
        setSermonDiscussionQuestions(data.discussionQuestions || []);
        setSermonSocialPosts(data.socialPosts || []);
        triggerSuccess("AI Sermon study materials successfully generated!");
      } else {
        const data = await res.json();
        triggerError(data.error || "Failed to generate AI materials.");
      }
    } catch (err) {
      triggerError("Could not connect to AI service. Ensure dev server is running.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDeleteSermon = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sermon record?")) return;
    try {
      const res = await fetch(`/api/sermons/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerSuccess("Sermon successfully deleted.");
        onRefresh();
      } else {
        triggerError("Failed to delete sermon.");
      }
    } catch (err) {
      triggerError("Network error.");
    }
  };

  // --- EVENTS CRUD ---
  const handleEditEventInit = (ev: Event) => {
    setEditingEventId(ev.id);
    setEventTitle(ev.title);
    setEventDesc(ev.description);
    setEventDate(ev.date);
    setEventTime(ev.time);
    setEventLocation(ev.location);
    setEventCategory(ev.category);
    setEventMaxCap(ev.maxCapacity.toString());
    setEventVolSpots(ev.volunteerSpots.join(", "));
  };

  const handleResetEventForm = () => {
    setEditingEventId(null);
    setEventTitle("");
    setEventDesc("");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
    setEventCategory("General");
    setEventMaxCap("100");
    setEventVolSpots("Ushers, Sound Crew, Hospitality");
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDesc || !eventDate || !eventTime || !eventLocation) {
      triggerError("Please fill out all required event fields.");
      return;
    }

    const spotsArray = eventVolSpots.split(",").map(s => s.trim()).filter(Boolean);

    const payload = {
      title: eventTitle,
      description: eventDesc,
      date: eventDate,
      time: eventTime,
      location: eventLocation,
      category: eventCategory,
      maxCapacity: parseInt(eventMaxCap) || 100,
      volunteerSpots: spotsArray
    };

    try {
      const url = editingEventId ? `/api/events/${editingEventId}` : "/api/events";
      const method = editingEventId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        triggerSuccess(editingEventId ? "Event updated successfully!" : "Event scheduled successfully!");
        handleResetEventForm();
        onRefresh();
      } else {
        const data = await res.json();
        triggerError(data.error || "Failed to save event.");
      }
    } catch (err) {
      triggerError("Network error.");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This will erase registrations and rosters.")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerSuccess("Event deleted successfully.");
        if (selectedEventDetails?.id === id) {
          setSelectedEventDetails(null);
        }
        onRefresh();
      } else {
        triggerError("Failed to delete event.");
      }
    } catch (err) {
      triggerError("Network error.");
    }
  };

  // Filters
  const filteredSermons = sermons.filter(s =>
    s.title.toLowerCase().includes(sermonSearch.toLowerCase()) ||
    s.speaker.toLowerCase().includes(sermonSearch.toLowerCase()) ||
    s.scripture.toLowerCase().includes(sermonSearch.toLowerCase())
  );

  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
      ev.location.toLowerCase().includes(eventSearch.toLowerCase());
    const matchesCategory = eventCategoryFilter === "all" || ev.category === eventCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSubTab("sermons")}
          className={`pb-2.5 px-4 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-1.5 ${
            subTab === "sermons" ? "border-gold-500 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Sermons Manager ({sermons.length})</span>
        </button>
        <button
          onClick={() => setSubTab("events")}
          className={`pb-2.5 px-4 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-1.5 ${
            subTab === "events" ? "border-gold-500 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Events & RSVPs ({events.length})</span>
        </button>
      </div>

      {/* State Feedback Banners */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-1.5 font-medium animate-fade-in">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-1.5 font-medium animate-fade-in">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* --- SERMONS PANEL --- */}
      {subTab === "sermons" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
            <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
              <Plus className="h-4 w-4 text-gold-600" />
              <span>{editingSermonId ? "Edit Sermon Guide" : "Upload New Sermon Guide"}</span>
            </h4>

            <form onSubmit={handleSaveSermon} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Sermon Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Walking in Divine Purpose"
                  value={sermonTitle}
                  onChange={(e) => setSermonTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Speaker *</label>
                  <input
                    type="text"
                    placeholder="Pastor Sipho"
                    value={sermonSpeaker}
                    onChange={(e) => setSermonSpeaker(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Date *</label>
                  <input
                    type="date"
                    value={sermonDate}
                    onChange={(e) => setSermonDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none text-slate-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Scripture Passage *</label>
                  <input
                    type="text"
                    placeholder="e.g. Romans 8:28"
                    value={sermonScripture}
                    onChange={(e) => setSermonScripture(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Topic Tag</label>
                  <input
                    type="text"
                    placeholder="Faith, Purpose, Trust"
                    value={sermonTopic}
                    onChange={(e) => setSermonTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">YouTube Video ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. dQw4w9WgXcQ"
                    value={sermonVideo}
                    onChange={(e) => setSermonVideo(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Audio MP3 URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/audio.mp3"
                    value={sermonAudio}
                    onChange={(e) => setSermonAudio(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Short Summary (Optional)</label>
                <input
                  type="text"
                  placeholder="One sentence briefing..."
                  value={sermonSummary}
                  onChange={(e) => setSermonSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Detailed Sermon Study Notes *</label>
                <textarea
                  rows={4}
                  placeholder="Write the study questions, key scriptures and outline details..."
                  value={sermonNotes}
                  onChange={(e) => setSermonNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none font-sans"
                  required
                ></textarea>
              </div>

              {/* AI Sermon Assistant Action & Editor */}
              <div className="bg-slate-900 text-white rounded-xl p-4 my-2 border border-slate-800 space-y-3.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-gold-400" />
                    <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-slate-300">
                      AI Sermon Assistant (Gemini)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunAiAssistant}
                    disabled={isAiLoading}
                    className="bg-gold-500 hover:bg-gold-400 text-slate-950 px-3 py-1 rounded text-[10px] font-heading font-extrabold uppercase tracking-wider flex items-center space-x-1 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        <span>Generate with AI</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Use our server-side Gemini intelligence to automatically craft theological summaries, list cross-references, design small-group study questions, and compose social drafts from your notes!
                </p>

                {(sermonSummary || sermonBibleReferences.length > 0 || sermonDiscussionQuestions.length > 0 || sermonSocialPosts.length > 0) && (
                  <div className="space-y-3 pt-2 border-t border-slate-800 text-xs text-slate-300 animate-fade-in">
                    
                    {/* Summary */}
                    <div>
                      <label className="block text-slate-400 font-heading text-[9px] uppercase tracking-wider mb-1 font-semibold">
                        Theological Summary
                      </label>
                      <textarea
                        rows={2}
                        value={sermonSummary}
                        onChange={(e) => setSermonSummary(e.target.value)}
                        placeholder="AI summary will appear here. Feel free to refine..."
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-200 focus:outline-none focus:border-gold-500 font-sans leading-relaxed"
                      />
                    </div>

                    {/* Bible References */}
                    <div>
                      <label className="block text-slate-400 font-heading text-[9px] uppercase tracking-wider mb-1 font-semibold">
                        Cross-References (One per line)
                      </label>
                      <textarea
                        rows={2.5}
                        value={sermonBibleReferences.join("\n")}
                        onChange={(e) => setSermonBibleReferences(e.target.value.split("\n"))}
                        placeholder="e.g. Jeremiah 29:11&#10;Proverbs 3:5-6"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded font-mono text-[10px] text-slate-200 focus:outline-none focus:border-gold-500 leading-relaxed"
                      />
                    </div>

                    {/* Discussion Questions */}
                    <div>
                      <label className="block text-slate-400 font-heading text-[9px] uppercase tracking-wider mb-1 font-semibold">
                        Discussion Questions (One per line)
                      </label>
                      <textarea
                        rows={3.5}
                        value={sermonDiscussionQuestions.join("\n")}
                        onChange={(e) => setSermonDiscussionQuestions(e.target.value.split("\n"))}
                        placeholder="e.g. How do we live with faith in our families?"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-200 focus:outline-none focus:border-gold-500 font-sans leading-relaxed"
                      />
                    </div>

                    {/* Social Media Drafts */}
                    <div>
                      <label className="block text-slate-400 font-heading text-[9px] uppercase tracking-wider mb-1 font-semibold">
                        Social Media Share Drafts (One per line)
                      </label>
                      <textarea
                        rows={3.5}
                        value={sermonSocialPosts.join("\n")}
                        onChange={(e) => setSermonSocialPosts(e.target.value.split("\n"))}
                        placeholder="Shareable drafts for Facebook/Instagram..."
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-200 focus:outline-none focus:border-gold-500 font-sans leading-relaxed"
                      />
                    </div>

                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-heading font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg transition-colors"
                >
                  {editingSermonId ? "Save Changes" : "Create Sermon"}
                </button>
                {editingSermonId && (
                  <button
                    type="button"
                    onClick={handleResetSermonForm}
                    className="px-3 bg-slate-250 hover:bg-slate-300 text-slate-600 font-heading font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search sermons by title, speaker, or scripture..."
                value={sermonSearch}
                onChange={(e) => setSermonSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredSermons.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">No sermons found matching your parameters.</p>
              ) : (
                filteredSermons.map((s) => (
                  <div key={s.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="font-heading font-bold text-slate-800 text-xs">{s.title}</p>
                      <p className="text-slate-500 text-[10px] font-sans">
                        <span className="font-semibold text-slate-600">{s.speaker}</span> • {s.date} • <span className="font-mono text-slate-600">{s.scripture}</span>
                      </p>
                      {s.summary && <p className="text-[10px] text-slate-400 line-clamp-1">{s.summary}</p>}
                    </div>

                    <div className="flex space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleEditSermonInit(s)}
                        className="p-1.5 bg-white text-slate-500 hover:text-slate-900 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                        title="Edit sermon"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSermon(s.id)}
                        className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- EVENTS & RSVPs PANEL --- */}
      {subTab === "events" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
            <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
              <Plus className="h-4 w-4 text-gold-600" />
              <span>{editingEventId ? "Edit Church Event" : "Schedule New Event"}</span>
            </h4>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Event Title *</label>
                <input
                  type="text"
                  placeholder="Youth Conference / Holy Communion"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Description *</label>
                <textarea
                  rows={2}
                  placeholder="Provide general details, speaker bios, or special instructions..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none font-sans"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Date *</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none text-slate-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Time *</label>
                  <input
                    type="text"
                    placeholder="09:00 AM"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none text-slate-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Location *</label>
                  <input
                    type="text"
                    placeholder="Fonteyn FEC Campus"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as Event["category"])}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none text-slate-600"
                  >
                    <option value="General">General</option>
                    <option value="Worship">Worship</option>
                    <option value="Youth">Youth</option>
                    <option value="Conference">Conference</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Study">Study</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Maximum Capacity</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={eventMaxCap}
                    onChange={(e) => setEventMaxCap(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Volunteer Spots (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="Ushers, Sound Crew, Hospitality"
                    value={eventVolSpots}
                    onChange={(e) => setEventVolSpots(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-heading font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg transition-colors"
                >
                  {editingEventId ? "Save Changes" : "Schedule Event"}
                </button>
                {editingEventId && (
                  <button
                    type="button"
                    onClick={handleResetEventForm}
                    className="px-3 bg-slate-250 hover:bg-slate-300 text-slate-600 font-heading font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search events by name or location..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <select
                value={eventCategoryFilter}
                onChange={(e) => setEventCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="General">General</option>
                <option value="Worship">Worship</option>
                <option value="Youth">Youth</option>
                <option value="Conference">Conference</option>
                <option value="Outreach">Outreach</option>
                <option value="Study">Study</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {filteredEvents.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">No events scheduled.</p>
              ) : (
                filteredEvents.map((ev) => (
                  <div key={ev.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-primary-100 text-primary-900 font-bold uppercase px-1.5 py-0.5 rounded text-[8px] tracking-wider">
                          {ev.category}
                        </span>
                        <p className="font-heading font-extrabold text-slate-800 text-xs">{ev.title}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {ev.date} at {ev.time} | {ev.location}
                      </p>
                      <p className="text-[10px] text-slate-500 font-sans line-clamp-1">{ev.description}</p>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setSelectedEventDetails(ev)}
                        className="px-2.5 py-1.5 bg-white text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 hover:border-slate-300 text-[10px] font-heading font-bold uppercase transition-all flex items-center space-x-1"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>Roster ({ev.registeredUsers?.length || 0})</span>
                      </button>
                      <button
                        onClick={() => handleEditEventInit(ev)}
                        className="p-1.5 bg-white text-slate-500 hover:text-slate-900 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-1.5 bg-white text-slate-400 hover:text-rose-500 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Collapse Detail Drawer for RSVPs and Volunteers */}
            {selectedEventDetails && (
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 animate-fade-in space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-gold-400 font-mono font-bold">Attendee & Volunteer Register</span>
                    <h5 className="font-heading font-bold text-sm text-white">{selectedEventDetails.title}</h5>
                  </div>
                  <button
                    onClick={() => setSelectedEventDetails(null)}
                    className="text-slate-400 hover:text-white text-xs font-bold font-mono px-2 py-1 bg-slate-800 rounded-md"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* RSVPs */}
                  <div>
                    <h6 className="font-heading font-bold text-[10px] text-slate-400 uppercase tracking-wide mb-2">
                      Registered Users ({selectedEventDetails.registeredUsers?.length || 0} / {selectedEventDetails.maxCapacity})
                    </h6>
                    {selectedEventDetails.registeredUsers?.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No registrations logged yet.</p>
                    ) : (
                      <div className="space-y-1 max-h-[140px] overflow-y-auto font-mono text-[10px] text-slate-300 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                        {selectedEventDetails.registeredUsers.map((email, i) => (
                          <div key={i} className="flex items-center space-x-1 py-0.5">
                            <span className="text-gold-400">#</span>
                            <span>{email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Volunteers */}
                  <div>
                    <h6 className="font-heading font-bold text-[10px] text-slate-400 uppercase tracking-wide mb-2">
                      Volunteer Roster ({selectedEventDetails.volunteers?.length || 0})
                    </h6>
                    {selectedEventDetails.volunteers?.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No volunteers assigned.</p>
                    ) : (
                      <div className="space-y-1 max-h-[140px] overflow-y-auto font-mono text-[10px] text-slate-300 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                        {selectedEventDetails.volunteers.map((vol, i) => (
                          <div key={i} className="flex items-center space-x-1 py-0.5">
                            <span className="text-emerald-400">✔</span>
                            <span>{vol}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
