import { safeStorage } from "../lib/storage";
import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Check, Trash2, BookOpen } from "lucide-react";
import { readingPlans } from "./BibleData";

interface BibleReadingPlansProps {
  language: "en" | "ss";
}

export default function BibleReadingPlans({ language }: BibleReadingPlansProps) {
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [completedDays, setCompletedDays] = useState<Record<string, number[]>>({});
  const [dayNoteInput, setDayNoteInput] = useState("");
  const [planNotes, setPlanNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedCompleted = safeStorage.getItem("fec_completed_plan_days");
    if (savedCompleted) {
      try {
        setCompletedDays(JSON.parse(savedCompleted));
      } catch (e) {
        console.error("Error loading completed days:", e);
      }
    }

    const savedNotes = safeStorage.getItem("fec_plan_notes");
    if (savedNotes) {
      try {
        setPlanNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Error loading plan notes:", e);
      }
    }
  }, []);

  const toggleDayCompleted = (planId: string, dayNum: number) => {
    const currentCompleted = completedDays[planId] || [];
    const updatedDays = currentCompleted.includes(dayNum)
      ? currentCompleted.filter((d) => d !== dayNum)
      : [...currentCompleted, dayNum];

    const updated = {
      ...completedDays,
      [planId]: updatedDays
    };
    setCompletedDays(updated);
    safeStorage.setItem("fec_completed_plan_days", JSON.stringify(updated));
  };

  const handleSaveDayNote = (planId: string, dayNum: number) => {
    if (!dayNoteInput.trim()) return;
    const noteKey = `${planId}_${dayNum}`;
    const updated = {
      ...planNotes,
      [noteKey]: dayNoteInput
    };
    setPlanNotes(updated);
    safeStorage.setItem("fec_plan_notes", JSON.stringify(updated));
    setDayNoteInput("");
  };

  const activePlan = readingPlans.find((p) => p.id === activePlanId);
  
  if (readingPlans.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in text-center p-12 bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-sans text-sm">No reading plans available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" id="reading-plans-section">
      {activePlanId === null || !activePlan ? (
        /* Plan Directory */
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-heading font-bold text-base text-primary-950">
              {language === "en" ? "Active Bible Reading Tracks" : "Tindlela Letisheshako Letifundvako"}
            </h4>
            <p className="text-xs text-slate-400">
              Commit to a structured reading habit. Progress is automatically saved to your browser cache.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {readingPlans.map((plan) => {
              const completed = completedDays[plan.id]?.length || 0;
              const total = plan.days.length;
              const pct = Math.round((completed / total) * 100);

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md hover:shadow-lg hover:border-primary-800/10 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <span className="bg-primary-900/10 text-primary-900 text-[8px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                      {plan.duration} — {plan.tag}
                    </span>
                    <h4 className="font-heading font-bold text-base text-primary-950 mt-2 mb-1.5">{plan.title}</h4>
                    <p className="text-slate-500 font-sans text-xs leading-relaxed mb-4">{plan.description}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>Progress: {completed}/{total} days</span>
                        <span className="font-bold">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gold-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActivePlanId(plan.id);
                        setDayNoteInput("");
                      }}
                      className="w-full bg-slate-50 hover:bg-primary-800 hover:text-white border border-slate-150 hover:border-primary-800 text-slate-700 font-heading font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>{completed > 0 ? "Resume Plan" : "Start Reading Track"}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Plan Detail View */
        (() => {
          const completedList = completedDays[activePlan.id] || [];
          const total = activePlan.days.length;
          const pct = Math.round((completedList.length / total) * 100);

          return (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
              {/* Detail Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                  <button
                    onClick={() => setActivePlanId(null)}
                    className="text-[10px] font-heading font-bold text-slate-400 hover:text-primary-800 uppercase tracking-widest flex items-center gap-1 mb-1.5"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Back to Tracks
                  </button>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-primary-950">{activePlan.title}</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    {activePlan.duration} Bible journey • Complete your reading each day
                  </p>
                </div>

                <div className="w-full sm:w-48 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Track Completed: {completedList.length}/{total} days</span>
                    <span className="font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gold-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Days Timeline */}
              <div className="space-y-6">
                {activePlan.days.map((day) => {
                  const isDone = completedList.includes(day.day);
                  const noteKey = `${activePlan.id}_${day.day}`;
                  const currentNote = planNotes[noteKey];

                  return (
                    <div
                      key={day.day}
                      className={`rounded-2xl border p-5 transition-all space-y-4 ${
                        isDone ? "bg-slate-50/50 border-slate-200" : "bg-white border-slate-150 shadow-sm"
                      }`}
                    >
                      {/* Day Row Header */}
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-extrabold text-xs shrink-0 ${
                              isDone ? "bg-emerald-100 text-emerald-800" : "bg-primary-100 text-primary-950"
                            }`}
                          >
                            {isDone ? <Check className="h-4.5 w-4.5" /> : `${day.day}`}
                          </span>
                          <div>
                            <h5 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                              Day {day.day} Assigned Reading
                            </h5>
                            <p className="text-gold-600 font-mono text-[11px] font-bold">📖 {day.ref}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleDayCompleted(activePlan.id, day.day)}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-heading font-bold uppercase tracking-wider border transition-all ${
                            isDone
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {isDone ? "Completed" : "Mark Complete"}
                        </button>
                      </div>

                      {/* Reading Section */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                        <span className="font-heading font-bold text-[9px] text-slate-400 uppercase tracking-wider block">
                          Scripture Text
                        </span>
                        <p className="text-slate-700 font-serif text-xs leading-relaxed italic">"{day.passage}"</p>
                      </div>

                      {/* Day Thought */}
                      <div className="text-xs text-slate-600 leading-relaxed font-sans pl-1 border-l-2 border-primary-800">
                        <strong className="font-heading text-primary-950 block mb-0.5">Meditation Thought</strong>
                        {day.thought}
                      </div>

                      {/* Study Notes for this day */}
                      <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-2 mt-2">
                        <span className="text-[10px] font-heading font-bold text-slate-400 uppercase tracking-wider block">
                          My Daily Study Notes
                        </span>

                        {currentNote ? (
                          <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 font-sans relative group">
                            <button
                              onClick={() => {
                                const updated = { ...planNotes };
                                delete updated[noteKey];
                                setPlanNotes(updated);
                                safeStorage.setItem("fec_plan_notes", JSON.stringify(updated));
                              }}
                              className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 transition-colors"
                              title="Clear Note"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            <p className="italic leading-relaxed">"{currentNote}"</p>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Write personal insights or study notes for this day..."
                              onChange={(e) => setDayNoteInput(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-800 font-sans"
                            />
                            <button
                              onClick={() => handleSaveDayNote(activePlan.id, day.day)}
                              className="bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
