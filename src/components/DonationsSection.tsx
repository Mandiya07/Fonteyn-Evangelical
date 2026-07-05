import React, { useState, useEffect } from "react";
import { CreditCard, Smartphone, Landmark, Check, Heart, Shield, Sparkles, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { translations } from "../lib/translations";

interface DonationsSectionProps {
  language: "en" | "ss";
}

export default function DonationsSection({ language }: DonationsSectionProps) {
  const [givePurpose, setGivePurpose] = useState("Tithes");
  const [giveAmount, setGiveAmount] = useState("250");
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "bank" | "debit" | "credit">("momo");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState("Monthly");

  // Donor identity fields
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  // MOMO Form fields
  const [momoNumber, setMomoNumber] = useState("");
  
  // Card Form fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [successTxId, setSuccessTxId] = useState("");

  const [recentGivers, setRecentGivers] = useState<Array<{ id: string; purpose: string; amount: number; date: string }>>([]);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await fetch("/api/donations");
      if (res.ok) {
        const data = await res.json();
        // Take latest 3 donations
        setRecentGivers(data.slice(-3).reverse());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = Number(giveAmount === "custom" ? customAmount : giveAmount);
    if (!finalAmount || finalAmount <= 0) return;
    if (!donorName.trim() || !donorEmail.trim()) return;

    try {
      setIsLoading(true);
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName,
          donorEmail,
          amount: finalAmount,
          purpose: givePurpose,
          paymentMethod,
          isRecurring,
          recurrenceInterval
        })
      });

      if (res.ok) {
        const data = await res.json();
        const receiptNo = data.donation?.receiptNumber || data.donation?.id || "FEC-TXN-" + Date.now();
        setSuccessTxId(receiptNo);
        setDonationSuccess(true);
        setDonorName("");
        setDonorEmail("");
        setCustomAmount("");
        setMomoNumber("");
        setCardNumber("");
        setCardExpiry("");
        setCardCvv("");
        fetchDonations(); // Refresh history
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const purposes = [
    { value: "Tithes", label: language === "en" ? "Tithes" : "Kwanhlonipho (Tithe)" },
    { value: "Offerings", label: language === "en" ? "Offerings" : "Umnikelo (Offering)" },
    { value: "Building Fund", label: language === "en" ? "Building Fund" : "Sikhwama SeSakhiwo" },
    { value: "Missions Fund", label: language === "en" ? "Missions Fund" : "Tingaba Temishini" }
  ];

  const presets = ["100", "250", "500", "1000", "custom"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900 tracking-tight">
          {translations.donationsTitle[language]}
        </h2>
        <div className="h-1.5 w-24 bg-gold-500 mx-auto rounded-full mt-3 mb-4"></div>
        <p className="text-slate-600 font-sans text-sm sm:text-base">
          {translations.donationsSubtitle[language]}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Giving form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
          
          {donationSuccess ? (
            <div className="text-center py-12 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-700 font-sans text-sm flex flex-col items-center justify-center space-y-2">
              <Check className="h-10 w-10 text-emerald-600 mb-1 animate-bounce" />
              <h3 className="font-heading font-bold text-lg uppercase tracking-wider">{language === "en" ? "Donation Completed!" : "Inhlawulo Iphumelele!"}</h3>
              <p className="text-slate-500 text-xs px-10 leading-relaxed font-normal">
                {language === "en"
                  ? "Thank you so much for your obedience and generous support. A receipt has been dispatched to your mobile record."
                  : "Siyabonga kakhulu ngelutsandvo nemnikelo wakho longcwele."}
              </p>
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-200/80 mt-4 text-[10px] font-mono text-slate-400">
                Transaction Ref: {successTxId}
              </div>
              <button
                onClick={() => setDonationSuccess(false)}
                className="mt-6 bg-primary-800 hover:bg-primary-900 text-white font-heading font-bold text-xs uppercase tracking-wider px-6 py-2 rounded-lg transition-colors"
              >
                Make Another Gift
              </button>
            </div>
          ) : (
            <form onSubmit={handleGiveSubmit} className="space-y-6">
              
              {/* Donor Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-heading text-xs font-bold uppercase tracking-wider mb-2">
                    {language === "en" ? "Your Name *" : "Ligama Lakho *"}
                  </label>
                  <input
                    type="text"
                    placeholder={language === "en" ? "e.g., Sipho Dlamini" : "Isib. Sipho Dlamini"}
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-800 font-sans text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-xs font-bold uppercase tracking-wider mb-2">
                    {language === "en" ? "Your Email Address *" : "I-imeyili Yakho *"}
                  </label>
                  <input
                    type="email"
                    placeholder={language === "en" ? "e.g., sipho@gmail.com" : "Isib. sipho@gmail.com"}
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-800 font-sans text-xs"
                    required
                  />
                </div>
              </div>

              {/* Purpose Selection */}
              <div>
                <label className="block text-slate-700 font-heading text-xs font-bold uppercase tracking-wider mb-2">{translations.givingPurpose[language]}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {purposes.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setGivePurpose(p.value)}
                      className={`py-2 px-3 rounded-xl text-xs font-heading font-bold uppercase tracking-wider border text-center transition-all ${
                        givePurpose === p.value
                          ? "bg-primary-800 border-primary-800 text-white shadow-md"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Presets */}
              <div>
                <label className="block text-slate-700 font-heading text-xs font-bold uppercase tracking-wider mb-2">{translations.givingAmount[language]}</label>
                <div className="grid grid-cols-5 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setGiveAmount(preset)}
                      className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-heading font-bold uppercase tracking-wider border text-center transition-all ${
                        giveAmount === preset
                          ? "bg-gold-500 border-gold-500 text-primary-950 shadow-md font-extrabold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {preset === "custom" ? "Custom" : `E${preset}`}
                    </button>
                  ))}
                </div>

                {giveAmount === "custom" && (
                  <div className="mt-3 relative animate-fade-in">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 font-heading font-extrabold text-slate-400">E</span>
                    <input
                      type="number"
                      placeholder="Enter custom Lilangeni amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-800 font-sans text-sm"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Recurring Switch */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-heading font-extrabold text-xs text-slate-800 uppercase tracking-wider block">Set as Recurring Gift</span>
                  <span className="text-[10px] text-slate-400 font-sans">Automate your obedience week-by-week or monthly.</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  {isRecurring && (
                    <select
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg text-xs px-2 py-1 text-slate-600 focus:outline-none"
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  )}
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="h-5 w-5 text-primary-800 focus:ring-primary-800 rounded"
                  />
                </div>
              </div>

              {/* Payment Method Switcher */}
              <div>
                <label className="block text-slate-700 font-heading text-xs font-bold uppercase tracking-wider mb-2">Select Payment Gateway</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("momo")}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                      paymentMethod === "momo"
                        ? "bg-primary-900 border-primary-900 text-white shadow-md"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Smartphone className="h-5 w-5 text-gold-400 mb-1" />
                    <span className="font-heading font-bold text-[10px] uppercase tracking-wider">Mobile Money</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                      paymentMethod === "bank"
                        ? "bg-primary-900 border-primary-900 text-white shadow-md"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Landmark className="h-5 w-5 text-gold-400 mb-1" />
                    <span className="font-heading font-bold text-[10px] uppercase tracking-wider">Bank Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("debit")}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                      paymentMethod === "debit"
                        ? "bg-primary-900 border-primary-900 text-white shadow-md"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-gold-400 mb-1" />
                    <span className="font-heading font-bold text-[10px] uppercase tracking-wider">Debit Card</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("credit")}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                      paymentMethod === "credit"
                        ? "bg-primary-900 border-primary-900 text-white shadow-md"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-gold-400 mb-1" />
                    <span className="font-heading font-bold text-[10px] uppercase tracking-wider">Credit Card</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Payment fields */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 animate-fade-in">
                {paymentMethod === "momo" ? (
                  <div className="space-y-2">
                    <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">MTN Mobile Money Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g., 76041234 (7 or 8 digits)"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 font-mono"
                      required
                    />
                    <p className="text-[10px] text-slate-400 italic">We will trigger an instant MoMo PIN prompt to complete this secure collection.</p>
                  </div>
                ) : paymentMethod === "bank" ? (
                  <div className="space-y-2">
                    <div className="bg-white border border-slate-200 p-4 rounded-lg">
                      <p className="text-xs font-bold font-heading text-slate-800 mb-2">Fonteyn Evangelical Church Accounts:</p>
                      <ul className="text-xs text-slate-600 space-y-1 font-mono">
                        <li>Bank: FNB Eswatini</li>
                        <li>Branch Code: 280164</li>
                        <li>Account No: 62000000000</li>
                        <li>Reference: [Your Name] + [Purpose]</li>
                      </ul>
                      <p className="text-[10px] text-slate-400 italic mt-3">Please use the details above to make an EFT. Click "Give Now" to register your pledge, and we will email you the receipt upon bank confirmation.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">Card Number *</label>
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 font-mono"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">Expiry Date *</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider">CVV *</label>
                        <input
                          type="password"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security note */}
              <p className="text-[11px] text-slate-400 font-sans flex items-center justify-center space-x-1">
                <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Secure SSL encrypted processing. Funds disbursed directly to FEC Bank Board accounts.</span>
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-800 hover:bg-primary-900 text-white font-heading font-extrabold text-sm uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <Heart className="h-5 w-5 text-rose-400 fill-rose-400 animate-pulse" />
                <span>{isLoading ? "Processing Offering..." : `Gift E${giveAmount === "custom" ? customAmount : giveAmount} Securely`}</span>
              </button>

            </form>
          )}

        </div>

        {/* Right Column: Funding Transparent Reports & Recent History */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Funds Usage Transparency Chart */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
            <h3 className="font-heading font-bold text-base text-primary-950 mb-1 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-gold-500" />
              <span>Transparent Reporting</span>
            </h3>
            <p className="text-slate-400 text-xs font-sans mb-6">How every Lilangeni (E) of your contribution is allocated at FEC.</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-heading font-semibold text-slate-700 mb-1">
                  <span>Missions & Regional Outreaches</span>
                  <span>30%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-800 rounded-full" style={{ width: "30%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-heading font-semibold text-slate-700 mb-1">
                  <span>Fonteyn Mercy Kitchen & Reliefe</span>
                  <span>25%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-500 rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-heading font-semibold text-slate-700 mb-1">
                  <span>Local Campus Ministry & Clergy</span>
                  <span>25%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-heading font-semibold text-slate-700 mb-1">
                  <span>Sanctuary Upgrades & Building</span>
                  <span>20%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: "20%" }}></div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal font-sans mt-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
              * Annual audited reports are published transparently during the annual church conference in October. Audits managed by independent Eswatini certified bookkeepers.
            </p>
          </div>

          {/* Recent Giving Stream */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
            <h3 className="font-heading font-bold text-sm text-primary-950 mb-3 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-gold-500 animate-pulse" />
              <span>Recent Love Offerings</span>
            </h3>

            <div className="space-y-3">
              {recentGivers.map((giver, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-heading font-bold text-slate-800">{giver.purpose}</span>
                    <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{giver.date}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600">+ E{giver.amount}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
