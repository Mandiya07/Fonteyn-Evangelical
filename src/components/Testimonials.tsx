import React from "react";
import { Quote } from "lucide-react";
import { translations } from "../lib/translations";

interface TestimonialsProps {
  language: "en" | "ss";
}

export default function Testimonials({ language }: TestimonialsProps) {
  const testimonials: Array<{id: string; name: string; role: string; quote: string; quoteSs: string}> = [];

  return (
    <section className="bg-slate-50 py-16 sm:py-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900 tracking-tight">
            {language === "en" ? "Stories of Faith" : "Tindzaba Tekukholwa"}
          </h2>
          <div className="w-16 h-1 bg-gold-500 mx-auto mt-4 mb-6"></div>
          <p className="text-slate-600 font-sans text-sm sm:text-base leading-relaxed">
            {language === "en"
              ? "Read how God is moving in the lives of our church members through faith, community impact, and spiritual growth."
              : "Fundza kutsi Nkulunkulu usebenta kanjani etimphilweni temalunga ebandla letfu ngekukholwa, umphakatsi kanye nekukhula emoyeni."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col relative">
              <Quote className="h-8 w-8 text-gold-200 absolute top-6 right-6" />
              <p className="text-slate-700 italic mb-8 relative z-10 font-sans text-sm leading-relaxed flex-grow">
                "{language === "en" ? t.quote : t.quoteSs}"
              </p>
              <div className="mt-auto border-t border-slate-100 pt-4">
                <h4 className="font-heading font-bold text-primary-900">{t.name}</h4>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
