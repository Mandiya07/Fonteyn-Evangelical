import { safeStorage } from "../lib/storage";
import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Check, RotateCw } from "lucide-react";
import { prayerGuides } from "./BibleData";

interface BiblePrayerGuidesProps {
  language: "en" | "ss";
}

export default function BiblePrayerGuides({ language }: BiblePrayerGuidesProps) {
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});

  useEffect(() => {
    const saved = safeStorage.getItem("fec_completed_guide_steps");
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading completed guide steps:", e);
      }
    }
  }, []);

  const toggleGuideStepCompleted = (guideId: string, stepIndex: number) => {
    const currentCompleted = completedSteps[guideId] || [];
    const updatedSteps = currentCompleted.includes(stepIndex)
      ? currentCompleted.filter((s) => s !== stepIndex)
      : [...currentCompleted, stepIndex];

    const updated = {
      ...completedSteps,
      [guideId]: updatedSteps
    };
    setCompletedSteps(updated);
    safeStorage.setItem("fec_completed_guide_steps", JSON.stringify(updated));
  };

  const activeGuide = prayerGuides.find((g) => g.id === activeGuideId);
  
  if (prayerGuides.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in text-center p-12 bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-sans text-sm">No prayer guides available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" id="prayer-guides-section">
      {activeGuideId === null || !activeGuide ? (
        /* Prayer Guides List */
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-heading font-bold text-base text-primary-950">
              {language === "en" ? "Guided Prayer Blueprints" : "Imikhombandlela Lemikhuleko"}
            </h4>
            <p className="text-xs text-slate-400">
              Step-by-step biblical templates to coordinate your personal or family prayer altar sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {prayerGuides.map((guide) => {
              const completed = completedSteps[guide.id]?.length || 0;
              const total = guide.steps.length;
              const pct = Math.round((completed / total) * 100);

              return (
                <div
                  key={guide.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md hover:shadow-lg hover:border-primary-800/10 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <span className="bg-primary-900/10 text-primary-900 text-[8px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                      {guide.tag}
                    </span>
                    <h4 className="font-heading font-bold text-base text-primary-950 mt-2 mb-1.5">{guide.title}</h4>
                    <p className="text-slate-500 font-sans text-xs leading-relaxed mb-4">{guide.description}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Step progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>Steps Prayed: {completed}/{total}</span>
                        <span className="font-bold">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary-800 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveGuideId(guide.id)}
                      className="w-full bg-slate-50 hover:bg-primary-800 hover:text-white border border-slate-150 hover:border-primary-800 text-slate-700 font-heading font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Enter Prayer Sanctuary</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Guided Prayer detail steps */
        (() => {
          const completedList = completedSteps[activeGuide.id] || [];
          const total = activeGuide.steps.length;
          const pct = Math.round((completedList.length / total) * 100);

          return (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                  <button
                    onClick={() => setActiveGuideId(null)}
                    className="text-[10px] font-heading font-bold text-slate-400 hover:text-primary-800 uppercase tracking-widest flex items-center gap-1 mb-1.5"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Back to Blueprints
                  </button>
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-primary-950">{activeGuide.title}</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    {activeGuide.tag} • Focus fully on each sequential stage
                  </p>
                </div>

                <div className="w-full sm:w-48 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Sanctuary Focus: {completedList.length}/{total} stages</span>
                    <span className="font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary-800 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    const updated = { ...completedSteps, [activeGuide.id]: [] };
                    setCompletedSteps(updated);
                    safeStorage.setItem("fec_completed_guide_steps", JSON.stringify(updated));
                  }}
                  className="text-[10px] font-heading font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors uppercase tracking-wider"
                >
                  <RotateCw className="h-3.5 w-3.5" /> Restart Altar Session
                </button>
              </div>

              {/* Steps Vertical Timeline */}
              <div className="space-y-6 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                {activeGuide.steps.map((step, idx) => {
                  const isDone = completedList.includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`relative pl-12 transition-all duration-300 ${isDone ? "opacity-65 scale-[0.99]" : "opacity-100"}`}
                    >
                      {/* Step circle */}
                      <button
                        onClick={() => toggleGuideStepCompleted(activeGuide.id, idx)}
                        className={`absolute left-2.5 top-0.5 w-7.5 h-7.5 rounded-full flex items-center justify-center border transition-all shadow ${
                          isDone
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-white border-slate-200 hover:border-primary-800 text-slate-400 hover:text-primary-800"
                        }`}
                      >
                        {isDone ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="font-heading font-extrabold text-[11px]">{idx + 1}</span>
                        )}
                      </button>

                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150/70 space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h5 className="font-heading font-bold text-xs sm:text-sm text-slate-900">{step.title}</h5>
                            <p className="text-gold-600 font-mono text-[10px] font-bold mt-0.5">📖 {step.scripture}</p>
                          </div>

                          <button
                            onClick={() => toggleGuideStepCompleted(activeGuide.id, idx)}
                            className={`p-1 rounded-lg border transition-colors ${
                              isDone
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                : "bg-white border-slate-200 text-slate-300 hover:text-slate-600"
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Scripture anchor */}
                        <div className="p-3 bg-white border border-slate-100 rounded-xl italic font-sans text-xs text-slate-500 leading-relaxed">
                          "{step.guidance}"
                        </div>

                        {/* Prompt instruction */}
                        <div className="text-xs text-slate-600 leading-relaxed font-sans">
                          <strong className="font-heading text-primary-950 block mb-0.5">How to Pray This Step:</strong>
                          {step.prompt}
                        </div>
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
