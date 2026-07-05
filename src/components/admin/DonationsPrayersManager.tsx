import React, { useState } from "react";
import { Plus, Trash2, Heart, Check, Search, DollarSign, Download, Calendar, ShieldAlert, HeartHandshake } from "lucide-react";
import { DonationReceipt, PrayerRequest } from "../../types";

interface DonationsPrayersManagerProps {
  donations: DonationReceipt[];
  prayers: PrayerRequest[];
  adminRole: string;
  onRefresh: () => void;
}

export default function DonationsPrayersManager({
  donations,
  prayers,
  adminRole,
  onRefresh
}: DonationsPrayersManagerProps) {
  const [subTab, setSubTab] = useState<"donations" | "prayers">("donations");

  // Search & Filters
  const [donationSearch, setDonationSearch] = useState("");
  const [prayerSearch, setPrayerSearch] = useState("");

  // Feedback flags
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // --- MANUAL DONATION FIELDS ---
  const [donorName, setDonorName] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [donationPurpose, setDonationPurpose] = useState("Tithes");
  const [donationMethod, setDonationMethod] = useState("Mobile Money");
  const [donationDate, setDonationDate] = useState("");

  // Quick helper
  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };
  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  // --- SAVE MANUAL DONATION ---
  const handleSaveDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(donationAmount);
    if (!donorName || isNaN(parsedAmount) || parsedAmount <= 0) {
      triggerError("Provide a valid donor name and positive monetary value.");
      return;
    }

    const payload = {
      donorName,
      amount: parsedAmount,
      purpose: donationPurpose,
      paymentMethod: donationMethod,
      date: donationDate || new Date().toISOString().split("T")[0],
      txId: "TX" + Math.floor(Math.random() * 899999 + 100000)
    };

    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        triggerSuccess("Donation manually cataloged into ledger.");
        setDonorName("");
        setDonationAmount("");
        setDonationDate("");
        onRefresh();
      } else {
        triggerError("Failed to save donation.");
      }
    } catch (err) {
      triggerError("Network error.");
    }
  };

  // --- VOID DONATION ---
  const handleVoidDonation = async (id: string) => {
    if (!window.confirm("Are you sure you want to VOID/DELETE this donation record? This is audit critical.")) return;
    try {
      const res = await fetch(`/api/donations/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerSuccess("Donation voided from ledger.");
        onRefresh();
      } else {
        triggerError("Failed to void donation.");
      }
    } catch (err) {}
  };

  // --- EXPORT AUDIT REPORTS ---
  const handleExportAudit = () => {
    const listStr = donations
      .map(d => `TxRef: ${d.txId} | Date: ${d.date} | Purpose: ${d.purpose} | Amount: E${d.amount} | Method: ${d.paymentMethod} | Donor: ${d.donorName}`)
      .join("\n");

    const total = donations.reduce((acc, curr) => acc + curr.amount, 0);

    const content = `FONTEYN EVANGELICAL CHURCH
OFFICIAL STRATEGIC BOARD AUDIT STATEMENT
EXPORTED BY: ROLE [${adminRole}]
DATE RANGE: ALL TIME RECONCILED LEDGER

Donation ledger receipts details:
--------------------------------------------------------------------------------
${listStr}
--------------------------------------------------------------------------------
TOTAL FINANCIAL CAPACITY RECONCILED: E ${total.toFixed(2)}

This report constitutes safe internal accounting of local collections via credit card channels, bank deposits and MTN Mobile Money in Fonteyn, Mbabane.

© 2026 FEC Governance Board, Mbabane.`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FEC_Financial_Ledger_Audit_${adminRole}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    triggerSuccess("Financial ledger exported successfully!");
  };

  // --- PRAYER ACTIONS ---
  const handleToggleAnswered = async (p: PrayerRequest) => {
    const payload = {
      ...p,
      isAnswered: !p.isAnswered,
      answersCount: p.isAnswered ? Math.max(0, p.answersCount - 1) : p.answersCount + 1
    };

    try {
      const res = await fetch(`/api/prayer-requests/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        triggerSuccess(payload.isAnswered ? "Prayer marked as ANSWERED! Praise God!" : "Prayer status reset.");
        onRefresh();
      }
    } catch (err) {}
  };

  const handleDeletePrayer = async (id: string) => {
    if (!window.confirm("Permanently delete this prayer request?")) return;
    try {
      const res = await fetch(`/api/prayer-requests/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerSuccess("Prayer request removed.");
        onRefresh();
      }
    } catch (err) {}
  };

  // Filters
  const filteredDonations = donations.filter(d =>
    d.donorName.toLowerCase().includes(donationSearch.toLowerCase()) ||
    d.purpose.toLowerCase().includes(donationSearch.toLowerCase()) ||
    d.txId.toLowerCase().includes(donationSearch.toLowerCase())
  );

  const filteredPrayers = prayers.filter(p =>
    p.name.toLowerCase().includes(prayerSearch.toLowerCase()) ||
    p.requestText.toLowerCase().includes(prayerSearch.toLowerCase())
  );

  // Stats
  const totalRaised = donations.reduce((acc, curr) => acc + curr.amount, 0);
  const unansweredCount = prayers.filter(p => !p.isAnswered).length;

  return (
    <div className="space-y-6">
      {/* Tab select */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSubTab("donations")}
          className={`pb-2.5 px-4 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-1.5 ${
            subTab === "donations" ? "border-gold-500 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Donations Ledger & Statements</span>
        </button>
        <button
          onClick={() => setSubTab("prayers")}
          className={`pb-2.5 px-4 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-1.5 ${
            subTab === "prayers" ? "border-gold-500 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>Prayer Requests Manager ({prayers.length})</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-1 font-medium">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-1 font-medium">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* --- DONATIONS PANEL --- */}
      {subTab === "donations" && (
        <div className="space-y-6">
          {/* Header & Export */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Total Ledger Capacity Reconciled</p>
              <h4 className="font-heading font-extrabold text-2xl text-slate-900 mt-0.5">E {totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
              <p className="text-[10px] text-slate-500 font-sans">Role [ {adminRole} ] possesses clearance to download audit registers.</p>
            </div>

            <button
              onClick={handleExportAudit}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Audit Ledger</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form */}
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-1">
                <Plus className="h-4 w-4 text-gold-600" />
                <span>Log External Donation (Cash / Bank / Cheque)</span>
              </h4>

              <form onSubmit={handleSaveDonation} className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Donor Full Name / Entity *</label>
                  <input
                    type="text"
                    placeholder="Sipho Yati / Anonymous Partner"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Donation Amount (SZL/SZL Equivalents) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs font-mono font-bold">E</span>
                      <input
                        type="number"
                        placeholder="250.00"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Receipt Date</label>
                    <input
                      type="date"
                      value={donationDate}
                      onChange={(e) => setDonationDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Giving Purpose</label>
                    <select
                      value={donationPurpose}
                      onChange={(e) => setDonationPurpose(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
                    >
                      <option value="Tithes">Tithes</option>
                      <option value="Offerings">Offerings</option>
                      <option value="Building Fund">Building Fund</option>
                      <option value="Missions Fund">Missions Fund</option>
                      <option value="Youth Support">Youth Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Payment Channel</label>
                    <select
                      value={donationMethod}
                      onChange={(e) => setDonationMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
                    >
                      <option value="Mobile Money">Mobile Money (MTN Momo)</option>
                      <option value="Bank Transfer">Bank EFT Transfer</option>
                      <option value="Debit Card">Debit Card Swipe</option>
                      <option value="Credit Card">Credit Card Stripe</option>
                      <option value="Cash Entry">Physical Cash Deposit</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white font-heading font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg transition-colors mt-2"
                >
                  Log Receipt Record
                </button>
              </form>
            </div>

            {/* Ledger List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search ledger by donor name, purpose, or TxRef reference ID..."
                  value={donationSearch}
                  onChange={(e) => setDonationSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {filteredDonations.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">No ledger transactions matched.</p>
                ) : (
                  filteredDonations.map((receipt) => (
                    <div key={receipt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-heading font-extrabold text-slate-800">{receipt.donorName}</span>
                          <span className="bg-slate-200 text-slate-600 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                            {receipt.purpose}
                          </span>
                        </div>
                        <p className="text-slate-400 font-mono text-[9px] mt-0.5">
                          {receipt.date} • Ref: <span className="text-slate-600">{receipt.txId}</span> • Method: {receipt.paymentMethod}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="font-mono font-bold text-emerald-600 text-xs">+ E {receipt.amount.toFixed(2)}</span>
                        <button
                          onClick={() => handleVoidDonation(receipt.id)}
                          className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded border border-slate-250 transition-colors"
                          title="Void transaction"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PRAYER REQUESTS PANEL --- */}
      {subTab === "prayers" && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <div>
              <p className="font-heading font-extrabold text-xs text-slate-800">Intercessory Prayer Moderation Panel</p>
              <p className="text-[10px] text-slate-400 font-sans">Toggle intercession states and moderate board privacy parameters.</p>
            </div>
            <span className="bg-amber-100 text-amber-800 font-heading font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
              {unansweredCount} Unanswered
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search request text, names, or district tags..."
              value={prayerSearch}
              onChange={(e) => setPrayerSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {filteredPrayers.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">No prayer requests recorded.</p>
            ) : (
              filteredPrayers.map((pr) => (
                <div key={pr.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col md:flex-row justify-between gap-4 text-xs">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-primary-100 text-primary-900 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase font-heading">
                        {pr.isAnonymous ? "Anonymous" : pr.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{pr.date}</span>
                      <span className={`text-[8px] font-heading font-bold uppercase px-1.5 py-0.5 rounded ${
                        pr.isPrivate ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {pr.isPrivate ? "Confidential" : "Public Board"}
                      </span>
                    </div>

                    <p className="text-slate-600 font-sans leading-relaxed">{pr.requestText}</p>
                    {pr.answersCount > 0 && (
                      <p className="text-[10px] font-semibold text-emerald-600 flex items-center space-x-1">
                        <span>✔</span>
                        <span>Answered: This request has {pr.answersCount} spiritual breakthroughs logged.</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 md:self-center shrink-0">
                    <button
                      onClick={() => handleToggleAnswered(pr)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-heading font-bold uppercase border tracking-wider transition-all flex items-center space-x-1 ${
                        pr.isAnswered
                          ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                          : "bg-white border-slate-200 text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <HeartHandshake className="h-3.5 w-3.5" />
                      <span>{pr.isAnswered ? "Answered!" : "Mark Answered"}</span>
                    </button>

                    <button
                      onClick={() => handleDeletePrayer(pr.id)}
                      className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded border border-slate-200 hover:border-red-200 transition-colors"
                      title="Delete request"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
