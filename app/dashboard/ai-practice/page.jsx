"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Sparkles, History, Loader2, Rocket, ArrowLeft } from "lucide-react";
import AIPracticeForm from "@/components/ai-practice/AIPracticeForm";
import ProblemDisplay from "@/components/ai-practice/ProblemDisplay";

export default function AiPracticePage() {
    const { user } = useUser();
    const [session, setSession] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [view, setView] = useState("form"); // 'form', 'practice', 'history'

    useEffect(() => {
        if (user) {
            fetchSessions();
        }
    }, [user]);

    const fetchSessions = async () => {
        try {
            const res = await fetch("/api/ai/sessions");
            const data = await res.json();
            if (Array.isArray(data)) setSessions(data);
        } catch (err) {
            console.error("Failed to fetch sessions", err);
        }
    };

    const handleGenerate = async (params) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/ai/generate-problems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
            });
            const data = await res.json();
            if (data && data.success) {
                setSession(data.session);
                setView("practice");
                fetchSessions();
            } else {
                console.error("Generation failed:", data.error || data.message);
                alert(`Failed to generate problems: ${data.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Generation failed", err);
            alert("An unexpected error occurred during problem generation.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExecute = async (payload) => {
        setIsExecuting(true);
        try {
            const res = await fetch("/api/ai/execute-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            return await res.json();
        } catch (err) {
            console.error("Execution failed", err);
            return { error: err.message };
        } finally {
            setIsExecuting(false);
        }
    };

    const handleSubmit = async (payload) => {
        return await handleExecute({ ...payload, isSubmit: true });
    };

    return (
        <div className="min-h-screen bg-[#0b0b0c] text-gray-300 p-8 custom-scroll">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 flex items-center gap-4">
                            <Rocket className="w-10 h-10 text-orange-500" />
                            AI PRACTICE LAB
                        </h1>
                        <p className="text-gray-500 text-sm tracking-widest uppercase font-medium">
                            Solve DSA patterns generated uniquely for you
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (view === "practice") {
                                    if (confirm("Go back to lab? Your current progress is saved.")) {
                                        setView("form");
                                        setSession(null);
                                    }
                                } else {
                                    setView(view === "history" ? "form" : "history");
                                }
                            }}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 text-sm font-bold active:scale-95"
                        >
                            {view === "history" || view === "practice" ? (
                                <><ArrowLeft className="w-4 h-4" /> Back to Generator</>
                            ) : (
                                <><History className="w-4 h-4 text-orange-400" /> Previous Sessions</>
                            )}
                        </button>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="transition-all duration-500">
                    {view === "form" && (
                        <div className="max-w-4xl mx-auto space-y-12">
                            <div className="text-center space-y-4 py-8">
                                <h2 className="text-2xl font-bold text-gray-200">Start Your Daily Routine</h2>
                                <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
                                    Pick a pattern you want to master. Gemini will craft unique, tailored problems to challenge your logic.
                                </p>
                            </div>
                            <AIPracticeForm onGenerate={handleGenerate} isLoading={isLoading} />

                            {isLoading && (
                                <div className="flex flex-col items-center gap-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-orange-500/10 rounded-full"></div>
                                        <div className="absolute inset-0 w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-orange-500 animate-pulse" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-lg font-bold text-gray-200">Gemini is Thinking...</p>
                                        <p className="text-sm text-gray-500 italic max-w-xs mx-auto">
                                            "Great coders are made, not born. I'm building your personalized curriculum now."
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {view === "practice" && session && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <ProblemDisplay
                                session={session}
                                onRun={handleExecute}
                                onSubmit={handleSubmit}
                                isRunning={isExecuting}
                            />
                        </div>
                    )}

                    {view === "history" && (
                        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sessions.length === 0 ? (
                                    <div className="col-span-full py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                        <History className="w-12 h-12 text-gray-600 mx-auto opacity-20" />
                                        <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">No sessions found</p>
                                    </div>
                                ) : (
                                    sessions.map((s) => (
                                        <div
                                            key={s._id}
                                            onClick={() => { setSession(s); setView("practice"); }}
                                            className="bg-[#111113] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                                    <Rocket className="w-5 h-5 text-orange-500" />
                                                </div>
                                                <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black ${s.difficulty === "Easy" ? "bg-green-500/10 text-green-500" :
                                                    s.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
                                                    }`}>
                                                    {s.difficulty}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-200 mb-2 truncate">{s.pattern}</h3>
                                            <div className="flex justify-between items-end">
                                                <p className="text-xs text-gray-600 font-medium">
                                                    {new Date(s.createdAt).toLocaleDateString()}
                                                </p>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Solved</p>
                                                    <p className="text-sm font-bold text-orange-500">{s.solvedProblems?.length || 0}/{s.problems?.length}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
