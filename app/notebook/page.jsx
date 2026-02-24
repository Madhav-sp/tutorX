"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  BookOpen,
  FileText,
  Zap,
  Layers,
  MessageSquare,
  ArrowLeft,
  Plus,
  Search,
  Home,
  BarChart3,
  Target,
  Settings,
  LogOut,
  Bell,
  Sparkles,
  Info,
} from "lucide-react";
import { useClerk, UserButton } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import WeatherWidget from "../components/WeatherWidget";

export default function NotebookPage() {
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [activeView, setActiveView] = useState("summary");
  const [selection, setSelection] = useState("");
  const [sectionExplanation, setSectionExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
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
        top: rect.top + window.scrollY - 40,
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
      setActiveView("explanation");
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0b0b0c] text-gray-300 font-sans">
      <Sidebar activePage="/notebook" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          currentPage={selectedNotebook ? selectedNotebook.title : "Library"}
        />

        <main className="flex-1 overflow-hidden relative">
          {!selectedNotebook ? (
            /* ================= LIBRARY VIEW ================= */
            <div className="h-full overflow-y-auto p-8 custom-scroll">
              <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                      Notebook<span className="text-orange-500">LLM</span>
                    </h1>
                    <p className="text-gray-500 mt-1">
                      Your personal AI research assistant
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/notebook/upload")}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black px-5 py-2.5 rounded-xl font-semibold transition shadow-lg shadow-orange-500/10"
                  >
                    <Plus size={18} /> New Notebook
                  </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notebooks.map((nb) => (
                    <div
                      key={nb._id}
                      onClick={() => {
                        setSelectedNotebook(nb);
                        setActiveView("summary");
                      }}
                      className="group bg-[#111113] border border-white/5 p-6 rounded-3xl hover:border-orange-500/30 transition cursor-pointer"
                    >
                      <div className="h-12 w-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                        <BookOpen className="text-orange-500" size={22} />
                      </div>

                      <h2 className="text-xl font-semibold text-gray-100 uppercase tracking-tight">
                        {nb.title}
                      </h2>

                      <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {nb.summary ||
                          "This notebook contains summarized insights."}
                      </p>

                      <div className="mt-6 text-[10px] uppercase tracking-widest text-gray-600 font-bold">
                        Created {new Date(nb.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ================= WORKSPACE VIEW ================= */
            <div className="flex h-full overflow-hidden">
              {/* LEFT SUB SIDEBAR */}
              <aside className="w-64 border-r border-white/5 bg-[#0e0e10] p-4 flex flex-col gap-2">
                <button
                  onClick={() => setSelectedNotebook(null)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:text-orange-400 transition mb-4"
                >
                  <ArrowLeft size={14} /> Back to Library
                </button>

                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 mb-2">
                  Notebook Guide
                </p>

                <SidebarItem
                  icon={<FileText size={18} />}
                  label="Summary"
                  active={activeView === "summary"}
                  onClick={() => setActiveView("summary")}
                />
                <SidebarItem
                  icon={<Layers size={18} />}
                  label="Full Notes"
                  active={activeView === "notes"}
                  onClick={() => setActiveView("notes")}
                />
                <SidebarItem
                  icon={<Zap size={18} />}
                  label="Explanation"
                  active={activeView === "explanation"}
                  onClick={() => setActiveView("explanation")}
                />
                <SidebarItem
                  icon={<BookOpen size={18} />}
                  label="Flashcards"
                  active={activeView === "flashcards"}
                  onClick={() => setActiveView("flashcards")}
                />
              </aside>

              {/* MAIN CONTENT - SIDE BY SIDE */}
              <section className="flex-1 overflow-hidden grid grid-cols-2 bg-[#0b0b0c]">
                {/* SOURCE COLUMN */}
                <div
                  className="overflow-y-auto p-12 border-r border-white/5 custom-scroll relative"
                  onMouseUp={handleTextSelection}
                >
                  <div className="max-w-[500px] mx-auto">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <FileText size={18} className="text-blue-400" />
                        Source Notes
                      </h2>
                      <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                        Raw Content
                      </span>
                    </div>

                    <div className="whitespace-pre-wrap text-gray-400 bg-[#0f0f11] p-8 rounded-2xl border border-white/10 leading-relaxed text-[15px] select-text">
                      {selectedNotebook.notes}
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
                      className="z-50 bg-orange-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
                    >
                      <Sparkles size={14} /> Explain This
                    </button>
                  )}
                </div>

                {/* AI INSIGHTS COLUMN */}
                <div className="overflow-y-auto p-12 bg-[#0d0d0f] custom-scroll">
                  <div className="max-w-[500px] mx-auto">
                    {/* TABS */}
                    <div className="flex gap-4 mb-10 border-b border-white/5 pb-2">
                      <button
                        onClick={() => setActiveView("summary")}
                        className={`text-xs font-bold uppercase tracking-widest pb-2 transition ${activeView === "summary" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-600 hover:text-gray-400"}`}
                      >
                        Summary
                      </button>
                      <button
                        onClick={() => setActiveView("explanation")}
                        className={`text-xs font-bold uppercase tracking-widest pb-2 transition ${activeView === "explanation" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-600 hover:text-gray-400"}`}
                      >
                        Deep Dive
                      </button>
                      <button
                        onClick={() => setActiveView("flashcards")}
                        className={`text-xs font-bold uppercase tracking-widest pb-2 transition ${activeView === "flashcards" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-600 hover:text-gray-400"}`}
                      >
                        Practice
                      </button>
                    </div>

                    {explaining && (
                      <div className="py-20 text-center animate-pulse">
                        <Sparkles className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                        <p className="text-orange-500 font-medium">AI is distilling insights...</p>
                      </div>
                    )}

                    {!explaining && activeView === "summary" && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="prose prose-invert max-w-none prose-orange text-[16px] leading-relaxed text-gray-300">
                          <ReactMarkdown>{selectedNotebook.summary}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {!explaining && activeView === "explanation" && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        {sectionExplanation || selectedNotebook.easyExplanation ? (
                          <div className="prose prose-invert max-w-none prose-orange text-[16px] leading-relaxed text-gray-300">
                            <ReactMarkdown>{sectionExplanation || selectedNotebook.easyExplanation}</ReactMarkdown>
                          </div>
                        ) : (
                          <div className="text-center py-20 text-gray-600">
                            <Info size={40} className="mx-auto mb-4 opacity-20" />
                            <p>Select text on the left to get a detailed AI explanation.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {!explaining && activeView === "flashcards" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        {selectedNotebook.flashcards?.map((c, i) => (
                          <div
                            key={i}
                            className="bg-[#111113] p-6 rounded-2xl border border-white/5 hover:border-orange-500/20 transition-colors"
                          >
                            <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                              Question
                            </p>
                            <p className="text-lg text-white mb-4 line-height-relaxed">
                              {c.question}
                            </p>
                            <div className="h-px bg-white/5 mb-4" />
                            <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                              Answer
                            </p>
                            <p className="text-gray-400 leading-relaxed text-sm">
                              {c.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* CHAT */}
              <aside className="w-[400px] border-l border-white/5 bg-[#0e0e10]">
                <ChatPanel notes={selectedNotebook.notes} />
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ================= SHARED COMPONENTS ================= */

function Sidebar({ activePage }) {
  const { signOut } = useClerk();
  const router = useRouter();

  const navItems = [
    { icon: Home, address: "/" },
    { icon: BookOpen, address: "/notebook" },
    { icon: BarChart3, address: "/analytics" },
    { icon: Target, address: "/goals" },
    { icon: Settings, address: "/settings" },
  ];

  return (
    <aside className="w-20 bg-[#0e0e10] border-r border-white/5 flex flex-col items-center py-8 justify-between">
      <div className="flex flex-col items-center gap-10">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-black" />
        </div>

        <nav className="flex flex-col gap-4">
          {navItems.map((item, i) => (
            <button
              key={i}
              onClick={() => router.push(item.address)}
              className={`p-3 rounded-xl transition ${activePage === item.address
                  ? "bg-white/10 text-orange-400"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                }`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </nav>
      </div>

      <button
        onClick={() => signOut({ redirectUrl: "/" })}
        className="p-3 text-gray-600 hover:text-red-400"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </aside>
  );
}

function TopBar({ currentPage }) {
  return (
    <header className="h-20 bg-[#0b0b0c] border-b border-white/5 flex items-center justify-between px-8">
      <h1 className="text-sm font-medium text-gray-200 uppercase">
        Console <span className="text-gray-500">/ {currentPage}</span>
      </h1>

      <div className="flex items-center gap-5">
        <Bell className="text-gray-400" />
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-full px-4 py-1">
          <WeatherWidget />
          <UserButton />
        </div>
      </div>
    </header>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${active
          ? "bg-orange-500 text-black font-semibold"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

function ChatPanel({ notes }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!question.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    const q = question;
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/notebook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, notes }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <MessageSquare size={18} className="text-orange-500" />
        <span className="font-semibold text-sm">AI Notebook Guide</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scroll">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === "user"
                  ? "bg-orange-500 text-black"
                  : "bg-white/5 text-gray-300 border border-white/5"
                }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-orange-500 text-xs">AI is thinking…</div>
        )}
      </div>

      <div className="p-4">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ask your notebook..."
          className="w-full bg-[#141416] border border-white/10 px-4 py-3 rounded-xl text-white"
        />
      </div>
    </div>
  );
}
