import React, { useState, useEffect } from "react";
import { Search, Play, Pause, Download, Share2, Sparkles, AlertCircle, FileText, Check, ChevronRight, Video, Music } from "lucide-react";
import { jsPDF } from "jspdf";
import { Sermon } from "../types";
import { translations } from "../lib/translations";

interface SermonCenterProps {
  language: "en" | "ss";
}

export default function SermonCenter({ language }: SermonCenterProps) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedSpeaker, setSelectedSpeaker] = useState("All");
  const [selectedDate, setSelectedDate] = useState("All");
  const [selectedScripture, setSelectedScripture] = useState("All");
  const [loading, setLoading] = useState(true);
  
  // Audio Player State
  const [playingSermonId, setPlayingSermonId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // AI Assistant State
  const [aiAnalyzingId, setAiAnalyzingId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    sermonId: string;
    summary: string;
    bibleReferences: string[];
    discussionQuestions: string[];
    socialPosts: string[];
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Share Simulation State
  const [sharedSermonId, setSharedSermonId] = useState<string | null>(null);

  useEffect(() => {
    fetchSermons();
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, []);

  const fetchSermons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sermons");
      if (res.ok) {
        const data = await res.json();
        setSermons(data);
      }
    } catch (err) {
      console.error("Failed to load sermons", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Sermons
  const filteredSermons = sermons.filter((sermon) => {
    const matchesSearch =
      sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.scripture.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTopic = selectedTopic === "All" || sermon.topic === selectedTopic;
    const matchesSpeaker = selectedSpeaker === "All" || sermon.speaker === selectedSpeaker;
    const matchesYear = selectedDate === "All" || sermon.date.startsWith(selectedDate);
    const matchesBook = selectedScripture === "All" || sermon.scripture.startsWith(selectedScripture);

    return matchesSearch && matchesTopic && matchesSpeaker && matchesYear && matchesBook;
  });

  // Unique Select Options
  const topics = ["All", ...Array.from(new Set(sermons.map((s) => s.topic).filter(Boolean)))];
  const speakers = ["All", ...Array.from(new Set(sermons.map((s) => s.speaker).filter(Boolean)))];
  const years = ["All", ...Array.from(new Set(sermons.map((s) => s.date.substring(0, 4)).filter(Boolean)))];
  const books = ["All", ...Array.from(new Set(sermons.map((s) => s.scripture.replace(/[0-9].*/, '').trim()).filter(Boolean)))];

  // Play/Pause Audio Handler
  const handlePlayAudio = (sermon: Sermon) => {
    if (!sermon.audioUrl) return;

    if (playingSermonId === sermon.id) {
      // Pause
      if (audioElement) {
        audioElement.pause();
      }
      setPlayingSermonId(null);
    } else {
      // Stop old audio if any
      if (audioElement) {
        audioElement.pause();
      }
      // Play new
      const audio = new Audio(sermon.audioUrl);
      audio.play().catch(e => console.warn("Audio playback delayed or blocked by browser policies", e));
      setAudioElement(audio);
      setPlayingSermonId(sermon.id);

      audio.onended = () => {
        setPlayingSermonId(null);
      };
    }
  };

  // Call Server-side AI Sermon Assistant API
  const handleAIAnalysis = async (sermon: Sermon) => {
    try {
      setAiAnalyzingId(sermon.id);
      setAiError(null);
      setAiResult(null);

      const res = await fetch("/api/sermon-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: sermon.notes,
          title: sermon.title,
          scripture: sermon.scripture
        })
      });

      if (!res.ok) {
        throw new Error("Failed to process sermon via AI.");
      }

      const data = await res.json();
      setAiResult({
        sermonId: sermon.id,
        summary: data.summary,
        bibleReferences: data.bibleReferences,
        discussionQuestions: data.discussionQuestions,
        socialPosts: data.socialPosts
      });

      // Storing AI results inside local sermon object so they stay loaded
      setSermons(prev => prev.map(s => {
        if (s.id === sermon.id) {
          return {
            ...s,
            summary: data.summary,
            bibleReferences: data.bibleReferences,
            discussionQuestions: data.discussionQuestions,
            socialPosts: data.socialPosts
          };
        }
        return s;
      }));

    } catch (err) {
      console.error(err);
      setAiError(language === "en" ? "Unable to contact the AI assistant at this moment." : "Kute kusebenta kwekhatsi komsiti we-AI.");
    } finally {
      setAiAnalyzingId(null);
    }
  };

  // Simulate sharing link
  const handleShare = (sermonId: string) => {
    setSharedSermonId(sermonId);
    setTimeout(() => setSharedSermonId(null), 3000);
  };

  // Simulate PDF download of sermon notes
  const handleDownloadNotes = (sermon: Sermon) => {
    const doc = new jsPDF();
    
    // Config
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("FONTEYN EVANGELICAL CHURCH", margin, 20);
    
    doc.setFontSize(12);
    doc.text("SERMON STUDY NOTES", margin, 28);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Title: ${sermon.title}`, margin, 40);
    doc.text(`Speaker: ${sermon.speaker}`, margin, 46);
    doc.text(`Date: ${sermon.date}`, margin, 52);
    doc.text(`Scripture: ${sermon.scripture}`, margin, 58);
    doc.text(`Topic: ${sermon.topic}`, margin, 64);
    
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", margin, 74);
    
    doc.setFont("helvetica", "normal");
    const splitNotes = doc.splitTextToSize(sermon.notes, pageWidth - margin * 2);
    
    let y = 80;
    for (let i = 0; i < splitNotes.length; i++) {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }
      doc.text(splitNotes[i], margin, y);
      y += 6;
    }
    
    y += 10;
    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin;
    }
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(`© ${new Date().getFullYear()} Fonteyn Evangelical Church, Mbabane.`, margin, y);
    
    doc.save(`${sermon.title.replace(/\s+/g, "_")}_Sermon_Notes.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900 tracking-tight">
          {translations.latestSermons[language]}
        </h2>
        <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full mt-3"></div>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 mb-8 flex flex-col gap-4">
        
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder={translations.searchPlaceholder[language]}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-800 transition-all font-sans text-sm"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <select 
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-800 text-sm font-sans"
          >
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic === "All" ? translations.filterAll[language] + " Topics" : topic}</option>
            ))}
          </select>

          <select 
            value={selectedSpeaker}
            onChange={(e) => setSelectedSpeaker(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-800 text-sm font-sans"
          >
            {speakers.map(speaker => (
              <option key={speaker} value={speaker}>{speaker === "All" ? translations.filterAll[language] + " Speakers" : speaker}</option>
            ))}
          </select>

          <select 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-800 text-sm font-sans"
          >
            {years.map(year => (
              <option key={year} value={year}>{year === "All" ? translations.filterAll[language] + " Years" : year}</option>
            ))}
          </select>

          <select 
            value={selectedScripture}
            onChange={(e) => setSelectedScripture(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-800 text-sm font-sans"
          >
            {books.map(book => (
              <option key={book} value={book}>{book === "All" ? translations.filterAll[language] + " Scriptures" : book}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading & Empty State */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-slate-500 font-sans">
            {language === "en" ? "Loading sermon library..." : "Iyalayisha lelibhodi yetishumayelo..."}
          </p>
        </div>
      ) : filteredSermons.length === 0 ? (
        <div className="text-center bg-white rounded-2xl p-12 border border-slate-100 shadow-sm max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-700 font-heading font-bold text-lg mb-1">
            {language === "en" ? "No Sermons Found" : "Kute tishumayelo letitfoliwe"}
          </p>
          <p className="text-slate-500 font-sans text-sm mb-4">
            {language === "en" ? "Try adjusting your search filters or check back later." : "Sicela ulungise tindlela letinye nobe ubuye emveni."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredSermons.map((sermon) => {
            const hasAIResults = sermon.summary || (aiResult && aiResult.sermonId === sermon.id);
            const displaySummary = sermon.summary || (aiResult?.sermonId === sermon.id ? aiResult.summary : null);
            const displayReferences = sermon.bibleReferences || (aiResult?.sermonId === sermon.id ? aiResult.bibleReferences : []);
            const displayQuestions = sermon.discussionQuestions || (aiResult?.sermonId === sermon.id ? aiResult.discussionQuestions : []);
            const displaySocial = sermon.socialPosts || (aiResult?.sermonId === sermon.id ? aiResult.socialPosts : []);

            return (
              <div
                key={sermon.id}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 hover:border-gold-500/20 transition-all flex flex-col xl:flex-row group"
              >
                {/* Sermon Card Info Section */}
                <div className="p-6 sm:p-8 xl:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <span className="bg-primary-100 text-primary-800 font-heading font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full border border-primary-800/10">
                        {sermon.topic}
                      </span>
                      <span className="text-slate-400 font-mono text-xs">{sermon.date}</span>
                    </div>

                    <h3 className="font-heading font-bold text-2xl text-primary-900 group-hover:text-primary-800 transition-colors mb-2">
                      {sermon.title}
                    </h3>
                    <p className="text-gold-600 font-sans text-sm font-semibold tracking-wide mb-4 flex items-center space-x-1.5">
                      <span className="font-heading font-bold">{sermon.speaker}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-normal italic">{sermon.scripture}</span>
                    </p>

                    <p className="text-slate-600 font-sans text-sm leading-relaxed line-clamp-3 hover:line-clamp-none transition-all duration-300 bg-slate-50 rounded-xl p-4 border border-slate-100">
                      {sermon.notes}
                    </p>
                  </div>

                  {/* Sermon Media Controls Panel */}
                  <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-3 items-center justify-between">
                    
                    {/* Media Actions */}
                    <div className="flex flex-wrap gap-2">
                      {sermon.audioUrl && (
                        <button
                          onClick={() => handlePlayAudio(sermon)}
                          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all border ${
                            playingSermonId === sermon.id
                              ? "bg-gold-500 border-gold-500 text-primary-950 animate-pulse"
                              : "bg-primary-800 border-primary-800 text-white hover:bg-primary-700"
                          }`}
                        >
                          {playingSermonId === sermon.id ? (
                            <>
                              <Pause className="h-4 w-4" />
                              <span>{language === "en" ? "Pause" : "Yimisa"}</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 fill-white" />
                              <span>{language === "en" ? "Listen Audio" : "Lalela"}</span>
                            </>
                          )}
                        </button>
                      )}

                      {sermon.videoUrl && (
                        <a
                          href={sermon.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-colors"
                        >
                          <Video className="h-4 w-4 text-slate-500" />
                          <span>{translations.watchOnline[language]}</span>
                        </a>
                      )}

                      {sermon.audioUrl && (
                        <a
                          href={sermon.audioUrl}
                          download
                          className="flex items-center space-x-1 px-3 py-2 text-slate-500 hover:text-primary-800 rounded-xl hover:bg-slate-50 text-xs font-heading font-bold uppercase transition-colors"
                          title={language === "en" ? "Download Audio" : "Dawuniloda Lomsindvo"}
                        >
                          <Download className="h-4 w-4" />
                          <span>MP3</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleDownloadNotes(sermon)}
                        className="flex items-center space-x-1 px-3 py-2 text-slate-500 hover:text-primary-800 rounded-xl hover:bg-slate-50 text-xs font-heading font-bold uppercase transition-colors"
                        title={translations.downloadNotes[language]}
                      >
                        <Download className="h-4 w-4" />
                        <span>PDF</span>
                      </button>
                    </div>

                    {/* Social Share & Assistant Trigger */}
                    <div className="flex items-center gap-2">
                      {/* Social share */}
                      <button
                        onClick={() => handleShare(sermon.id)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-heading font-bold uppercase transition-all ${
                          sharedSermonId === sermon.id
                            ? "bg-emerald-500 text-white border border-emerald-500"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {sharedSermonId === sermon.id ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>{language === "en" ? "Link Copied!" : "Kukopishwe!"}</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="h-4 w-4 text-slate-500" />
                            <span>{translations.shareSermon[language]}</span>
                          </>
                        )}
                      </button>

                      {/* AI Assistant Button */}
                      <button
                        onClick={() => handleAIAnalysis(sermon)}
                        disabled={aiAnalyzingId === sermon.id}
                        className="flex items-center space-x-1.5 bg-gradient-to-r from-primary-900 to-primary-800 hover:from-gold-600 hover:to-gold-500 text-white hover:text-primary-950 px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider border border-primary-700 hover:border-gold-500/20 shadow-md transition-all duration-300 disabled:opacity-50"
                      >
                        <Sparkles className={`h-4 w-4 ${aiAnalyzingId === sermon.id ? "animate-spin" : ""}`} />
                        <span>{aiAnalyzingId === sermon.id ? "AI Analyzing..." : "AI Study Guide"}</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* AI Assistant Results Sidebar (Expanding inside) */}
                <div className={`p-6 sm:p-8 xl:w-1/3 border-t xl:border-t-0 xl:border-l border-slate-100 ${hasAIResults ? "bg-slate-50/70" : "bg-slate-50/20 flex flex-col justify-center items-center text-center text-slate-400"}`}>
                  {aiAnalyzingId === sermon.id ? (
                    <div className="text-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto mb-3"></div>
                      <p className="text-primary-900 font-heading font-bold text-sm">
                        {language === "en" ? "Gemini is synthesizing..." : "Likusito leAI liyalayisha..."}
                      </p>
                      <p className="text-slate-500 font-sans text-xs mt-1 px-4">
                        {language === "en"
                          ? "Generating summary, scriptural cross-references, study questions, and social media posts..."
                          : "Yakha luhlaka lwetinkonzo, nemibuzo..."}
                      </p>
                    </div>
                  ) : hasAIResults ? (
                    <div className="space-y-6 animate-fade-in text-slate-700">
                      <div className="flex items-center space-x-2 text-primary-800">
                        <Sparkles className="h-5 w-5 text-gold-500" />
                        <h4 className="font-heading font-extrabold text-sm uppercase tracking-wider">
                          {translations.aiSermonAssistant[language]}
                        </h4>
                      </div>

                      {/* Summary */}
                      <div>
                        <h5 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wide mb-1">
                          {language === "en" ? "Theological Summary" : "Kuhlungwa Kwekholwe"}
                        </h5>
                        <p className="text-slate-600 font-sans text-xs leading-relaxed">
                          {displaySummary}
                        </p>
                      </div>

                      {/* References */}
                      {displayReferences && displayReferences.length > 0 && (
                        <div>
                          <h5 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wide mb-1.5">
                            {language === "en" ? "Cross References" : "Tekukhomba kwiBhayibheli"}
                          </h5>
                          <div className="flex flex-wrap gap-1.5">
                            {displayReferences.map((ref: string, i: number) => (
                              <span key={i} className="bg-primary-900/10 text-primary-900 font-mono text-[10px] px-2 py-0.5 rounded border border-primary-900/5">
                                {ref}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Discussion Questions */}
                      {displayQuestions && displayQuestions.length > 0 && (
                        <div>
                          <h5 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wide mb-1.5">
                            {language === "en" ? "Small Group Discussion" : "Mibuto Yekucocisana"}
                          </h5>
                          <ul className="space-y-1.5 list-none pl-0">
                            {displayQuestions.map((q: string, i: number) => (
                              <li key={i} className="flex items-start space-x-1.5 text-xs text-slate-600 font-sans">
                                <ChevronRight className="h-3.5 w-3.5 text-gold-500 shrink-0 mt-0.5" />
                                <span>{q}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Social Posts */}
                      {displaySocial && displaySocial.length > 0 && (
                        <div>
                          <h5 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wide mb-1.5">
                            {language === "en" ? "Social Share Drafts" : "Umbhalo wetindzaba tekusita"}
                          </h5>
                          <div className="bg-white border border-slate-200/60 rounded-xl p-3 text-[11px] font-sans text-slate-500 italic max-h-24 overflow-y-auto">
                            {displaySocial[0]}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8">
                      <Sparkles className="h-8 w-8 text-gold-400 mb-2 animate-bounce" />
                      <p className="font-heading font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">
                        {translations.aiSermonAssistant[language]}
                      </p>
                      <p className="text-slate-500 font-sans text-xs max-w-xs mb-4">
                        {language === "en"
                          ? "Unlock a full study guide including structured summaries, cross-references, and small-group study questions."
                          : "Funa imibuto, kanye nekwahlukaniswa kwelivi ngalokushesha."}
                      </p>
                      <button
                        onClick={() => handleAIAnalysis(sermon)}
                        className="bg-primary-100 hover:bg-gold-500 text-primary-900 hover:text-primary-950 font-heading font-bold text-xs px-4 py-2 rounded-xl transition-all uppercase tracking-wider border border-primary-800/10"
                      >
                        {language === "en" ? "Activate Assistant" : "Cala Umsiti"}
                      </button>
                    </div>
                  )}

                  {aiError && aiResult?.sermonId === sermon.id && (
                    <p className="text-red-500 font-sans text-xs mt-2 text-center">{aiError}</p>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
