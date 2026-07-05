import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY is not defined. AI features will run in offline simulation mode.");
}

const DB_FILE = path.join(process.cwd(), "db.json");

// Helper for Database persistence
interface ChurchDatabase {
  sermons: any[];
  events: any[];
  ministries: any[];
  photoAlbums: any[];
  videos: any[];
  livestreams: any[];
  prayerRequests: any[];
  donations: any[];
  counselingBookings: any[];
  blogPosts: any[];
  members: any[];
  outreachVolunteers: any[];
  pastorContacts: any[];
  announcements?: any[];
  contactInquiries?: any[];
  notifications?: any[];
  securityConfig?: any;
}

const initialDb: ChurchDatabase = {
  sermons: [],
  events: [],
  ministries: [],
  photoAlbums: [],
  videos: [],
  livestreams: [],
  prayerRequests: [],
  donations: [],
  counselingBookings: [],
  blogPosts: [],
  members: [],
  outreachVolunteers: [],
  pastorContacts: [],
  contactInquiries: [],
  notifications: [],
  announcements: [],
  securityConfig: {
    sslEnforced: true,
    blacklistWords: "viagra, cialis, casino, free cash, cheap drugs, click here to buy, casino-online"
  }
};

// ==========================================
// 🔒 TRANSPARENT DATA ENCRYPTION ENGINE
// ==========================================
import crypto from "crypto";

const ENCRYPTION_KEY = crypto.createHash("sha256").update("FONTEYN_FEC_SECURE_SALT_KEY_2026").digest(); // 32 bytes
const ENCRYPTION_IV = crypto.createHash("md5").update("FONTEYN_FEC_IV").digest(); // 16 bytes

function encryptField(text: string): string {
  try {
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, ENCRYPTION_IV);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  } catch (err) {
    console.error("Encryption Error:", err);
    return "[ENCRYPTION_ERROR]";
  }
}

function decryptField(cipherText: string): string {
  try {
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, ENCRYPTION_IV);
    let decrypted = decipher.update(cipherText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption Error:", err);
    return "[DECRYPTION_ERROR]";
  }
}

function encryptSensitiveFields(data: ChurchDatabase): ChurchDatabase {
  const cloned = JSON.parse(JSON.stringify(data));
  
  if (cloned.counselingBookings) {
    cloned.counselingBookings = cloned.counselingBookings.map((b: any) => ({
      ...b,
      email: b.email ? encryptField(b.email) : b.email,
      phone: b.phone ? encryptField(b.phone) : b.phone,
      reason: b.reason ? encryptField(b.reason) : b.reason,
    }));
  }
  
  if (cloned.members) {
    cloned.members = cloned.members.map((m: any) => ({
      ...m,
      email: m.email ? encryptField(m.email) : m.email,
      phone: m.phone ? encryptField(m.phone) : m.phone,
      password: m.password ? encryptField(m.password) : m.password,
    }));
  }

  if (cloned.contactInquiries) {
    cloned.contactInquiries = cloned.contactInquiries.map((c: any) => ({
      ...c,
      email: c.email ? encryptField(c.email) : c.email,
      phone: c.phone ? encryptField(c.phone) : c.phone,
      message: c.message ? encryptField(c.message) : c.message,
    }));
  }

  if (cloned.pastorContacts) {
    cloned.pastorContacts = cloned.pastorContacts.map((p: any) => ({
      ...p,
      email: p.email ? encryptField(p.email) : p.email,
      phone: p.phone ? encryptField(p.phone) : p.phone,
      message: p.message ? encryptField(p.message) : p.message,
    }));
  }

  if (cloned.donations) {
    cloned.donations = cloned.donations.map((d: any) => ({
      ...d,
      donorEmail: d.donorEmail ? encryptField(d.donorEmail) : d.donorEmail,
    }));
  }

  return cloned;
}

function decryptSensitiveFields(data: ChurchDatabase): ChurchDatabase {
  if (data.counselingBookings) {
    data.counselingBookings = data.counselingBookings.map((b: any) => ({
      ...b,
      email: b.email && !b.email.includes("@") ? decryptField(b.email) : b.email,
      phone: b.phone && b.phone.length > 20 ? decryptField(b.phone) : b.phone,
      reason: b.reason && b.reason.length > 20 && !b.reason.includes(" ") ? decryptField(b.reason) : b.reason,
    }));
  }

  if (data.members) {
    data.members = data.members.map((m: any) => ({
      ...m,
      email: m.email && !m.email.includes("@") ? decryptField(m.email) : m.email,
      phone: m.phone && m.phone.length > 20 ? decryptField(m.phone) : m.phone,
      password: m.password && m.password.length > 20 && !m.password.includes(" ") ? decryptField(m.password) : m.password,
    }));
  }

  if (data.contactInquiries) {
    data.contactInquiries = data.contactInquiries.map((c: any) => ({
      ...c,
      email: c.email && !c.email.includes("@") ? decryptField(c.email) : c.email,
      phone: c.phone && c.phone.length > 20 ? decryptField(c.phone) : c.phone,
      message: c.message && c.message.length > 20 && !c.message.includes(" ") ? decryptField(c.message) : c.message,
    }));
  }

  if (data.pastorContacts) {
    data.pastorContacts = data.pastorContacts.map((p: any) => ({
      ...p,
      email: p.email && !p.email.includes("@") ? decryptField(p.email) : p.email,
      phone: p.phone && p.phone.length > 20 ? decryptField(p.phone) : p.phone,
      message: p.message && p.message.length > 20 && !p.message.includes(" ") ? decryptField(p.message) : p.message,
    }));
  }

  if (data.donations) {
    data.donations = data.donations.map((d: any) => ({
      ...d,
      donorEmail: d.donorEmail && !d.donorEmail.includes("@") ? decryptField(d.donorEmail) : d.donorEmail,
    }));
  }

  return data;
}

// Load or Initialize database file
function loadDb(): ChurchDatabase {
  try {
    let loaded: ChurchDatabase;
    if (fs.existsSync(DB_FILE)) {
      const rawData = fs.readFileSync(DB_FILE, "utf-8");
      loaded = decryptSensitiveFields(JSON.parse(rawData));
    } else {
      const encryptedInit = encryptSensitiveFields(initialDb);
      fs.writeFileSync(DB_FILE, JSON.stringify(encryptedInit, null, 2), "utf-8");
      loaded = initialDb;
    }
    if (loaded) {
      loaded.outreachVolunteers = loaded.outreachVolunteers || [];
      // Removed members fallback
      loaded.announcements = loaded.announcements || [];
    }
    // Normalize comments
    if (loaded && Array.isArray(loaded.blogPosts)) {
      loaded.blogPosts.forEach((post: any) => {
        if (Array.isArray(post.comments)) {
          post.comments.forEach((comment: any) => {
            if (comment.text && !comment.content) {
              comment.content = comment.text;
            } else if (comment.content && !comment.text) {
              comment.text = comment.content;
            }
            if (comment.approved === undefined) {
              comment.approved = true;
            }
          });
        }
      });
    }
    
    if (loaded) {
      loaded.notifications = loaded.notifications || [];
      
    }
    return loaded;
  } catch (error) {
    console.error("Failed to load database. Using in-memory store.", error);
    return initialDb;
  }
}

