import React, { useState } from "react";
import { BookOpen, Sparkles, MessageSquare } from "lucide-react";
import { translations } from "../lib/translations";

interface PastorMessageProps {
  language: "en" | "ss";
}

export default function PastorMessage({ language }: PastorMessageProps) {
  const [readMore, setReadMore] = useState(false);

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
          
          {/* Pastor Image Frame */}
          <div className="lg:col-span-5 mb-10 lg:mb-0 relative">
            <div className="absolute -inset-2 bg-gradient-to-tr from-gold-500 to-primary-700 rounded-3xl opacity-10 blur-lg"></div>
            <div className="relative overflow-hidden bg-slate-100 rounded-2xl border-4 border-slate-50 shadow-xl max-w-sm mx-auto">
              <div className="w-full aspect-[4/5] flex items-center justify-center bg-slate-200">
                <span className="text-slate-400 font-heading text-lg">Photo Pending</span>
              </div>
              {/* Overlay Label */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-primary-950/90 to-transparent p-5 text-white">
                <p className="font-heading font-bold text-lg text-gold-400">
                  {language === "en" ? "Rev. L. S. Mnisi" : "Mfundisi L. S. Mnisi"}
                </p>
                <p className="text-slate-300 text-xs font-sans tracking-wide">
                  {language === "en" ? "FEC Senior Pastoral Leadership" : "Baholi Labakhulu BaseFEC"}
                </p>
              </div>
            </div>
            
            {/* Visual accent corner decoration */}
            <div className="hidden sm:block absolute -bottom-5 -right-5 w-24 h-24 bg-gold-100 rounded-2xl -z-10 border border-gold-300/30"></div>
          </div>

          {/* Welcome Text content */}
          <div className="lg:col-span-7">
            <div className="flex items-center space-x-2 text-gold-600 mb-3">
              <MessageSquare className="h-5 w-5" />
              <span className="font-heading font-bold uppercase tracking-wider text-xs">
                {translations.pastorWelcomeTitle[language]}
              </span>
            </div>
            
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-primary-900 tracking-tight mb-6">
              {language === "en" ? "Siyakwemukela! Welcome to Our Sanctuary" : "Siyakwemukela eKhabeni Lelikhethekile"}
            </h2>

            <div className="prose prose-slate max-w-none text-slate-600 font-sans leading-relaxed space-y-4 text-base sm:text-lg">
              <p className="italic font-medium text-slate-700">
                {language === "en"
                  ? '"We are deeply humbled and overjoyed that you have chosen to connect with Fonteyn Evangelical Church today. Whether you are a life-long believer or searching for hope, there is a place for you in our family."'
                  : '"Sisondveta kakhulu ngenjabulo lenkhulu kutsi uhlanganyele natsi lapha eFonteyn Evangelical Church. Kungakhathaliseki kutsi ukholwa sikhathi lesidze nobe usafuna litsemba, unendzawo yakho emndenini waseFEC."'}
              </p>
              
              <p>
                {language === "en"
                  ? "Fonteyn Evangelical Church is located in the breath-taking mountainous community of Fonteyn, right outside Mbabane. For over three decades, we have stood as a beacon of Christian faith, sharing the light of Jesus Christ, making disciples, and serving our neighbors with compassion."
                  : "IFonteyn Evangelical Church itholakala emagqumeni lamahle aseFonteyn, ngaphandle nje kwaseMbabane. Iminyaka leminyenti, sesime njengesibani sekholo lwebuKrestu, sabelana ngenkhanyiso yaJesu Krestu, senta bafundi, siphindze sisita bamakhelwane betfu ngetandla telutsandvo."}
              </p>

              {readMore && (
                <div className="animate-fade-in space-y-4 border-t border-slate-100 pt-4 mt-4">
                  <p>
                    {language === "en"
                      ? "Our theology is firmly grounded in the scriptures. We preach the gospel of grace, encouraging personal holiness, strong marital bonds, solid parenting structures, and active youth development. We believe that when families are strengthened in Christ, the whole community is uplifted."
                      : "Imfundiso yetfu isisekelweni setincwadzi letingcwele tsaLibhayibheli. Sishumayela livi lemusa wamahhala, sikhutsaza kuphila lokungcwele, imishado lecinile, kukhulisa bantfwana kahle, kanye nekutfutfukisa luhlelo lwentsha. Siyakholwa kutsi uma imindeni isesimeni lesihle kuKrestu, nemphakatsi wonke uyavuselelwa."}
                  </p>
                  <p className="font-semibold text-primary-800">
                    {language === "en"
                      ? "Join us this Sunday. Let us grow, worship, and change Eswatini together!"
                      : "Hlanganyela natsi ngaleliSontfo. Asikhule, sikhulekele, siphindze siguqule Eswatini ndzawonye!"}
                  </p>
                </div>
              )}
            </div>

            {/* Read More button */}
            <button
              onClick={() => setPastorMore(!readMore)}
              className="mt-6 flex items-center space-x-1.5 text-primary-800 hover:text-gold-600 font-heading font-semibold text-sm transition-colors border-b-2 border-primary-800/10 hover:border-gold-500 pb-0.5"
            >
              <BookOpen className="h-4 w-4" />
              <span>{readMore ? translations.showLess[language] : translations.readMore[language]}</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );

  // Quick state patch
  function setPastorMore(val: boolean) {
    setReadMore(val);
  }
}
