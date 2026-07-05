import React, { useState, useEffect } from "react";
import { Camera, Video as VideoIcon, Radio, Play, Maximize2, X, MessageSquare, Send, Calendar, Clock, Lock, Heart } from "lucide-react";
import { PhotoAlbum, Video, Livestream } from "../types";
import { translations } from "../lib/translations";
import CommunityOutreach from "./CommunityOutreach";

interface MediaCenterProps {
  language: "en" | "ss";
}

type Tab = "photos" | "videos" | "live" | "outreach";
type PhotoCategory = 'All' | 'Worship Services' | 'Conferences' | 'Youth Events' | 'Outreach Programs' | 'Special Events';

export default function MediaCenter({ language }: MediaCenterProps) {
  const [activeTab, setActiveTab] = useState<Tab>("photos");

  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [livestreams, setLivestreams] = useState<Livestream[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Photos state
  const [photoCategory, setPhotoCategory] = useState<PhotoCategory>("All");
  const [selectedAlbum, setSelectedAlbum] = useState<PhotoAlbum | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Videos state
  const [videoCategory, setVideoCategory] = useState<PhotoCategory>("All");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Live state
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{user: string, text: string}[]>([
    { user: "Sarah T.", text: "Praise the Lord!" },
    { user: "Thabo M.", text: "Amen!" }
  ]);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const [albumsRes, videosRes, liveRes] = await Promise.all([
        fetch("/api/media/photo-albums"),
        fetch("/api/media/videos"),
        fetch("/api/media/livestreams")
      ]);
      if (albumsRes.ok) setAlbums(await albumsRes.json());
      if (videosRes.ok) setVideos(await videosRes.json());
      if (liveRes.ok) setLivestreams(await liveRes.json());
    } catch (error) {
      console.error("Error fetching media", error);
    }
    setLoading(false);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatMessages([...chatMessages, { user: "You", text: chatMessage }]);
    setChatMessage("");
  };

  const categories: PhotoCategory[] = ['All', 'Worship Services', 'Conferences', 'Youth Events', 'Outreach Programs', 'Special Events'];

  const filteredAlbums = photoCategory === 'All' ? albums : albums.filter(a => a.category === photoCategory);
  const filteredVideos = videoCategory === 'All' ? videos : videos.filter(v => v.category === videoCategory);

  const activeStream = livestreams.find(ls => ls.status === 'live' || ls.status === 'upcoming');
  const pastStreams = livestreams.filter(ls => ls.status === 'ended');

  // Time remaining for upcoming
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00:00");
  useEffect(() => {
    if (activeStream && activeStream.status === 'upcoming') {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(activeStream.startTime).getTime();
        const distance = start - now;
        if (distance < 0) {
          setTimeRemaining("Starting now...");
          return;
        }
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeStream]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="media-center">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900 tracking-tight">
          {activeTab === "outreach" 
            ? (language === "en" ? "Community Outreach" : "Imisebenti Yekusita") 
            : (language === "en" ? "Media Center" : "Tindzaba teLiBandla")}
        </h2>
        <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full mt-3 mb-6"></div>
        
        {/* Tabs */}
        <div className="inline-flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-sm flex-wrap justify-center gap-1">
          <button
            onClick={() => setActiveTab("photos")}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-heading font-bold uppercase tracking-wider transition-all ${
              activeTab === "photos"
                ? "bg-white text-primary-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Camera className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Photos</span>
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-heading font-bold uppercase tracking-wider transition-all ${
              activeTab === "videos"
                ? "bg-white text-primary-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <VideoIcon className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Videos</span>
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-heading font-bold uppercase tracking-wider transition-all ${
              activeTab === "live"
                ? "bg-white text-red-600 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-red-500"
            }`}
          >
            <Radio className={`h-4.5 w-4.5 ${activeTab === 'live' ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">Live</span>
          </button>
          <button
            onClick={() => setActiveTab("outreach")}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-heading font-bold uppercase tracking-wider transition-all ${
              activeTab === "outreach"
                ? "bg-white text-teal-600 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-teal-600"
            }`}
          >
            <Heart className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">
              {language === "en" ? "Outreach" : "Kusita"}
            </span>
          </button>
        </div>
      </div>

      {loading && activeTab !== "outreach" ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-slate-500 font-sans">Loading media...</p>
        </div>
      ) : (
        <div className="animate-fade-in">
          
          {/* PHOTO GALLERY */}
          {activeTab === "photos" && (
            <div className="space-y-8">
              {/* Categories */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setPhotoCategory(cat); setSelectedAlbum(null); }}
                    className={`px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                      photoCategory === cat
                        ? "bg-primary-900 border-primary-900 text-white shadow-md"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {selectedAlbum ? (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-heading font-extrabold text-2xl text-primary-900">{selectedAlbum.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{selectedAlbum.date}</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] uppercase font-bold text-slate-600 ml-2">{selectedAlbum.category}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedAlbum(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors"
                    >
                      Back to Albums
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedAlbum.photos.map((photo, idx) => (
                      <div 
                        key={idx} 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer relative group bg-slate-100"
                        onClick={() => setLightboxImage(photo)}
                      >
                        <img 
                          src={photo} 
                          alt={`${selectedAlbum.title} ${idx + 1}`} 
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none" 
                          onContextMenu={(e) => e.preventDefault()}
                          draggable="false"
                        />
                        <div className="absolute inset-0 bg-primary-950/0 group-hover:bg-primary-950/20 transition-all flex items-center justify-center">
                          <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 h-8 w-8 drop-shadow-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAlbums.length > 0 ? filteredAlbums.map(album => (
                    <button
                      key={album.id}
                      onClick={() => setSelectedAlbum(album)}
                      className="group text-left bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                          src={album.photos[0]} 
                          alt={album.title} 
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none" 
                          onContextMenu={(e) => e.preventDefault()}
                          draggable="false"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-gold-500 text-primary-950 px-2 py-0.5 rounded-md mb-2 inline-block">
                            {album.category}
                          </span>
                          <h4 className="font-heading font-bold text-lg leading-tight">{album.title}</h4>
                          <p className="text-xs text-slate-300 mt-1">{album.photos.length} Photos • {album.date}</p>
                        </div>
                      </div>
                    </button>
                  )) : (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                      <Camera className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-sans">No photo albums found in this category.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIDEO GALLERY */}
          {activeTab === "videos" && (
            <div className="space-y-8">
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setVideoCategory(cat); setSelectedVideo(null); }}
                    className={`px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                      videoCategory === cat
                        ? "bg-primary-900 border-primary-900 text-white shadow-md"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {selectedVideo ? (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-heading font-extrabold text-2xl text-primary-900">{selectedVideo.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 flex items-center space-x-2">
                        <span className="font-bold">{selectedVideo.platform}</span>
                        <span>•</span>
                        <span>{selectedVideo.date}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedVideo(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors"
                    >
                      Back to Videos
                    </button>
                  </div>
                  
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-inner">
                    {selectedVideo.platform === 'YouTube' ? (
                      <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`} 
                        title={selectedVideo.title}
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                        <Play className="h-16 w-16 text-slate-600 mb-4" />
                        <p>Video playback for {selectedVideo.platform} simulated.</p>
                        <a href={selectedVideo.url} target="_blank" rel="noreferrer" className="mt-4 text-gold-400 hover:underline">Watch on {selectedVideo.platform}</a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.length > 0 ? filteredVideos.map(video => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className="group text-left bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="aspect-video bg-slate-200 relative overflow-hidden flex-shrink-0">
                        {video.platform === 'YouTube' ? (
                          <img src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800">
                             <VideoIcon className="text-slate-600 h-12 w-12" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-primary-900/90 text-white p-3 rounded-full transform group-hover:scale-110 shadow-lg transition-transform">
                            <Play className="h-6 w-6 ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 mb-1 inline-block">
                          {video.category}
                        </span>
                        <h4 className="font-heading font-bold text-base leading-tight text-primary-950 mb-2 line-clamp-2">{video.title}</h4>
                        <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                          <span>{video.platform}</span>
                          <span>{video.date}</span>
                        </div>
                      </div>
                    </button>
                  )) : (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                      <VideoIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-sans">No videos found in this category.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* LIVESTREAM */}
          {activeTab === "live" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                
                {activeStream ? (
                  <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          {activeStream.status === 'live' ? (
                            <span className="flex items-center space-x-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold uppercase tracking-wider animate-pulse">
                              <span className="h-2 w-2 rounded-full bg-red-600"></span>
                              <span>Live Now</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              <Clock className="h-3 w-3" />
                              <span>Upcoming</span>
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{activeStream.platform}</span>
                        </div>
                        <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-primary-900">{activeStream.title}</h3>
                      </div>
                    </div>

                    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-inner relative">
                      {activeStream.status === 'live' ? (
                        activeStream.platform === 'YouTube' ? (
                          <iframe 
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${activeStream.videoId}?autoplay=1`} 
                            title={activeStream.title}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                            <Radio className="h-16 w-16 text-slate-600 mb-4 animate-pulse" />
                            <p>Live stream player for {activeStream.platform}</p>
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary-900 to-primary-950 text-white p-6 text-center">
                           <Clock className="h-16 w-16 text-gold-500 mb-6 opacity-80" />
                           <h4 className="font-heading font-extrabold text-2xl mb-2">Starts In</h4>
                           <div className="text-4xl sm:text-6xl font-mono font-light tracking-wider text-gold-400 drop-shadow-md">
                             {timeRemaining}
                           </div>
                           <p className="mt-6 text-primary-200">Waiting for broadcast to begin...</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-3xl border border-slate-100 border-dashed aspect-video flex flex-col items-center justify-center text-center p-8">
                    <Radio className="h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="font-heading font-bold text-lg text-slate-400 mb-2">No Active Broadcast</h3>
                    <p className="text-slate-400 text-sm">Check back later for live services and events.</p>
                  </div>
                )}

                {/* Archive */}
                {pastStreams.length > 0 && (
                  <div>
                    <h4 className="font-heading font-bold text-lg text-primary-900 mb-4 border-b border-slate-100 pb-2">Previous Broadcasts</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pastStreams.map(stream => (
                        <div key={stream.id} className="bg-white border border-slate-100 rounded-xl p-3 flex gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer">
                          <div className="w-24 h-16 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                            {stream.platform === 'YouTube' ? (
                              <img src={`https://img.youtube.com/vi/${stream.videoId}/mqdefault.jpg`} alt={stream.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-800"><VideoIcon className="text-slate-600 h-6 w-6"/></div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="h-5 w-5 text-white opacity-80" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm text-primary-950 line-clamp-1">{stream.title}</h5>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wide">{stream.platform}</p>
                            <p className="text-xs text-slate-400 truncate">{new Date(stream.startTime).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Column */}
              <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[600px] overflow-hidden">
                <div className="p-4 bg-primary-950 text-white flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-gold-400" />
                  <h4 className="font-heading font-bold">Live Chat</h4>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm text-sm">
                      <span className="font-bold text-primary-800 block text-xs mb-0.5">{msg.user}</span>
                      <span className="text-slate-700">{msg.text}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Say hello..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800 transition-colors"
                      disabled={!activeStream}
                    />
                    <button
                      type="submit"
                      disabled={!activeStream || !chatMessage.trim()}
                      className="p-2.5 bg-primary-900 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                  {!activeStream && (
                    <p className="text-[10px] text-center text-slate-500 mt-2">Chat is disabled when offline</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "outreach" && (
            <CommunityOutreach language={language} />
          )}

        </div>
      )}

      {/* LIGHTBOX FOR PHOTOS */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in">
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black p-3 rounded-full transition-all"
          >
            <X className="h-6 w-6" />
          </button>
          
          <img 
            src={lightboxImage} 
            alt="Enlarged view" 
            className="max-w-[90vw] max-h-[90vh] object-contain select-none pointer-events-none rounded-sm shadow-2xl"
            onContextMenu={(e) => e.preventDefault()}
            draggable="false"
          />
          <div className="absolute bottom-6 flex items-center justify-center bg-black/50 text-white/50 text-xs px-4 py-2 rounded-full space-x-2">
            <Lock className="h-3 w-3" />
            <span>Image download restricted</span>
          </div>
        </div>
      )}
    </div>
  );
}
