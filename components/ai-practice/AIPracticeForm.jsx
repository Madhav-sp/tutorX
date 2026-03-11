"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, ChevronDown } from "lucide-react";

const patterns = [
    "Sliding Window",
    "Two Pointers",
    "Recursion",
    "Backtracking",
    "Binary Search",
    "Dynamic Programming",
    "Graphs",
    "Trees",
    "Stack & Queue",
];

const difficulties = ["Easy", "Medium", "Hard"];

export default function AIPracticeForm({ onGenerate, isLoading }) {
    const [pattern, setPattern] = useState(patterns[0]);
    const [count, setCount] = useState(5);
    const [difficulty, setDifficulty] = useState(difficulties[1]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onGenerate({ pattern, count, difficulty });
    };

    return (
        <div className="bg-[#111113]/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-12 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles className="w-20 h-20 text-orange-500" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Pattern Selector */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500 px-1">
                            Neural Pattern
                        </label>
                        <div className="relative group">
                            <select
                                value={pattern}
                                onChange={(e) => setPattern(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all appearance-none cursor-pointer group-hover:bg-white/[0.05]"
                            >
                                {patterns.map((p) => (
                                    <option key={p} value={p} className="bg-[#1c1c1f]">
                                        {p} Pattern
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Problem Count */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500 px-1">
                            Intensity Level
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all group-hover:bg-white/[0.05]"
                            placeholder="Count (1-10)"
                        />
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500 px-1">
                            Logic Tier
                        </label>
                        <div className="flex gap-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl">
                            {difficulties.map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setDifficulty(d)}
                                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === d
                                            ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                                            : "text-gray-500 hover:text-gray-300"
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative px-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-[22px] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl flex items-center gap-4 overflow-hidden"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Synthesizing...</span>
                            </>
                        ) : (
                            <>
                                {/* <Sparkles className="w-4 h-4 text-orange-500" /> */}
                                <span>Initialize Training Session</span>
                            </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </button>
                </div>
            </form>
        </div>
    );
}
