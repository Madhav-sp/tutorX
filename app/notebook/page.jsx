"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  BookOpen,
  FileText,
  Zap,
  Layers,
  MessageSquare,
  ArrowLeft,
  Plus,
  Home,
  BarChart3,
  Target,
  Settings,
  LogOut,
  Bell,
  Sparkles,
  Info,
  Clock,
  ChevronRight,
  Send,
  Trophy,
  Search,
  Maximize2,
  Minimize2,
  Volume2,
  Globe,
  Download,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import WeatherWidget from "../components/WeatherWidget";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function NotebookPage() {
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [activeView, setActiveView] = useState("chat"); // Default to chat in research hub
  const [selection, setSelection] = useState("");
  const [sectionExplanation, setSectionExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/notebook/list")
      .then((res) => res.json())
      .then(setNotebooks);
  }, []);

  const handleTextSelection = (e) => {
    const text = window.getSelection().toString().trim();
    if (text && text.length > 10) {
      const range = window.getSelection().getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection(text);
      setSelectionBox({
        top: rect.top + window.scrollY - 45,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    } else {
      setSelectionBox(null);
    }
  };

  const explainSelection = async () => {
    if (!selection) return;
    setExplaining(true);
    setSectionExplanation("");
    setSelectionBox(null);
    setActiveView("explanation"); // Switch to insights tab to show explanation

    try {
      const res = await fetch("/api/notebook/section-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: selection,
          fullNotes: selectedNotebook?.notes,
        }),
      });
      const data = await res.json();
      setSectionExplanation(data.explanation);
    } finally {
      setExplaining(false);
    }
  };

  const handleDownloadPDF = () => {
    // Elegant way to trigger PDF download via browser print
    const originalTitle = document.title;
    document.title = `Research_Notes_${selectedNotebook?.title || "Notebook"}`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="flex h-screen bg-[#0b0b0c] text-gray-300 font-sans selection:bg-orange-500/30">
      <div className="no-print">
        <Sidebar hidden={isFocusMode} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="no-print">
          <TopBar
            currentPage={selectedNotebook ? selectedNotebook.title : "Library"}
            showSearch={!selectedNotebook}
          />
        </div>

        <main className="flex-1 overflow-hidden flex">
          {!selectedNotebook ? (
            /* ================= LIBRARY VIEW ================= */
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto p-12 custom-scroll">
                <div className="max-w-5xl mx-auto">
                  <header className="flex justify-between items-center mb-12">
                    <div>
                      <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Notebook<span className="text-orange-500">LLM</span>
                      </h1>
                      <p className="text-gray-500 mt-1">
                        High-performance AI research environment
                      </p>
                    </div>

                    <button
                      onClick={() => router.push("/notebook/upload")}
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black px-6 py-3 rounded-2xl font-bold transition shadow-lg shadow-orange-500/10"
                    >
                      <Plus size={20} /> New Notebook
                    </button>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notebooks.map((nb) => (
                      <div
                        key={nb._id}
                        onClick={() => {
                          setSelectedNotebook(nb);
                          setActiveView("chat");
                        }}
                        className="group bg-[#111113] border border-white/5 p-7 rounded-[32px] hover:border-orange-500/30 transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform">
                          <BookOpen size={24} />
                        </div>

                        <h2 className="text-lg font-bold text-gray-100 uppercase tracking-tight mb-2">
                          {nb.title}
                        </h2>

                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-6">
                          {nb.summary || "Summarized insights from your research."}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 uppercase text-[10px] font-black text-gray-600 tracking-widest">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {new Date(nb.createdAt).toLocaleDateString()}
                          </div>
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}

                    {notebooks.length === 0 && (
                      <div className="col-span-full py-24 text-center border border-dashed border-white/5 rounded-[40px]">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-gray-500">Your library is empty. Click "New Notebook" to begin.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <RightPanel />
            </div>
          ) : (
            /* ================= WORKSPACE VIEW (TRIPLE PANE) ================= */
            <div className="flex h-full w-full overflow-hidden bg-[#070708]">
              {/* 1. LEFT PANEL: NAVIGATOR */}
              {!isFocusMode && (
                <aside className="w-64 border-r border-white/5 bg-[#0e0e10]/50 backdrop-blur-xl p-6 flex flex-col gap-2 animate-in slide-in-from-left-4 duration-300 no-print">
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setSelectedNotebook(null)}
                      className="flex items-center gap-2 px-3 py-2 text-[10px] font-black text-gray-500 hover:text-orange-400 transition uppercase tracking-widest group"
                    >
                      <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                      Library
                    </button>
                    
                    <button
                      onClick={() => setIsFocusMode(!isFocusMode)}
                      className="p-2 rounded-lg border border-white/5 text-gray-500 hover:text-white transition-all"
                      title="Toggle Focus Mode"
                    >
                      <Maximize2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] px-4 mb-4">
                      Research Guide
                    </p>
                    <SidebarItem
                      icon={<MessageSquare size={18} />}
                      label="Research Hub"
                      active={activeView === "chat"}
                      onClick={() => setActiveView("chat")}
                    />
                    <SidebarItem
                      icon={<Zap size={18} />}
                      label="Key Summary"
                      active={activeView === "summary"}
                      onClick={() => setActiveView("summary")}
                    />
                    <SidebarItem
                      icon={<Layers size={18} />}
                      label="Deep Insights"
                      active={activeView === "explanation"}
                      onClick={() => setActiveView("explanation")}
                    />
                    <SidebarItem
                      icon={<Sparkles size={18} />}
                      label="Knowledge Cards"
                      active={activeView === "flashcards"}
                      onClick={() => setActiveView("flashcards")}
                    />
                  </div>

                  <div className="mt-auto p-5 rounded-3xl bg-orange-500/5 border border-orange-500/10">
                    <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase mb-2">
                      <Sparkles size={12} />
                      AI Assistant
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Highlight any text in the source to trigger deep-dive reasoning.
                    </p>
                  </div>
                </aside>
              )}

              {/* 2. MIDDLE PANEL: THE SOURCE CONTENT */}
              <section
                className="flex-1 overflow-y-auto p-12 custom-scroll relative bg-[#070708] border-r border-white/5"
                onMouseUp={handleTextSelection}
              >
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <span className="text-[10px] text-orange-500 font-black uppercase tracking-[0.3em] mb-1">Source</span>
                      <h2 className="text-2xl font-black text-white tracking-tight uppercase">Document Notes</h2>
                    </div>
                    <div className="flex items-center gap-3 no-print">
                      <button 
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/10"
                      >
                        <Download size={14} /> Export PDF
                      </button>
                      <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-gray-500">
                        V1.0
                      </div>
                    </div>
                  </div>

                  <div className="relative group print-content">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 to-transparent rounded-[2rem] blur opacity-20 pointer-events-none no-print"></div>
                    <div className="relative prose prose-invert prose-orange max-w-none prose-p:leading-[1.8] prose-p:text-[16px] prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight bg-[#111113]/50 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl select-text">
                      <ReactMarkdown>{selectedNotebook.notes}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* FLOATING ACTION */}
                {selectionBox && (
                  <button
                    onClick={explainSelection}
                    style={{
                      position: "absolute",
                      top: selectionBox.top,
                      left: selectionBox.left,
                      transform: "translateX(-50%)",
                    }}
                    className="z-50 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white hover:scale-105 active:scale-95 transition-all animate-in zoom-in-90 duration-300 uppercase"
                  >
                    <Sparkles size={14} className="text-orange-500" /> Explain
                  </button>
                )}
              </section>

              {/* 3. RIGHT PANEL: THE RESEARCH HUB (Chat, Info, Flashcards) */}
              <aside className="w-[480px] bg-[#0b0b0c] flex flex-col shadow-2xl relative z-10 no-print">
                {/* HUB TABS */}
                <div className="p-4 border-b border-white/5 flex gap-2">
                  <button
                    onClick={() => setActiveView("chat")}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === "chat" ? "bg-white text-black" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
                  >
                    Assistant
                  </button>
                  <button
                    onClick={() => setActiveView("summary")}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === "summary" ? "bg-white text-black" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveView("flashcards")}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === "flashcards" ? "bg-white text-black" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
                  >
                    Review
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scroll p-8">
                  {explaining && (
                    <div className="py-32 text-center animate-in fade-in duration-500">
                      <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-orange-500 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 tracking-tight">AI REASONING</h3>
                      <p className="text-gray-500 text-xs uppercase tracking-widest">Synthesizing insights...</p>
                    </div>
                  )}

                  {!explaining && activeView === "chat" && (
                    <ChatPanel notes={selectedNotebook.notes} />
                  )}

                  {!explaining && activeView === "summary" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-8">Executive Summary</h3>
                      <div className="prose prose-invert max-w-none prose-orange text-[15px] leading-relaxed text-gray-300">
                        <ReactMarkdown>{selectedNotebook.summary}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {!explaining && activeView === "explanation" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-8">Generated Insight</h3>
                      {sectionExplanation || selectedNotebook.easyExplanation ? (
                        <div className="prose prose-invert max-w-none prose-orange text-[15px] leading-relaxed text-gray-300">
                          <ReactMarkdown>{sectionExplanation || selectedNotebook.easyExplanation}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="text-center py-32 bg-white/[0.02] border border-dashed border-white/5 rounded-[40px]">
                          <Info size={40} className="mx-auto mb-4 text-orange-500 opacity-20" />
                          <p className="text-gray-500 text-xs px-10">Select source text to generate explanations here.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!explaining && activeView === "flashcards" && (
                    <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-4">Neural Knowledge Cards</h3>
                      {selectedNotebook.flashcards?.map((c, i) => (
                        <div key={i} className="group perspective-1000">
                          <div className="relative bg-[#111113] p-8 rounded-[32px] border border-white/5 shadow-xl transition-all duration-500 hover:border-orange-500/30 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                              <Sparkles size={40} className="text-orange-500" />
                            </div>
                            <div className="relative z-10">
                              <p className="text-[9px] font-black text-orange-500/60 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-orange-500" /> Card {i + 1}
                              </p>
                              <p className="text-xl font-black text-white leading-tight mb-8 group-hover:text-orange-100 transition-colors">{c.question}</p>
                              <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 text-sm text-gray-300 leading-relaxed italic border-dashed group-hover:bg-orange-500/10 transition-colors">
                                <span className="text-orange-500/50 mr-2 font-black tracking-tighter uppercase text-[10px]">Response:</span>
                                {c.answer}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}




function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-4 px-5 py-4 rounded-3xl transition-all duration-300 relative overflow-hidden ${active
        ? "bg-white text-black font-extrabold shadow-xl shadow-white/5 border-white"
        : "text-gray-500 hover:bg-white/[0.03] hover:text-white"
        }`}
    >
      <div className={`transition-colors ${active ? "text-orange-600" : "text-gray-500 group-hover:text-orange-400"}`}>
        {icon}
      </div>
      <span className="text-xs uppercase tracking-widest font-black">{label}</span>
      {active && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1 h-1 bg-orange-500 rounded-full" />
      )}
    </button>
  );
}

function RightPanel() {
  const { user } = useUser();
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/goals", { headers: { "x-user-id": user.id } })
      .then((res) => res.json())
      .then((data) => {
        setUpcoming((data || []).filter((t) => !t.completed).slice(0, 2).map((t) => ({ label: t.text, time: "Today" })));
      })
      .catch(() => {
        setUpcoming([{ label: "Review Notebooks", time: "Today" }, { label: "Weekly Goals", time: "Today" }]);
      });
  }, [user]);

  return (
    <aside className="w-80 bg-[#0e0e10] border-l border-white/5 p-8 space-y-10 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 mb-6">Learning Activity</h3>
        <div className="flex items-end gap-1.5 h-32">
          {[40, 70, 45, 90, 60, 30, 50].map((h, i) => (
            <div key={i} className={`flex-1 rounded-sm ${i === 3 ? "bg-orange-500" : "bg-white/5"}`} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 mb-6">Up Next</h3>
        <div className="space-y-3">
          {upcoming.map((e, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-orange-500/20 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10">
                <Trophy className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-200">{e.label}</p>
                <p className="text-[10px] text-gray-500 uppercase font-black">{e.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-7 rounded-[32px] bg-[#111113] border border-orange-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-3xl" />
        <p className="text-[9px] font-black uppercase text-orange-500 mb-2 tracking-[0.2em]">Upgrade Now</p>
        <p className="text-lg font-bold text-white mb-6 leading-tight">Unlock AI Deep-Analytic Engine</p>
        <button className="w-full bg-white text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
          Elevate
        </button>
      </div>
    </aside>
  );
}

function ChatPanel({ notes }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Ready to assist. I've indexed your document—what specifically shall we investigate?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [translatingId, setTranslatingId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const ask = async (customQ) => {
    const q = customQ || question;
    if (!q.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/notebook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, notes }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer, id: Date.now() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Network error. Please retry." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (msgId, text, lang) => {
    setTranslatingId(`${msgId}-${lang}`);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage: lang }),
      });
      const data = await res.json();
      if (data.translatedText) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, text: data.translatedText } : m
          )
        );
      }
    } catch (error) {
      console.error("Translation Failed", error);
    } finally {
      setTranslatingId(null);
    }
  };

  const handleSpeak = (text) => {
    // Basic TTS using browser API
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel(); // Stop playing anything else
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex-1 space-y-8 mb-8 overflow-y-auto custom-scroll pr-2" ref={scrollRef}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[95%] p-6 rounded-[2rem] text-[14px] leading-relaxed shadow-xl ${
                m.role === "user"
                  ? "bg-white text-black font-bold"
                  : "bg-[#111113] text-gray-300 border border-white/5"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-invert prose-orange max-w-none">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                  
                  {/* ACTIONS */}
                  <div className="mt-4 flex items-center gap-3 pt-4 border-t border-white/5">
                    <button
                      onClick={() => handleSpeak(m.text)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all"
                      title="Read Aloud"
                    >
                      <Volume2 size={14} />
                    </button>
                    <div className="flex items-center gap-1 ml-auto">
                      {["Hindi", "Telugu"].map((lang) => (
                        <button
                          key={lang}
                          disabled={translatingId === `${m.id}-${lang}`}
                          onClick={() => handleTranslate(m.id, m.text, lang)}
                          className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-orange-500 hover:text-black text-[9px] font-black uppercase tracking-widest text-gray-500 transition-all disabled:opacity-50"
                        >
                          {translatingId === `${m.id}-${lang}` ? "..." : lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase animate-pulse">
            <Sparkles size={14} /> AI Engine Active...
          </div>
        )}
      </div>

      <div className="relative group mt-auto pt-4 shadow-[0_-20px_40px_#0b0b0c]">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Command Assistant..."
          className="w-full bg-[#111113] border border-white/10 px-6 py-5 rounded-[2rem] text-white focus:outline-none focus:border-orange-500/40 transition-all font-medium text-sm pr-16"
        />
        <button
          onClick={() => ask()}
          className="absolute right-2 top-[calc(50%+8px)] -translate-y-1/2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
