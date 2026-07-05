import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users, Heart, Check, AlertTriangle, ChevronLeft, ChevronRight, List, CalendarDays } from "lucide-react";
import { Event } from "../types";
import { translations } from "../lib/translations";

interface EventsSystemProps {
  language: "en" | "ss";
}

export default function EventsSystem({ language }: EventsSystemProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"monthly" | "weekly" | "agenda">("monthly");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Date states
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form states
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerRole, setVolunteerRole] = useState("");
  const [volunteerSuccess, setVolunteerSuccess] = useState<string | null>(null);
  const [volunteerError, setVolunteerError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
        if (data.length > 0) {
          setSelectedEvent(data[0]); // Select first event by default
        }
      }
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!registerEmail) {
      setRegisterError(language === "en" ? "Please enter a valid email." : "Faka i-imeyili lemusa.");
      return;
    }

    try {
      setRegisterError(null);
      setRegisterSuccess(null);
      const res = await fetch(`/api/events/${selectedEvent.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registerEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error || "Failed to register.");
      } else {
        setRegisterSuccess(language === "en" ? "Successfully registered! Check your email for confirmation." : "Kubhaliswe ngalokuphelele! Hlola i-imeyili yakho.");
        setRegisterEmail("");
        setEvents(prev => prev.map(ev => ev.id === selectedEvent.id ? data.event : ev));
        setSelectedEvent(data.event);
      }
    } catch (err) {
      setRegisterError("Server connection lost. Please try again.");
    }
  };

  const handleVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!volunteerName || !volunteerRole) {
      setVolunteerError(language === "en" ? "Name and role selection are required." : "Leligama nemsebenti bayadzingeka.");
      return;
    }

    try {
      setVolunteerError(null);
      setVolunteerSuccess(null);
      const res = await fetch(`/api/events/${selectedEvent.id}/volunteer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: volunteerName, spot: volunteerRole })
      });

      const data = await res.json();
      if (!res.ok) {
        setVolunteerError(data.error || "Failed to register as volunteer.");
      } else {
        setVolunteerSuccess(language === "en" ? `Thank you, ${volunteerName}! You are signed up as: ${volunteerRole}.` : `Ngiyabonga, ${volunteerName}! Ubhalisela: ${volunteerRole}.`);
        setVolunteerName("");
        setVolunteerRole("");
        setEvents(prev => prev.map(ev => ev.id === selectedEvent.id ? data.event : ev));
        setSelectedEvent(data.event);
      }
    } catch (err) {
      setVolunteerError("Server error. Please try again.");
    }
  };

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getStartDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  
  const monthName = currentDate.toLocaleString(language === "en" ? 'en-US' : 'ss-SZ', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startDayOffset = getStartDayOfMonth(currentYear, currentMonth);

  // Generate Calendar Arrays
  const monthlyCalendarDays = [];
  for (let i = 0; i < startDayOffset; i++) {
    monthlyCalendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    monthlyCalendarDays.push(i);
  }

  // Weekly Calendar Logic
  const getStartOfWeek = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return start;
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weeklyCalendarDays = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const getEventsForDate = (dateString: string) => {
    return events.filter((e) => e.date === dateString);
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  // Navigation handlers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'monthly') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'monthly') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 6, 15)); // Setting to mid-July 2026 for demo purposes
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="events">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900 tracking-tight">
          {translations.upcomingEvents[language]}
        </h2>
        <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full mt-3 mb-4"></div>
        
        {/* Toggle View Mode */}
        <div className="inline-flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode("monthly")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all ${
              viewMode === "monthly"
                ? "bg-white text-primary-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Monthly</span>
          </button>
          <button
            onClick={() => setViewMode("weekly")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all ${
              viewMode === "weekly"
                ? "bg-white text-primary-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Weekly</span>
          </button>
          <button
            onClick={() => setViewMode("agenda")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all ${
              viewMode === "agenda"
                ? "bg-white text-primary-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">{translations.agendaView[language]}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-slate-500 font-sans">Loading church calendar...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Calendar Grid or Agenda list */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
            
            {viewMode !== "agenda" && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 px-2 gap-4">
                <div className="flex items-center space-x-4">
                  <h3 className="font-heading font-extrabold text-lg text-primary-900 flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gold-500 shrink-0" />
                    <span>
                      {viewMode === "monthly" 
                        ? monthName 
                        : `${startOfWeek.toLocaleString(language === "en" ? 'en-US' : 'ss-SZ', { month: 'short', day: 'numeric' })} - ${new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleString(language === "en" ? 'en-US' : 'ss-SZ', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      }
                    </span>
                  </h3>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button onClick={handlePrev} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary-900">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={handleToday} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 hover:text-primary-900 font-heading">
                    Today
                  </button>
                  <button onClick={handleNext} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary-900">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {viewMode === "monthly" && (
              <div>
                <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-heading font-bold text-slate-400 uppercase tracking-wider">
                  <div className="hidden sm:block">Sun</div><div className="sm:hidden">S</div>
                  <div className="hidden sm:block">Mon</div><div className="sm:hidden">M</div>
                  <div className="hidden sm:block">Tue</div><div className="sm:hidden">T</div>
                  <div className="hidden sm:block">Wed</div><div className="sm:hidden">W</div>
                  <div className="hidden sm:block">Thu</div><div className="sm:hidden">T</div>
                  <div className="hidden sm:block">Fri</div><div className="sm:hidden">F</div>
                  <div className="hidden sm:block">Sat</div><div className="sm:hidden">S</div>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {monthlyCalendarDays.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/50 rounded-xl border border-transparent"></div>;
                    }

                    const dateString = formatDateString(currentYear, currentMonth, day);
                    const dayEvents = getEventsForDate(dateString);
                    const isSelected = selectedEvent && selectedEvent.date === dateString;
                    const hasEvents = dayEvents.length > 0;
                    const isToday = dateString === formatDateString(2026, 6, 15);

                    return (
                      <button
                        key={`day-${day}`}
                        onClick={() => hasEvents && setSelectedEvent(dayEvents[0])}
                        className={`aspect-square p-1 sm:p-2 rounded-xl border flex flex-col justify-between items-center transition-all relative ${
                          hasEvents
                            ? isSelected
                              ? "bg-gold-500 border-gold-500 text-primary-950 shadow-md transform scale-105 z-10"
                              : "bg-primary-50 border-primary-100 text-primary-900 hover:bg-gold-100 cursor-pointer"
                            : isToday 
                              ? "bg-slate-100/50 border-slate-200 text-slate-800"
                              : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 cursor-default"
                        }`}
                        disabled={!hasEvents}
                      >
                        <span className={`text-[10px] sm:text-xs font-heading ${hasEvents ? 'font-extrabold' : 'font-medium'}`}>{day}</span>
                        {hasEvents && (
                          <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1 mt-auto">
                            {dayEvents.slice(0, 3).map((_, evIdx) => (
                              <span key={evIdx} className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-primary-950" : "bg-primary-800"}`}></span>
                            ))}
                            {dayEvents.length > 3 && <span className="text-[8px] leading-none font-bold text-primary-800">+</span>}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === "weekly" && (
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-heading font-bold text-slate-400 uppercase tracking-wider">
                  <div className="hidden sm:block">Sun</div><div className="sm:hidden">S</div>
                  <div className="hidden sm:block">Mon</div><div className="sm:hidden">M</div>
                  <div className="hidden sm:block">Tue</div><div className="sm:hidden">T</div>
                  <div className="hidden sm:block">Wed</div><div className="sm:hidden">W</div>
                  <div className="hidden sm:block">Thu</div><div className="sm:hidden">T</div>
                  <div className="hidden sm:block">Fri</div><div className="sm:hidden">F</div>
                  <div className="hidden sm:block">Sat</div><div className="sm:hidden">S</div>
                </div>
                
                <div className="grid grid-cols-7 gap-1.5 min-h-[400px]">
                  {weeklyCalendarDays.map((dayObj, idx) => {
                    const dateString = formatDateString(dayObj.getFullYear(), dayObj.getMonth(), dayObj.getDate());
                    const dayEvents = getEventsForDate(dateString);
                    const isToday = dateString === formatDateString(2026, 6, 15); // Demo current date
                    
                    return (
                      <div key={idx} className={`border rounded-xl p-1 sm:p-2 flex flex-col h-full bg-slate-50 ${isToday ? 'border-gold-300 bg-gold-50/30' : 'border-slate-100'}`}>
                        <div className={`text-center font-heading font-bold text-[10px] sm:text-sm mb-2 sm:mb-3 ${isToday ? 'text-gold-600' : 'text-slate-600'}`}>
                          {dayObj.getDate()}
                        </div>
                        <div className="flex-1 space-y-1 sm:space-y-2 overflow-y-auto hide-scrollbar">
                          {dayEvents.map(ev => (
                            <button
                              key={ev.id}
                              onClick={() => setSelectedEvent(ev)}
                              className={`w-full text-left p-1.5 sm:p-2 rounded-lg text-xs transition-all ${
                                selectedEvent?.id === ev.id
                                  ? 'bg-primary-900 text-white shadow-md'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:border-primary-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="font-bold truncate text-[8px] sm:text-[10px] uppercase">{ev.title}</div>
                              <div className="text-[8px] sm:text-[10px] opacity-80 mt-0.5">{ev.time}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === "agenda" && (
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-lg text-primary-900 mb-4 flex items-center space-x-2">
                  <List className="h-5 w-5 text-gold-500" />
                  <span>{language === "en" ? "Upcoming Church Schedule" : "Ihlelo Lemicimbi Letawoya"}</span>
                </h3>

                {events.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <p className="text-slate-500 font-sans">No upcoming events scheduled.</p>
                  </div>
                ) : (
                  events.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        selectedEvent?.id === ev.id
                          ? "bg-primary-900 border-primary-900 text-white shadow-lg transform scale-[1.01]"
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200 text-slate-700"
                      }`}
                    >
                      <div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${selectedEvent?.id === ev.id ? "bg-gold-500 text-primary-950" : "bg-primary-100 text-primary-800"}`}>
                          {ev.category}
                        </span>
                        <h4 className="font-heading font-bold text-base mt-1">{ev.title}</h4>
                        <p className={`text-xs mt-1 flex items-center space-x-3 ${selectedEvent?.id === ev.id ? "text-slate-300" : "text-slate-500"}`}>
                          <span className="font-mono bg-black/10 px-1.5 py-0.5 rounded">{ev.date}</span>
                          <span>•</span>
                          <span>{ev.time}</span>
                        </p>
                      </div>
                      <ChevronRight className={`h-5 w-5 ${selectedEvent?.id === ev.id ? "text-gold-400" : "text-slate-400"}`} />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right Column: Selected Event Detail */}
          <div className="lg:col-span-5 space-y-6">
            {selectedEvent ? (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in sticky top-24">
                
                <div className="h-44 bg-primary-950 relative">
                  <img
                    src={selectedEvent.image || "https://images.unsplash.com/photo-1511180590220-bb06972294ba?auto=format&fit=crop&q=80&w=600"}
                    alt={selectedEvent.title}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/40 to-transparent"></div>
                  
                  <span className="absolute top-4 left-4 bg-gold-500 text-primary-950 font-heading font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    {selectedEvent.category}
                  </span>
                </div>

                <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto hide-scrollbar">
                  <h3 className="font-heading font-bold text-2xl text-primary-950 mb-3">{selectedEvent.title}</h3>
                  <p className="text-slate-600 font-sans text-sm leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedEvent.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-xs font-heading font-semibold text-slate-700 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gold-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Date</p>
                        <p className="font-mono text-primary-900">{selectedEvent.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gold-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Time</p>
                        <p className="text-primary-900">{selectedEvent.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 col-span-2">
                      <MapPin className="h-5 w-5 text-gold-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Location</p>
                        <p className="text-primary-900 truncate max-w-[280px]" title={selectedEvent.location}>{selectedEvent.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 col-span-2">
                      <Users className="h-5 w-5 text-gold-500 shrink-0" />
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{translations.capacity[language]}</p>
                          <p className="text-[10px] text-primary-900 font-bold">{selectedEvent.registeredUsers.length}/{selectedEvent.maxCapacity} {translations.spotsLeft[language]}</p>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-primary-800 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(100, (selectedEvent.registeredUsers.length / selectedEvent.maxCapacity) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RSVP REGISTRATION FORM */}
                  <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-2xl p-5 mb-6 shadow-sm">
                    <h4 className="font-heading font-extrabold text-sm text-primary-950 mb-1 flex items-center space-x-2">
                      <Check className="h-4.5 w-4.5 text-primary-800" />
                      <span>{translations.eventRegister[language]}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mb-4 font-sans">Reserve your spot and receive event reminders.</p>

                    <form onSubmit={handleRegister} className="space-y-3">
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm font-sans bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800 transition-all"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full bg-primary-900 hover:bg-primary-800 text-white font-heading font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                        disabled={selectedEvent.registeredUsers.length >= selectedEvent.maxCapacity}
                      >
                        {selectedEvent.registeredUsers.length >= selectedEvent.maxCapacity ? "Event Full" : translations.eventRegister[language]}
                      </button>
                    </form>

                    {registerSuccess && (
                      <div className="mt-3 bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-xl flex items-start space-x-2 animate-fade-in">
                        <Check className="h-4 w-4 shrink-0 mt-0.5" />
                        <p className="font-sans text-xs">{registerSuccess}</p>
                      </div>
                    )}
                    {registerError && (
                      <div className="mt-3 bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-xl flex items-start space-x-2 animate-fade-in">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p className="font-sans text-xs">{registerError}</p>
                      </div>
                    )}
                  </div>

                  {/* VOLUNTEER SIGNUP FORM */}
                  {selectedEvent.volunteerSpots && selectedEvent.volunteerSpots.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <h4 className="font-heading font-extrabold text-sm text-slate-900 mb-1 flex items-center space-x-2">
                        <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500" />
                        <span>{translations.volunteerSignUp[language]}</span>
                      </h4>
                      <p className="text-xs text-slate-500 mb-4 font-sans">Serve the community by joining the volunteer team.</p>

                      <form onSubmit={handleVolunteer} className="space-y-3">
                        <input
                          type="text"
                          placeholder="Your full name"
                          value={volunteerName}
                          onChange={(e) => setVolunteerName(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm font-sans bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800 transition-all"
                          required
                        />
                        <select
                          value={volunteerRole}
                          onChange={(e) => setVolunteerRole(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm font-sans bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800 transition-all text-slate-700"
                          required
                        >
                          <option value="">-- Select volunteer role --</option>
                          {selectedEvent.volunteerSpots.map((spot, i) => (
                            <option key={i} value={spot}>{spot}</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-heading font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md active:scale-95"
                        >
                          Sign Up to Serve
                        </button>
                      </form>

                      {volunteerSuccess && (
                        <div className="mt-3 bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-xl flex items-start space-x-2 animate-fade-in">
                          <Check className="h-4 w-4 shrink-0 mt-0.5" />
                          <p className="font-sans text-xs">{volunteerSuccess}</p>
                        </div>
                      )}
                      {volunteerError && (
                        <div className="mt-3 bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-xl flex items-start space-x-2 animate-fade-in">
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                          <p className="font-sans text-xs">{volunteerError}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl border border-slate-100 border-dashed h-[500px] flex flex-col items-center justify-center text-center p-8">
                <Calendar className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="font-heading font-bold text-lg text-slate-400 mb-2">No Event Selected</h3>
                <p className="text-slate-400 text-sm">Select an event from the calendar to view details and register.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