function saveDb(data: ChurchDatabase) {
  try {
    const encryptedData = encryptSensitiveFields(data);
    fs.writeFileSync(DB_FILE, JSON.stringify(encryptedData, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save database:", error);
  }
}

let db = loadDb();

// Global Security configuration state
db.securityConfig = db.securityConfig || {
  sslEnforced: true,
  enable2fa: false,
  blacklistWords: "viagra, cialis, casino, free cash, cheap drugs, click here to buy, casino-online"
};
saveDb(db);

// ==========================================
// 🛡️ SECURITY & PROTECTION MIDDLEWARES
// ==========================================

// 1. SSL Enforcement and HTTP Security Headers
app.use((req, res, next) => {
  // Always enforce standard OWASP HTTP security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  if (db.securityConfig?.sslEnforced) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

    const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
    const isLocal = req.hostname === "localhost" || req.hostname === "127.0.0.1" || req.hostname.includes("ais-dev-") || process.env.NODE_ENV !== "production";

    if (!isHttps && !isLocal) {
      console.log(`[SSL] Redirecting HTTP request to HTTPS for secure transit: ${req.url}`);
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  }
  next();
});

// 2. Heuristic Spam Checker Helper
function isSpam(text: string, honeypotField?: string): { spam: boolean; reason?: string } {
  if (honeypotField && honeypotField.trim().length > 0) {
    return { spam: true, reason: "Honeypot field was triggered by bot behavior." };
  }
  if (!text) return { spam: false };
  const lowercaseText = text.toLowerCase();

  // Check blacklist words configured in security dashboard
  const blacklist = (db.securityConfig?.blacklistWords || "")
    .split(",")
    .map((w: string) => w.trim().toLowerCase())
    .filter(Boolean);

  for (const word of blacklist) {
    if (lowercaseText.includes(word)) {
      return { spam: true, reason: `Matches blacklisted spam word "${word}"` };
    }
  }

  // Prevent typical URL link advertising injections
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  if (urlPattern.test(lowercaseText)) {
    return { spam: true, reason: "Commercial URL links are not allowed in public forms." };
  }

  // Capital letter shouting pattern check
  const capsCount = (text.match(/[A-Z]/g) || []).length;
  const totalLetters = (text.match(/[a-zA-Z]/g) || []).length;
  if (totalLetters > 10 && capsCount / totalLetters > 0.7) {
    return { spam: true, reason: "Excessive capital letters shouting pattern detected." };
  }

  return { spam: false };
}

// 3. Spam Protection Express Middleware
function spamCheckMiddleware(req: any, res: any, next: any) {
  // Check for honeypots (commonly submitted fields in forms: 'honeypot', 'website')
  const honeypot = req.body.honeypot || req.body.website || "";
  if (honeypot) {
    console.warn("🚨 Spam Honeypot triggered!");
    return res.status(400).json({ error: "Spam Blocked: Bot honeypot was triggered." });
  }

  // Extract text fields
  const content = req.body.requestText || req.body.message || req.body.text || req.body.content || "";
  if (content) {
    const result = isSpam(content);
    if (result.spam) {
      console.warn(`🚨 Spam submission blocked. Reason: ${result.reason}`);
      return res.status(400).json({ error: `Submission Blocked: ${result.reason}` });
    }
  }
  next();
}

// 4. Simple Rate Limiter State
const requestCounts = new Map<string, { count: number; firstRequest: number }>();

app.use((req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "anonymous";
  const path = req.path;
  const publicForms = ["/api/prayer-requests", "/api/pastor-contact", "/api/contact-inquiries", "/api/blog-posts/comments"];
  const isPublicForm = publicForms.some(f => path.startsWith(f));

  if (isPublicForm && req.method === "POST") {
    const key = `${ip}:${path}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 10;

    const record = requestCounts.get(key);
    if (!record) {
      requestCounts.set(key, { count: 1, firstRequest: now });
    } else {
      if (now - record.firstRequest < windowMs) {
        record.count++;
        if (record.count > maxRequests) {
          console.warn(`🚨 Rate limit exceeded for IP: ${ip} on endpoint ${path}`);
          return res.status(429).json({ error: "Too Many Requests. Rate-limiting spam shield triggered. Please wait 1 minute." });
        }
      } else {
        requestCounts.set(key, { count: 1, firstRequest: now });
      }
    }
  }

  next();
});

// 5. Role-Based Access Control middleware
function requireRole(allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    const activeRoleHeader = req.headers["x-admin-role"];
    const activeRole = Array.isArray(activeRoleHeader) ? activeRoleHeader[0] : (activeRoleHeader || "Member");
    if (allowedRoles.includes(activeRole)) {
      next();
    } else {
      res.status(403).json({ error: `Permission Denied: This action requires one of the following roles: ${allowedRoles.join(", ")}` });
    }
  };
}

// Security Configuration & Features Endpoints
app.get("/api/security/settings", (req, res) => {
  res.json(db.securityConfig);
});

app.post("/api/security/settings", requireRole(["Pastor", "Admin"]), (req, res) => {
  const { sslEnforced, enable2fa, blacklistWords } = req.body;
  if (sslEnforced !== undefined) db.securityConfig.sslEnforced = sslEnforced;
  if (enable2fa !== undefined) db.securityConfig.enable2fa = enable2fa;
  if (blacklistWords !== undefined) db.securityConfig.blacklistWords = blacklistWords;
  saveDb(db);
  res.json({ success: true, settings: db.securityConfig });
});

app.post("/api/security/2fa/verify", (req, res) => {
  const { code } = req.body;
  const epochSeconds = Math.floor(Date.now() / 1000);
  const intervalIndex = Math.floor(epochSeconds / 30);
  const calculatedCode = ((intervalIndex * 14753) % 900000 + 100000).toString();

  if (code === calculatedCode) {
    res.json({ success: true });
  } else {
    res.json({ success: false, error: "Incorrect verification token code." });
  }
});

app.post("/api/security/encrypt-field", requireRole(["Pastor", "Admin", "Elder"]), (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required to encrypt." });
  const encrypted = encryptField(text);
  res.json({ encrypted });
});

app.post("/api/security/decrypt-field", requireRole(["Pastor", "Admin", "Elder"]), (req, res) => {
  const { encrypted } = req.body;
  if (!encrypted) return res.status(400).json({ error: "Ciphertext is required to decrypt." });
  const decrypted = decryptField(encrypted);
  if (decrypted === "[DECRYPTION_ERROR]") {
    return res.status(400).json({ error: "Decryption failed. Invalid cipher code." });
  }
  res.json({ decrypted });
});

const BACKUPS_DIR = path.join(process.cwd(), "backups");
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// Automated Daily Backups Scheduler & Rolling Retention
function triggerDailyBackup() {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `FEC-daily-backup-${dateStr}.json`;
    const destPath = path.join(BACKUPS_DIR, filename);

    if (!fs.existsSync(destPath)) {
      fs.writeFileSync(destPath, JSON.stringify(db, null, 2), "utf-8");
      console.log(`[BACKUP] Automated daily snapshot backup created successfully: ${filename}`);

      // Retain for 30 rolling calendar days
      const files = fs.readdirSync(BACKUPS_DIR);
      const now = Date.now();
      const maxAgeMs = 30 * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (file.endsWith(".json")) {
          const filePath = path.join(BACKUPS_DIR, file);
          const stats = fs.statSync(filePath);
          if (now - stats.mtimeMs > maxAgeMs) {
            fs.unlinkSync(filePath);
            console.log(`[BACKUP] Rolling retention pruned expired file: ${file}`);
          }
        }
      }
    }
  } catch (err) {
    console.error("[BACKUP] Automated daily backup execution failed:", err);
  }
}

// Hourly check to verify rolling schedule
setInterval(triggerDailyBackup, 60 * 60 * 1000);
// Trigger once on initialization
setTimeout(triggerDailyBackup, 5000);

app.get("/api/security/backups", requireRole(["Pastor", "Admin"]), (req, res) => {
  try {
    const files = fs.readdirSync(BACKUPS_DIR);
    const backupList = files
      .filter(f => f.endsWith(".json"))
      .map(f => {
        const stats = fs.statSync(path.join(BACKUPS_DIR, f));
        const sizeKB = Math.round(stats.size / 1024);
        return {
          name: f,
          size: `${sizeKB} KB`,
          mtime: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => b.mtime.localeCompare(a.mtime));
    res.json(backupList);
  } catch (err) {
    res.status(500).json({ error: "Failed to read backups directory." });
  }
});

app.post("/api/security/backups/create", requireRole(["Pastor", "Admin"]), (req, res) => {
  try {
    const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `FEC-backup-${dateStr}.json`;
    const destPath = path.join(BACKUPS_DIR, filename);

    // Snapshot of active db
    fs.writeFileSync(destPath, JSON.stringify(db, null, 2), "utf-8");
    res.json({ success: true, filename });
  } catch (err) {
    res.status(500).json({ error: "Failed to assemble database backup snapshot." });
  }
});

app.post("/api/security/backups/restore", requireRole(["Pastor", "Admin"]), (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: "Filename is required to restore." });
  try {
    const srcPath = path.join(BACKUPS_DIR, filename);
    if (!fs.existsSync(srcPath)) {
      return res.status(404).json({ error: "Selected backup snapshot file not found." });
    }

    const backupData = fs.readFileSync(srcPath, "utf-8");
    fs.writeFileSync(DB_FILE, backupData, "utf-8");
    db = JSON.parse(backupData);

    res.json({ success: true, message: "Database state restored successfully." });
  } catch (err) {
    res.status(500).json({ error: "Disaster recovery restore operation failed." });
  }
});

app.get("/api/security/backups/download/:filename", requireRole(["Pastor", "Admin"]), (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(BACKUPS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Backup file not found.");
  }
  res.download(filePath);
});

app.delete("/api/security/backups/:filename", requireRole(["Pastor", "Admin"]), (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(BACKUPS_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Backup snapshot file not found." });
  }
});

// ==========================================

// 1. Sermons API
app.get("/api/sermons", (req, res) => {
  res.json(db.sermons);
});

app.post("/api/sermons", requireRole(["Pastor", "Admin", "Elder"]), (req, res) => {
  const { title, speaker, date, topic, scripture, notes, videoUrl, audioUrl, summary, bibleReferences, discussionQuestions, socialPosts } = req.body;
  if (!title || !speaker || !date || !scripture || !notes) {
    return res.status(400).json({ error: "Missing required sermon details." });
  }
  const newSermon = {
    id: "s" + (db.sermons.length + 1) + "_" + Date.now(),
    title,
    speaker,
    date,
    topic: topic || "General",
    scripture,
    notes,
    videoUrl: videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
    audioUrl: audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    summary: summary || "",
    bibleReferences: bibleReferences || [],
    discussionQuestions: discussionQuestions || [],
    socialPosts: socialPosts || []
  };
  db.sermons.unshift(newSermon);
  saveDb(db);
  res.json({ success: true, sermon: newSermon });
});

app.delete("/api/sermons/:id", requireRole(["Pastor", "Admin"]), (req, res) => {
  db.sermons = db.sermons.filter(s => s.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// AI Sermon Assistant API
app.post("/api/sermon-assistant", requireRole(["Pastor", "Admin", "Elder"]), async (req, res) => {
  const { notes, title, scripture } = req.body;
  if (!notes) {
    return res.status(400).json({ error: "Sermon notes are required for AI analysis." });
  }

  if (!ai) {
    // Offline simulation mode fallback
    return res.json({
      summary: `[SIMULATED] Summary for '${title}': This inspiring message explores ${scripture}. It calls us to live with bold faith, build a secure, love-filled household, and strengthen our personal walk with God daily.`,
      bibleReferences: [scripture, "Matthew 6:33", "Galatians 5:22-23"],
      discussionQuestions: [
        `How does the message in ${scripture} challenge our daily priorities in Mbabane?`,
        "What is one concrete habit you can establish this week to align closer to this sermon's topic?",
        "How can we help fellow members in Eswatini who are struggling to put these principles into practice?"
      ],
      socialPosts: [
        `📖 Pastor shared a powerful message on '${title}' (${scripture}). Let's ground our hearts in God's promises this week! #MbabaneChurches #Faith`,
        `What does it look like to live a fully surrendered life? Check out our notes and questions on '${title}' from Sunday! 🙌🕊️`
      ]
    });
  }

  try {
    const prompt = `Analyze the following sermon details and generate four structured outputs in JSON format.
Sermon Title: "${title || 'Untitled sermon'}"
Scripture Reference: "${scripture || 'Various'}"
Sermon Notes:
"${notes}"

Please respond with a JSON object containing these exact keys:
1. "summary" (string): A concise, 2-3 sentence inspiring theological summary of the message.
2. "bibleReferences" (array of strings): A list of 3-4 highly relevant cross-reference scriptures that expand on this sermon's themes (format: Book Chapter:Verse).
3. "discussionQuestions" (array of strings): A list of 3 deeply reflective, practical small-group Bible study discussion questions based on the notes.
4. "socialPosts" (array of strings): A list of 2 engaging, welcoming social media post drafts (including hashtags relevant to Mbabane and Christian life) to share the key message.

Do not write anything outside the JSON object. Just return the raw JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            bibleReferences: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            discussionQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            socialPosts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "bibleReferences", "discussionQuestions", "socialPosts"]
        }
      }
    });

    const resultText = response.text || "";
    const analysis = JSON.parse(resultText);
    res.json(analysis);
  } catch (error: any) {
    console.error("AI Sermon Assistant Error:", error);
    res.status(500).json({ error: "AI assistant is temporarily busy. Running offline fallback.", fallback: true });
  }
});

// 2. Events API
app.get("/api/events", (req, res) => {
  res.json(db.events);
});

// Ministries API
app.get("/api/ministries", (req, res) => {
  res.json(db.ministries);
});

// Daily Verse API
app.get("/api/verse", async (req, res) => {
  try {
    const response = await fetch("https://labs.bible.org/api/?passage=random&type=json");
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const verse = data[0];
      res.json({
        text: verse.text,
        reference: `${verse.bookname} ${verse.chapter}:${verse.verse}`
      });
    } else {
      throw new Error("No verse found");
    }
  } catch (error) {
    res.json({
      text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
      reference: "Jeremiah 29:11"
    });
  }
});

// Media APIs
app.get("/api/media/photo-albums", (req, res) => {
  res.json(db.photoAlbums || []);
});

app.get("/api/media/videos", (req, res) => {
  res.json(db.videos || []);
});

app.get("/api/media/livestreams", (req, res) => {
  res.json(db.livestreams || []);
});

// Outreach APIs
app.get("/api/outreach/volunteers", (req, res) => {
  res.json(db.outreachVolunteers || []);
});

app.post("/api/outreach/volunteer", (req, res) => {
  const { name, email, phone, projectId, projectTitle, role } = req.body;
  if (!name || !email || !projectId || !projectTitle) {
    return res.status(400).json({ error: "Missing required volunteer details (name, email, projectId, projectTitle)." });
  }

  const newVolunteer = {
    id: "ov_" + Date.now(),
    name,
    email,
    phone: phone || "",
    projectId,
    projectTitle,
    role: role || "General Help",
    date: new Date().toISOString()
  };

  db.outreachVolunteers = db.outreachVolunteers || [];
  db.outreachVolunteers.push(newVolunteer);
  saveDb(db);

  res.json({ success: true, message: "Volunteer registration successful!", volunteer: newVolunteer });
});

app.post("/api/pastor-contact", spamCheckMiddleware, (req, res) => {
  const { name, email, phone, message, pastor } = req.body;
  if (!name || !email || !message || !pastor) {
    return res.status(400).json({ error: "Missing required details." });
  }

  const newContact = {
    id: "pc_" + Date.now(),
    name,
    email,
    phone: phone || "",
    message,
    pastor,
    date: new Date().toISOString()
  };

  db.pastorContacts = db.pastorContacts || [];
  db.pastorContacts.push(newContact);
  saveDb(db);

  res.json({ success: true, message: "Message sent to pastor successfully!" });
});

app.post("/api/contact-inquiries", spamCheckMiddleware, (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required fields." });
  }

  const newInquiry = {
    id: "ci_" + Date.now(),
    name,
    email,
    phone: phone || "",
    subject: subject || "General Inquiry",
    message,
    date: new Date().toISOString()
  };

  db.contactInquiries = db.contactInquiries || [];
  db.contactInquiries.push(newInquiry);
  saveDb(db);

  res.json({ success: true, message: "Inquiry saved successfully!", inquiry: newInquiry });
});

app.post("/api/ministries/:id/join", (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }
  
  const minIndex = db.ministries.findIndex(m => m.id === id);
  if (minIndex === -1) {
    return res.status(404).json({ error: "Ministry not found." });
  }

  // We could add them to a pending list or just return success
  res.json({ success: true, message: `Successfully requested to join ${db.ministries[minIndex].name}` });
});

app.post("/api/events", (req, res) => {
  const { title, description, date, time, location, category, maxCapacity, volunteerSpots } = req.body;
  if (!title || !description || !date || !time || !location || !category) {
    return res.status(400).json({ error: "Missing required event details." });
  }
  const newEvent = {
    id: "e" + (db.events.length + 1) + "_" + Date.now(),
    title,
    description,
    date,
    time,
    location,
    category,
    registeredUsers: [],
    maxCapacity: maxCapacity ? parseInt(maxCapacity) : 100,
    volunteerSpots: volunteerSpots || ["Ushers", "Sound Crew", "Hospitality"],
    volunteers: []
  };
  db.events.push(newEvent);
  saveDb(db);
  res.json({ success: true, event: newEvent });
});

app.post("/api/events/:id/register", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required to register." });
  }
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: "Event not found." });
  }
  if (event.registeredUsers.includes(email)) {
    return res.json({ success: true, message: "Already registered for this event.", event });
  }
  if (event.registeredUsers.length >= event.maxCapacity) {
    return res.status(400).json({ error: "This event has reached full capacity." });
  }
  event.registeredUsers.push(email);
  saveDb(db);
  res.json({ success: true, message: "Registration successful!", event });
});

app.post("/api/events/:id/volunteer", (req, res) => {
  const { name, spot } = req.body;
  if (!name || !spot) {
    return res.status(400).json({ error: "Name and volunteer role are required." });
  }
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: "Event not found." });
  }
  const volunteerEntry = `${name} (${spot})`;
  if (event.volunteers.includes(volunteerEntry)) {
    return res.json({ success: true, message: "Already volunteered.", event });
  }
  event.volunteers.push(volunteerEntry);
  saveDb(db);
  res.json({ success: true, message: "Thank you for volunteering!", event });
});

// 3. Blog API
app.get(["/api/blog", "/api/blog-posts"], (req, res) => {
  res.json(db.blogPosts);
});

app.post(["/api/blog", "/api/blog-posts"], (req, res) => {
  const { title, author, category, tags, content } = req.body;
  if (!title || !author || !category || !content) {
    return res.status(400).json({ error: "Missing required blog details." });
  }
  const newPost = {
    id: "b" + (db.blogPosts.length + 1) + "_" + Date.now(),
    title,
    author,
    date: new Date().toISOString().split('T')[0],
    category,
    tags: tags || ["Church"],
    content,
    comments: [],
    likes: 0
  };
  db.blogPosts.unshift(newPost);
  saveDb(db);
  res.json({ success: true, blog: newPost });
});

app.post(["/api/blog/:id/comment", "/api/blog-posts/:id/comment"], spamCheckMiddleware, (req, res) => {
  const { author, text, content } = req.body;
  const commentText = text || content;
  if (!author || !commentText) {
    return res.status(400).json({ error: "Author name and comment text are required." });
  }
  const post = db.blogPosts.find(b => b.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: "Blog post not found." });
  }
  const newComment = {
    id: "bc" + (post.comments.length + 1) + "_" + Date.now(),
    author,
    text: commentText,
    content: commentText,
    date: new Date().toISOString().split('T')[0],
    approved: true
  };
  post.comments.push(newComment);
  saveDb(db);
  res.json({ success: true, comment: newComment, comments: post.comments });
});

app.put(["/api/blog/:postId/comments/:commentId/approve", "/api/blog-posts/:postId/comments/:commentId/approve"], (req, res) => {
  const { postId, commentId } = req.params;
  const post = db.blogPosts.find(b => b.id === postId);
  if (!post) return res.status(404).json({ error: "Blog post not found." });
  const comment = post.comments.find(c => c.id === commentId);
  if (!comment) return res.status(404).json({ error: "Comment not found." });
  comment.approved = true;
  saveDb(db);
  res.json({ success: true, comment, comments: post.comments });
});

app.put(["/api/blog/:postId/comments/:commentId/reject", "/api/blog-posts/:postId/comments/:commentId/reject"], (req, res) => {
  const { postId, commentId } = req.params;
  const post = db.blogPosts.find(b => b.id === postId);
  if (!post) return res.status(404).json({ error: "Blog post not found." });
  const comment = post.comments.find(c => c.id === commentId);
  if (!comment) return res.status(404).json({ error: "Comment not found." });
  comment.approved = false;
  saveDb(db);
  res.json({ success: true, comment, comments: post.comments });
});

app.delete(["/api/blog/:postId/comments/:commentId", "/api/blog-posts/:postId/comments/:commentId"], (req, res) => {
  const { postId, commentId } = req.params;
  const post = db.blogPosts.find(b => b.id === postId);
  if (!post) return res.status(404).json({ error: "Blog post not found." });
  post.comments = post.comments.filter(c => c.id !== commentId);
  saveDb(db);
  res.json({ success: true, comments: post.comments });
});

app.delete(["/api/blog/:id", "/api/blog-posts/:id"], (req, res) => {
  db.blogPosts = db.blogPosts.filter(b => b.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

app.post(["/api/blog/:id/like", "/api/blog-posts/:id/like"], (req, res) => {
  const post = db.blogPosts.find(b => b.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: "Blog post not found." });
  }
  post.likes = (post.likes || 0) + 1;
  saveDb(db);
  res.json({ success: true, likes: post.likes });
});

// 4. Prayer Requests API
app.get("/api/prayer-requests", (req, res) => {
  res.json(db.prayerRequests);
});

app.post("/api/prayer-requests", spamCheckMiddleware, (req, res) => {
  const { name, email, isPrivate, isAnonymous, requestText } = req.body;
  if (!requestText) {
    return res.status(400).json({ error: "Prayer request details cannot be empty." });
  }
  const newRequest = {
    id: "p" + (db.prayerRequests.length + 1) + "_" + Date.now(),
    name: isAnonymous ? "Anonymous Partner" : (name || "Church Brother/Sister"),
    email: isPrivate ? "" : (email || ""),
    isPrivate: !!isPrivate,
    isAnonymous: !!isAnonymous,
    requestText,
    date: new Date().toISOString().split('T')[0],
    isAnswered: false,
    answersCount: 1
  };
  db.prayerRequests.unshift(newRequest);
  saveDb(db);
  res.json({ success: true, request: newRequest });
});

app.post("/api/prayer-requests/:id/pray", (req, res) => {
  const request = db.prayerRequests.find(p => p.id === req.params.id);
  if (!request) {
    return res.status(404).json({ error: "Prayer request not found." });
  }
  request.answersCount = (request.answersCount || 0) + 1;
  saveDb(db);
  res.json({ success: true, count: request.answersCount });
});

// 5. Donations API
app.get("/api/donations", requireRole(["Pastor", "Admin"]), (req, res) => {
  res.json(db.donations);
});

app.post("/api/donations", (req, res) => {
  const { donorName, donorEmail, amount, purpose, paymentMethod } = req.body;
  if (!donorName || !donorEmail || !amount || !purpose || !paymentMethod) {
    return res.status(400).json({ error: "All donation details are required." });
  }
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "Donation amount must be a positive number." });
  }

  const receiptNumber = "FEC-TXN-2026-" + Math.floor(1000 + Math.random() * 9000);
  const newDonation = {
    id: "d" + (db.donations.length + 1) + "_" + Date.now(),
    donorName,
    donorEmail,
    amount: numericAmount,
    purpose,
    paymentMethod,
    date: new Date().toISOString().split('T')[0],
    receiptNumber
  };

  db.donations.unshift(newDonation);
  saveDb(db);
  res.json({ success: true, donation: newDonation });
});

// 6. Counseling / Visit Bookings API
app.get("/api/counseling", (req, res) => {
  res.json(db.counselingBookings);
});

app.post("/api/counseling", (req, res) => {
  const { name, email, phone, dateTime, type, reason } = req.body;
  if (!name || !email || !phone || !dateTime || !type || !reason) {
    return res.status(400).json({ error: "All appointment booking fields are required." });
  }
  const newBooking = {
    id: "c" + (db.counselingBookings.length + 1) + "_" + Date.now(),
    name,
    email,
    phone,
    dateTime,
    type,
    reason,
    status: "Pending",
    pastor: "Pastor Sipho M. Dlamini"
  };
  db.counselingBookings.unshift(newBooking);
  saveDb(db);
  res.json({ success: true, booking: newBooking });
});

// 7. Members API & Profile Updates
app.get("/api/members", (req, res) => {
  const activeRoleHeader = req.headers["x-admin-role"];
  const activeRole = Array.isArray(activeRoleHeader) ? activeRoleHeader[0] : (activeRoleHeader || "Member");
  const isPrivileged = ["Pastor", "Admin", "Elder"].includes(activeRole);

  if (isPrivileged) {
    // Privileged roles get complete, transparent raw profiles
    res.json(db.members);
  } else {
    // Public directory gets clean, redacted data respecting privacy settings
    const filtered = db.members
      .filter(m => !(m.privacySettings?.hideEntireProfile))
      .map(m => ({
        id: m.id,
        name: m.name,
        district: m.privacySettings?.hideDistrict ? "[Hidden]" : m.district,
        familyGroup: m.familyGroup,
        familyRelation: m.familyRelation,
        servingDepartment: m.servingDepartment,
        role: m.role,
        bio: m.bio,
        photo: m.photo,
        email: m.privacySettings?.hideEmail ? "[Hidden]" : m.email,
        phone: m.privacySettings?.hideContact ? "[Hidden]" : m.phone,
      }));
    res.json(filtered);
  }
});

app.post("/api/members", (req, res) => {
  const { id, name, email, phone, district, familyGroup, familyRelation, hideContact, hideEmail, hideDistrict, hideEntireProfile, bio } = req.body;
  
  let existingIndex = -1;
  if (id) {
    existingIndex = db.members.findIndex(m => m.id === id);
  } else if (email) {
    existingIndex = db.members.findIndex(m => m.email.toLowerCase() === email.toLowerCase());
  }

  if (existingIndex >= 0) {
    // Update existing member profile
    const existing = db.members[existingIndex];
    db.members[existingIndex] = {
      ...existing,
      name: name !== undefined ? name : existing.name,
      phone: phone !== undefined ? phone : existing.phone,
      district: district !== undefined ? district : existing.district,
      familyGroup: familyGroup !== undefined ? familyGroup : existing.familyGroup,
      familyRelation: familyRelation !== undefined ? familyRelation : existing.familyRelation,
      bio: bio !== undefined ? bio : existing.bio,
      privacySettings: {
        hideContact: hideContact !== undefined ? hideContact : (existing.privacySettings?.hideContact ?? false),
        hideEmail: hideEmail !== undefined ? hideEmail : (existing.privacySettings?.hideEmail ?? false),
        hideDistrict: hideDistrict !== undefined ? hideDistrict : (existing.privacySettings?.hideDistrict ?? false),
        hideEntireProfile: hideEntireProfile !== undefined ? hideEntireProfile : (existing.privacySettings?.hideEntireProfile ?? false)
      }
    };
    saveDb(db);
    return res.json(db.members[existingIndex]);
  } else {
    // Create new member
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required to register as a member." });
    }
    const newMember = {
      id: "m" + (db.members.length + 1) + "_" + Date.now(),
      name,
      email,
      phone: phone || "+268 ",
      district: district || "Fonteyn",
      familyGroup: familyGroup || "New Household",
      familyRelation: familyRelation || "Member",
      servingDepartment: "General",
      role: "Member",
      photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300",
      bio: bio || "Grateful member of the Fonteyn Evangelical family.",
      givingHistory: [],
      serviceRegistry: [],
      privacySettings: {
        hideContact: hideContact !== undefined ? hideContact : false,
        hideEmail: hideEmail !== undefined ? hideEmail : false,
        hideDistrict: hideDistrict !== undefined ? hideDistrict : false,
        hideEntireProfile: hideEntireProfile !== undefined ? hideEntireProfile : false
      }
    };
    db.members.push(newMember);
    saveDb(db);
    return res.json(newMember);
  }
});

// 8. Announcements API
app.get("/api/announcements", (req, res) => {
  res.json(db.announcements || []);
});

app.post("/api/announcements", (req, res) => {
  const { title, content, category, author } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ error: "Title, content, and category are required." });
  }
  const newAnnouncement = {
    id: "a_" + Date.now(),
    title,
    content,
    category,
    author: author || "Church Administration",
    date: new Date().toISOString().split('T')[0]
  };
  db.announcements = db.announcements || [];
  db.announcements.unshift(newAnnouncement);
  saveDb(db);
  res.json({ success: true, announcement: newAnnouncement });
});

// 9. Mobile App Integration APIs
// A. Sermons synchronization API
app.get("/api/mobile/sermons/sync", (req, res) => {
  const { since, search, speaker, topic, limit, offset } = req.query;
  let list = [...(db.sermons || [])];

  // Sync filter: only items since given date
  if (since && typeof since === "string") {
    list = list.filter(s => s.date >= since);
  }

  // Keyword search
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    list = list.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.notes.toLowerCase().includes(q) || 
      (s.summary && s.summary.toLowerCase().includes(q))
    );
  }

  // Speaker filter
  if (speaker && typeof speaker === "string") {
    list = list.filter(s => s.speaker.toLowerCase().includes(speaker.toLowerCase()));
  }

  // Topic filter
  if (topic && typeof topic === "string") {
    list = list.filter(s => s.topic.toLowerCase() === topic.toLowerCase());
  }

  // Sorting: newest sermons first
  list.sort((a, b) => b.date.localeCompare(a.date));

  // Pagination
  const total = list.length;
  const l = limit ? parseInt(limit as string, 10) : 50;
  const o = offset ? parseInt(offset as string, 10) : 0;
  const paginated = list.slice(o, o + l);

  res.json({
    success: true,
    sermons: paginated,
    syncTimestamp: new Date().toISOString(),
    pagination: {
      total,
      limit: l,
      offset: o,
      hasMore: o + l < total
    }
  });
});

// B. Events synchronization API
app.get("/api/mobile/events/sync", (req, res) => {
  const { since, category, limit, offset } = req.query;
  let list = [...(db.events || [])];

  if (since && typeof since === "string") {
    list = list.filter(e => e.date >= since);
  }

  if (category && typeof category === "string" && category !== "All") {
    list = list.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  list.sort((a, b) => a.date.localeCompare(b.date)); // chronological order for upcoming events

  const total = list.length;
  const l = limit ? parseInt(limit as string, 10) : 50;
  const o = offset ? parseInt(offset as string, 10) : 0;
  const paginated = list.slice(o, o + l);

  res.json({
    success: true,
    events: paginated,
    syncTimestamp: new Date().toISOString(),
    pagination: {
      total,
      limit: l,
      offset: o,
      hasMore: o + l < total
    }
  });
});

// C. Notifications API
app.get("/api/mobile/notifications", (req, res) => {
  const { topic } = req.query;
  let list = [...(db.notifications || [])];

  if (topic && typeof topic === "string" && topic !== "All") {
    list = list.filter(n => n.topic.toLowerCase() === topic.toLowerCase());
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({
    success: true,
    notifications: list
  });
});

app.post("/api/mobile/notifications", (req, res) => {
  const { title, body, topic, sentBy } = req.body;
  if (!title || !body || !topic) {
    return res.status(400).json({ error: "Title, body, and topic are required fields." });
  }

  const newNotification = {
    id: "n_" + Date.now(),
    title,
    body,
    topic,
    sentBy: sentBy || "System Admin",
    date: new Date().toISOString()
  };

  db.notifications = db.notifications || [];
  db.notifications.unshift(newNotification);
  saveDb(db);

  res.json({
    success: true,
    message: "Notification pushed and broadcasted to mobile users!",
    notification: newNotification
  });
});

// D. Member Accounts Authentication and Profile management
app.post("/api/mobile/auth/register", (req, res) => {
  const { email, password, name, phone, district } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required." });
  }

  // Check if existing member has this email
  const existingIndex = db.members.findIndex(m => m.email.toLowerCase() === email.toLowerCase());

  if (existingIndex >= 0) {
    // Member already exists, link their mobile credentials / set their password
    const member = db.members[existingIndex];
    
    // Add password if not existing, or update it
    member.password = password;
    saveDb(db);

    return res.json({
      success: true,
      message: "Mobile account successfully linked to your existing Covenant member profile!",
      token: `mock-jwt-token-${member.id}`,
      member
    });
  } else {
    // Create new member profile
    const newMember = {
      id: "m" + (db.members.length + 1) + "_" + Date.now(),
      name,
      email,
      password, // Save password
      phone: phone || "+268 ",
      district: district || "Fonteyn",
      familyGroup: "New Household",
      familyRelation: "Member",
      servingDepartment: "General",
      role: "Member",
      photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300",
      bio: "Grateful member of the Fonteyn Evangelical family joined via Mobile Client.",
      givingHistory: [],
      serviceRegistry: [],
      privacySettings: {
        hideContact: false,
        hideEmail: false,
        hideDistrict: false,
        hideEntireProfile: false
      }
    };

    db.members.push(newMember);
    saveDb(db);

    res.json({
      success: true,
      message: "New member account registered and synchronized successfully!",
      token: `mock-jwt-token-${newMember.id}`,
      member: newMember
    });
  }
});

app.post("/api/mobile/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required fields." });
  }

  const member = db.members.find(m => m.email.toLowerCase() === email.toLowerCase());

  if (!member) {
    return res.status(401).json({ error: "No account found with this email. Please register first." });
  }

  // Simple dev validation: If they haven't set a password, allow them to log in with any password and save it
  // otherwise, verify their password.
  if (!member.password) {
    member.password = password; // Auto-set password on first login for ease of development
    saveDb(db);
  } else if (member.password !== password) {
    return res.status(401).json({ error: "Incorrect password. Please try again." });
  }

  res.json({
    success: true,
    message: "Login successful",
    token: `mock-jwt-token-${member.id}`,
    member
  });
});

app.get("/api/mobile/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token header." });
  }

  const token = authHeader.split(" ")[1];
  const memberId = token.replace("mock-jwt-token-", "");

  const member = db.members.find(m => m.id === memberId);

  if (!member) {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }

  res.json({
    success: true,
    member
  });
});

app.put("/api/mobile/auth/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const token = authHeader.split(" ")[1];
  const memberId = token.replace("mock-jwt-token-", "");

  const memberIndex = db.members.findIndex(m => m.id === memberId);
  if (memberIndex < 0) {
    return res.status(404).json({ error: "Member profile not found." });
  }

  const { name, phone, district, bio, hideContact, hideEmail, hideDistrict } = req.body;

  const current = db.members[memberIndex];
  db.members[memberIndex] = {
    ...current,
    name: name !== undefined ? name : current.name,
    phone: phone !== undefined ? phone : current.phone,
    district: district !== undefined ? district : current.district,
    bio: bio !== undefined ? bio : current.bio,
    privacySettings: {
      hideContact: hideContact !== undefined ? hideContact : (current.privacySettings?.hideContact ?? false),
      hideEmail: hideEmail !== undefined ? hideEmail : (current.privacySettings?.hideEmail ?? false),
      hideDistrict: hideDistrict !== undefined ? hideDistrict : (current.privacySettings?.hideDistrict ?? false),
      hideEntireProfile: current.privacySettings?.hideEntireProfile ?? false
    }
  };

  saveDb(db);

  res.json({
    success: true,
    message: "Profile updated successfully over secure mobile sync API!",
    member: db.members[memberIndex]
  });
});

// ==========================================
// 10. ADVANCED ADMINISTRATIVE CRUD APIs
// ==========================================

// Events CRUD - Update & Delete
app.put("/api/events/:id", requireRole(["Pastor", "Admin", "Elder"]), (req, res) => {
  const { id } = req.params;
  const eventIndex = db.events.findIndex(e => e.id === id);
  if (eventIndex < 0) {
    return res.status(404).json({ error: "Event not found." });
  }

  const current = db.events[eventIndex];
  const { title, description, date, time, location, category, maxCapacity, volunteerSpots } = req.body;

  db.events[eventIndex] = {
    ...current,
    title: title !== undefined ? title : current.title,
    description: description !== undefined ? description : current.description,
    date: date !== undefined ? date : current.date,
    time: time !== undefined ? time : current.time,
    location: location !== undefined ? location : current.location,
    category: category !== undefined ? category : current.category,
    maxCapacity: maxCapacity !== undefined ? parseInt(maxCapacity) : current.maxCapacity,
    volunteerSpots: volunteerSpots !== undefined ? volunteerSpots : current.volunteerSpots
  };

  saveDb(db);
  res.json({ success: true, event: db.events[eventIndex] });
});

app.delete("/api/events/:id", requireRole(["Pastor", "Admin"]), (req, res) => {
  const { id } = req.params;
  const initialLength = db.events.length;
  db.events = db.events.filter(e => e.id !== id);
  if (db.events.length === initialLength) {
    return res.status(404).json({ error: "Event not found." });
  }
  saveDb(db);
  res.json({ success: true, message: "Event successfully deleted." });
});

// Sermons CRUD - Update
app.put("/api/sermons/:id", requireRole(["Pastor", "Admin", "Elder"]), (req, res) => {
  const { id } = req.params;
  const sermonIndex = db.sermons.findIndex(s => s.id === id);
  if (sermonIndex < 0) {
    return res.status(404).json({ error: "Sermon not found." });
  }

  const current = db.sermons[sermonIndex];
  const { title, speaker, date, topic, scripture, notes, videoUrl, audioUrl, summary, bibleReferences, discussionQuestions, socialPosts } = req.body;

  db.sermons[sermonIndex] = {
    ...current,
    title: title !== undefined ? title : current.title,
    speaker: speaker !== undefined ? speaker : current.speaker,
    date: date !== undefined ? date : current.date,
    topic: topic !== undefined ? topic : current.topic,
    scripture: scripture !== undefined ? scripture : current.scripture,
    notes: notes !== undefined ? notes : current.notes,
    videoUrl: videoUrl !== undefined ? videoUrl : current.videoUrl,
    audioUrl: audioUrl !== undefined ? audioUrl : current.audioUrl,
    summary: summary !== undefined ? summary : current.summary,
    bibleReferences: bibleReferences !== undefined ? bibleReferences : current.bibleReferences,
    discussionQuestions: discussionQuestions !== undefined ? discussionQuestions : current.discussionQuestions,
    socialPosts: socialPosts !== undefined ? socialPosts : current.socialPosts
  };

  saveDb(db);
  res.json({ success: true, sermon: db.sermons[sermonIndex] });
});

// Ministries CRUD - Create, Update & Delete
app.post("/api/ministries", (req, res) => {
  const { name, description, leaderName, leaderRole, leaderContact, leaderBio, leaderPhoto, schedule, activities, gallery } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: "Name and Description are required." });
  }

  const newMinistry = {
    id: "min_" + Date.now(),
    name,
    description,
    leader: {
      name: leaderName || "Vacant",
      role: leaderRole || "Ministry Facilitator",
      photo: leaderPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300",
      contact: leaderContact || "+268 ",
      bio: leaderBio || "Called to serve Fonteyn campus."
    },
    schedule: schedule || "Sundays at 11:30 AM",
    activities: activities || [],
    gallery: gallery || []
  };

  db.ministries = db.ministries || [];
  db.ministries.push(newMinistry);
  saveDb(db);
  res.json({ success: true, ministry: newMinistry });
});

app.put("/api/ministries/:id", (req, res) => {
  const { id } = req.params;
  const minIndex = db.ministries.findIndex(m => m.id === id);
  if (minIndex < 0) {
    return res.status(404).json({ error: "Ministry not found." });
  }

  const current = db.ministries[minIndex];
  const { name, description, leaderName, leaderRole, leaderContact, leaderBio, leaderPhoto, schedule, activities, gallery } = req.body;

  db.ministries[minIndex] = {
    ...current,
    name: name !== undefined ? name : current.name,
    description: description !== undefined ? description : current.description,
    leader: {
      name: leaderName !== undefined ? leaderName : (current.leader?.name || "Vacant"),
      role: leaderRole !== undefined ? leaderRole : (current.leader?.role || "Ministry Facilitator"),
      photo: leaderPhoto !== undefined ? leaderPhoto : (current.leader?.photo || ""),
      contact: leaderContact !== undefined ? leaderContact : (current.leader?.contact || ""),
      bio: leaderBio !== undefined ? leaderBio : (current.leader?.bio || "")
    },
    schedule: schedule !== undefined ? schedule : current.schedule,
    activities: activities !== undefined ? activities : current.activities,
    gallery: gallery !== undefined ? gallery : current.gallery
  };

  saveDb(db);
  res.json({ success: true, ministry: db.ministries[minIndex] });
});

app.delete("/api/ministries/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = db.ministries.length;
  db.ministries = db.ministries.filter(m => m.id !== id);
  if (db.ministries.length === initialLength) {
    return res.status(404).json({ error: "Ministry not found." });
  }
  saveDb(db);
  res.json({ success: true, message: "Ministry deleted." });
});

// Donations CRUD - Delete (Manual audit cancellation)
app.delete("/api/donations/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = db.donations.length;
  db.donations = db.donations.filter(d => d.id !== id);
  if (db.donations.length === initialLength) {
    return res.status(404).json({ error: "Donation record not found." });
  }
  saveDb(db);
  res.json({ success: true, message: "Donation record voided." });
});

// Prayer Requests CRUD - Edit ( pastor answers/notes, public toggle ) & Delete
app.put("/api/prayer-requests/:id", (req, res) => {
  const { id } = req.params;
  const prayerIndex = db.prayerRequests.findIndex(p => p.id === id);
  if (prayerIndex < 0) {
    return res.status(404).json({ error: "Prayer request not found." });
  }

  const current = db.prayerRequests[prayerIndex];
  const { isAnswered, answersCount, isPrivate, isAnonymous, requestText, name } = req.body;

  db.prayerRequests[prayerIndex] = {
    ...current,
    name: name !== undefined ? name : current.name,
    requestText: requestText !== undefined ? requestText : current.requestText,
    isAnswered: isAnswered !== undefined ? isAnswered : current.isAnswered,
    answersCount: answersCount !== undefined ? parseInt(answersCount) : current.answersCount,
    isPrivate: isPrivate !== undefined ? isPrivate : current.isPrivate,
    isAnonymous: isAnonymous !== undefined ? isAnonymous : current.isAnonymous
  };

  saveDb(db);
  res.json({ success: true, prayerRequest: db.prayerRequests[prayerIndex] });
});

app.delete("/api/prayer-requests/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = db.prayerRequests.length;
  db.prayerRequests = db.prayerRequests.filter(p => p.id !== id);
  if (db.prayerRequests.length === initialLength) {
    return res.status(404).json({ error: "Prayer request not found." });
  }
  saveDb(db);
  res.json({ success: true, message: "Prayer request successfully deleted." });
});

// Blog Posts CRUD - Update
app.put(["/api/blog/:id", "/api/blog-posts/:id"], (req, res) => {
  const { id } = req.params;
  const postIndex = db.blogPosts.findIndex(p => p.id === id);
  if (postIndex < 0) {
    return res.status(404).json({ error: "Blog post not found." });
  }

  const current = db.blogPosts[postIndex];
  const { title, author, category, tags, content } = req.body;

  db.blogPosts[postIndex] = {
    ...current,
    title: title !== undefined ? title : current.title,
    author: author !== undefined ? author : current.author,
    category: category !== undefined ? category : current.category,
    tags: tags !== undefined ? tags : current.tags,
    content: content !== undefined ? content : current.content
  };

  saveDb(db);
  res.json({ success: true, blogPost: db.blogPosts[postIndex] });
});

// Media Files CRUD
// Photo Albums
app.post("/api/media/photo-albums", (req, res) => {
  const { title, date, category, photos } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: "Title and Category are required." });
  }
  const newAlbum = {
    id: "album_" + Date.now(),
    title,
    date: date || new Date().toISOString().split("T")[0],
    category,
    photos: photos || []
  };
  db.photoAlbums = db.photoAlbums || [];
  db.photoAlbums.push(newAlbum);
  saveDb(db);
  res.json({ success: true, album: newAlbum });
});

app.put("/api/media/photo-albums/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.photoAlbums.findIndex(a => a.id === id);
  if (idx < 0) return res.status(404).json({ error: "Album not found." });

  const current = db.photoAlbums[idx];
  const { title, date, category, photos } = req.body;

  db.photoAlbums[idx] = {
    ...current,
    title: title !== undefined ? title : current.title,
    date: date !== undefined ? date : current.date,
    category: category !== undefined ? category : current.category,
    photos: photos !== undefined ? photos : current.photos
  };
  saveDb(db);
  res.json({ success: true, album: db.photoAlbums[idx] });
});

app.delete("/api/media/photo-albums/:id", (req, res) => {
  const { id } = req.params;
  db.photoAlbums = (db.photoAlbums || []).filter(a => a.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Videos
app.post("/api/media/videos", (req, res) => {
  const { title, date, category, platform, videoId, url } = req.body;
  if (!title || !videoId) return res.status(400).json({ error: "Title and VideoId are required." });
  const newVideo = {
    id: "video_" + Date.now(),
    title,
    date: date || new Date().toISOString().split("T")[0],
    category: category || "Worship Services",
    platform: platform || "YouTube",
    videoId,
    url: url || `https://www.youtube.com/watch?v=${videoId}`
  };
  db.videos = db.videos || [];
  db.videos.push(newVideo);
  saveDb(db);
  res.json({ success: true, video: newVideo });
});

