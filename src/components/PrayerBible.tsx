import React, { useState, useEffect } from "react";
import { 
  MessageSquare, Calendar, BookOpen, Clock, Check, Shield, Search, Heart, 
  Sparkles, BookMarked, User, ChevronRight, ChevronLeft, Copy, Share2, PenTool, 
  Bookmark, Compass, HeartHandshake, Square, CheckSquare, Trash2, 
  ArrowRight, RotateCw 
} from "lucide-react";
import { PrayerRequest, CounselingBooking } from "../types";
import { translations } from "../lib/translations";
import { dailyVerses, preseededScriptures, devotionalList, readingPlans, prayerGuides, miniBible } from "./BibleData";
import BibleDailyVerse from "./BibleDailyVerse";
import BibleDevotionals from "./BibleDevotionals";
import BibleReadingPlans from "./BibleReadingPlans";
import BiblePrayerGuides from "./BiblePrayerGuides";
import BibleBrowseSearch from "./BibleBrowseSearch";

interface PrayerBibleProps {
  language: "en" | "ss";
}

export default function PrayerBible({ language }: PrayerBibleProps) {
  const [activeSegment, setActiveSegment] = useState<"prayer" | "counseling" | "pastor-contact" | "bible">("prayer");
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loadingPrayers, setLoadingPrayers] = useState(true);

  // Pastor contact states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactPastor, setContactPastor] = useState("Rev. L. S. Mnisi");
  const [contactSuccess, setContactSuccess] = useState(false);

  // Prayer form states
  const [prayerText, setPrayerText] = useState("");
  const [prayerName, setPrayerName] = useState("");
  const [prayerEmail, setPrayerEmail] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [prayerSuccess, setPrayerSuccess] = useState(false);

  // Counseling Booking form states
  const [bookName, setBookName] = useState("");
  const [bookEmail, setBookEmail] = useState("");
  const [bookPhone, setBookPhone] = useState("");
  const [bookDateTime, setBookDateTime] = useState("");
  const [bookType, setBookType] = useState<"Counseling" | "Home Visit" | "Hospital Visit">("Counseling");
  const [bookReason, setBookReason] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Bible states
  const [bibleSubTab, setBibleSubTab] = useState<"verse" | "plans" | "devotionals" | "guides" | "browse">("verse");
  const [bibleQuery, setBibleQuery] = useState("");
  const [bibleResults, setBibleResults] = useState<Array<{ ref: string; text: string }>>([]);

  const preseededScriptures: any[] = [];

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    try {
      setLoadingPrayers(true);
      const res = await fetch("/api/prayer-requests");
      if (res.ok) {
        const data = await res.json();
        // Filter out private requests for public display
        setPrayers(data.filter((p: PrayerRequest) => !p.isPrivate));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrayers(false);
    }
  };

  const handleAddPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText) return;

    try {
      const res = await fetch("/api/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prayerName,
          email: prayerEmail,
          isPrivate,
          isAnonymous,
          requestText: prayerText
        })
      });

      if (res.ok) {
        setPrayerSuccess(true);
        setPrayerText("");
        setPrayerName("");
        setPrayerEmail("");
        setIsPrivate(false);
        setIsAnonymous(false);
        fetchPrayers();
        setTimeout(() => setPrayerSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSupportPrayer = async (id: string) => {
    try {
      const res = await fetch(`/api/prayer-requests/${id}/pray`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPrayers(prev => prev.map(p => p.id === id ? { ...p, answersCount: data.count } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookName || !bookEmail || !bookPhone || !bookDateTime || !bookReason) return;

    try {
      const res = await fetch("/api/counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookName,
          email: bookEmail,
          phone: bookPhone,
          dateTime: bookDateTime,
          type: bookType,
          reason: bookReason
        })
      });

      if (res.ok) {
        setBookingSuccess(true);
        setBookName("");
        setBookEmail("");
        setBookPhone("");
        setBookDateTime("");
        setBookReason("");
        setTimeout(() => setBookingSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePastorContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage || !contactPastor) return;

    try {
      const res = await fetch("/api/pastor-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          message: contactMessage,
          pastor: contactPastor
        })
      });

      if (res.ok) {
        setContactSuccess(true);
        setContactName("");
        setContactEmail("");
        setContactPhone("");
        setContactMessage("");
        setTimeout(() => setContactSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBibleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bibleQuery.trim()) {
      setBibleResults([]);
      return;
    }
    const query = bibleQuery.toLowerCase();
    const results = preseededScriptures.filter(scripture =>
      scripture.ref.toLowerCase().includes(query) ||
      scripture.text.toLowerCase().includes(query) ||
      scripture.keywords.some(kw => kw.includes(query))
    );
    setBibleResults(results);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Tab select bar */}
      <div className="flex justify-center mb-10">
        <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-md inline-flex">
          <button
            onClick={() => setActiveSegment("prayer")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-heading font-extrabold uppercase tracking-wider transition-all ${
              activeSegment === "prayer"
                ? "bg-primary-800 text-white shadow-md border-b-2 border-gold-500"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
            <span>{translations.prayerRequestTitle[language]}</span>
          </button>
          
          <button
            onClick={() => setActiveSegment("counseling")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-heading font-extrabold uppercase tracking-wider transition-all ${
              activeSegment === "counseling"
                ? "bg-primary-800 text-white shadow-md border-b-2 border-gold-500"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Counseling & Visit</span>
          </button>

          <button
            onClick={() => setActiveSegment("pastor-contact")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-heading font-extrabold uppercase tracking-wider transition-all ${
              activeSegment === "pastor-contact"
                ? "bg-primary-800 text-white shadow-md border-b-2 border-gold-500"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Contact Pastors</span>
          </button>

          <button
            onClick={() => setActiveSegment("bible")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-heading font-extrabold uppercase tracking-wider transition-all ${
              activeSegment === "bible"
                ? "bg-primary-800 text-white shadow-md border-b-2 border-gold-500"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Bible Resources</span>
          </button>
        </div>
      </div>

      {activeSegment === "prayer" ? (
        /* PRAYER SECTION */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          
          {/* Left Column: Form to submit prayer */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
            <div className="flex items-center space-x-2 text-rose-600 mb-4">
              <Heart className="h-5 w-5 fill-rose-500 animate-pulse" />
              <h3 className="font-heading font-bold uppercase tracking-wider text-xs">
                {translations.prayerRequestTitle[language]}
              </h3>
            </div>

            <p className="text-slate-600 font-sans text-sm mb-6 leading-relaxed">
              {language === "en"
                ? "Submit your burdens, worries, or praises. Our dedicated elders, intercessors, and pastoral staff stand ready to cover you in faithful prayer daily."
                : "Thumela imikhuleko yakho, izinkathazo zakho, nobe ukubonga. Abadala bethu bakhonza ekukhulekeleni imihla nemihla."}
            </p>

            {prayerSuccess ? (
              <div className="text-center py-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-700 font-sans text-sm flex flex-col items-center justify-center space-y-1">
                <Check className="h-8 w-8 mb-1" />
                <span className="font-bold uppercase tracking-wider">{language === "en" ? "Prayer Submitted Successfully!" : "Sicelo Sethunyelwe!"}</span>
                <span className="text-slate-500 text-xs px-6 font-normal">We have dispatched this to our pastoral care team. God bless you!</span>
              </div>
            ) : (
              <form onSubmit={handleAddPrayer} className="space-y-4">
                
                {/* Textarea */}
                <div>
                  <label className="block text-slate-700 font-heading text-xs font-bold uppercase tracking-wider mb-1.5">Prayer Details *</label>
                  <textarea
                    rows={4}
                    placeholder={translations.prayerPlaceholder[language]}
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 transition-all font-sans"
                    required
                  ></textarea>
                </div>

                {/* Identity toggles */}
                <div className="flex items-center space-x-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) setPrayerName("");
                    }}
                    className="h-4 w-4 text-primary-800 focus:ring-primary-800 rounded"
                  />
                  <label htmlFor="isAnonymous" className="text-slate-700 font-sans text-xs select-none">
                    {translations.prayerAnonymous[language]}
                  </label>
                </div>

                {!isAnonymous && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Your Name</label>
                      <input
                        type="text"
                        placeholder="John"
                        value={prayerName}
                        onChange={(e) => setPrayerName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Your Email</label>
                      <input
                        type="email"
                        placeholder="john@test.com"
                        value={prayerEmail}
                        onChange={(e) => setPrayerEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800"
                      />
                    </div>
                  </div>
                )}

                {/* Confidentiality Toggle */}
                <div className="bg-primary-100/50 rounded-2xl p-4 border border-primary-800/10 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary-800" />
                    <span className="font-heading font-bold text-xs text-primary-950 uppercase tracking-wider">Confidentiality level</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-xs text-slate-700 font-sans cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        checked={!isPrivate}
                        onChange={() => setIsPrivate(false)}
                        className="h-3.5 w-3.5 text-primary-800 focus:ring-primary-800"
                      />
                      <span>{translations.prayerPublic[language]}</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs text-slate-700 font-sans cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        checked={isPrivate}
                        onChange={() => setIsPrivate(true)}
                        className="h-3.5 w-3.5 text-primary-800 focus:ring-primary-800"
                      />
                      <span>{translations.prayerPrivate[language]}</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors shadow-md"
                >
                  {translations.submitRequest[language]}
                </button>

              </form>
            )}
          </div>

          {/* Right Column: Public Prayer Board */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
            <h3 className="font-heading font-bold text-lg text-primary-950 mb-4 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <BookMarked className="h-5 w-5 text-gold-500" />
              <span>Public Prayer Altar Board</span>
            </h3>

            {loadingPrayers ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800 mx-auto mb-2"></div>
                <p className="text-slate-500 font-sans text-xs">Loading prayer board...</p>
              </div>
            ) : prayers.length === 0 ? (
              <p className="text-slate-400 font-sans text-xs text-center py-10">No public prayer requests posted. Be the first to share.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
                {prayers.map((pr) => (
                  <div
                    key={pr.id}
                    className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <p className="font-heading font-bold text-xs text-primary-950 flex items-center space-x-1.5 mb-1.5">
                        <span className="bg-gold-500/10 text-gold-600 px-2 py-0.5 rounded text-[10px] uppercase font-semibold">
                          {pr.isAnonymous ? "Anonymous" : pr.name}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{pr.date}</span>
                      </p>
                      <p className="text-slate-600 font-sans text-xs leading-relaxed">{pr.requestText}</p>
                    </div>

                    <button
                      onClick={() => handleSupportPrayer(pr.id)}
                      className="bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 px-3.5 py-2 rounded-xl text-[11px] font-heading font-bold flex items-center space-x-1.5 transition-all shadow-sm shrink-0"
                    >
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      <span>Pray ({pr.answersCount})</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : activeSegment === "counseling" ? (
        /* COUNSELING BOOKING SECTION */
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 animate-fade-in">
          <div className="flex items-center space-x-2 text-primary-800 mb-4 pb-2 border-b border-slate-100">
            <Calendar className="h-5 w-5" />
            <h3 className="font-heading font-bold text-lg text-primary-950">Book Counseling & Visits</h3>
          </div>

          <p className="text-slate-600 font-sans text-sm mb-6 leading-relaxed">
            Need spiritual counseling, marital guidance, a home visitation, or hospital visitation for an elder or loved one? Schedule a direct appointment with Rev. L. S. Mnisi or our elders.
          </p>

          {bookingSuccess ? (
            <div className="text-center py-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-700 font-sans text-sm flex flex-col items-center justify-center space-y-1">
              <Check className="h-8 w-8 mb-1" />
              <span className="font-bold uppercase tracking-wider">Appointment Request Sent!</span>
              <span className="text-slate-500 text-xs px-6 font-normal">We have saved your booking. Our pastoral coordinator will call or SMS you shortly to confirm the exact location and hour.</span>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              
              {/* Type select */}
              <div>
                <label className="block text-slate-700 font-heading text-xs font-bold uppercase tracking-wider mb-1.5">Request Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Counseling", "Home Visit", "Hospital Visit"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBookType(type)}
                      className={`py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                        bookType === type
                          ? "bg-primary-800 border-primary-800 text-white shadow-md"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Name and Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    placeholder="Sipho Maseko"
                    value={bookName}
                    onChange={(e) => setBookName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Your Email *</label>
                  <input
                    type="email"
                    placeholder="sipho@gmail.com"
                    value={bookEmail}
                    onChange={(e) => setBookEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800"
                    required
                  />
                </div>
              </div>

              {/* Grid Phone and DateTime */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+268 7604 1234"
                    value={bookPhone}
                    onChange={(e) => setBookPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Preferred Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={bookDateTime}
                    onChange={(e) => setBookDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Details field */}
              <div>
                <label className="block text-slate-700 font-heading text-xs font-bold uppercase tracking-wider mb-1.5">Reason / Message *</label>
                <textarea
                  rows={3}
                  placeholder="Tell us briefly how we can serve, pray, or counsel you..."
                  value={bookReason}
                  onChange={(e) => setBookReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 font-sans"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors shadow-md"
              >
                Submit Booking Request
              </button>

            </form>
          )}
        </div>
      ) : activeSegment === "pastor-contact" ? (
        /* PASTOR CONTACT SECTION */
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 animate-fade-in">
          <div className="flex items-center space-x-2 text-primary-800 mb-4 pb-2 border-b border-slate-100">
            <User className="h-5 w-5" />
            <h3 className="font-heading font-bold text-lg text-primary-950">Contact Our Pastors</h3>
          </div>

          <p className="text-slate-600 font-sans text-sm mb-6 leading-relaxed">
            Have a personal question, need spiritual guidance, or want to share a testimony? Send a direct, confidential message to one of our pastors.
          </p>

          {contactSuccess ? (
            <div className="text-center py-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-700 font-sans text-sm flex flex-col items-center justify-center space-y-1">
              <Check className="h-8 w-8 mb-1" />
              <span className="font-bold uppercase tracking-wider">Message Sent!</span>
              <span className="text-slate-500 text-xs px-6 font-normal">Thank you for reaching out. We will get back to you shortly.</span>
            </div>
          ) : (
            <form onSubmit={handlePastorContact} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Select Pastor *</label>
                <select
                  value={contactPastor}
                  onChange={(e) => setContactPastor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800"
                >
                  <option value="Rev. L. S. Mnisi">Rev. L. S. Mnisi</option>
                  <option value="Associate Pastor Lindifa Nxumalo">Associate Pastor Lindifa Nxumalo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Your Email *</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-heading text-xs font-bold uppercase tracking-wider mb-1.5">Message *</label>
                <textarea
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 font-sans"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors shadow-md"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      ) : (
        /* BIBLE RESOURCES SECTION */
        <div className="space-y-8 animate-fade-in text-slate-700">
          
          {/* Sub-Tab Navigation Bar */}
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 grid grid-cols-2 sm:grid-cols-5 gap-1 shadow-inner">
            <button
              onClick={() => setBibleSubTab("verse")}
              className={`px-3 py-2.5 rounded-xl text-xs font-heading font-extrabold uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                bibleSubTab === "verse"
                  ? "bg-white text-primary-950 shadow-md border border-slate-200/40"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="h-4 w-4 text-gold-500 shrink-0" />
              <span>Daily Verse</span>
            </button>
            <button
              onClick={() => setBibleSubTab("devotionals")}
              className={`px-3 py-2.5 rounded-xl text-xs font-heading font-extrabold uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                bibleSubTab === "devotionals"
                  ? "bg-white text-primary-950 shadow-md border border-slate-200/40"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <PenTool className="h-4 w-4 text-primary-800 shrink-0" />
              <span>Devotionals</span>
            </button>
            <button
              onClick={() => setBibleSubTab("plans")}
              className={`px-3 py-2.5 rounded-xl text-xs font-heading font-extrabold uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                bibleSubTab === "plans"
                  ? "bg-white text-primary-950 shadow-md border border-slate-200/40"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <BookOpen className="h-4 w-4 text-primary-800 shrink-0" />
              <span>Reading Plans</span>
            </button>
            <button
              onClick={() => setBibleSubTab("guides")}
              className={`px-3 py-2.5 rounded-xl text-xs font-heading font-extrabold uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                bibleSubTab === "guides"
                  ? "bg-white text-primary-950 shadow-md border border-slate-200/40"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Compass className="h-4 w-4 text-primary-800 shrink-0" />
              <span>Prayer Guides</span>
            </button>
            <button
              onClick={() => setBibleSubTab("browse")}
              className={`px-3 py-2.5 rounded-xl text-xs font-heading font-extrabold uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 col-span-2 sm:col-span-1 ${
                bibleSubTab === "browse"
                  ? "bg-white text-primary-950 shadow-md border border-slate-200/40"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Search className="h-4 w-4 text-primary-800 shrink-0" />
              <span>Lookup & Search</span>
            </button>
          </div>

          {/* Active Sub-Tab Viewport */}
          <div className="mt-6">
            {bibleSubTab === "verse" && <BibleDailyVerse language={language} />}
            {bibleSubTab === "devotionals" && <BibleDevotionals language={language} />}
            {bibleSubTab === "plans" && <BibleReadingPlans language={language} />}
            {bibleSubTab === "guides" && <BiblePrayerGuides language={language} />}
            {bibleSubTab === "browse" && <BibleBrowseSearch language={language} />}
          </div>

        </div>
      )}

    </div>
  );
}
