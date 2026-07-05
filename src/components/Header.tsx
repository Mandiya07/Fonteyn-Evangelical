import React, { useState } from "react";
import { Church, Languages, Menu, X, Shield, Settings, Heart } from "lucide-react";
import { translations } from "../lib/translations";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: "en" | "ss";
  setLanguage: (lang: "en" | "ss") => void;
}

export default function Header({ currentTab, setCurrentTab, language, setLanguage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", labelKey: "navHome" },
    { id: "about", labelKey: "navAbout" },
    { id: "sermons", labelKey: "navSermons" },
    { id: "events", labelKey: "navEvents" },
    { id: "ministries", labelKey: "navMinistries" },
    { id: "media_outreach", labelKey: "navMedia" },
    { id: "prayer_bible", labelKey: "navPrayer" },
    { id: "membership", labelKey: "navMembership" },
    { id: "donations", labelKey: "navDonations" },
    { id: "contact", labelKey: "navContact" },
    { id: "mobile_sync", labelKey: "navMobileSync" },
    { id: "admin", labelKey: "navAdmin", isSpecial: true }
  ];

  // Dynamically sort middle navigation items alphabetically based on selected language
  // while keeping Home as the first item and Admin as the last item.
  const sortedNavItems = React.useMemo(() => {
    const homeItem = navItems.find((item) => item.id === "home");
    const adminItem = navItems.find((item) => item.id === "admin");
    const middleItems = navItems.filter((item) => item.id !== "home" && item.id !== "admin");

    const sortedMiddle = [...middleItems].sort((a, b) => {
      const labelA = translations[a.labelKey]?.[language] || a.id;
      const labelB = translations[b.labelKey]?.[language] || b.id;
      return labelA.localeCompare(labelB, language, { sensitivity: "base" });
    });

    const result = [];
    if (homeItem) result.push(homeItem);
    result.push(...sortedMiddle);
    if (adminItem) result.push(adminItem);
    return result;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ss" : "en");
  };

  const selectTab = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-primary-800 text-white shadow-lg border-b border-gold-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => selectTab("home")}>
            <div className="bg-gold-500 text-primary-900 p-2 rounded-xl shadow-md border border-white/20 transition-transform hover:scale-105">
              <Church className="h-7 w-7" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight block">
                FONTEYN
              </span>
              <span className="text-gold-400 font-sans text-xs tracking-widest font-semibold uppercase block -mt-1">
                Evangelical Church
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {sortedNavItems.map((item) => {
              const isActive = currentTab === item.id;
              const label = translations[item.labelKey]?.[language] || item.id;
              
              if (item.isSpecial) {
                return (
                  <button
                    key={item.id}
                    onClick={() => selectTab(item.id)}
                    className={`ml-1 2xl:ml-2 px-2 2xl:px-4 py-2 rounded-lg font-heading text-[11px] 2xl:text-xs uppercase tracking-wider font-bold border transition-all ${
                      isActive
                        ? "bg-gold-500 border-gold-500 text-primary-950 shadow-md"
                        : "border-gold-500/50 text-gold-400 hover:bg-gold-500 hover:text-primary-950"
                    }`}
                  >
                    <span className="flex items-center space-x-1.5">
                      <Settings className="h-3.5 w-3.5" />
                      <span>{label}</span>
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => selectTab(item.id)}
                  className={`px-2 2xl:px-3 py-2 rounded-lg font-heading text-[11px] 2xl:text-sm transition-all hover:text-gold-400 font-medium ${
                    isActive
                      ? "text-gold-400 bg-primary-900/40 border-b-2 border-gold-500 rounded-b-none"
                      : "text-slate-100 hover:bg-primary-700/50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Utilities (Language Toggle & Mobile Menu) */}
          <div className="flex items-center space-x-3">
            {/* Instant translation switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 bg-primary-900/60 hover:bg-primary-700 text-slate-100 hover:text-gold-400 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-heading font-medium tracking-wide uppercase transition-all shadow-inner"
              title="Switch Language"
            >
              <Languages className="h-4 w-4 text-gold-500" />
              <span>{language === "en" ? "Siswati" : "English"}</span>
            </button>

            {/* Hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden bg-primary-900/50 hover:bg-primary-700 p-2 rounded-lg text-slate-200 hover:text-white border border-slate-700/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-primary-900/95 border-t border-primary-700 backdrop-blur-md animate-fade-in max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="px-2 pt-3 pb-6 space-y-1.5">
            {sortedNavItems.map((item) => {
              const isActive = currentTab === item.id;
              const label = translations[item.labelKey]?.[language] || item.id;

              if (item.isSpecial) {
                return (
                  <button
                    key={item.id}
                    onClick={() => selectTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left font-heading font-bold text-sm tracking-wide ${
                      isActive
                        ? "bg-gold-500 text-primary-950"
                        : "bg-primary-800 text-gold-400 border border-gold-500/30"
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>{label}</span>
                    </span>
                    <span className="bg-primary-900/30 text-[10px] px-2 py-0.5 rounded font-mono font-normal">FEC ADMIN</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => selectTab(item.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg font-heading text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-800 text-gold-400 border-l-4 border-gold-500"
                      : "text-slate-100 hover:bg-primary-800/60"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
