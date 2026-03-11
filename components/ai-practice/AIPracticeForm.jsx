"use client";

import React, { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

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
        <div className="bg-[#111113] border border-white/5 rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-12 h-12 text-orange-500" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pattern Selector */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
                            Select Pattern
                        </label>
                        <select
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value)}
                            className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none cursor-pointer"
                        >
                            {patterns.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Problem Count */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
                            Number of Problems
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                        />
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
                            Difficulty
                        </label>
                        <div className="flex gap-2 p-1 bg-[#1c1c1f] border border-white/10 rounded-xl">
                            {difficulties.map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setDifficulty(d)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${difficulty === d
                                            ? "bg-orange-500 text-black shadow-lg"
                                            : "text-gray-500 hover:text-gray-300"
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative px-8 py-4 bg-orange-500 text-black font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] flex items-center gap-3 overflow-hidden"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Generating Problems...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 transition-transform group-hover:scale-125" />
                                <span>Generate Practice Problems</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
