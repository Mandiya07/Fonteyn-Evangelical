import { safeStorage } from "../lib/storage";
import React, { useState, useEffect } from "react";
import { Search, Bookmark, Trash2, BookOpen } from "lucide-react";
import { miniBible, preseededScriptures } from "./BibleData";

interface BibleBrowseSearchProps {
  language: "en" | "ss";
}

export default function BibleBrowseSearch({ language }: BibleBrowseSearchProps) {
  const [selectedBookChapter, setSelectedBookChapter] = useState<string>("Psalm 23");
  const [savedBookmarks, setSavedBookmarks] = useState<string[]>([]);
  const [bibleQuery, setBibleQuery] = useState("");
  const [bibleResults, setBibleResults] = useState<Array<{ ref: string; text: string }>>([]);

  useEffect(() => {
    const saved = safeStorage.getItem("fec_bible_bookmarks");
    if (saved) {
      try {
        setSavedBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading bookmarks:", e);
      }
    }
  }, []);

  const toggleBookmark = (verseRef: string) => {
    const updated = savedBookmarks.includes(verseRef)
      ? savedBookmarks.filter((ref) => ref !== verseRef)
      : [...savedBookmarks, verseRef];
    setSavedBookmarks(updated);
    safeStorage.setItem("fec_bible_bookmarks", JSON.stringify(updated));
  };

  const handleBibleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bibleQuery.trim()) {
      setBibleResults([]);
      return;
    }
    const query = bibleQuery.toLowerCase();
    const results = preseededScriptures.filter(
      (scripture) =>
        scripture.ref.toLowerCase().includes(query) ||
        scripture.text.toLowerCase().includes(query) ||
        scripture.keywords.some((kw) => kw.includes(query))
    );
    setBibleResults(results);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="browse-search-section">
      {/* Left Column: Search & Bookmarks */}
      <div className="lg:col-span-5 space-y-6">
        {/* Search box */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md space-y-4">
          <h4 className="font-heading font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Search className="h-4 w-4 text-gold-500" />
            <span>{language === "en" ? "Scripture Search" : "Kufuna Umbhalo"}</span>
          </h4>
          <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
            Enter keywords like <strong className="font-mono text-slate-700">trust</strong>,{" "}
            <strong className="font-mono text-slate-700">peace</strong>,{" "}
            <strong className="font-mono text-slate-700">love</strong>,{" "}
            <strong className="font-mono text-slate-700">courage</strong>,{" "}
            <strong className="font-mono text-slate-700">strength</strong>, or{" "}
            <strong className="font-mono text-slate-700">grace</strong>.
          </p>

          <form onSubmit={handleBibleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search keywords..."
              value={bibleQuery}
              onChange={(e) => setBibleQuery(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-800 font-sans"
            />
            <button
              type="submit"
              className="bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors shadow"
            >
              Search
            </button>
          </form>

          {/* Results List */}
          {bibleResults.length > 0 ? (
            <div className="space-y-2.5 max-h-[250px] overflow-y-auto scrollbar-thin pr-1 mt-2">
              {bibleResults.map((res, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-150 relative">
                  <p className="font-heading font-bold text-xs text-primary-900 mb-0.5">{res.ref}</p>
                  <p className="text-slate-600 font-sans text-[11px] italic leading-relaxed">"{res.text}"</p>
                </div>
              ))}
            </div>
          ) : bibleQuery ? (
            <p className="text-[11px] text-slate-400 italic text-center py-2">
              No matching search results found. Try other scripture keywords.
            </p>
          ) : null}
        </div>

        {/* Bookmarks Manager */}
        <div className="bg-slate-50/80 rounded-3xl p-5 border border-slate-100 space-y-4">
          <h4 className="font-heading font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Bookmark className="h-4 w-4 text-gold-500 fill-gold-500" />
            <span>My Bookmarked Verses</span>
          </h4>
          {savedBookmarks.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">
              No bookmarks saved yet. Click the bookmark icon next to any verse in the reader to save your favorite
              anchor scriptures.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
              {savedBookmarks.map((ref, idx) => {
                let foundText = "";
                const pre = preseededScriptures.find((p) => p.ref === ref);
                if (pre) {
                  foundText = pre.text;
                } else {
                  Object.entries(miniBible).forEach(([chapter, verses]) => {
                    verses.forEach((v) => {
                      const vRef = `${chapter}:${v.v}`;
                      if (vRef === ref) {
                        foundText = v.t;
                      }
                    });
                  });
                }

                return (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-150 relative group">
                    <button
                      onClick={() => toggleBookmark(ref)}
                      className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <span className="text-[10px] font-heading font-extrabold text-primary-950 block mb-0.5">
                      {ref}
                    </span>
                    {foundText && (
                      <p className="text-[10px] text-slate-500 font-sans italic line-clamp-2 leading-relaxed">
                        "{foundText}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Premium Scripture Reader */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
        {/* Book & Chapter selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="bg-primary-900/10 text-primary-900 font-heading font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded block mb-1">
              Digital Bible Sanctuary
            </span>
            <h3 className="font-heading font-bold text-base sm:text-lg text-primary-950 flex items-center gap-1.5">
              <BookOpen className="h-4.5 w-4.5 text-gold-500" />
              <span>Scripture Browse Reader</span>
            </h3>
          </div>

          <select
            value={selectedBookChapter}
            onChange={(e) => setSelectedBookChapter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-700 font-heading font-bold"
          >
            {Object.keys(miniBible).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter verses reading list */}
        <div className="space-y-4 max-h-[450px] overflow-y-auto scrollbar-thin pr-2">
          {(() => {
            const verses = miniBible[selectedBookChapter] || [];
            return verses.map((verse) => {
              const verseRef = `${selectedBookChapter}:${verse.v}`;
              const isBookmarked = savedBookmarks.includes(verseRef);

              return (
                <div
                  key={verse.v}
                  className={`flex items-start gap-3.5 p-2 rounded-lg transition-colors group/verse ${
                    isBookmarked ? "bg-gold-500/5 border border-gold-500/10" : ""
                  }`}
                >
                  <sup className="text-gold-600 font-mono font-bold text-[11px] mt-1 shrink-0 w-4 text-right">
                    {verse.v}
                  </sup>

                  <p className="flex-1 text-slate-700 font-serif text-sm leading-relaxed">{verse.t}</p>

                  <button
                    onClick={() => toggleBookmark(verseRef)}
                    className={`p-1.5 rounded transition-colors shrink-0 ${
                      isBookmarked
                        ? "text-gold-500 hover:text-gold-600"
                        : "text-slate-300 hover:text-gold-400 opacity-0 group-hover/verse:opacity-100 focus:opacity-100"
                    }`}
                    title={isBookmarked ? "Remove Bookmark" : "Bookmark Verse"}
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-gold-500" : ""}`} />
                  </button>
                </div>
              );
            });
          })()}
        </div>

        <div className="text-[10px] text-slate-400 font-sans italic text-center pt-2 border-t border-slate-50">
          Select a book chapter above to browse and bookmark scriptures directly in the church applet.
        </div>
      </div>
    </div>
  );
}
