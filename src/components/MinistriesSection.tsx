import React, { useState, useEffect } from "react";
import { Users, Mail, Clock, Check, AlertTriangle, ArrowRight, User, Phone, MapPin, Calendar } from "lucide-react";
import { Ministry } from "../types";
import { translations } from "../lib/translations";

interface MinistriesProps {
  language: "en" | "ss";
}

export default function MinistriesSection({ language }: MinistriesProps) {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  const [loading, setLoading] = useState(true);

  // Join form states
  const [joinName, setJoinName] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ministries");
      if (res.ok) {
        const data = await res.json();
        setMinistries(data);
        if (data.length > 0) {
          setSelectedMinistry(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load ministries", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMinistry) return;
    if (!joinName || !joinEmail) {
      setJoinError(language === "en" ? "Name and email are required." : "Ligama ne-imeyili kuyadzingeka.");
      return;
    }

    try {
      setIsJoining(true);
      setJoinError(null);
      setJoinSuccess(null);
      const res = await fetch(`/api/ministries/${selectedMinistry.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: joinName, email: joinEmail, phone: joinPhone })
      });

      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || "Failed to join ministry.");
      } else {
        setJoinSuccess(language === "en" ? `Thank you, ${joinName}! We will contact you soon.` : `Ngiyabonga, ${joinName}! Sitokutsintsa madvutane.`);
        setJoinName("");
        setJoinEmail("");
        setJoinPhone("");
      }
    } catch (err) {
      setJoinError("Server error. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="ministries">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900 tracking-tight">
          {language === "en" ? "Our Ministries" : "Tisebenti Letingcwele"}
        </h2>
        <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full mt-3 mb-4"></div>
        <p className="text-slate-500 font-sans text-sm">
          {language === "en" ? "Find a place to serve, grow, and connect with our church community." : "Tfola indzawo yekukhonta nekukhula neliBandla."}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-slate-500 font-sans">Loading ministries...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Ministry List */}
          <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-heading font-bold text-xl text-primary-900 mb-4 flex items-center space-x-2">
              <Users className="h-5 w-5 text-gold-500" />
              <span>{language === "en" ? "Ministries" : "Tisebenti"}</span>
            </h3>

            <div className="space-y-3">
              {ministries.map(ministry => (
                <button
                  key={ministry.id}
                  onClick={() => {
                    setSelectedMinistry(ministry);
                    setJoinError(null);
                    setJoinSuccess(null);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedMinistry?.id === ministry.id
                      ? "bg-primary-900 border-primary-900 text-white shadow-md transform scale-[1.02]"
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200 text-slate-700"
                  }`}
                >
                  <h4 className="font-heading font-bold text-sm sm:text-base">{ministry.name}</h4>
                  <p className={`text-xs mt-1 line-clamp-2 ${selectedMinistry?.id === ministry.id ? "text-primary-100" : "text-slate-500"}`}>
                    {ministry.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Ministry Details */}
          <div className="lg:col-span-8">
            {selectedMinistry ? (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in relative z-10">
                {/* Hero / Gallery Header */}
                <div className="h-64 sm:h-80 relative overflow-hidden group">
                  <img
                    src={selectedMinistry.gallery[0] || "https://images.unsplash.com/photo-1511180590220-bb06972294ba?auto=format&fit=crop&q=80&w=1200"}
                    alt={selectedMinistry.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/40 to-transparent"></div>
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mb-2">{selectedMinistry.name}</h3>
                    <p className="text-primary-100 font-sans text-sm sm:text-base max-w-2xl leading-relaxed">
                      {selectedMinistry.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left info column */}
                  <div className="space-y-8">
                    
                    {/* Leader Profile */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <img 
                        src={selectedMinistry.leader.photo} 
                        alt={selectedMinistry.leader.name}
                        loading="lazy"
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm shrink-0"
                      />
                      <div className="text-center sm:text-left">
                        <h4 className="font-heading font-bold text-lg text-primary-950">{selectedMinistry.leader.name}</h4>
                        <p className="text-gold-600 font-heading font-bold text-[10px] uppercase tracking-wider mb-2">{selectedMinistry.leader.role}</p>
                        <p className="text-slate-500 font-sans text-xs leading-relaxed mb-3">{selectedMinistry.leader.bio}</p>
                        <a href={`mailto:${selectedMinistry.leader.contact}`} className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary-800 hover:text-primary-600 transition-colors">
                          <Mail className="h-3.5 w-3.5" />
                          <span>Contact Leader</span>
                        </a>
                      </div>
                    </div>

                    {/* Schedule & Activities */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4">
                        <div className="flex items-center space-x-2 text-primary-900 mb-2">
                          <Clock className="h-4.5 w-4.5 text-gold-500" />
                          <h4 className="font-heading font-bold text-sm uppercase tracking-wider">Schedule</h4>
                        </div>
                        <p className="text-slate-600 font-sans text-sm">{selectedMinistry.schedule}</p>
                      </div>

                      <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4">
                        <div className="flex items-center space-x-2 text-primary-900 mb-2">
                          <Calendar className="h-4.5 w-4.5 text-gold-500" />
                          <h4 className="font-heading font-bold text-sm uppercase tracking-wider">Activities</h4>
                        </div>
                        <ul className="text-slate-600 font-sans text-sm space-y-1">
                          {selectedMinistry.activities.map((activity, idx) => (
                            <li key={idx} className="flex items-start space-x-1.5">
                              <span className="text-gold-500 mt-1">•</span>
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>

                  {/* Right Form column */}
                  <div>
                    <div className="bg-primary-950 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
                        <Users className="w-40 h-40 text-white" />
                      </div>
                      
                      <div className="relative z-10 text-white">
                        <h4 className="font-heading font-extrabold text-xl mb-2 text-white">Join {selectedMinistry.name}</h4>
                        <p className="text-primary-200 font-sans text-xs mb-6">Take the next step in your spiritual journey by getting involved.</p>

                        <form onSubmit={handleJoin} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-primary-300 mb-1">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 h-4 w-4" />
                              <input
                                type="text"
                                value={joinName}
                                onChange={(e) => setJoinName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-primary-900/50 border border-primary-800 rounded-xl text-sm font-sans text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all placeholder:text-primary-500"
                                placeholder="Your Name"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-primary-300 mb-1">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 h-4 w-4" />
                              <input
                                type="email"
                                value={joinEmail}
                                onChange={(e) => setJoinEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-primary-900/50 border border-primary-800 rounded-xl text-sm font-sans text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all placeholder:text-primary-500"
                                placeholder="your@email.com"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-primary-300 mb-1">Phone (Optional)</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 h-4 w-4" />
                              <input
                                type="tel"
                                value={joinPhone}
                                onChange={(e) => setJoinPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-primary-900/50 border border-primary-800 rounded-xl text-sm font-sans text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all placeholder:text-primary-500"
                                placeholder="+268 7600 0000"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isJoining}
                            className="w-full bg-gold-500 hover:bg-gold-400 text-primary-950 font-heading font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 mt-2"
                          >
                            <span>{isJoining ? "Submitting..." : "Send Request"}</span>
                            {!isJoining && <ArrowRight className="h-4 w-4" />}
                          </button>
                        </form>

                        {joinSuccess && (
                          <div className="mt-4 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 p-3 rounded-xl flex items-start space-x-2 animate-fade-in">
                            <Check className="h-4 w-4 shrink-0 mt-0.5" />
                            <p className="font-sans text-xs">{joinSuccess}</p>
                          </div>
                        )}
                        {joinError && (
                          <div className="mt-4 bg-rose-500/20 text-rose-300 border border-rose-500/30 p-3 rounded-xl flex items-start space-x-2 animate-fade-in">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <p className="font-sans text-xs">{joinError}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Additional Gallery if more than 1 image */}
                {selectedMinistry.gallery.length > 1 && (
                  <div className="px-6 pb-6 sm:px-8 sm:pb-8">
                     <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-400 mb-4 border-t border-slate-100 pt-6">Ministry Gallery</h4>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {selectedMinistry.gallery.slice(1).map((img, idx) => (
                           <div key={idx} className="aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-100">
                             <img src={img} alt="Gallery image" loading="lazy" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                           </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl border border-slate-100 border-dashed h-[400px] flex flex-col items-center justify-center text-center p-8">
                <Users className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="font-heading font-bold text-lg text-slate-400 mb-2">No Ministry Selected</h3>
                <p className="text-slate-400 text-sm">Select a ministry from the list to view details and join.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
