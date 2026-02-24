"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Loader2, AlertCircle } from "lucide-react";

const LANGUAGES = [
    { id: 71, name: "Python", value: "python", defaultCode: 'print("Hello, World!")' },
    { id: 62, name: "Java", value: "java", defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
    { id: 54, name: "C++", value: "cpp", defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}' },
    { id: 63, name: "JavaScript", value: "javascript", defaultCode: 'console.log("Hello, World!");' },
];

export default function CodeEditor() {
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [code, setCode] = useState(language.defaultCode);
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLanguageChange = (e) => {
        const lang = LANGUAGES.find((l) => l.value === e.target.value);
        setLanguage(lang);
        setCode(lang.defaultCode);
    };

    const runCode = async () => {
        setLoading(true);
        setOutput("");
        setError("");

        const rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;

        if (!rapidApiKey || rapidApiKey === "your_rapidapi_key_here") {
            setError("Please provide a valid RapidAPI Key in .env.local (NEXT_PUBLIC_RAPIDAPI_KEY)");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
                method: "POST",
                headers: {
                    "x-rapidapi-key": rapidApiKey,
                    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    language_id: language.id,
                    source_code: code,
                    stdin: "",
                }),
            });

            const data = await response.json();

            if (data.stdout) {
                setOutput(data.stdout);
            } else if (data.stderr) {
                setOutput(data.stderr);
            } else if (data.compile_output) {
                setOutput(data.compile_output);
            } else {
                setOutput("Program executed with no output.");
            }
        } catch (err) {
            setError("Failed to execute code. Please check your internet connection and API key.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0b0b0c] text-gray-200">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#111113]">
                <div className="flex items-center gap-4">
                    <select
                        value={language.value}
                        onChange={handleLanguageChange}
                        className="bg-[#0b0b0c] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.id} value={lang.value}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={runCode}
                    disabled={loading}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black px-4 py-1.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Play className="w-4 h-4 fill-current" />
                    )}
                    Run Code
                </button>
            </div>

            {/* EDITOR & OUTPUT */}
            <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
                {/* EDITOR */}
                <div className="flex-1 border-r border-white/5">
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        language={language.value}
                        value={code}
                        onChange={(value) => setCode(value)}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 16 },
                        }}
                    />
                </div>

                {/* OUTPUT */}
                <div className="w-full md:w-80 flex flex-col bg-[#0e0e10]">
                    <div className="px-4 py-2 border-b border-white/5 text-xs font-semibold uppercase tracking-widest text-gray-500">
                        Output
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scroll">
                        {error ? (
                            <div className="flex gap-2 text-red-400">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        ) : output ? (
                            <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
                        ) : (
                            <span className="text-gray-600">Run your code to see the output here...</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
