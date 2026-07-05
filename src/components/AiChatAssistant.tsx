import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Send, X, ArrowDown, Shield, Eye, HelpCircle } from "lucide-react";

interface AiChatAssistantProps {
  language: "en" | "ss";
}

export default function AiChatAssistant({ language }: AiChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: language === "en"
        ? "Greetings! I am the Fonteyn FEC Pastoral & Church Assistant. How can I guide you today? I can help with service hours, tithing, family altars, prayer requests, or provide spiritual encouragements."
        : "Likhona! Ngingumsiti waseFonteyn FEC. Ngingakusita njani namuhla? Ngingakusita ngetingaba, imiphakatsi, nobe emavesi eBhayibheli."
    }
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, language })
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.response || data.reply || data.text || "";
        setMessages(prev => [...prev, { sender: "ai", text: replyText }]);
      } else {
        throw new Error();
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: language === "en"
            ? "Pardon me, my communication link is experiencing high traffic. Please try asking again in a moment, or visit our Contact section!"
            : "Uxolo kakhulu, kute kusebenta komsiti we-AI kwekhatsi. Sicela ubuye emveni."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const preloadedPrompts = language === "en" ? [
    "What are Sunday service times?",
    "Tell me about the Youth Ministry",
    "Encouragement for family anxiety",
    "How do I give tithes via Mobile Money?"
  ] : [
    "Ngumuphi umsebenzi wentsha?",
    "Nginganikela njani ngetimali?"
  ];

  return (
    <>
      {/* Floating Button in bottom right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-primary-900 to-primary-800 hover:from-gold-600 hover:to-gold-500 text-white hover:text-primary-950 p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center space-x-2 border border-primary-750 hover:border-gold-500/20 group"
          title="Pastoral Chat Helper"
        >
          <Sparkles className="h-6 w-6 animate-pulse text-gold-400 group-hover:text-primary-950" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-heading font-extrabold uppercase tracking-wider block whitespace-nowrap">
            {language === "en" ? "AI Care Helper" : "Umsiti we-AI"}
          </span>
        </button>
      )}

      {/* Retractable Chat Box */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-150 animate-slide-up flex flex-col h-[500px]">
          
          {/* Header */}
          <div className="bg-primary-900 text-white p-4 flex items-center justify-between border-b border-primary-850 shadow">
            <div className="flex items-center space-x-2.5">
              <div className="bg-primary-950 p-2 rounded-xl border border-primary-800">
                <Sparkles className="h-4.5 w-4.5 text-gold-400 animate-pulse" />
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-xs sm:text-sm text-white">FEC Care Assistant</h4>
                <p className="text-[10px] text-slate-300 font-sans flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Pastor's virtual guide</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="bg-primary-950 hover:bg-primary-800 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Scroll Box */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 scrollbar-thin">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-sans leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary-800 text-white rounded-tr-none shadow"
                      : "bg-white text-slate-700 border border-slate-150 rounded-tl-none shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-500 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs font-sans shadow-sm border border-slate-150 flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gold-600"></div>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap gap-1.5 justify-center">
              {preloadedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(p)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 px-2 py-1.5 rounded-lg text-[10px] font-sans text-left transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Secure / Privacy note */}
          <div className="px-4 py-1.5 bg-slate-100 border-t border-slate-150 text-[10px] text-slate-400 font-sans flex items-center justify-center space-x-1">
            <Shield className="h-3 w-3 text-emerald-500 shrink-0" />
            <span>Chat is securely sandboxed. Privacy compliant.</span>
          </div>

          {/* Form input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-150 flex gap-2">
            <input
              type="text"
              placeholder={language === "en" ? "Ask something about our church..." : "Buza lutfo..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary-800 placeholder-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary-800 hover:bg-primary-900 disabled:bg-slate-300 text-white p-2.5 rounded-xl transition-colors shadow"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
