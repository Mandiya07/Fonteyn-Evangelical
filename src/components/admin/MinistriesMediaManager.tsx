import React, { useState } from "react";
import { Plus, Edit2, Trash2, Heart, Video, Image, Radio, Check, Search, AlertTriangle, Play } from "lucide-react";
import { Ministry, PhotoAlbum, Video as VideoType, Livestream } from "../../types";

interface MinistriesMediaManagerProps {
  ministries: Ministry[];
  albums: PhotoAlbum[];
  videos: VideoType[];
  livestreams: Livestream[];
  onRefresh: () => void;
}

export default function MinistriesMediaManager({
  ministries,
  albums,
  videos,
  livestreams,
  onRefresh
}: MinistriesMediaManagerProps) {
  // Tabs
  const [subTab, setSubTab] = useState<"ministries" | "media">("ministries");
  const [mediaSubTab, setMediaSubTab] = useState<"albums" | "videos" | "livestreams">("albums");

  // Search
  const [ministrySearch, setMinistrySearch] = useState("");
  const [mediaSearch, setMediaSearch] = useState("");

  // Feedback states
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Editing targets
  const [editingMinId, setEditingMinId] = useState<string | null>(null);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingLiveId, setEditingLiveId] = useState<string | null>(null);

  // --- MINISTRY FORM FIELDS ---
  const [minName, setMinName] = useState("");
  const [minDesc, setMinDesc] = useState("");
  const [minLeaderName, setMinLeaderName] = useState("");
  const [minLeaderRole, setMinLeaderRole] = useState("");
  const [minLeaderContact, setMinLeaderContact] = useState("");
  const [minLeaderBio, setMinLeaderBio] = useState("");
  const [minLeaderPhoto, setMinLeaderPhoto] = useState("");
  const [minSchedule, setMinSchedule] = useState("");
  const [minActivities, setMinActivities] = useState("");

  // --- PHOTO ALBUM FIELDS ---
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumCategory, setAlbumCategory] = useState<PhotoAlbum["category"]>("Worship Services");
  const [albumDate, setAlbumDate] = useState("");
  const [albumPhotos, setAlbumPhotos] = useState("");

  // --- VIDEO FIELDS ---
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCategory, setVideoCategory] = useState("Worship Services");
  const [videoPlatform, setVideoPlatform] = useState<"YouTube" | "Facebook" | "Vimeo">("YouTube");
  const [videoVidId, setVideoVidId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // --- LIVESTREAM FIELDS ---
  const [liveTitle, setLiveTitle] = useState("");
  const [livePlatform, setLivePlatform] = useState<"YouTube" | "Facebook">("YouTube");
  const [liveVidId, setLiveVidId] = useState("");
  const [liveStatus, setLiveStatus] = useState<"upcoming" | "live" | "ended">("upcoming");
  const [liveStart, setLiveStart] = useState("");

  // Feedback helpers
  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };
  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  // --- MINISTRIES CRUD ---
  const handleEditMinInit = (m: Ministry) => {
    setEditingMinId(m.id);
    setMinName(m.name);
    setMinDesc(m.description);
    setMinLeaderName(m.leader?.name || "");
    setMinLeaderRole(m.leader?.role || "");
    setMinLeaderContact(m.leader?.contact || "");
    setMinLeaderBio(m.leader?.bio || "");
    setMinLeaderPhoto(m.leader?.photo || "");
    setMinSchedule(m.schedule);
    setMinActivities(m.activities?.join(", ") || "");
  };

  const handleResetMinForm = () => {
    setEditingMinId(null);
    setMinName("");
    setMinDesc("");
    setMinLeaderName("");
    setMinLeaderRole("");
    setMinLeaderContact("");
    setMinLeaderBio("");
    setMinLeaderPhoto("");
    setMinSchedule("");
    setMinActivities("");
  };

  const handleSaveMinistry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!minName || !minDesc) {
      triggerError("Ministry Name and Description are required.");
      return;
    }

    const payload = {
      name: minName,
      description: minDesc,
      leaderName: minLeaderName,
      leaderRole: minLeaderRole,
      leaderContact: minLeaderContact,
      leaderBio: minLeaderBio,
      leaderPhoto: minLeaderPhoto,
      schedule: minSchedule,
      activities: minActivities.split(",").map(a => a.trim()).filter(Boolean)
    };

    try {
      const url = editingMinId ? `/api/ministries/${editingMinId}` : "/api/ministries";
      const method = editingMinId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        triggerSuccess(editingMinId ? "Ministry updated successfully!" : "Ministry added successfully!");
        handleResetMinForm();
        onRefresh();
      } else {
        const data = await res.json();
        triggerError(data.error || "Failed to save ministry.");
      }
    } catch (err) {
      triggerError("Network error.");
    }
  };

  const handleDeleteMinistry = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ministry permanently?")) return;
    try {
      const res = await fetch(`/api/ministries/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerSuccess("Ministry successfully deleted.");
        onRefresh();
      } else {
        triggerError("Failed to delete ministry.");
      }
    } catch (err) {
      triggerError("Network error.");
    }
  };

  // --- PHOTO ALBUMS CRUD ---
  const handleEditAlbumInit = (a: PhotoAlbum) => {
    setEditingAlbumId(a.id);
    setAlbumTitle(a.title);
    setAlbumCategory(a.category);
    setAlbumDate(a.date);
    setAlbumPhotos(a.photos?.join(", ") || "");
  };

  const handleResetAlbumForm = () => {
    setEditingAlbumId(null);
    setAlbumTitle("");
    setAlbumCategory("Worship Services");
    setAlbumDate("");
    setAlbumPhotos("");
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle) return;

    const payload = {
      title: albumTitle,
      category: albumCategory,
      date: albumDate,
      photos: albumPhotos.split(",").map(p => p.trim()).filter(Boolean)
    };

    try {
      const url = editingAlbumId ? `/api/media/photo-albums/${editingAlbumId}` : "/api/media/photo-albums";
      const method = editingAlbumId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        triggerSuccess("Photo album saved!");
        handleResetAlbumForm();
        onRefresh();
      }
    } catch (err) {
      triggerError("Network error.");
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!window.confirm("Delete photo album?")) return;
    try {
      const res = await fetch(`/api/media/photo-albums/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerSuccess("Album deleted.");
        onRefresh();
      }
    } catch (err) {}
  };

  // --- VIDEOS CRUD ---
  const handleEditVideoInit = (v: VideoType) => {
    setEditingVideoId(v.id);
    setVideoTitle(v.title);
    setVideoCategory(v.category);
    setVideoPlatform(v.platform);
    setVideoVidId(v.videoId);
    setVideoUrl(v.url || "");
  };

  const handleResetVideoForm = () => {
    setEditingVideoId(null);
    setVideoTitle("");
    setVideoCategory("Worship Services");
    setVideoPlatform("YouTube");
    setVideoVidId("");
    setVideoUrl("");
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle || !videoVidId) return;

    const payload = {
      title: videoTitle,
      category: videoCategory,
      platform: videoPlatform,
      videoId: videoVidId,
      url: videoUrl
    };

    try {
      const url = editingVideoId ? `/api/media/videos/${editingVideoId}` : "/api/media/videos";
      const method = editingVideoId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        triggerSuccess("Video record saved!");
        handleResetVideoForm();
        onRefresh();
      }
    } catch (err) {}
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm("Delete video?")) return;
    try {
      const res = await fetch(`/api/media/videos/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerSuccess("Video deleted.");
        onRefresh();
      }
    } catch (err) {}
  };

  // --- LIVESTREAMS CRUD ---
  const handleEditLiveInit = (l: Livestream) => {
    setEditingLiveId(l.id);
    setLiveTitle(l.title);
    setLivePlatform(l.platform);
    setLiveVidId(l.videoId);
    setLiveStatus(l.status);
    setLiveStart(l.startTime);
  };

  const handleResetLiveForm = () => {
    setEditingLiveId(null);
    setLiveTitle("");
    setLivePlatform("YouTube");
    setLiveVidId("");
    setLiveStatus("upcoming");
    setLiveStart("");
  };

  const handleSaveLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTitle || !liveVidId) return;

    const payload = {
      title: liveTitle,
      platform: livePlatform,
      videoId: liveVidId,
      status: liveStatus,
      startTime: liveStart
    };

    try {
      const url = editingLiveId ? `/api/media/livestreams/${editingLiveId}` : "/api/media/livestreams";
      const method = editingLiveId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        triggerSuccess("Livestream configuration updated!");
        handleResetLiveForm();
        onRefresh();
      }
    } catch (err) {}
  };

  const handleDeleteLive = async (id: string) => {
    if (!window.confirm("Remove livestream schedule?")) return;
    try {
      const res = await fetch(`/api/media/livestreams/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerSuccess("Livestream removed.");
        onRefresh();
      }
    } catch (err) {}
  };

  // Filter listings
  const filteredMinistries = ministries.filter(m =>
    m.name.toLowerCase().includes(ministrySearch.toLowerCase()) ||
    m.description.toLowerCase().includes(ministrySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSubTab("ministries")}
          className={`pb-2.5 px-4 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-1.5 ${
            subTab === "ministries" ? "border-gold-500 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>Ministries ({ministries.length})</span>
        </button>
        <button
          onClick={() => setSubTab("media")}
          className={`pb-2.5 px-4 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-1.5 ${
            subTab === "media" ? "border-gold-500 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Video className="h-4 w-4" />
          <span>Media Files Database</span>
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-1 font-medium">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* --- MINISTRIES MANAGER --- */}
      {subTab === "ministries" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Ministry Form */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
            <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Plus className="h-4 w-4 text-gold-600" />
              <span>{editingMinId ? "Edit Ministry Details" : "Create New Ministry"}</span>
            </h4>

            <form onSubmit={handleSaveMinistry} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Ministry Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Women of Faith / Youth Ministry"
                  value={minName}
                  onChange={(e) => setMinName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Description *</label>
                <textarea
                  rows={2}
                  placeholder="Core purpose and mission statements..."
                  value={minDesc}
                  onChange={(e) => setMinDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none font-sans"
                  required
                ></textarea>
              </div>

              <div className="border-t border-slate-200 pt-2.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-heading">Ministry Leader Assignment</span>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <div>
                    <label className="block text-slate-700 font-heading text-[9px] font-semibold mb-0.5">Leader Name</label>
                    <input
                      type="text"
                      placeholder="Elder Thabo"
                      value={minLeaderName}
                      onChange={(e) => setMinLeaderName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-heading text-[9px] font-semibold mb-0.5">Leader Role Title</label>
                    <input
                      type="text"
                      placeholder="Youth Coordinator"
                      value={minLeaderRole}
                      onChange={(e) => setMinLeaderRole(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-slate-700 font-heading text-[9px] font-semibold mb-0.5">Contact phone/email</label>
                    <input
                      type="text"
                      placeholder="+268 7600..."
                      value={minLeaderContact}
                      onChange={(e) => setMinLeaderContact(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-heading text-[9px] font-semibold mb-0.5">Leader Avatar Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={minLeaderPhoto}
                      onChange={(e) => setMinLeaderPhoto(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block text-slate-700 font-heading text-[9px] font-semibold mb-0.5">Brief Leader Bio</label>
                  <input
                    type="text"
                    placeholder="Brief testimony/bio..."
                    value={minLeaderBio}
                    onChange={(e) => setMinLeaderBio(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2.5 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Schedules</label>
                  <input
                    type="text"
                    placeholder="Sundays at 11:30 AM"
                    value={minSchedule}
                    onChange={(e) => setMinSchedule(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Activities (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="Weekly fellowship, Outreaches"
                    value={minActivities}
                    onChange={(e) => setMinActivities(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-heading font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg transition-colors"
                >
                  {editingMinId ? "Update Ministry" : "Create Ministry"}
                </button>
                {editingMinId && (
                  <button
                    type="button"
                    onClick={handleResetMinForm}
                    className="px-3 bg-slate-250 hover:bg-slate-300 text-slate-600 font-heading font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Ministry List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search ministries by name or bio..."
                value={ministrySearch}
                onChange={(e) => setMinistrySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredMinistries.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">No active ministries indexed.</p>
              ) : (
                filteredMinistries.map((m) => (
                  <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="font-heading font-extrabold text-slate-800 text-xs">{m.name}</p>
                      <p className="text-[10px] text-slate-500 font-sans leading-relaxed">{m.description}</p>
                      <p className="text-[9px] font-mono text-slate-400">
                        Schedule: <span className="text-slate-600 font-semibold">{m.schedule}</span>
                      </p>
                      {m.leader?.name && (
                        <div className="bg-white p-1.5 rounded-lg border border-slate-200 text-[9px] text-slate-500 font-sans inline-flex items-center gap-1.5 mt-1.5">
                          {m.leader.photo && <img src={m.leader.photo} alt={m.leader.name} className="h-5 w-5 rounded-full object-cover" />}
                          <span>Leader: <span className="font-semibold text-slate-700">{m.leader.name}</span> ({m.leader.role})</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleEditMinInit(m)}
                        className="p-1.5 bg-white text-slate-500 hover:text-slate-900 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMinistry(m.id)}
                        className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
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

      {/* --- MEDIA FILES DATABASE --- */}
      {subTab === "media" && (
        <div className="space-y-6">
          {/* Sub sub-tabs */}
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setMediaSubTab("albums")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-heading font-bold uppercase tracking-wider transition-all flex items-center space-x-1 ${
                mediaSubTab === "albums" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Image className="h-3.5 w-3.5" />
              <span>Photo Albums ({albums.length})</span>
            </button>
            <button
              onClick={() => setMediaSubTab("videos")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-heading font-bold uppercase tracking-wider transition-all flex items-center space-x-1 ${
                mediaSubTab === "videos" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Video Links ({videos.length})</span>
            </button>
            <button
              onClick={() => setMediaSubTab("livestreams")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-heading font-bold uppercase tracking-wider transition-all flex items-center space-x-1 ${
                mediaSubTab === "livestreams" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Livestreams ({livestreams.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form */}
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-1">
                <Plus className="h-4 w-4 text-gold-600" />
                {mediaSubTab === "albums" && <span>{editingAlbumId ? "Edit Photo Album" : "Create Photo Album"}</span>}
                {mediaSubTab === "videos" && <span>{editingVideoId ? "Edit Video File" : "Upload Video Link"}</span>}
                {mediaSubTab === "livestreams" && <span>{editingLiveId ? "Edit Livestream Configuration" : "Schedule Livestream"}</span>}
              </h4>

              {/* ALBUM FORM */}
              {mediaSubTab === "albums" && (
                <form onSubmit={handleSaveAlbum} className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Album Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Winter Youth Summit 2026"
                      value={albumTitle}
                      onChange={(e) => setAlbumTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Date</label>
                      <input
                        type="date"
                        value={albumDate}
                        onChange={(e) => setAlbumDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Category</label>
                      <select
                        value={albumCategory}
                        onChange={(e) => setAlbumCategory(e.target.value as PhotoAlbum["category"])}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
                      >
                        <option value="Worship Services">Worship Services</option>
                        <option value="Conferences">Conferences</option>
                        <option value="Youth Events">Youth Events</option>
                        <option value="Outreach Programs">Outreach Programs</option>
                        <option value="Special Events">Special Events</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Photos Image URLs (Comma Separated)</label>
                    <textarea
                      rows={3}
                      placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                      value={albumPhotos}
                      onChange={(e) => setAlbumPhotos(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none font-sans"
                    ></textarea>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-slate-900 text-white font-heading font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg">
                      Save Album
                    </button>
                    {editingAlbumId && (
                      <button type="button" onClick={handleResetAlbumForm} className="px-3 bg-slate-200 text-slate-600 font-heading text-[10px] uppercase py-2.5 rounded-lg">Cancel</button>
                    )}
                  </div>
                </form>
              )}

              {/* VIDEO FORM */}
              {mediaSubTab === "videos" && (
                <form onSubmit={handleSaveVideo} className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Video Title *</label>
                    <input
                      type="text"
                      placeholder="Weekly Sunday Sermon Stream"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Platform</label>
                      <select
                        value={videoPlatform}
                        onChange={(e) => setVideoPlatform(e.target.value as "YouTube" | "Facebook" | "Vimeo")}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
                      >
                        <option value="YouTube">YouTube</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Vimeo">Vimeo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Video ID *</label>
                      <input
                        type="text"
                        placeholder="e.g. dQw4w9WgXcQ"
                        value={videoVidId}
                        onChange={(e) => setVideoVidId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Full URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-slate-900 text-white font-heading font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg">
                      Save Video
                    </button>
                    {editingVideoId && (
                      <button type="button" onClick={handleResetVideoForm} className="px-3 bg-slate-200 text-slate-600 font-heading text-[10px] uppercase py-2.5 rounded-lg">Cancel</button>
                    )}
                  </div>
                </form>
              )}

              {/* LIVESTREAM FORM */}
              {mediaSubTab === "livestreams" && (
                <form onSubmit={handleSaveLive} className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Stream Title *</label>
                    <input
                      type="text"
                      placeholder="Live Worship Service Stream"
                      value={liveTitle}
                      onChange={(e) => setLiveTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Platform</label>
                      <select
                        value={livePlatform}
                        onChange={(e) => setLivePlatform(e.target.value as "YouTube" | "Facebook")}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
                      >
                        <option value="YouTube">YouTube</option>
                        <option value="Facebook">Facebook</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Video/Broadcast ID *</label>
                      <input
                        type="text"
                        placeholder="e.g. dQw4w9WgXcQ"
                        value={liveVidId}
                        onChange={(e) => setLiveVidId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Status</label>
                      <select
                        value={liveStatus}
                        onChange={(e) => setLiveStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="live">Live Now</option>
                        <option value="ended">Ended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Start DateTime</label>
                      <input
                        type="text"
                        placeholder="Sundays at 09:00 AM"
                        value={liveStart}
                        onChange={(e) => setLiveStart(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-slate-900 text-white font-heading font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg">
                      Save Stream Configuration
                    </button>
                    {editingLiveId && (
                      <button type="button" onClick={handleResetLiveForm} className="px-3 bg-slate-200 text-slate-600 font-heading text-[10px] uppercase py-2.5 rounded-lg">Cancel</button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Lists */}
            <div className="lg:col-span-7">
              {/* Albums lists */}
              {mediaSubTab === "albums" && (
                <div className="space-y-2 max-h-[440px] overflow-y-auto">
                  {albums.length === 0 ? (
                    <p className="text-center py-8 text-xs text-slate-400">No photo albums.</p>
                  ) : (
                    albums.map(a => (
                      <div key={a.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-heading font-bold text-slate-800">{a.title}</p>
                          <p className="text-[9px] text-slate-400 font-sans">{a.category} • {a.date} • {a.photos?.length || 0} photos</p>
                        </div>
                        <div className="flex space-x-1">
                          <button onClick={() => handleEditAlbumInit(a)} className="p-1 bg-white text-slate-500 rounded border hover:bg-slate-550"><Edit2 className="h-3 w-3" /></button>
                          <button onClick={() => handleDeleteAlbum(a.id)} className="p-1 bg-white text-slate-400 hover:text-red-500 rounded border"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Videos listing */}
              {mediaSubTab === "videos" && (
                <div className="space-y-2 max-h-[440px] overflow-y-auto">
                  {videos.length === 0 ? (
                    <p className="text-center py-8 text-xs text-slate-400">No uploaded videos.</p>
                  ) : (
                    videos.map(v => (
                      <div key={v.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-heading font-bold text-slate-800">{v.title}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{v.platform} Link | VideoID: {v.videoId}</p>
                        </div>
                        <div className="flex space-x-1">
                          <button onClick={() => handleEditVideoInit(v)} className="p-1 bg-white text-slate-500 rounded border"><Edit2 className="h-3 w-3" /></button>
                          <button onClick={() => handleDeleteVideo(v.id)} className="p-1 bg-white text-slate-400 hover:text-red-500 rounded border"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Livestreams listing */}
              {mediaSubTab === "livestreams" && (
                <div className="space-y-2 max-h-[440px] overflow-y-auto">
                  {livestreams.length === 0 ? (
                    <p className="text-center py-8 text-xs text-slate-400">No scheduled streams.</p>
                  ) : (
                    livestreams.map(l => (
                      <div key={l.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            {l.status === "live" && <span className="h-2 w-2 bg-rose-600 rounded-full animate-ping" />}
                            <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                              l.status === "live" ? "bg-rose-100 text-rose-700" : l.status === "upcoming" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"
                            }`}>
                              {l.status}
                            </span>
                            <p className="font-heading font-bold text-slate-800">{l.title}</p>
                          </div>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">{l.platform} Broadcaster | Start: {l.startTime}</p>
                        </div>
                        <div className="flex space-x-1">
                          <button onClick={() => handleEditLiveInit(l)} className="p-1 bg-white text-slate-500 rounded border"><Edit2 className="h-3 w-3" /></button>
                          <button onClick={() => handleDeleteLive(l.id)} className="p-1 bg-white text-slate-400 hover:text-red-500 rounded border"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
