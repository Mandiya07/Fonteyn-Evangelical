import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Check,
  Send,
  MessageSquare,
  Facebook,
  Youtube,
  ShieldAlert,
  Compass,
  Copy,
  ExternalLink,
  Calendar,
  AlertTriangle,
  HeartHandshake
} from "lucide-react";
import { translations } from "../lib/translations";

interface ContactPageProps {
  language: "en" | "ss";
}

export default function ContactPage({ language }: ContactPageProps) {
  // Form submission state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // WhatsApp draft state
  const [whatsappTemplate, setWhatsappTemplate] = useState("prayer");
  const [customWhatsappMsg, setCustomWhatsappMsg] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Localized text translations
  const t = {
    title: {
      en: "Contact & Pastoral Care Desk",
      ss: "Litiko lekuchhumana nemiKhuleko"
    },
    subtitle: {
      en: "We are always ready to listen, pray, counsel, and welcome you. Reach out to us through any of our channels.",
      ss: "Sihlale tilungele kulalela, kukhuleka, nekuwemukela. Chhumana natsi ngaleti tindlela letilandelako."
    },
    churchAddress: {
      en: "Church Campus Address",
      ss: "Likheli leLisontfo leFonteyn"
    },
    serviceTimesTitle: {
      en: "Weekly Worship & Services",
      ss: "Tinsimbi teKukhonza teLisontfo"
    },
    contactFormTitle: {
      en: "Send us a direct message",
      ss: "Tfumela umlayeto wekuvakasha nobe kukhonza"
    },
    emergencySectionTitle: {
      en: "24/7 Spiritual & Crisis Support",
      ss: "Tinombolo teSimo lesiphuthumako neMthandazo"
    },
    whatsappTitle: {
      en: "WhatsApp Altar & Chat Connect",
      ss: "Kuchhumana ku-WhatsApp noMthandazo"
    },
    interactiveMapTitle: {
      en: "Interactive Google Map",
      ss: "Imebhe ye-Google Map Leyisebentako"
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    // Honeypot check for spam protection
    if ((formData as any).honeypot) {
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: ""
      });
      setTimeout(() => setSuccess(false), 5000);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/contact-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "General Inquiry",
          message: ""
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const errData = await response.json();
        setError(errData.error || "Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // WhatsApp helper
  const getWhatsappLink = () => {
    const defaultMessages: Record<string, string> = {
      prayer: "Hello Pastor, I would like to request pastoral prayers for myself/family regarding...",
      visit: "Peace be with you. I am planning to attend Fonteyn Evangelical Church this coming Sunday and would love to connect!",
      ministry: "Hi, I would love to get involved in serving with the church ministries! Please guide me.",
      other: customWhatsappMsg || "Greetings, I am reaching out to Fonteyn Evangelical Church from the website..."
    };

    const finalMsg = whatsappTemplate === "other" ? customWhatsappMsg : defaultMessages[whatsappTemplate];
    return `https://wa.me/26876058257?text=${encodeURIComponent(finalMsg || "")}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="contact-page-module">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest font-heading font-extrabold text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
          {language === "en" ? "Get In Touch" : "Xhumana Natsi"}
        </span>
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-950 mt-3 tracking-tight">
          {t.title[language]}
        </h2>
        <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full mt-3 mb-4"></div>
        <p className="text-slate-600 font-sans text-sm sm:text-base leading-relaxed">
          {t.subtitle[language]}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column (8 Cols on Desktop) - Map, Contact Form, WhatsApp */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Contact Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Campus Address Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-gold-500/50 transition-all">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary-50 rounded-bl-full -z-10 opacity-60"></div>
              <div className="bg-primary-50 p-2.5 rounded-xl text-primary-900 w-fit mb-3">
                <MapPin className="h-5 w-5 text-primary-800" />
              </div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">
                {language === "en" ? "Physical Campus" : "Likheli LeLisontfo"}
              </h4>
              <p className="text-primary-950 font-heading font-bold text-sm mt-1">Fonteyn Hill Campus</p>
              <p className="text-slate-500 font-sans text-xs mt-0.5">Mbabane, H100, Eswatini</p>
              <button
                onClick={() => triggerCopy("Fonteyn Hill Campus, Mbabane, Eswatini", "address")}
                className="mt-3 text-[10px] text-primary-800 hover:text-primary-950 font-heading font-bold uppercase tracking-wider flex items-center space-x-1"
              >
                <Copy className="h-3 w-3" />
                <span>{copiedText === "address" ? "Copied!" : "Copy Address"}</span>
              </button>
            </div>

            {/* Direct Telephone Desk Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-gold-500/50 transition-all">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -z-10 opacity-60"></div>
              <div className="bg-amber-50 p-2.5 rounded-xl text-amber-900 w-fit mb-3">
                <Phone className="h-5 w-5 text-amber-700" />
              </div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">
                {language === "en" ? "Official Telephones" : "Tinombolo Telucingo"}
              </h4>
              <p className="text-primary-950 font-heading font-bold text-sm mt-1">
                <a href="tel:+26876058257" className="hover:underline">+268 7605 8257</a>
              </p>
              <p className="text-slate-500 font-sans text-[11px] mt-0.5">Admin: <span className="font-semibold text-slate-700">+268 7605 8257</span></p>
              <button
                onClick={() => triggerCopy("+26876058257", "phone")}
                className="mt-3 text-[10px] text-primary-800 hover:text-primary-950 font-heading font-bold uppercase tracking-wider flex items-center space-x-1"
              >
                <Copy className="h-3 w-3" />
                <span>{copiedText === "phone" ? "Copied!" : "Copy Main Phone"}</span>
              </button>
            </div>

            {/* Direct Email Desks Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-gold-500/50 transition-all">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-10 opacity-60"></div>
              <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-900 w-fit mb-3">
                <Mail className="h-5 w-5 text-emerald-700" />
              </div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">
                {language === "en" ? "Official Emails" : "Tikheli teI-meyili"}
              </h4>
              <p className="text-primary-950 font-mono text-xs font-semibold mt-1">
                <a href="mailto:info@fonteynevangelical.org.sz" className="hover:underline break-all">info@fonteynevangelical.org.sz</a>
              </p>
              <p className="text-slate-500 font-sans text-[11px] mt-0.5">Prayer: <span className="font-mono text-slate-700">prayer@fonteynevangelical.org.sz</span></p>
              <button
                onClick={() => triggerCopy("info@fonteynevangelical.org.sz", "email")}
                className="mt-3 text-[10px] text-primary-800 hover:text-primary-950 font-heading font-bold uppercase tracking-wider flex items-center space-x-1"
              >
                <Copy className="h-3 w-3" />
                <span>{copiedText === "email" ? "Copied!" : "Copy Main Email"}</span>
              </button>
            </div>
          </div>

          {/* Contact Form Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80" id="contact-form-section">
            <h3 className="font-heading font-bold text-lg text-primary-950 mb-1 flex items-center space-x-2">
              <Mail className="h-5 w-5 text-gold-500" />
              <span>{t.contactFormTitle[language]}</span>
            </h3>
            <p className="text-slate-500 text-xs font-sans mb-6">
              {language === "en"
                ? "Fill out this form to request pastoral counseling, schedule a baby dedication, ask questions, or request prayer support."
                : "Gcwalisa leli fomu kute utfole lusito lwemkhuleko, ukhulume nemfundisi, nobe ubuze mibuto."}
            </p>

            {success ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="font-heading font-bold text-emerald-950 text-sm uppercase tracking-wide">
                  {language === "en" ? "Message Submitted Successfully" : "Umlayeto utfunyelwe ngemphumelelo"}
                </h4>
                <p className="text-slate-600 text-xs max-w-md mx-auto leading-relaxed">
                  {language === "en"
                    ? "Thank you! Your inquiry has been logged securely in our church database. An administrative officer or elder will contact you within 24 hours."
                    : "Ngiyabonga! Umlayeto wakho ugcinwe kahle. Umphathi nobe mhloli wetfu utawuchhumana nawe kungakapheli amahora langamashumi mabili namane."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-rose-600 text-xs font-sans font-medium bg-rose-50 p-3 rounded-lg border border-rose-100">
                    ⚠️ {error}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                      {language === "en" ? "Your Name *" : "Ligama Lakho *"}
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Sipho Dlamini"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 font-sans"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                      {language === "en" ? "Email Address *" : "I-Meyili yakho *"}
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. sipho@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                      {language === "en" ? "Phone Number (Optional)" : "Lucingo Lwakho (Kungakhetsi)"}
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="e.g. +268 7602 5678"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                    {language === "en" ? "Inquiry Subject *" : "Sihloko Semlayeto *"}
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-600 font-sans"
                  >
                    <option value="General Inquiry">{language === "en" ? "General Inquiry / Hello" : "Imibuto Javulekile"}</option>
                    <option value="Prayer Request">{language === "en" ? "Request Personal Prayer" : "Mthandazo Wesihloko"}</option>
                    <option value="Counseling Request">{language === "en" ? "Schedule Pastoral Counseling" : "Kubona Umfundisi"}</option>
                    <option value="Ministry Service">{language === "en" ? "Inquire about serving" : "Kubamba liqhaza etingabeni"}</option>
                    <option value="Donation Query">{language === "en" ? "Tithing & Donation assistance" : "Imikhombandlela yokunikela"}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                    {language === "en" ? "Detailed Message *" : "Umlayeto Ugcwele *"}
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder={language === "en" ? "How can we walk with you, serve you, or pray for you today..." : "Bhala ngenhlonipho imininingwane..."}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 font-sans leading-relaxed"
                    required
                  ></textarea>
                </div>

                {/* Honeypot field for spam protection */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input
                    type="text"
                    name="contact_me_by_fax_only"
                    tabIndex={-1}
                    autoComplete="off"
                    onChange={(e) => {
                      if (e.target.value) {
                        setFormData((prev) => ({ ...prev, honeypot: e.target.value }));
                      }
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-800 hover:bg-primary-900 disabled:bg-primary-300 text-white font-heading font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow hover:shadow-md flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>{language === "en" ? "Submit Inquiry" : "Tfumela Umlayeto"}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Interactive Google Map embed component */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-primary-950 flex items-center space-x-2">
                  <Compass className="h-5 w-5 text-gold-500" />
                  <span>{t.interactiveMapTitle[language]}</span>
                </h3>
                <p className="text-slate-500 text-xs font-sans">
                  {language === "en" ? "Find us in the beautiful Fonteyn valley, just minutes from central Mbabane." : "Sithole emagqumeni amahle eFonteyn, kuseduze naseMbabane Central."}
                </p>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Fonteyn+Evangelical+Church+Mbabane+Eswatini"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-heading font-bold uppercase tracking-wider flex items-center space-x-1 transition-all"
              >
                <span>{language === "en" ? "Open in Google Maps" : "Vula ku-Google Maps"}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Embed container with map-height preservation */}
            <div className="h-80 w-full rounded-2xl overflow-hidden border border-slate-200/60 relative shadow-inner">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14316.51865248235!2d31.1444!3d-26.3150!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ef38fb9279774e1%3A0xc39cb7e7191147cc!2sMbabane%2C%20Eswatini!5e0!3m2!1sen!2szw!4v1719999999999!5m2!1sen!2szw"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Fonteyn Evangelical Church Location Map"
                className="w-full h-full"
              ></iframe>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>📍 Coordinates: 26.3150° S, 31.1444° E</span>
              <span>🗺️ Fonteyn-Mbabane Highway</span>
            </div>
          </div>
        </div>

        {/* Right column (4 Cols on Desktop) - Service Times, Emergency hotlines, WhatsApp */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Service Times Box */}
          <div className="bg-primary-950 text-white rounded-3xl p-6 shadow-md border border-primary-900">
            <h3 className="font-heading font-bold text-base text-gold-400 mb-3 flex items-center space-x-2 border-b border-primary-900 pb-3">
              <Calendar className="h-5 w-5 text-gold-400" />
              <span>{t.serviceTimesTitle[language]}</span>
            </h3>

            <div className="space-y-4">
              <div className="border-b border-primary-900/40 pb-2.5">
                <p className="font-heading font-bold text-xs text-gold-500 uppercase tracking-wide">
                  {language === "en" ? "Sunday Morning Service" : "Inkonzo yaLisontfo"}
                </p>
                <p className="text-white font-sans text-sm font-semibold">09:00 AM - 11:30 AM</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {language === "en" ? "Holy Communion (First Sundays) & Bible Teaching" : "Inkonzo yesiphohlo nembili nemicimbi lebalulekile"}
                </p>
              </div>

              <div className="border-b border-primary-900/40 pb-2.5">
                <p className="font-heading font-bold text-xs text-gold-500 uppercase tracking-wide">
                  {language === "en" ? "Sunday Evening Devotion" : "Inkonzo yaKusihlwa"}
                </p>
                <p className="text-white font-sans text-sm font-semibold">05:00 PM - 06:30 PM</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {language === "en" ? "Fireside Scripture & Communal Devotions" : "Mthandazo nekulalela litwi lemfundisi kusihlwa"}
                </p>
              </div>

              <div className="border-b border-primary-900/40 pb-2.5">
                <p className="font-heading font-bold text-xs text-gold-500 uppercase tracking-wide">
                  {language === "en" ? "Wednesday Bible Study" : "Mfundvo weliBhayibheli"}
                </p>
                <p className="text-white font-sans text-sm font-semibold">06:00 PM - 07:30 PM</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {language === "en" ? "Systematic scriptural deep-dives and small groups" : "Kujula ngeMbhalo kanye nemacembu emthandazo"}
                </p>
              </div>

              <div className="border-b border-primary-900/40 pb-2.5">
                <p className="font-heading font-bold text-xs text-gold-500 uppercase tracking-wide">
                  {language === "en" ? "Friday Youth Altar Nights" : "Umthandazo weBasha"}
                </p>
                <p className="text-white font-sans text-sm font-semibold">06:00 PM - 08:30 PM</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {language === "en" ? "Deep prayer, energetic worship for youth & seekers" : "Umthandazo losebasha, kudvumisa, nentsha"}
                </p>
              </div>

              <div>
                <p className="font-heading font-bold text-xs text-gold-500 uppercase tracking-wide">
                  {language === "en" ? "Saturday Outreach" : "Kusita live ngeMgcibelo"}
                </p>
                <p className="text-white font-sans text-sm font-semibold">10:00 AM - 01:00 PM</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {language === "en" ? "Community blanket & food relief distribution" : "Kusakatwa kwemablankethe nekudla emphakathini"}
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contact Information Section */}
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm" id="emergency-support-section">
            <h3 className="font-heading font-bold text-base text-rose-950 flex items-center space-x-2 border-b border-rose-200/60 pb-3 mb-4">
              <ShieldAlert className="h-5.5 w-5.5 text-rose-600 animate-pulse" />
              <span>{t.emergencySectionTitle[language]}</span>
            </h3>

            <p className="text-slate-700 font-sans text-xs leading-relaxed mb-4">
              {language === "en"
                ? "If you are in personal distress, facing a family emergency, in deep grief, or needing immediate prayer counseling, please contact our 24/7 designated pastoral care lines immediately."
                : "Ube sesimeni lesimatima nobe udinga mthandazo wemanyala ngokushesha, tsatsa letinombolo usebentise noma ngasiphi sikhathi sekushona kwelanga."}
            </p>

            <div className="space-y-3.5">
              <div className="bg-white rounded-xl p-3.5 border border-rose-100 flex items-start space-x-3">
                <HeartHandshake className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading font-bold text-xs text-rose-950">{language === "en" ? "24/7 Spiritual & Counsel Line" : "Lucingo loMkhuleko loVulekile"}</p>
                  <p className="text-rose-700 font-mono text-sm font-extrabold mt-0.5">
                    <a href="tel:+26878123456" className="hover:underline">+268 7812 3456</a>
                  </p>
                  <p className="text-slate-500 text-[10px]">{language === "en" ? "Attended by on-duty Elder or Pastor" : "Kubanjwa nguMfundisi nobe uMdala okhona"}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3.5 border border-rose-100 flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading font-bold text-xs text-slate-800">{language === "en" ? "National Hospital & Clinic" : "Sipitela neMtholampilo"}</p>
                  <p className="text-slate-700 font-mono text-sm font-bold mt-0.5">
                    <a href="tel:+26824043111" className="hover:underline">+268 2404 3111</a>
                  </p>
                  <p className="text-slate-500 text-[10px]">{language === "en" ? "Mbabane Emergency Medical Ward" : "Litiko lekuHlangulwa kweMbabane Clinic"}</p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-rose-800 font-sans italic mt-4 text-center">
              "The Lord is near to all who call on him." — Psalm 145:18
            </p>
          </div>

          {/* WhatsApp Integration Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm" id="whatsapp-integration-section">
            <h3 className="font-heading font-bold text-base text-emerald-950 flex items-center space-x-2 border-b border-emerald-200 pb-3 mb-4">
              <MessageSquare className="h-5.5 w-5.5 text-emerald-600 fill-emerald-600" />
              <span>{t.whatsappTitle[language]}</span>
            </h3>

            <p className="text-emerald-900 font-sans text-xs leading-relaxed mb-4">
              {language === "en"
                ? "Launch a direct secure chat with the Pastor's Altar on WhatsApp. Choose a template or type a message below."
                : "Thumela umlayeto longuyena ku-WhatsApp yeMfundisi. Khetsa siphakamiso setfu nobe ubhale ngezansi."}
            </p>

            <div className="space-y-3">
              {/* Predefined message options */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setWhatsappTemplate("prayer")}
                  className={`px-1.5 py-2 text-[10px] font-heading font-bold rounded-lg border text-center transition-all ${
                    whatsappTemplate === "prayer"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-100/50"
                  }`}
                >
                  {language === "en" ? "Prayer Request" : "Mthandazo"}
                </button>
                <button
                  type="button"
                  onClick={() => setWhatsappTemplate("visit")}
                  className={`px-1.5 py-2 text-[10px] font-heading font-bold rounded-lg border text-center transition-all ${
                    whatsappTemplate === "visit"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-100/50"
                  }`}
                >
                  {language === "en" ? "Worship Visit" : "Kuvakasha"}
                </button>
                <button
                  type="button"
                  onClick={() => setWhatsappTemplate("other")}
                  className={`px-1.5 py-2 text-[10px] font-heading font-bold rounded-lg border text-center transition-all ${
                    whatsappTemplate === "other"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-100/50"
                  }`}
                >
                  {language === "en" ? "Custom Draft" : "Okunye"}
                </button>
              </div>

              {whatsappTemplate === "other" && (
                <textarea
                  rows={3}
                  value={customWhatsappMsg}
                  onChange={(e) => setCustomWhatsappMsg(e.target.value)}
                  placeholder={language === "en" ? "Write your custom WhatsApp message here..." : "Bhala umlayeto wakho ku-WhatsApp..."}
                  className="w-full p-2.5 text-xs bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-sans"
                />
              )}

              <a
                href={getWhatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow flex items-center justify-center space-x-1.5"
              >
                <MessageSquare className="h-4.5 w-4.5" />
                <span>{language === "en" ? "Launch WhatsApp Chat" : "Xoxa ku-WhatsApp"}</span>
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