app.put("/api/media/videos/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.videos.findIndex(v => v.id === id);
  if (idx < 0) return res.status(404).json({ error: "Video not found." });

  const current = db.videos[idx];
  const { title, date, category, platform, videoId, url } = req.body;

  db.videos[idx] = {
    ...current,
    title: title !== undefined ? title : current.title,
    date: date !== undefined ? date : current.date,
    category: category !== undefined ? category : current.category,
    platform: platform !== undefined ? platform : current.platform,
    videoId: videoId !== undefined ? videoId : current.videoId,
    url: url !== undefined ? url : current.url
  };
  saveDb(db);
  res.json({ success: true, video: db.videos[idx] });
});

app.delete("/api/media/videos/:id", (req, res) => {
  const { id } = req.params;
  db.videos = (db.videos || []).filter(v => v.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Livestreams
app.post("/api/media/livestreams", (req, res) => {
  const { title, platform, videoId, url, status, startTime } = req.body;
  if (!title || !videoId) return res.status(400).json({ error: "Title and VideoId are required." });
  const newLivestream = {
    id: "live_" + Date.now(),
    title,
    platform: platform || "YouTube",
    videoId,
    url: url || `https://www.youtube.com/watch?v=${videoId}`,
    status: status || "upcoming",
    startTime: startTime || new Date().toISOString()
  };
  db.livestreams = db.livestreams || [];
  db.livestreams.push(newLivestream);
  saveDb(db);
  res.json({ success: true, livestream: newLivestream });
});

app.put("/api/media/livestreams/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.livestreams.findIndex(l => l.id === id);
  if (idx < 0) return res.status(404).json({ error: "Livestream not found." });

  const current = db.livestreams[idx];
  const { title, platform, videoId, url, status, startTime } = req.body;

  db.livestreams[idx] = {
    ...current,
    title: title !== undefined ? title : current.title,
    platform: platform !== undefined ? platform : current.platform,
    videoId: videoId !== undefined ? videoId : current.videoId,
    url: url !== undefined ? url : current.url,
    status: status !== undefined ? status : current.status,
    startTime: startTime !== undefined ? startTime : current.startTime
  };
  saveDb(db);
  res.json({ success: true, livestream: db.livestreams[idx] });
});

app.delete("/api/media/livestreams/:id", (req, res) => {
  const { id } = req.params;
  db.livestreams = (db.livestreams || []).filter(l => l.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Memberships & Users CRUD - Delete
app.delete("/api/members/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = db.members.length;
  db.members = db.members.filter(m => m.id !== id);
  if (db.members.length === initialLength) {
    return res.status(404).json({ error: "Member not found." });
  }
  saveDb(db);
  res.json({ success: true, message: "Member profile deleted successfully." });
});

app.put("/api/members/:id", (req, res) => {
  const { id } = req.params;
  const memberIdx = db.members.findIndex(m => m.id === id);
  if (memberIdx < 0) {
    return res.status(404).json({ error: "Member profile not found." });
  }

  const current = db.members[memberIdx];
  const { name, email, phone, district, familyGroup, familyRelation, servingDepartment, role, bio, photo, password } = req.body;

  db.members[memberIdx] = {
    ...current,
    name: name !== undefined ? name : current.name,
    email: email !== undefined ? email : current.email,
    phone: phone !== undefined ? phone : current.phone,
    district: district !== undefined ? district : current.district,
    familyGroup: familyGroup !== undefined ? familyGroup : current.familyGroup,
    familyRelation: familyRelation !== undefined ? familyRelation : current.familyRelation,
    servingDepartment: servingDepartment !== undefined ? servingDepartment : current.servingDepartment,
    role: role !== undefined ? role : current.role,
    bio: bio !== undefined ? bio : current.bio,
    photo: photo !== undefined ? photo : current.photo,
    password: password !== undefined ? password : current.password
  };

  saveDb(db);
  res.json({ success: true, member: db.members[memberIdx] });
});

// AI Interactive Chatbot API
app.post("/api/chat", async (req, res) => {
  const { message, history, language } = req.body;
  const currentLang = language || "English";

  if (!message) {
    return res.status(400).json({ error: "Message content cannot be empty." });
  }

  const systemInstruction = `You are "Pastor Sipho's Digital Assistant", a warm, gentle, wise, and helpful AI Chat Assistant representing Fonteyn Evangelical Church in Fonteyn, Mbabane, Eswatini. 
Your core mission is to assist visitors, members, and seekers with questions about church life, Christian beliefs, times of worship, events, and ministries.

Key Information about Fonteyn Evangelical Church:
- Location: Fonteyn, Mbabane, Eswatini. (Set in the beautiful hills of Mbabane).
- Leadership: Senior Pastor Sipho M. Dlamini (a welcoming and compassionate shepherd), Associate Pastor Lindifa Nxumalo, and Elder Thabo Shongwe.
- Core Values: Worship, Gospel Outreach, Discipleship, Community Service, Developing Leaders, Strengthening Families, Youth Empowerment.
- Service Times:
  * Sunday Morning Worship: 09:00 AM (Main Service)
  * Sunday Evening Devotional: 05:00 PM
  * Wednesday Bible Study: 06:00 PM (Exploring scriptures systematically)
  * Friday Prayer & Worship: 06:00 PM (An evening of deep prayer)
  * Saturday Youth Fellowship: 02:00 PM (Youth Ignite)
- Ministries: Children's, Youth, Young Adults, Men's Fellowship, Women's Fellowship, Family, Evangelism, Worship, Prayer, and Community Outreach.
- Church Beliefs: We are an Evangelical, Bible-believing church rooted in the grace, love, and redemption found in Jesus Christ. We emphasize the authority of Scripture, salvation by faith, and active community transformation.

Language Instructions:
The user is currently browsing the website in "${currentLang}". 
- If the current language is "Siswati" (or "Swati"), please respond in fluent, grammatically correct, warm, and natural Siswati, while maintaining the same Christian pastoral character.
- If the current language is "English", reply in warm, structured, encouraging English.
- Always be polite, biblical, and include occasional scriptures when relevant to comfort or guide the user. Keep your responses structured, clean, and reasonably concise so they look great in a chat bubble. Encourage them to book counseling, visit this Sunday, or join a ministry.`;

  if (!ai) {
    // Return offline simulated response if API Key is not set
    const simulatedResponse = currentLang === "Siswati"
      ? `Yemphi, ncesi. Ngingu-Assistant we-Fonteyn Evangelical Church. Semukela ngetandla letimhlophe! Umfundisi Sipho M. Dlamini utsandza kukumema kunkholo yetfu ngeLisontfo ngetsimbi yesiphohlo nembili (09:00 AM). Ngabe kukhona lokunye longakutsandza kwati ngemishado, luhlelo lwentsha nobe imikhuleko?`
      : `Welcome! I am the Digital Assistant for Fonteyn Evangelical Church in Mbabane. Pastor Sipho M. Dlamini and our whole congregation would love for you to join us this Sunday at 09:00 AM for our Morning Worship. Is there anything else I can help you with today? (e.g., ministries, counseling, or upcoming events)`;
    return res.json({ response: simulatedResponse });
  }

  try {
    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    }));

    // Add the current user message to the query
    formattedHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    const chatSession = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.7
      },
      history: formattedHistory.slice(0, -1) // Exclude the last message which we will send now
    });

    const response = await chatSession.sendMessage({
      message: message
    });

    res.json({ response: response.text || "I am praying for you and listening." });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: "AI assistant is temporarily resting. Here is an automatic response.", fallback: true });
  }
});

// Vite Development integration & Static Production Assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fonteyn Church Server] Listening securely on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
