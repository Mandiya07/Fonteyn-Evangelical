import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

export default function DailyVerse({ language }: { language: "en" | "ss" }) {
  const [verse, setVerse] = useState<{ text: string; reference: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/verse")
      .then((res) => res.json())
      .then((data) => {
        setVerse(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch daily verse", err);
        setLoading(false);
      });
  }, []);

  if (loading || !verse) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 my-8 mx-auto max-w-2xl animate-fade-in">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="h-5 w-5 text-gold-500" />
        <h3 className="font-heading font-bold text-primary-950">
          {language === "en" ? "Daily Verse" : "Livesi Lansuku"}
        </h3>
      </div>
      <p className="font-sans text-slate-700 italic leading-relaxed mb-2">"{verse.text}"</p>
      <p className="font-mono text-xs text-primary-800 font-bold">— {verse.reference}</p>
    </div>
  );
}
