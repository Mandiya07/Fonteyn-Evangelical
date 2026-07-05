import React from "react";
import { Compass, Play, Calendar, MapPin, Phone } from "lucide-react";
import { translations } from "../lib/translations";

interface HeroProps {
  setCurrentTab: (tab: string) => void;
  language: "en" | "ss";
}

export default function Hero({ setCurrentTab, language }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-primary-950 text-white min-h-[500px] lg:min-h-[600px] flex items-center">
      {/* Background Graphic & Img Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=75&w=1200&fm=webp"
          alt="Fonteyn Church Worship Service"
          fetchPriority="high"
          className="w-full h-full object-cover opacity-30 object-center filter saturate-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-900/80 to-primary-800/40"></div>
        
        {/* Subtle geometric particles/dots */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-3xl">
          {/* Tagline / Top-header */}
          <div className="inline-flex items-center space-x-2 bg-gold-500/10 border border-gold-500/30 text-gold-400 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase mb-6 shadow-sm backdrop-blur-sm animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-gold-500 animate-pulse"></span>
            <span>{translations.locationMbabane[language]}</span>
          </div>

          {/* Main Display Heading */}
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mb-6 text-white drop-shadow-md">
            {translations.welcome[language]}
          </h1>

          {/* Supporting Subheading */}
          <p className="text-slate-300 font-sans text-lg sm:text-xl font-normal leading-relaxed mb-10 max-w-2xl border-l-4 border-gold-500/80 pl-4">
            {translations.tagline[language]}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={() => setCurrentTab("contact")}
              className="flex items-center justify-center space-x-2 bg-gold-500 hover:bg-gold-400 text-primary-950 font-heading font-bold text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-gold-500/10 transition-all transform hover:-translate-y-0.5"
            >
              <Compass className="h-5 w-5" />
              <span>{translations.planVisit[language]}</span>
            </button>

            <button
              onClick={() => setCurrentTab("sermons")}
              className="flex items-center justify-center space-x-2 bg-primary-900/60 hover:bg-primary-800 text-white font-heading font-semibold text-base px-7 py-4 rounded-xl border border-slate-700 hover:border-gold-500/50 shadow-md backdrop-blur-sm transition-all"
            >
              <Play className="h-4.5 w-4.5 text-gold-400 fill-gold-400" />
              <span>{translations.watchSermons[language]}</span>
            </button>

            <button
              onClick={() => {
                const element = document.getElementById("service-times-section");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                } else {
                  setCurrentTab("home");
                  setTimeout(() => {
                    document.getElementById("service-times-section")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }
              }}
              className="flex items-center justify-center space-x-1.5 text-gold-400 hover:text-gold-300 font-heading font-medium text-sm py-3 transition-colors underline decoration-gold-500/30 hover:decoration-gold-400 underline-offset-4"
            >
              <Calendar className="h-4 w-4" />
              <span>{translations.joinSunday[language]}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative Wave Divider at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-50 [clip-path:polygon(0_100%,100%_100%,100%_0)]"></div>
    </div>
  );
}
