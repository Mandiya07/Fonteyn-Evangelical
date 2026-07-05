import { safeStorage } from "../lib/storage";
import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Wifi,
  Battery,
  Terminal,
  Send,
  Database,
  RefreshCw,
  User,
  Lock,
  Mail,
  Plus,
  Search,
  Bell,
  Calendar,
  BookOpen,
  Cpu,
  Layers,
  Globe,
  ChevronRight,
  Play,
  CheckCircle,
  ExternalLink,
  AlertTriangle,
  Heart,
  Briefcase,
  Sliders,
  LogOut,
  MapPin,
  Clock,
  Phone,
  FileText
} from "lucide-react";
import { Sermon, Event, Member } from "../types";

interface MobileIntegrationProps {
  language: "en" | "ss";
}

interface Notification {
  id: string;
  title: string;
  body: string;
  topic: string;
  sentBy: string;
  date: string;
}

export default function MobileIntegration({ language }: MobileIntegrationProps) {
  // Navigation tabs for the developer dashboard
  const [activeDashTab, setActiveDashTab] = useState<"simulator" | "sandbox" | "docs">("simulator");

  // Mobile App state within the simulator
  const [authToken, setAuthToken] = useState<string | null>(() => safeStorage.getItem("fec_mobile_token"));
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [simScreen, setSimScreen] = useState<"splash" | "login" | "register" | "home">("splash");
  const [simTab, setSimTab] = useState<"feed" | "sermons" | "events" | "profile">("feed");

  // Simulator UI Inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("+268 ");
  const [regDistrict, setRegDistrict] = useState("Fonteyn");

  // Live collections synced inside the simulator
  const [syncedSermons, setSyncedSermons] = useState<Sermon[]>([]);
  const [syncedEvents, setSyncedEvents] = useState<Event[]>([]);
  const [syncedNotifications, setSyncedNotifications] = useState<Notification[]>([]);
  const [sermonSearch, setSermonSearch] = useState("");
  const [eventCategory, setEventCategory] = useState("All");
  
  // Profile editor state in the phone
  const [editPhone, setEditPhone] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  // Live status / simulation metrics
  const [simNetworkLoading, setSimNetworkLoading] = useState(false);
  const [simError, setSimError] = useState("");

  // Sandbox REST Client state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("GET /api/mobile/sermons/sync");
  const [sandboxQueryParams, setSandboxQueryParams] = useState<Record<string, string>>({
    since: "2026-06-01",
    search: "",
    limit: "10",
    offset: "0"
  });
  const [sandboxHeaders, setSandboxHeaders] = useState<Record<string, string>>({
    "Content-Type": "application/json",
    "Authorization": "Bearer mock-jwt-token-m1_1719999999999"
  });
  const [sandboxBody, setSandboxBody] = useState<string>(`{\n  "email": "siphom.yati@gmail.com",\n  "password": "password123"\n}`);
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [sandboxRespStatus, setSandboxRespStatus] = useState<number | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  // Broadcast Notification Form
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastTopic, setBroadcastTopic] = useState("General");
  const [broadcastSender, setBroadcastSender] = useState("Pastor Sipho");
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [broadcastError, setBroadcastError] = useState("");

  // System time for smartphone screen
  const [currentTimeStr, setCurrentTimeStr] = useState("09:00");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let mins = now.getMinutes().toString().padStart(2, "0");
      setCurrentTimeStr(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync / fetch database resources when tab shifts or login occurs
  const syncSermons = async () => {
    try {
      setSimNetworkLoading(true);
      const url = `/api/mobile/sermons/sync?search=${encodeURIComponent(sermonSearch)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSyncedSermons(data.sermons || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimNetworkLoading(false);
    }
  };

  const syncEvents = async () => {
    try {
      setSimNetworkLoading(true);
      const url = `/api/mobile/events/sync?category=${encodeURIComponent(eventCategory)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSyncedEvents(data.events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimNetworkLoading(false);
    }
  };

  const syncNotifications = async () => {
    try {
      const res = await fetch("/api/mobile/notifications");
      if (res.ok) {
        const data = await res.json();
        setSyncedNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sync profile data using current token
  const fetchMyProfile = async (tokenStr: string) => {
    try {
      setSimNetworkLoading(true);
      const res = await fetch("/api/mobile/auth/me", {
        headers: {
          "Authorization": `Bearer ${tokenStr}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentMember(data.member);
        setEditPhone(data.member.phone || "");
        setEditDistrict(data.member.district || "");
        setEditBio(data.member.bio || "");
        setSimScreen("home");
      } else {
        // Token expired/invalid
        setAuthToken(null);
        safeStorage.removeItem("fec_mobile_token");
        setSimScreen("splash");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimNetworkLoading(false);
    }
  };

  // Run initial syncs
  useEffect(() => {
    syncNotifications();
    syncSermons();
    syncEvents();
    if (authToken) {
      fetchMyProfile(authToken);
    } else {
      setSimScreen("splash");
    }
  }, []);

  // Trigger sermons sync on search changes
  useEffect(() => {
    syncSermons();
  }, [sermonSearch]);

  // Trigger events sync on category changes
  useEffect(() => {
    syncEvents();
  }, [eventCategory]);

  // Simulator authentication handlers
  const handleMobileLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    try {
      setSimNetworkLoading(true);
      setSimError("");
      const res = await fetch("/api/mobile/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthToken(data.token);
        safeStorage.setItem("fec_mobile_token", data.token);
        setCurrentMember(data.member);
        setEditPhone(data.member.phone || "");
        setEditDistrict(data.member.district || "");
        setEditBio(data.member.bio || "");
        setSimScreen("home");
        setSimTab("feed");
        // Update headers in sandbox to match current logged in token
        setSandboxHeaders(prev => ({
          ...prev,
          "Authorization": `Bearer ${data.token}`
        }));
      } else {
        setSimError(data.error || "Login failed");
      }
    } catch (err) {
      setSimError("Network error connecting to mobile APIs.");
    } finally {
      setSimNetworkLoading(false);
    }
  };

  const handleMobileRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !regName) return;

    try {
      setSimNetworkLoading(true);
      setSimError("");
      const res = await fetch("/api/mobile/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          name: regName,
          phone: regPhone,
          district: regDistrict
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthToken(data.token);
        safeStorage.setItem("fec_mobile_token", data.token);
        setCurrentMember(data.member);
        setEditPhone(data.member.phone || "");
        setEditDistrict(data.member.district || "");
        setEditBio(data.member.bio || "");
        setSimScreen("home");
        setSimTab("feed");
        setSandboxHeaders(prev => ({
          ...prev,
          "Authorization": `Bearer ${data.token}`
        }));
      } else {
        setSimError(data.error || "Registration failed");
      }
    } catch (err) {
      setSimError("Network error connecting to mobile registration API.");
    } finally {
      setSimNetworkLoading(false);
    }
  };

  const handleMobileSignOut = () => {
    setAuthToken(null);
    setCurrentMember(null);
    safeStorage.removeItem("fec_mobile_token");
    setLoginEmail("");
    setLoginPassword("");
    setSimScreen("splash");
  };

  const handleUpdateProfileMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    try {
      setSimNetworkLoading(true);
      setEditSuccess(false);
      const res = await fetch("/api/mobile/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          phone: editPhone,
          district: editDistrict,
          bio: editBio
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentMember(data.member);
        setEditSuccess(true);
        setTimeout(() => setEditSuccess(false), 3000);
      } else {
        setSimError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setSimError("Error updating mobile profile details.");
    } finally {
      setSimNetworkLoading(false);
    }
  };

  const handleRegisterEventMobile = async (eventId: string) => {
    if (!authToken || !currentMember) return;
    try {
      setSimNetworkLoading(true);
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentMember.email })
      });
      if (res.ok) {
        // Reload events list
        syncEvents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimNetworkLoading(false);
    }
  };

  // Developer Broadcast Trigger
  const handlePushBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastBody) return;

    try {
      setBroadcastSuccess(false);
      setBroadcastError("");
      const res = await fetch("/api/mobile/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          body: broadcastBody,
          topic: broadcastTopic,
          sentBy: broadcastSender
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBroadcastSuccess(true);
        setBroadcastTitle("");
        setBroadcastBody("");
        // Reload notifications list
        syncNotifications();
      } else {
        setBroadcastError(data.error || "Push failed");
      }
    } catch (err) {
      setBroadcastError("Network failure sending push notification.");
    }
  };

  // Sandbox API Client trigger
  const executeSandboxRequest = async () => {
    try {
      setSandboxLoading(true);
      setSandboxResponse(null);
      setSandboxRespStatus(null);

      // Extract path and method
      const [method, rawPath] = selectedEndpoint.split(" ");
      let finalPath = rawPath;

      // Replace path parameters if applicable (e.g., placeholder IDs)
      if (finalPath.includes(":id")) {
        finalPath = finalPath.replace(":id", "e1");
      }

      // Format query parameters
      if (method === "GET") {
        const queryStr = Object.entries(sandboxQueryParams)
          .filter(([_, val]) => val !== "")
          .map(([key, val]) => `${key}=${encodeURIComponent(val as string)}`)
          .join("&");
        if (queryStr) {
          finalPath += `?${queryStr}`;
        }
      }

      const options: RequestInit = {
        method,
        headers: sandboxHeaders
      };

      if (method !== "GET" && method !== "DELETE") {
        options.body = sandboxBody;
      }

      const res = await fetch(finalPath, options);
      setSandboxRespStatus(res.status);
      const data = await res.json();
      setSandboxResponse(data);
    } catch (e: any) {
      setSandboxResponse({ error: e.message || "Failed to execute request." });
      setSandboxRespStatus(500);
    } finally {
      setSandboxLoading(false);
    }
  };

  // Update sandbox defaults when endpoint changes
  const handleEndpointChange = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    setSandboxResponse(null);
    setSandboxRespStatus(null);

    // Default bodies/params for endpoints
    if (endpoint.startsWith("POST /api/mobile/auth/login")) {
      setSandboxBody(`{\n  "email": "siphom.yati@gmail.com",\n  "password": "password123"\n}`);
    } else if (endpoint.startsWith("POST /api/mobile/auth/register")) {
      setSandboxBody(`{\n  "email": "new.member@gmail.com",\n  "password": "securePass123",\n  "name": "Thabiso Maseko",\n  "phone": "+268 7611 2233",\n  "district": "Fonteyn"\n}`);
    } else if (endpoint.startsWith("POST /api/mobile/notifications")) {
      setSandboxBody(`{\n  "title": "Evening Fellowship Update",\n  "body": "The evening scripture devotion will start 15 mins later than usual.",\n  "topic": "General",\n  "sentBy": "Admin Desk"\n}`);
    } else if (endpoint.startsWith("PUT /api/mobile/auth/profile")) {
      setSandboxBody(`{\n  "name": "Sipho Dlamini",\n  "phone": "+268 7602 1111",\n  "district": "Mbabane Central",\n  "bio": "Devoted elder and developer of Christian portals."\n}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="mobile-integration-hub">
      {/* Visual Hub Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-heading font-extrabold text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200 inline-block">
            {language === "en" ? "Future Architecture" : "Luhlelo Lwelicophe"}
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary-950 mt-2 tracking-tight">
            {language === "en" ? "Mobile Client API Center" : "Likheli Letincingo Letihambako"}
          </h2>
          <p className="text-slate-500 font-sans text-xs sm:text-sm mt-1">
            {language === "en" 
              ? "Expose, secure, and synchronize church resources with native mobile applications (iOS/Android)."
              : "Vumelanisa tishumayelo, imicimbi, netisusa tetincingo ku-iOS naku-Android."}
          </p>
        </div>

        {/* Dashboard Switchers */}
        <div className="flex bg-slate-100 rounded-xl p-1.5 border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveDashTab("simulator")}
            className={`px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 ${
              activeDashTab === "simulator"
                ? "bg-white text-primary-950 shadow-sm"
                : "text-slate-600 hover:text-primary-950"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5 text-gold-500" />
            <span>{language === "en" ? "Phone Simulator" : "Simathandazo"}</span>
          </button>
          <button
            onClick={() => setActiveDashTab("sandbox")}
            className={`px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 ${
              activeDashTab === "sandbox"
                ? "bg-white text-primary-950 shadow-sm"
                : "text-slate-600 hover:text-primary-950"
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-primary-700" />
            <span>{language === "en" ? "API Sandbox" : "Sandbox"}</span>
          </button>
          <button
            onClick={() => setActiveDashTab("docs")}
            className={`px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 ${
              activeDashTab === "docs"
                ? "bg-white text-primary-950 shadow-sm"
                : "text-slate-600 hover:text-primary-950"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-emerald-600" />
            <span>{language === "en" ? "API Contracts" : "Imisebenti"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Interactive Dashboard Content */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {activeDashTab === "simulator" && (
            <div className="space-y-6">
              {/* Feature Cards Grid (Visual Highlights) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start space-x-3.5">
                  <div className="bg-amber-50 p-2.5 rounded-xl text-amber-700">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">01. Resource Synchronization</h4>
                    <p className="text-primary-950 font-heading font-bold text-sm mt-1">Sermon & Event JSON Buffers</p>
                    <p className="text-slate-500 font-sans text-xs mt-0.5 leading-relaxed">
                      Sync endpoints yield paginated, searchable content. Caches on device for zero-data offline playback and reading.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start space-x-3.5">
                  <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-700">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">02. Push Broadcast Center</h4>
                    <p className="text-primary-950 font-heading font-bold text-sm mt-1">Broadcasting System</p>
                    <p className="text-slate-500 font-sans text-xs mt-0.5 leading-relaxed">
                      Administrators push immediate prayer mandates, weather emergencies, or fellowship notices to topic channels.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start space-x-3.5">
                  <div className="bg-primary-50 p-2.5 rounded-xl text-primary-700">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">03. Member Accounts Desk</h4>
                    <p className="text-primary-950 font-heading font-bold text-sm mt-1">Secure Sign On</p>
                    <p className="text-slate-500 font-sans text-xs mt-0.5 leading-relaxed">
                      Covenant members link their profiles, track giving records, join serving guilds, and check digital communion passes.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start space-x-3.5">
                  <div className="bg-purple-50 p-2.5 rounded-xl text-purple-700">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">04. Live Mobile Simulator</h4>
                    <p className="text-primary-950 font-heading font-bold text-sm mt-1">Real-time Feedback</p>
                    <p className="text-slate-500 font-sans text-xs mt-0.5 leading-relaxed">
                      Interact directly with the smartphone bezel on the right to simulate live REST requests instantly on our church server.
                    </p>
                  </div>
                </div>
              </div>

              {/* Push Notification Panel (Live admin tools) */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
                <h3 className="font-heading font-bold text-base text-primary-950 flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                  <Bell className="h-5 w-5 text-gold-500 fill-gold-500" />
                  <span>Administrative Push Alert Dashboard</span>
                </h3>

                <p className="text-slate-500 text-xs font-sans mb-4 leading-relaxed">
                  Compose an urgent broadcast message below. Submitting this form issues a real `POST /api/mobile/notifications` call to the server database. This notification will immediately appear in the smartphone simulator's live feed as an active push notification.
                </p>

                {broadcastSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-xs font-sans mb-4 flex items-center space-x-2">
                    <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>Notification pushed successfully! It has been broadcast to all mobile users. Check the phone simulator feed!</span>
                  </div>
                )}

                {broadcastError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 text-xs font-sans mb-4">
                    ⚠️ {broadcastError}
                  </div>
                )}

                <form onSubmit={handlePushBroadcast} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                        Topic Channel
                      </label>
                      <select
                        value={broadcastTopic}
                        onChange={(e) => setBroadcastTopic(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-600 font-sans"
                      >
                        <option value="General">General Broadcast</option>
                        <option value="Prayer">Urgent Prayer Call</option>
                        <option value="Youth">Youth Ignite Channel</option>
                        <option value="Emergency">Crisis / Weather Support</option>
                      </select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                        Author Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Pastor Sipho Dlamini"
                        value={broadcastSender}
                        onChange={(e) => setBroadcastSender(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-600 font-sans"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                      Alert Heading / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Midweek Prayer Service Relocated"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-800 font-heading font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                      Detailed Message Body
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Type details that will flash on users' lockscreens..."
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 text-slate-700 font-sans leading-relaxed"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-primary-800 hover:bg-primary-950 text-white font-heading font-extrabold text-xs uppercase tracking-wider py-3 px-5 rounded-xl transition-all shadow hover:shadow-md flex items-center justify-center space-x-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Mobile Push Alert</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeDashTab === "sandbox" && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
              <div>
                <h3 className="font-heading font-bold text-base text-primary-950 flex items-center space-x-2">
                  <Terminal className="h-5 w-5 text-primary-800" />
                  <span>Interactive API Sandbox & Developer Client</span>
                </h3>
                <p className="text-slate-500 text-xs font-sans mt-1">
                  Query live church data models and authentication registers. Modify headers, parameters, and payloads.
                </p>
              </div>

              {/* Endpoint Picker */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                  Target Mobile Endpoint
                </label>
                <select
                  value={selectedEndpoint}
                  onChange={(e) => handleEndpointChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 font-mono text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-800 text-primary-950"
                >
                  <optgroup label="Sermons & Events Sync">
                    <option value="GET /api/mobile/sermons/sync">GET /api/mobile/sermons/sync (Sermons synchronization)</option>
                    <option value="GET /api/mobile/events/sync">GET /api/mobile/events/sync (Events synchronization)</option>
                  </optgroup>
                  <optgroup label="Push Notifications Channel">
                    <option value="GET /api/mobile/notifications">GET /api/mobile/notifications (List notifications)</option>
                    <option value="POST /api/mobile/notifications">POST /api/mobile/notifications (Push message broadcast)</option>
                  </optgroup>
                  <optgroup label="Covenant Accounts Auth & Profile">
                    <option value="POST /api/mobile/auth/register">POST /api/mobile/auth/register (Create / link mobile member)</option>
                    <option value="POST /api/mobile/auth/login">POST /api/mobile/auth/login (Simulate Member Login)</option>
                    <option value="GET /api/mobile/auth/me">GET /api/mobile/auth/me (Get Authenticated Profile)</option>
                    <option value="PUT /api/mobile/auth/profile">PUT /api/mobile/auth/profile (Update Profile details)</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Inputs area: Headers, Parameters or Body */}
                <div className="space-y-4">
                  {/* Auth Header Toggle */}
                  <div className="space-y-1">
                    <span className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                      Headers
                    </span>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[10px] space-y-1 text-slate-600">
                      <div><span className="text-purple-600">Content-Type:</span> application/json</div>
                      <div>
                        <span className="text-purple-600">Authorization:</span> Bearer{" "}
                        <input
                          type="text"
                          value={sandboxHeaders["Authorization"]?.replace("Bearer ", "") || ""}
                          onChange={(e) => setSandboxHeaders(prev => ({ ...prev, "Authorization": `Bearer ${e.target.value}` }))}
                          className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-800 w-36 focus:outline-none"
                          placeholder="token"
                        />
                      </div>
                    </div>
                  </div>

                  {/* GET Query Parameters */}
                  {selectedEndpoint.startsWith("GET") ? (
                    <div className="space-y-2">
                      <span className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                        Query Parameters
                      </span>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                        {Object.entries(sandboxQueryParams).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-500">{key}</span>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => setSandboxQueryParams(prev => ({ ...prev, [key]: e.target.value }))}
                              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs w-2/3 focus:outline-none focus:border-primary-800"
                              placeholder={`val for ${key}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* POST/PUT Body Payload */
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                        JSON Request Payload
                      </label>
                      <textarea
                        rows={6}
                        value={sandboxBody}
                        onChange={(e) => setSandboxBody(e.target.value)}
                        className="w-full p-3 bg-slate-900 text-emerald-400 border border-slate-200 font-mono text-[11px] rounded-xl focus:outline-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={executeSandboxRequest}
                    disabled={sandboxLoading}
                    className="w-full bg-primary-800 hover:bg-primary-950 text-white font-heading font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow hover:shadow-md flex items-center justify-center space-x-1.5"
                  >
                    {sandboxLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send className="h-4 w-4 text-gold-400" />
                        <span>Execute HTTP API Call</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Response Code Block */}
                <div className="space-y-2 h-full flex flex-col justify-between">
                  <div>
                    <span className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                      HTTP Response Status
                    </span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        sandboxRespStatus === null 
                          ? "bg-slate-100 text-slate-500" 
                          : sandboxRespStatus >= 200 && sandboxRespStatus < 300 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {sandboxRespStatus !== null ? `${sandboxRespStatus}` : "Waiting..."}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {sandboxRespStatus !== null 
                          ? (sandboxRespStatus >= 200 && sandboxRespStatus < 300 ? "OK" : "Error")
                          : "Ready to fire"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 flex-1 mt-2">
                    <span className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">
                      JSON Payload Response
                    </span>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] h-64 overflow-y-auto shadow-inner relative">
                      {sandboxResponse ? (
                        <pre className="whitespace-pre-wrap">{JSON.stringify(sandboxResponse, null, 2)}</pre>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs text-center p-4">
                          Execute an API call using the client button to analyze the real structured JSON response payload.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDashTab === "docs" && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
              <div>
                <h3 className="font-heading font-bold text-base text-primary-950 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <span>API Integration Contracts & Recipes</span>
                </h3>
                <p className="text-slate-500 text-xs font-sans mt-1">
                  Use these API routes inside the future Native iOS (Swift) or Android (Kotlin) network clients.
                </p>
              </div>

              <div className="space-y-5">
                {/* Sermon Contract */}
                <div className="border border-slate-200 rounded-2xl p-4 hover:border-gold-500/50 transition-all">
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">GET</span>
                    <code className="text-xs font-mono font-bold text-slate-800">/api/mobile/sermons/sync</code>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Acquires all church sermons, fully filterable by date (`since`), topic keyword, or speaker.
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded-lg font-mono text-[10px] text-slate-600 mt-2 whitespace-pre overflow-x-auto">
                    curl "https://fonteynevangelical.org.sz/api/mobile/sermons/sync?limit=5&since=2026-06-01"
                  </div>
                </div>

                {/* Event Contract */}
                <div className="border border-slate-200 rounded-2xl p-4 hover:border-gold-500/50 transition-all">
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">GET</span>
                    <code className="text-xs font-mono font-bold text-slate-800">/api/mobile/events/sync</code>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Acquires all church calendar workshops, conferences, and community outreach campaigns.
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded-lg font-mono text-[10px] text-slate-600 mt-2 whitespace-pre overflow-x-auto">
                    curl "https://fonteynevangelical.org.sz/api/mobile/events/sync?category=Youth"
                  </div>
                </div>

                {/* Notification Contract */}
                <div className="border border-slate-200 rounded-2xl p-4 hover:border-gold-500/50 transition-all">
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">GET</span>
                    <code className="text-xs font-mono font-bold text-slate-800">/api/mobile/notifications</code>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Fetches pushed community notifications. Mobile app should bind to topic channels to filter alerts.
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded-lg font-mono text-[10px] text-slate-600 mt-2 whitespace-pre overflow-x-auto">
                    curl "https://fonteynevangelical.org.sz/api/mobile/notifications?topic=Prayer"
                  </div>
                </div>

                {/* Authentication Contract */}
                <div className="border border-slate-200 rounded-2xl p-4 hover:border-gold-500/50 transition-all">
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">POST</span>
                    <code className="text-xs font-mono font-bold text-slate-800">/api/mobile/auth/login</code>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Authenticates credentials and returns a secure token for profile modification and event bookings.
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded-lg font-mono text-[10px] text-slate-600 mt-2 whitespace-pre overflow-x-auto">
                    {`curl -X POST "https://fonteynevangelical.org.sz/api/mobile/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"sipho@gmail.com","password":"mypassword"}'`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Phone Simulator */}
        <div className="lg:col-span-5 xl:col-span-4 flex justify-center">
          {/* Smartphone Visual Container */}
          <div className="w-[330px] h-[640px] bg-slate-950 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-800 relative overflow-hidden shrink-0">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-slate-950 rounded-b-xl z-50 flex items-center justify-center">
              <div className="h-1.5 w-12 bg-slate-800 rounded-full"></div>
            </div>

            {/* Simulated Live Network indicator overlay */}
            {simNetworkLoading && (
              <div className="absolute top-7 left-1/2 -translate-x-1/2 z-50 bg-primary-900/90 text-gold-400 border border-gold-500/30 text-[9px] px-2.5 py-0.5 rounded-full font-mono flex items-center space-x-1 shadow">
                <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                <span>SYNCING...</span>
              </div>
            )}

            {/* Inner Phone Content */}
            <div className="w-full h-full bg-slate-50 rounded-[34px] overflow-hidden flex flex-col justify-between select-none relative">
              
              {/* Status Bar */}
              <div className="bg-primary-900 text-white h-7 px-5 pt-1.5 flex justify-between items-center text-[10px] font-sans shrink-0">
                <span className="font-semibold">{currentTimeStr}</span>
                <div className="flex items-center space-x-1.5">
                  <Wifi className="h-3 w-3 text-gold-400" />
                  <span className="text-[8px] font-mono font-bold text-slate-300">5G</span>
                  <Battery className="h-3.5 w-3.5 text-white" />
                </div>
              </div>

              {/* Dynamic Screen View routing inside phone */}
              <div className="flex-1 overflow-y-auto relative bg-slate-50">
                
                {/* 1. SPLASH SCREEN */}
                {simScreen === "splash" && (
                  <div className="p-6 flex flex-col justify-between h-full items-center text-center bg-gradient-to-b from-primary-900 to-primary-950 text-white">
                    <div className="my-auto space-y-4">
                      <div className="h-14 w-14 bg-gold-500 text-primary-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Smartphone className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="font-heading font-extrabold text-base tracking-tight">FONTEYN APP</h4>
                        <span className="text-gold-400 text-[10px] uppercase font-mono tracking-widest block mt-0.5">Mobile Sync client</span>
                      </div>
                      <p className="text-[11px] text-slate-300 max-w-[200px] mx-auto leading-relaxed">
                        Securely synchronize sermons, check fellowship schedules, and receive urgent prayer alerts.
                      </p>
                    </div>

                    <div className="w-full space-y-2 mt-auto">
                      <button
                        onClick={() => { setSimScreen("login"); setSimError(""); }}
                        className="w-full bg-gold-500 hover:bg-gold-600 text-primary-950 text-xs font-heading font-bold py-3 rounded-xl transition-all shadow-md"
                      >
                        Log In with Covenant Account
                      </button>
                      <button
                        onClick={() => { setSimScreen("register"); setSimError(""); }}
                        className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-heading font-bold py-3 rounded-xl transition-all border border-white/10"
                      >
                        Link Existing / New Profile
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. LOGIN SCREEN */}
                {simScreen === "login" && (
                  <div className="p-5 flex flex-col justify-between h-full">
                    <div>
                      <button
                        onClick={() => setSimScreen("splash")}
                        className="text-primary-800 text-[10px] font-heading font-bold uppercase tracking-wider flex items-center space-x-1 mb-4"
                      >
                        ← Back to intro
                      </button>
                      <h4 className="font-heading font-extrabold text-lg text-primary-950">Welcome Back</h4>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">Please sign into your mobile covenantal account.</p>

                      <form onSubmit={handleMobileLogin} className="space-y-3 mt-5">
                        {simError && (
                          <div className="bg-rose-50 border border-rose-100 text-[10px] text-rose-700 p-2.5 rounded-lg leading-relaxed">
                            ⚠️ {simError}
                          </div>
                        )}

                        <div className="space-y-0.5">
                          <label className="text-slate-500 text-[9px] font-heading font-bold uppercase tracking-wider">Email Address</label>
                          <input
                            type="email"
                            placeholder="siphom.yati@gmail.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-slate-500 text-[9px] font-heading font-bold uppercase tracking-wider">Passcode / Password</label>
                          <input
                            type="password"
                            placeholder="password123"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-primary-800 text-white text-xs font-heading font-bold py-2.5 rounded-xl transition-all shadow"
                        >
                          Sign In Securely
                        </button>
                      </form>
                    </div>

                    <p className="text-[10px] text-center text-slate-400 mt-auto leading-tight">
                      Don't have a mobile credential? <br />
                      <span className="text-primary-800 font-semibold cursor-pointer" onClick={() => setSimScreen("register")}>Register now</span>
                    </p>
                  </div>
                )}

                {/* 3. REGISTER SCREEN */}
                {simScreen === "register" && (
                  <div className="p-5 flex flex-col justify-between h-full">
                    <div>
                      <button
                        onClick={() => setSimScreen("splash")}
                        className="text-primary-800 text-[10px] font-heading font-bold uppercase tracking-wider flex items-center space-x-1 mb-4"
                      >
                        ← Back
                      </button>
                      <h4 className="font-heading font-extrabold text-lg text-primary-950">Link Account</h4>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">Create a credential or link an existing record.</p>

                      <form onSubmit={handleMobileRegister} className="space-y-2.5 mt-4">
                        {simError && (
                          <div className="bg-rose-50 border border-rose-100 text-[10px] text-rose-700 p-2.5 rounded-lg leading-relaxed">
                            ⚠️ {simError}
                          </div>
                        )}

                        <div className="space-y-0.5">
                          <label className="text-slate-500 text-[9px] font-heading font-bold uppercase tracking-wider">Full Name</label>
                          <input
                            type="text"
                            placeholder="Sipho Dlamini"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-slate-500 text-[9px] font-heading font-bold uppercase tracking-wider">Email Address</label>
                          <input
                            type="email"
                            placeholder="sipho@example.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-slate-500 text-[9px] font-heading font-bold uppercase tracking-wider">Passcode / Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-slate-500 text-[9px] font-heading font-bold uppercase tracking-wider">Phone</label>
                          <input
                            type="text"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-primary-800 text-white text-xs font-heading font-bold py-2.5 rounded-xl transition-all shadow mt-2"
                        >
                          Register & Sync Profile
                        </button>
                      </form>
                    </div>

                    <p className="text-[10px] text-center text-slate-400 mt-4 leading-tight">
                      Already registered? <br />
                      <span className="text-primary-800 font-semibold cursor-pointer" onClick={() => setSimScreen("login")}>Sign in instead</span>
                    </p>
                  </div>
                )}

                {/* 4. MAIN HOME TAB SCREEN (CONNECTED STATE) */}
                {simScreen === "home" && currentMember && (
                  <div className="flex flex-col h-full justify-between">
                    {/* Header inside Phone */}
                    <div className="bg-primary-900 text-white p-4 shrink-0 shadow-md">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={currentMember.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300"}
                          alt="avatar"
                          className="h-8 w-8 rounded-full border border-gold-500/30 object-cover"
                        />
                        <div className="leading-tight">
                          <p className="text-[10px] text-slate-300">Sanibonani!</p>
                          <h5 className="font-heading font-extrabold text-xs text-white truncate max-w-[160px]">{currentMember.name}</h5>
                        </div>
                        
                        <span className="ml-auto bg-gold-500 text-primary-950 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                          {currentMember.role}
                        </span>
                      </div>
                    </div>

                    {/* Phone Inner Routing Tab Contents */}
                    <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
                      
                      {/* FEED TAB */}
                      {simTab === "feed" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                            <span className="text-slate-800 font-heading font-extrabold text-[11px] uppercase tracking-wide">Pushed Announcements</span>
                            <span className="bg-slate-200 text-slate-700 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                              {syncedNotifications.length} LIVE
                            </span>
                          </div>

                          {syncedNotifications.length === 0 ? (
                            <p className="text-[10px] text-slate-400 text-center py-6">No notifications currently posted.</p>
                          ) : (
                            syncedNotifications.map((notif) => (
                              <div
                                key={notif.id}
                                className={`rounded-xl p-3 border shadow-sm relative overflow-hidden ${
                                  notif.topic === "Emergency"
                                    ? "bg-rose-50 border-rose-200"
                                    : notif.topic === "Prayer"
                                      ? "bg-amber-50 border-amber-200"
                                      : "bg-white border-slate-200"
                                }`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className={`text-[7px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                                    notif.topic === "Emergency"
                                      ? "bg-rose-600 text-white"
                                      : notif.topic === "Prayer"
                                        ? "bg-amber-600 text-white"
                                        : "bg-primary-900 text-white"
                                  }`}>
                                    {notif.topic}
                                  </span>
                                  <span className="text-[7px] font-mono text-slate-400">
                                    {new Date(notif.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                                <h6 className="font-heading font-extrabold text-xs text-slate-900 mt-1.5">{notif.title}</h6>
                                <p className="text-slate-600 font-sans text-[10px] mt-0.5 leading-relaxed">{notif.body}</p>
                                <p className="text-[8px] text-slate-400 mt-2 font-semibold">📢 Sent by: {notif.sentBy}</p>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* SERMONS TAB */}
                      {simTab === "sermons" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-800 font-heading font-extrabold text-[11px] uppercase tracking-wide">Synced Teachings</span>
                          </div>

                          {/* Mini Search bar */}
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search synced sermons..."
                              value={sermonSearch}
                              onChange={(e) => setSermonSearch(e.target.value)}
                              className="w-full pl-7.5 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2.5">
                            {syncedSermons.length === 0 ? (
                              <p className="text-[10px] text-slate-400 text-center py-6">No matched teachings synced.</p>
                            ) : (
                              syncedSermons.map((sermon) => (
                                <div key={sermon.id} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-1.5">
                                  <div>
                                    <h6 className="font-heading font-bold text-xs text-slate-900 leading-tight">{sermon.title}</h6>
                                    <p className="text-[9px] text-slate-500 font-medium">Speaker: {sermon.speaker}</p>
                                  </div>
                                  <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">
                                    {sermon.summary || sermon.notes}
                                  </p>

                                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
                                    <span className="text-[8px] font-mono text-slate-400">📅 {sermon.date}</span>
                                    
                                    {sermon.audioUrl && (
                                      <button className="bg-primary-100 text-primary-900 px-2 py-0.5 rounded font-heading font-bold text-[8px] flex items-center space-x-0.5">
                                        <Play className="h-2 w-2 fill-primary-900" />
                                        <span>PLAY AUDIO</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* EVENTS TAB */}
                      {simTab === "events" && (
                        <div className="space-y-3">
                          <span className="text-slate-800 font-heading font-extrabold text-[11px] uppercase tracking-wide block border-b border-slate-200 pb-1">
                            Church Calendar Sync
                          </span>

                          <div className="flex space-x-1 overflow-x-auto pb-1">
                            {["All", "Worship", "Youth", "Outreach"].map(cat => (
                              <button
                                key={cat}
                                onClick={() => setEventCategory(cat)}
                                className={`px-2 py-0.5 text-[8px] font-heading font-bold rounded-full border shrink-0 ${
                                  eventCategory === cat
                                    ? "bg-primary-800 border-primary-800 text-white"
                                    : "bg-white border-slate-200 text-slate-600"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-2.5">
                            {syncedEvents.length === 0 ? (
                              <p className="text-[10px] text-slate-400 text-center py-6">No matching events scheduled.</p>
                            ) : (
                              syncedEvents.map((evt) => {
                                const isRegistered = evt.registeredUsers?.includes(currentMember.email);
                                return (
                                  <div key={evt.id} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2">
                                    <div>
                                      <h6 className="font-heading font-bold text-xs text-slate-900 leading-tight">{evt.title}</h6>
                                      <span className="text-[8px] font-semibold text-slate-400">📍 {evt.location}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 line-clamp-2 leading-relaxed">{evt.description}</p>
                                    
                                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                                      <span className="text-[8px] text-slate-400 font-mono">📅 {evt.date}</span>
                                      
                                      {isRegistered ? (
                                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold text-[8px] border border-emerald-200 flex items-center space-x-0.5">
                                          <CheckCircle className="h-2.5 w-2.5" />
                                          <span>REGISTERED</span>
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => handleRegisterEventMobile(evt.id)}
                                          className="bg-primary-800 text-white px-2 py-0.5 rounded font-heading font-bold text-[8px] hover:bg-primary-950 transition-all"
                                        >
                                          REGISTER NOW
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {/* PROFILE TAB */}
                      {simTab === "profile" && (
                        <div className="space-y-3">
                          <span className="text-slate-800 font-heading font-extrabold text-[11px] uppercase tracking-wide block border-b border-slate-200 pb-1">
                            My Covenant Account
                          </span>

                          <div className="bg-slate-100 rounded-xl p-3 border border-slate-200/50 space-y-1">
                            <p className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">Registered Email</p>
                            <p className="text-xs font-mono font-semibold text-slate-700 truncate">{currentMember.email}</p>
                            
                            <p className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold mt-2">Serving Guild</p>
                            <p className="text-[11px] font-heading font-bold text-slate-800">{currentMember.servingDepartment || "General Member"}</p>
                          </div>

                          {editSuccess && (
                            <div className="bg-emerald-50 border border-emerald-100 text-[9px] text-emerald-800 p-2 rounded-lg text-center font-sans">
                              ✓ Profile synced to server securely!
                            </div>
                          )}

                          <form onSubmit={handleUpdateProfileMobile} className="space-y-2">
                            <div className="space-y-0.5">
                              <label className="text-slate-500 text-[8px] font-heading font-bold uppercase tracking-wider">Phone Link</label>
                              <input
                                type="text"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] focus:outline-none"
                              />
                            </div>

                            <div className="space-y-0.5">
                              <label className="text-slate-500 text-[8px] font-heading font-bold uppercase tracking-wider">Mbabane District</label>
                              <input
                                type="text"
                                value={editDistrict}
                                onChange={(e) => setEditDistrict(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] focus:outline-none"
                              />
                            </div>

                            <div className="space-y-0.5">
                              <label className="text-slate-500 text-[8px] font-heading font-bold uppercase tracking-wider">Spiritual Bio</label>
                              <textarea
                                rows={2}
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] focus:outline-none font-sans"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-primary-800 text-white text-[10px] font-heading font-bold py-2 rounded-lg transition-all"
                            >
                              Sync Profile Changes
                            </button>
                          </form>

                          <button
                            onClick={handleMobileSignOut}
                            className="w-full border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-50 text-[10px] font-heading font-bold py-2 rounded-lg transition-all flex items-center justify-center space-x-1"
                          >
                            <LogOut className="h-3 w-3" />
                            <span>Sign Out Credentials</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom simulated navigation inside phone */}
                    <div className="bg-white border-t border-slate-200 h-14 flex justify-around items-center text-slate-400 shrink-0 select-none">
                      <button
                        onClick={() => setSimTab("feed")}
                        className={`flex flex-col items-center justify-center space-y-0.5 ${
                          simTab === "feed" ? "text-primary-900 font-bold" : "hover:text-slate-600"
                        }`}
                      >
                        <Bell className={`h-4.5 w-4.5 ${simTab === "feed" ? "text-gold-500 fill-gold-500" : ""}`} />
                        <span className="text-[8px] uppercase tracking-wider">Feed</span>
                      </button>

                      <button
                        onClick={() => setSimTab("sermons")}
                        className={`flex flex-col items-center justify-center space-y-0.5 ${
                          simTab === "sermons" ? "text-primary-900 font-bold" : "hover:text-slate-600"
                        }`}
                      >
                        <BookOpen className="h-4.5 w-4.5" />
                        <span className="text-[8px] uppercase tracking-wider">Sermons</span>
                      </button>

                      <button
                        onClick={() => setSimTab("events")}
                        className={`flex flex-col items-center justify-center space-y-0.5 ${
                          simTab === "events" ? "text-primary-900 font-bold" : "hover:text-slate-600"
                        }`}
                      >
                        <Calendar className="h-4.5 w-4.5" />
                        <span className="text-[8px] uppercase tracking-wider">Events</span>
                      </button>

                      <button
                        onClick={() => setSimTab("profile")}
                        className={`flex flex-col items-center justify-center space-y-0.5 ${
                          simTab === "profile" ? "text-primary-900 font-bold" : "hover:text-slate-600"
                        }`}
                      >
                        <User className="h-4.5 w-4.5" />
                        <span className="text-[8px] uppercase tracking-wider">Profile</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

              {/* Simulated Home button */}
              <div className="bg-slate-100 h-10 flex items-center justify-center shrink-0 border-t border-slate-200">
                <div className="h-1 w-24 bg-slate-300 rounded-full cursor-pointer" onClick={() => {
                  if (simScreen !== "splash" && simScreen !== "login" && simScreen !== "register") {
                    setSimTab("feed");
                  }
                }}></div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
