import React, { useState } from "react";
import { BookOpen, Sparkles, Copy, Share2, Check } from "lucide-react";
import { dailyVerses } from "./BibleData";

interface BibleDailyVerseProps {
  language: "en" | "ss";
}

export default function BibleDailyVerse({ language }: BibleDailyVerseProps) {
  const [dailyVerseIndex, setDailyVerseIndex] = useState(0);
  const [copiedVerse, setCopiedVerse] = useState(false);
  const [sharedVerse, setSharedVerse] = useState(false);

  const handleCopyVerse = (text: string, ref: string) => {
    try {
      navigator.clipboard.writeText(`"${text}" — ${ref}`);
      setCopiedVerse(true);
      setTimeout(() => setCopiedVerse(false), 3000);
    } catch (err) {
      console.error("Failed to copy verse:", err);
    }
  };

  const handleShareVerse = (ref: string) => {
    try {
      navigator.clipboard.writeText(`${window.location.origin}/?tab=prayer_bible&verse=${encodeURIComponent(ref)}`);
      setSharedVerse(true);
      setTimeout(() => setSharedVerse(false), 4000);
    } catch (err) {
      console.error("Failed to share verse:", err);
    }
  };

  const activeVerse = dailyVerses[dailyVerseIndex] || dailyVerses[0];
  
  if (!activeVerse) {
    return (
      <div className="space-y-6 animate-fade-in" id="daily-verse-section">
        <div className="bg-primary-900 text-white rounded-3xl p-8 border border-primary-850 shadow-xl text-center">
          <p className="text-primary-300 font-sans text-sm">No daily verses available at the moment.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 animate-fade-in" id="daily-verse-section">
      {/* Card Container */}
      <div className="bg-primary-900 text-white rounded-3xl p-8 border border-primary-850 shadow-xl relative overflow-hidden text-center">
        <div className="absolute top-4 right-4 text-gold-500/10"><BookOpen className="h-32 w-32" /></div>
        
        <div className="relative z-10">
          <span className="bg-gold-500 text-primary-950 font-heading font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full mb-6 inline-block">
            {language === "en" ? "Daily Bible Verse" : "Livesi Lamuhla laBhayibheli"} — {activeVerse.theme}
          </span>
          
          <blockquote className="font-heading font-extrabold text-xl sm:text-2xl max-w-3xl mx-auto mb-6 tracking-tight leading-relaxed">
            "{activeVerse.text}"
          </blockquote>
          
          <cite className="font-mono text-gold-400 font-bold text-sm not-italic block mb-8">
            — {activeVerse.ref}
          </cite>

          {/* Interactivity tools */}
          <div className="flex flex-wrap justify-center items-center gap-3">
            <button
              onClick={() => {
                setDailyVerseIndex((prev) => (prev - 1 + dailyVerses.length) % dailyVerses.length);
                setCopiedVerse(false);
                setSharedVerse(false);
              }}
              className="bg-primary-800 hover:bg-primary-700 text-white font-heading font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-colors border border-primary-750"
            >
              Previous
            </button>
            
            <button
              onClick={() => handleCopyVerse(activeVerse.text, activeVerse.ref)}
              className="bg-white text-primary-950 hover:bg-slate-50 font-heading font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow flex items-center gap-1.5"
            >
              {copiedVerse ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-primary-800" />}
              <span>{copiedVerse ? "Copied!" : "Copy Verse"}</span>
            </button>

            <button
              onClick={() => handleShareVerse(activeVerse.ref)}
              className="bg-gold-500 text-primary-950 hover:bg-gold-400 font-heading font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow flex items-center gap-1.5"
            >
              <Share2 className="h-3.5 w-3.5 text-primary-950" />
              <span>Share</span>
            </button>

            <button
              onClick={() => {
                setDailyVerseIndex((prev) => (prev + 1) % dailyVerses.length);
                setCopiedVerse(false);
                setSharedVerse(false);
              }}
              className="bg-primary-800 hover:bg-primary-700 text-white font-heading font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-colors border border-primary-750"
            >
              Next Verse
            </button>
          </div>
        </div>
      </div>

      {sharedVerse && (
        <div className="bg-emerald-50 text-emerald-800 text-xs px-4 py-3 rounded-2xl border border-emerald-100 flex items-center gap-2 animate-fade-in max-w-md mx-auto">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Blessing link prepared! Reference copied to clipboard to share with your family circle.</span>
        </div>
      )}

      {/* Devotional Advice */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
        <h4 className="font-heading font-bold text-sm text-primary-950 mb-3 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-gold-500" />
          <span>Sovereign Reflection Thought</span>
        </h4>
        <p className="text-slate-600 text-xs leading-relaxed">
          How does this scripture anchor your soul today? Take 5 minutes in silent gratitude, repeating the verse in your heart. Remember that God's covenantal promises are active and steadfast, and the hills of Fonteyn are under His watchful care.
        </p>
      </div>
    </div>
  );
}
