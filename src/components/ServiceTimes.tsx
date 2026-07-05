import React from "react";
import { Clock, Calendar, Heart, Shield, Sparkles } from "lucide-react";
import { translations } from "../lib/translations";

interface ServiceTimesProps {
  language: "en" | "ss";
}

export default function ServiceTimes({ language }: ServiceTimesProps) {
  return (
    <section id="service-times-section" className="py-16 bg-slate-50 border-b border-slate-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900 tracking-tight mb-3">
            {translations.serviceTimes[language]}
          </h2>
          <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full mb-4"></div>
          <p className="text-slate-600 font-sans text-sm sm:text-base">
            {language === "en"
              ? "We welcome you to worship with us! Join any of our scheduled services at our church campus in Fonteyn, Mbabane."
              : "Siyakwamukela kutsi utewudumisa natsi! Hlanganyela kunobe ngabe nguyiphi inkonzo yetfu emagqumeni aseFonteyn, Mbabane."}
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Sunday Services Card */}
          <div className="bg-primary-900 text-white rounded-2xl shadow-xl overflow-hidden border border-primary-800 flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="font-heading font-extrabold text-lg sm:text-xl text-gold-400 flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gold-500 animate-pulse" />
                  <span>Sunday Services</span>
                </span>
                <span className="bg-gold-500/10 text-gold-400 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-gold-500/30">
                  Weekly
                </span>
              </div>

              <div className="space-y-6">
                {/* Bible Study */}
                <div className="border-l-4 border-gold-500 pl-4">
                  <h4 className="font-heading font-bold text-base sm:text-lg text-white">
                    Bible Study
                  </h4>
                  <div className="flex items-center space-x-2 text-slate-300 text-sm mt-1">
                    <Clock className="h-4 w-4 text-gold-400" />
                    <span>10:00 AM</span>
                  </div>
                </div>

                {/* Main Church Service */}
                <div className="border-l-4 border-slate-600 pl-4">
                  <h4 className="font-heading font-bold text-base sm:text-lg text-slate-200">
                    Main Church Service
                  </h4>
                  <div className="flex items-center space-x-2 text-slate-300 text-sm mt-1">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>11:00 AM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sunday Footer Info */}
            <div className="bg-primary-950 px-8 py-4 text-xs font-heading font-medium text-slate-400 tracking-wide border-t border-primary-800/50">
              📍 Location: Main Sanctuary (Campus Hall)
            </div>
          </div>

          {/* Weekly Schedule Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="font-heading font-extrabold text-lg sm:text-xl text-primary-900 flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary-800" />
                  <span>Weekly Schedule</span>
                </span>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-200">
                  Interactive
                </span>
              </div>

              <div className="space-y-6">
                {/* Monday */}
                <div className="border-l-4 border-primary-800 pl-4">
                  <h4 className="font-heading font-bold text-base sm:text-lg text-primary-950">
                    Monday: Fathers' Fellowship
                  </h4>
                  <div className="flex items-center space-x-2 text-slate-500 text-sm mt-1">
                    <Clock className="h-4 w-4 text-primary-600" />
                    <span>05:30 PM</span>
                  </div>
                </div>

                {/* Wednesday */}
                <div className="border-l-4 border-primary-600 pl-4">
                  <h4 className="font-heading font-bold text-base sm:text-lg text-primary-950">
                    Wednesday: Prayer Service
                  </h4>
                  <div className="flex items-center space-x-2 text-slate-500 text-sm mt-1">
                    <Clock className="h-4 w-4 text-primary-500" />
                    <span>05:30 PM</span>
                  </div>
                </div>

                {/* Saturday */}
                <div className="border-l-4 border-gold-500 pl-4">
                  <h4 className="font-heading font-bold text-base sm:text-lg text-primary-950">
                    Saturday Fellowships
                  </h4>
                  <div className="space-y-1 mt-1 text-slate-500 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gold-500" />
                      <span>11:00 AM: Mothers' Fellowship</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gold-500" />
                      <span>01:00 PM: Youth Fellowship</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Footer Info */}
            <div className="bg-slate-50 px-8 py-4 text-xs font-heading font-medium text-slate-500 tracking-wide border-t border-slate-100">
              📍 Location: Chapel Hall / Classrooms
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
