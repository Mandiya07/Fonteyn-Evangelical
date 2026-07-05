import { safeStorage } from "../lib/storage";
import React, { useState, useEffect } from "react";
import { PenTool, Trash2, HeartHandshake, Check } from "lucide-react";
import { devotionalList } from "./BibleData";

interface BibleDevotionalsProps {
  language: "en" | "ss";
}

interface JournalEntry {
  id: string;
  devTitle: string;
  entry: string;
  date: string;
}

export default function BibleDevotionals({ language }: BibleDevotionalsProps) {
  const [selectedDevotionalId, setSelectedDevotionalId] = useState("dev-1");
  const [journalInput, setJournalInput] = useState("");
  const [savedJournalEntries, setSavedJournalEntries] = useState<JournalEntry[]>([]);
  const [journalSaveSuccess, setJournalSaveSuccess] = useState(false);

  useEffect(() => {
    const saved = safeStorage.getItem("fec_bible_journals");
    if (saved) {
      try {
        setSavedJournalEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading journals:", e);
      }
    }
  }, []);

  const handleSaveJournal = (e: React.FormEvent, devTitle: string) => {
    e.preventDefault();
    if (!journalInput.trim()) return;

    const newEntry: JournalEntry = {
      id: "journal-" + Date.now(),
      devTitle,
      entry: journalInput,
      date: new Date().toLocaleDateString(language === "en" ? "en-US" : "ss-SZ", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };

    const updated = [newEntry, ...savedJournalEntries];
    setSavedJournalEntries(updated);
    safeStorage.setItem("fec_bible_journals", JSON.stringify(updated));
    setJournalInput("");
    setJournalSaveSuccess(true);
    setTimeout(() => setJournalSaveSuccess(false), 3000);
  };

  const handleDeleteJournal = (id: string) => {
    const updated = savedJournalEntries.filter((entry) => entry.id !== id);
    setSavedJournalEntries(updated);
    safeStorage.setItem("fec_bible_journals", JSON.stringify(updated));
  };

  const activeDev = devotionalList.find((d) => d.id === selectedDevotionalId) || devotionalList[0];
  
  if (!activeDev) {
    return (
      <div className="space-y-6 animate-fade-in text-center p-12 bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-sans text-sm">No devotionals available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="devotionals-section">
      {/* Sidebar List */}
      <div className="lg:col-span-4 space-y-3">
        <h4 className="font-heading font-bold text-xs text-slate-400 uppercase tracking-widest px-1">
          {language === "en" ? "Daily Devotionals" : "Sikhumbuto Lesikhulu"}
        </h4>
        <div className="space-y-2.5">
          {devotionalList.map((dev) => (
            <button
              key={dev.id}
              onClick={() => {
                setSelectedDevotionalId(dev.id);
                setJournalInput("");
              }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedDevotionalId === dev.id
                  ? "bg-white border-primary-800/20 shadow-md ring-1 ring-primary-800/10"
                  : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-gold-600 block uppercase tracking-wider mb-1">
                {dev.scripture}
              </span>
              <h5 className="font-heading font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                {dev.title}
              </h5>
            </button>
          ))}
        </div>

        {/* Saved Journals block */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-3 mt-6">
          <h5 className="font-heading font-bold text-xs text-primary-950 flex items-center gap-1.5 uppercase tracking-wide">
            <PenTool className="h-3.5 w-3.5 text-primary-800" />
            <span>My Journal History</span>
          </h5>
          {savedJournalEntries.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">
              No saved reflections yet. Write your thoughts on the active devotional to save them securely.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[250px] overflow-y-auto scrollbar-thin pr-1">
              {savedJournalEntries.map((entry) => (
                <div key={entry.id} className="bg-white p-3 rounded-xl border border-slate-150 relative group">
                  <button
                    onClick={() => handleDeleteJournal(entry.id)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <span className="text-[8px] font-mono text-slate-400 block mb-0.5">{entry.date}</span>
                  <span className="text-[9px] font-bold text-slate-700 block truncate pr-4">{entry.devTitle}</span>
                  <p className="text-[10px] text-slate-500 font-sans mt-1 line-clamp-3 leading-relaxed">
                    {entry.entry}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Devotional Reader and Form */}
      <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="bg-primary-900/10 text-primary-900 font-heading font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded mb-2 inline-block">
            {language === "en" ? "Daily Devotional Meditation" : "Kuzindla Kwalamuhla"}
          </span>
          <h3 className="font-heading font-bold text-lg sm:text-xl text-primary-950">{activeDev.title}</h3>
          <p className="text-gold-600 font-mono text-xs font-bold mt-1">📖 Scripture Anchor: {activeDev.scripture}</p>
        </div>

        {/* Passage citation box */}
        <div className="bg-slate-50 border-l-4 border-gold-500 rounded-r-2xl p-4 italic font-sans text-xs text-slate-600 leading-relaxed">
          "{activeDev.passage}"
        </div>

        {/* Content */}
        <p className="text-slate-600 font-sans text-sm leading-relaxed whitespace-pre-line">
          {activeDev.content}
        </p>

        {/* Interactive Reflection / Journal Form */}
        <div className="bg-primary-50/50 rounded-2xl p-5 border border-primary-100/50 space-y-4">
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="h-4.5 w-4.5 text-primary-800" />
            <h4 className="font-heading font-bold text-xs text-primary-950 uppercase tracking-wider">Interactive Study Journal</h4>
          </div>
          <p className="text-slate-600 font-sans text-xs italic leading-relaxed">
            "{activeDev.reflection}"
          </p>

          <form onSubmit={(e) => handleSaveJournal(e, activeDev.title)} className="space-y-3">
            <textarea
              rows={3}
              placeholder="Type your reflection, personal insights, or a prayer here..."
              value={journalInput}
              onChange={(e) => setJournalInput(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-800 font-sans"
              required
            ></textarea>
            
            <div className="flex justify-between items-center">
              {journalSaveSuccess ? (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 animate-fade-in">
                  <Check className="h-3 w-3" /> Saved to My Journal History!
                </span>
              ) : (
                <span></span>
              )}
              <button
                type="submit"
                className="bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Save Entry
              </button>
            </div>
          </form>
        </div>

        {/* Prayer Starter */}
        <div className="bg-slate-50/75 rounded-2xl p-4 border border-slate-100">
          <span className="font-heading font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Guided Prayer Starter</span>
          <p className="text-slate-600 font-sans text-xs italic leading-relaxed">
            "{activeDev.prayerStarter}"
          </p>
        </div>
      </div>
    </div>
  );
}
