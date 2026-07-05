import React, { useState, lazy, Suspense } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import { translations } from "./lib/translations";
import { Heart, BellRing } from "lucide-react";

// PageLoading spinner fallback for elegant code splitting transitions
function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[350px] py-16">
      <div className="relative flex flex-col items-center space-y-4">
        <div className="h-12 w-12 border-4 border-slate-150 border-t-gold-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-sans text-xs tracking-widest animate-pulse uppercase">Loading...</p>
      </div>
    </div>
  );
}

// Code Splitting - Lazy Load sub-components to reduce initial bundle size and maximize Lighthouse scores
const AboutUs = lazy(() => import("./components/AboutUs"));
const SermonCenter = lazy(() => import("./components/SermonCenter"));
const EventsSystem = lazy(() => import("./components/EventsSystem"));
const MinistriesSection = lazy(() => import("./components/MinistriesSection"));
const MediaCenter = lazy(() => import("./components/MediaCenter"));
const PrayerBible = lazy(() => import("./components/PrayerBible"));
const MembershipDirectory = lazy(() => import("./components/MembershipDirectory"));
const DonationsSection = lazy(() => import("./components/DonationsSection"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const ContactPage = lazy(() => import("./components/ContactPage"));
const MobileIntegration = lazy(() => import("./components/MobileIntegration"));
const AiChatAssistant = lazy(() => import("./components/AiChatAssistant"));
const NewsBlog = lazy(() => import("./components/NewsBlog"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const PastorMessage = lazy(() => import("./components/PastorMessage"));
const DailyVerse = lazy(() => import("./components/DailyVerse"));
const ServiceTimes = lazy(() => import("./components/ServiceTimes"));

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [language, setLanguage] = useState<"en" | "ss">("en");

  console.log("App component mounted correctly");
  React.useEffect(() => { console.log("App mounted"); }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-gold-500/30 selection:text-primary-950">
      
      {/* Dynamic Church Announcement alert Banner */}
      <div className="bg-gold-500 text-primary-950 text-xs py-2 px-4 text-center font-heading font-extrabold tracking-wide uppercase flex items-center justify-center space-x-2 shadow-inner">
        <BellRing className="h-4 w-4 animate-bounce shrink-0" />
        <span>
          {language === "en"
            ? "Announcement: High School Study Fellowship begins this Saturday at 02:00 PM!"
            : "Simemetelo: Inhlangano Yentsha Yebantfwana Besikolo Icala Ngalesisihlanu ngensimbi yasibili!"}
        </span>
      </div>

      {/* Header element */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Primary Tab-based Content router */}
      <main className="flex-1 pb-16">
        <Suspense fallback={<PageLoading />}>
          {currentTab === "home" && (
            <div className="animate-fade-in">
              <Hero setCurrentTab={setCurrentTab} language={language} />
              <DailyVerse language={language} />
              <PastorMessage language={language} />
              <ServiceTimes language={language} />
              <SermonCenter language={language} />
              <EventsSystem language={language} />
              <MinistriesSection language={language} />
              <Testimonials language={language} />
              <PrayerBible language={language} />
              <DonationsSection language={language} />
              <div className="bg-white py-12 border-b border-slate-100">
                <NewsBlog language={language} />
              </div>
            </div>
          )}

          {currentTab === "about" && (
            <div className="animate-fade-in">
              <AboutUs language={language} />
            </div>
          )}

          {currentTab === "sermons" && (
            <div className="animate-fade-in">
              <SermonCenter language={language} />
            </div>
          )}

          {currentTab === "events" && (
            <div className="animate-fade-in">
              <EventsSystem language={language} />
            </div>
          )}

          {currentTab === "ministries" && (
            <div className="animate-fade-in">
              <MinistriesSection language={language} />
            </div>
          )}

          {currentTab === "media_outreach" && (
            <div className="animate-fade-in">
              <MediaCenter language={language} />
            </div>
          )}

          {currentTab === "prayer_bible" && (
            <div className="animate-fade-in">
              <PrayerBible language={language} />
            </div>
          )}

          {currentTab === "membership" && (
            <div className="animate-fade-in">
              <MembershipDirectory language={language} />
            </div>
          )}

          {currentTab === "donations" && (
            <div className="animate-fade-in">
              <DonationsSection language={language} />
            </div>
          )}

          {currentTab === "admin" && (
            <div className="animate-fade-in">
              <AdminDashboard language={language} />
            </div>
          )}

          {currentTab === "contact" && (
            <div className="animate-fade-in">
              <ContactPage language={language} />
            </div>
          )}

          {currentTab === "mobile_sync" && (
            <div className="animate-fade-in">
              <MobileIntegration language={language} />
            </div>
          )}
        </Suspense>
      </main>

      {/* Retractable Floating AI Care Chatbot */}
      <Suspense fallback={null}>
        <AiChatAssistant language={language} />
      </Suspense>

      {/* Beautiful Crafted Footer */}
      <footer className="bg-primary-950 text-white border-t border-slate-800 py-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="flex justify-center items-center space-x-2">
            <Heart className="h-5 w-5 text-gold-500 fill-gold-500 animate-pulse" />
            <span className="font-heading font-extrabold tracking-widest text-sm uppercase">FONTEYN EVANGELICAL CHURCH</span>
          </div>

          <p className="text-slate-400 font-sans text-xs max-w-lg mx-auto leading-relaxed">
            {language === "en"
              ? "Worshipping God, sharing the Gospel of Calvary, making disciples, and serving the beautiful hills of Fonteyn and Mbabane, H100, Eswatini."
              : "Khulekela Nkulunkulu, sabelana ngevangeli yaseCalvary, senta bafundi beqiniso, siphindze sisita emagquma aseFonteyn naseMbabane, Eswatini."}
          </p>

          <div className="text-[10px] text-slate-500 font-mono space-y-1">
            <p>© 2026 Fonteyn Evangelical Church Governance. All Rights Secured.</p>
            <p>Certified Eswatini Non-Profit Christian Trust • Mbabane</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
