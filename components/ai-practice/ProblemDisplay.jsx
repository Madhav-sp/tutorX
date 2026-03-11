"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { ChevronDown, ChevronRight, Play, CheckCircle2, XCircle, Code2, Terminal, BookOpen, AlertCircle } from "lucide-react";

export default function ProblemDisplay({ session, onRun, onSubmit, isRunning }) {
    const [activeTab, setActiveTab] = useState(0);
    const [language, setLanguage] = useState("javascript");
    const [codeMap, setCodeMap] = useState({});
    const [outputs, setOutputs] = useState({});
    const [showTestCases, setShowTestCases] = useState(false);

    const problems = session?.problems || [];
    const currentProblem = problems[activeTab];

    useEffect(() => {
        if (currentProblem && !codeMap[activeTab]) {
            setCodeMap(prev => ({
                ...prev,
                [activeTab]: {
                    javascript: currentProblem.starter_code?.javascript || "// Write your JavaScript code here\n",
                    python: currentProblem.starter_code?.python || "# Write your Python code here\n",
                    java: currentProblem.starter_code?.java || "// Write your Java code here\n",
                }
            }));
        }
    }, [activeTab, currentProblem]);

    const handleCodeChange = (value) => {
        setCodeMap(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [language]: value
            }
        }));
    };

    const handleAction = async (isSubmit) => {
        const code = codeMap[activeTab]?.[language] || "";
        if (!code.trim()) {
            alert("Please write some code before running.");
            return;
        }

        const res = await (isSubmit ? onSubmit : onRun)({
            sessionId: session._id,
            problemIndex: activeTab,
            code,
            language,
            testCases: currentProblem?.test_cases || [],
            runnerLogic: currentProblem?.runner_logic,
        });

        if (res.error || res.success === false) {
            alert(res.message || res.error || "Execution failed");
            return;
        }

        setOutputs(prev => ({ ...prev, [activeTab]: res }));
    };

    if (!problems.length) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-gray-600 opacity-20" />
                <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">No problems found in this session</p>
            </div>
        );
    }

    if (!currentProblem) return null;

    const currentOutput = outputs[activeTab];

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] gap-6">
            {/* Problem Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {problems.map((p, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveTab(i)}
                        className={`px-6 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === i
                            ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                            : "bg-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10"
                            }`}
                    >
                        Problem {i + 1}
                    </button>
                ))}
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Left Side: Problem Description */}
                <div className="w-1/2 bg-[#111113] border border-white/5 rounded-3xl overflow-y-auto p-8 custom-scroll">
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-orange-400" />
                                {currentProblem.title}
                            </h2>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                {currentProblem.description}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-xs uppercase tracking-widest text-orange-500/80 font-bold">Constraints</h3>
                                <pre className="text-gray-400 text-sm whitespace-pre-wrap font-sans bg-white/5 p-4 rounded-xl border border-white/5">
                                    {currentProblem.constraints}
                                </pre>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xs uppercase tracking-widest text-orange-500/80 font-bold">Input/Output Format</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-xs text-gray-500 mb-1">Input</p>
                                        <p className="text-sm text-gray-300">{currentProblem.input_format}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-xs text-gray-500 mb-1">Output</p>
                                        <p className="text-sm text-gray-300">{currentProblem.output_format}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xs uppercase tracking-widest text-orange-500/80 font-bold">Example</h3>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Sample Input</p>
                                        <code className="text-sm text-orange-300">{currentProblem.sample_input}</code>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Sample Output</p>
                                        <code className="text-sm text-green-400">{currentProblem.sample_output}</code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Test Cases Preview */}
                        <div className="border-t border-white/5 pt-6">
                            <button
                                onClick={() => setShowTestCases(!showTestCases)}
                                className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-gray-300 font-bold"
                            >
                                {showTestCases ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                Test Case Preview ({currentProblem.test_cases?.length || 0})
                            </button>

                            {showTestCases && (
                                <div className="mt-4 space-y-2">
                                    {currentProblem.test_cases?.map((tc, idx) => (
                                        <div key={idx} className="p-3 bg-white/5 rounded-lg text-xs font-mono border border-white/5">
                                            <span className="text-gray-500">In:</span> {tc.input} | <span className="text-gray-500">Exp:</span> {tc.expected_output}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Code Editor */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    <div className="flex-1 bg-[#111113] border border-white/5 rounded-3xl overflow-hidden flex flex-col relative">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <Code2 className="w-4 h-4 text-orange-400" />
                                <span className="text-xs uppercase tracking-widest font-bold text-gray-400">Editor</span>
                            </div>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-[#1c1c1f] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                            </select>
                        </div>

                        <div className="flex-1">
                            <Editor
                                theme="vs-dark"
                                language={language}
                                value={codeMap[activeTab]?.[language] || ""}
                                onChange={handleCodeChange}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    padding: { top: 20 },
                                    fontFamily: "var(--font-mono)",
                                    lineHeight: 1.6,
                                }}
                                loading={<div className="h-full w-full flex items-center justify-center bg-[#111113]"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-[#141416]">
                            <button
                                onClick={() => handleAction(false)}
                                disabled={isRunning}
                                className="px-6 py-2 rounded-xl text-sm font-bold bg-white/5 text-gray-300 hover:bg-white/10 transition-all flex items-center gap-2 border border-white/5 disabled:opacity-50"
                            >
                                <Play className="w-4 h-4" />
                                Run
                            </button>
                            <button
                                onClick={() => handleAction(true)}
                                disabled={isRunning}
                                className="px-8 py-2 rounded-xl text-sm font-bold bg-orange-500 text-black shadow-lg shadow-orange-500/10 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Submit
                            </button>
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="h-1/3 bg-[#111113] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-orange-400" />
                                <span className="text-xs uppercase tracking-widest font-bold text-gray-400">Console</span>
                            </div>
                            <button
                                onClick={() => handleAction(false)}
                                disabled={isRunning}
                                className="text-[10px] uppercase font-black px-3 py-1 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <Play className="w-3 h-3 text-orange-500" />
                                Run Now
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scroll font-mono text-sm">
                            {!currentOutput && !isRunning && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2 opacity-50">
                                    <Terminal className="w-8 h-8" />
                                    <p className="text-xs uppercase tracking-widest">Execute code to see results</p>
                                </div>
                            )}

                            {isRunning && (
                                <div className="flex items-center gap-3 text-orange-400 animate-pulse">
                                    <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                                    Running against test cases...
                                </div>
                            )}

                            {currentOutput && !isRunning && (
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-2xl flex items-center justify-between ${currentOutput.passed === currentOutput.total && currentOutput.total > 0
                                        ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                        : "bg-red-500/10 border border-red-500/20 text-red-400"
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            {currentOutput.passed === currentOutput.total && currentOutput.total > 0 ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                            <span className="font-bold">
                                                {currentOutput.passed === currentOutput.total && currentOutput.total > 0
                                                    ? "All Test Cases Passed!"
                                                    : currentOutput.results?.some(r => r.status_id && r.status_id !== 3 && r.status_id !== 4) // Not Accepted (3) and Not Wrong Answer (4)
                                                        ? "Compilation or Runtime Error"
                                                        : "Some Test Cases Failed"
                                                }
                                            </span>
                                        </div>
                                        <span className="text-lg font-black">{currentOutput.passed}/{currentOutput.total}</span>
                                    </div>

                                    <div className="space-y-2">
                                        {currentOutput.results?.map((res, idx) => (
                                            <div key={idx} className={`p-4 rounded-xl border ${res.passed ? "bg-white/5 border-white/5 text-gray-400" : "bg-red-500/5 border-red-500/20 text-red-300"
                                                }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Test Case {idx + 1}</span>
                                                        {!res.passed && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md font-bold uppercase">{res.status || "Error"}</span>}
                                                    </div>
                                                    {res.passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                                </div>
                                                {!res.passed && (
                                                    <div className="space-y-2 mt-2 font-mono text-xs">
                                                        {res.input && <div><span className="text-gray-500">Input:</span> {res.input}</div>}
                                                        {res.expected && <div><span className="text-gray-500">Expected:</span> {res.expected}</div>}
                                                        <div className="mt-2">
                                                            <p className="text-gray-500 mb-1">Actual Output / Error:</p>
                                                            <pre className="p-3 bg-red-900/10 border border-red-500/20 rounded-lg text-red-300 whitespace-pre-wrap overflow-x-auto max-h-32 custom-scroll">
                                                                {res.got || "No Output"}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                )}
                                                {res.passed && (
                                                    <div className="text-[10px] text-gray-500 italic">
                                                        Output matched expected: "{res.expected}"
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
