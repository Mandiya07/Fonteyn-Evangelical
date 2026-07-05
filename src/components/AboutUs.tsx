import React, { useState } from "react";
import { Award, BookOpen, Shield, Heart, Sparkles, Star, Users, CheckCircle2, Globe, HeartHandshake } from "lucide-react";
import { translations } from "../lib/translations";

interface AboutUsProps {
  language: "en" | "ss";
}

export default function AboutUs({ language }: AboutUsProps) {
  const leadership: any[] = [];

  const milestones: any[] = [];

  const [activeMilestone, setActiveMilestone] = useState(0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16" id="about_us">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900 tracking-tight">
          {translations.aboutUs[language]}
        </h2>
        <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full mt-3 mb-4"></div>
      </div>

      {/* History Timeline */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="text-center mb-10 relative z-10">
          <h3 className="font-heading font-extrabold text-2xl text-primary-950 uppercase tracking-wider mb-2">Our History</h3>
          <p className="text-slate-500 font-sans text-sm">Tracing God's faithfulness from our humble beginnings to today.</p>
        </div>

        <div className="relative z-10 hidden md:flex items-center justify-between mb-8">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
          {milestones.map((milestone, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <button
                onClick={() => setActiveMilestone(idx)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold font-heading transition-all ${
                  activeMilestone === idx
                    ? "bg-primary-900 text-white shadow-lg scale-110 ring-4 ring-primary-100"
                    : "bg-white text-slate-400 border-2 border-slate-200 hover:border-primary-400 hover:text-primary-600"
                }`}
              >
                {milestone.year}
              </button>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex md:hidden overflow-x-auto pb-4 gap-4 hide-scrollbar">
          {milestones.map((milestone, idx) => (
             <button
              key={idx}
              onClick={() => setActiveMilestone(idx)}
              className={`flex-none px-4 py-2 rounded-full text-sm font-bold font-heading transition-all ${
                activeMilestone === idx
                  ? "bg-primary-900 text-white shadow-md"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}
             >
               {milestone.year}
             </button>
          ))}
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center max-w-2xl mx-auto relative z-10 min-h-[140px] flex flex-col justify-center">
          <h4 className="font-heading font-bold text-xl text-primary-900 mb-2">{milestones[activeMilestone].title}</h4>
          <p className="text-slate-600 font-sans text-sm leading-relaxed">{milestones[activeMilestone].desc}</p>
        </div>
      </div>

      {/* Vision and Mission segment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-gradient-to-br from-primary-900 to-primary-950 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
            <Star className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <span className="bg-gold-500/20 text-gold-300 p-2 rounded-xl inline-block mb-4">
              <Star className="h-6 w-6" />
            </span>
            <h3 className="font-heading font-bold text-2xl mb-4 text-white">Our Vision</h3>
            <p className="font-sans text-primary-100 text-base leading-relaxed">
              {language === "en"
                ? "To worship God, share the sovereign Gospel of Christ Jesus, and nurture scripture-grounded family altars across Eswatini."
                : "Kukhulekela Nkulunkulu, sabelana ngevangeli laJesu Krestu, nekwakha emakhaya lathobile."}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5 text-primary-900">
            <Globe className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <span className="bg-primary-50 text-primary-800 p-2 rounded-xl inline-block mb-4 border border-primary-100">
              <Globe className="h-6 w-6" />
            </span>
            <h3 className="font-heading font-bold text-2xl mb-4 text-primary-950">Our Mission</h3>
            <p className="font-sans text-slate-600 text-base leading-relaxed">
               {language === "en"
                  ? "To make lifelong disciples of Christ, serve our community with sacrificial love, and develop resilient Christian leaders."
                  : "Kwakha bafundi baphakade, kusita imindeni netandla telutsandvo emphakatsini."}
            </p>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="font-heading font-extrabold text-2xl text-primary-950 uppercase tracking-wider">Our Core Values</h3>
          <p className="text-slate-500 font-sans text-sm mt-2">The fundamental principles that govern our community.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center hover:border-gold-300 transition-colors">
            <span className="bg-slate-50 text-slate-700 p-2.5 rounded-xl inline-block mb-3 border border-slate-150"><BookOpen className="h-5 w-5 text-primary-800" /></span>
            <h4 className="font-heading font-bold text-sm text-slate-900 mb-1">Faith</h4>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center hover:border-gold-300 transition-colors">
            <span className="bg-slate-50 text-slate-700 p-2.5 rounded-xl inline-block mb-3 border border-slate-150"><Heart className="h-5 w-5 text-primary-800" /></span>
            <h4 className="font-heading font-bold text-sm text-slate-900 mb-1">Love</h4>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center hover:border-gold-300 transition-colors">
            <span className="bg-slate-50 text-slate-700 p-2.5 rounded-xl inline-block mb-3 border border-slate-150"><Shield className="h-5 w-5 text-primary-800" /></span>
            <h4 className="font-heading font-bold text-sm text-slate-900 mb-1">Integrity</h4>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center hover:border-gold-300 transition-colors">
            <span className="bg-slate-50 text-slate-700 p-2.5 rounded-xl inline-block mb-3 border border-slate-150"><HeartHandshake className="h-5 w-5 text-primary-800" /></span>
            <h4 className="font-heading font-bold text-sm text-slate-900 mb-1">Service</h4>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center hover:border-gold-300 transition-colors">
            <span className="bg-slate-50 text-slate-700 p-2.5 rounded-xl inline-block mb-3 border border-slate-150"><Award className="h-5 w-5 text-primary-800" /></span>
            <h4 className="font-heading font-bold text-sm text-slate-900 mb-1">Excellence</h4>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center hover:border-gold-300 transition-colors">
            <span className="bg-slate-50 text-slate-700 p-2.5 rounded-xl inline-block mb-3 border border-slate-150"><Users className="h-5 w-5 text-primary-800" /></span>
            <h4 className="font-heading font-bold text-sm text-slate-900 mb-1">Unity</h4>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center hover:border-gold-300 transition-colors md:col-start-2 md:col-span-2">
            <span className="bg-slate-50 text-slate-700 p-2.5 rounded-xl inline-block mb-3 border border-slate-150"><Heart className="h-5 w-5 text-primary-800" /></span>
            <h4 className="font-heading font-bold text-sm text-slate-900 mb-1">Compassion</h4>
          </div>
        </div>
      </div>

      {/* Leadership Directory Section */}
      <div className="space-y-8 pt-8">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="font-heading font-extrabold text-2xl text-primary-950 uppercase tracking-wider mb-2">Leadership Team</h3>
          <p className="text-slate-500 font-sans text-sm mt-1 leading-relaxed">Dedicated servants leading our congregation with grace, truth, and a deep commitment to the Gospel.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {leadership.map((lead, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all flex flex-col h-full">
              <div className="h-48 bg-slate-100 overflow-hidden relative">
                <img
                  src={lead.photo}
                  alt={lead.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h4 className="font-heading font-bold text-sm text-slate-900 mb-1">{lead.name}</h4>
                <p className="text-gold-600 font-heading font-bold text-[10px] uppercase tracking-wider mb-3">{lead.role}</p>
                <p className="text-slate-500 font-sans text-xs leading-relaxed flex-grow">{lead.bio}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <a href={`mailto:contact@fonteynchurch.org`} className="text-primary-800 hover:text-primary-600 text-xs font-bold font-sans flex items-center space-x-1">
                    <span>Contact</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
