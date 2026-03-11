/**
 * Service to interact with Judge0 API for code execution.
 */
export async function executeCode(code, language, testCases, options = {}) {
  const JUDGE0_URL = process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com";
  const RAPIDAPI_KEY = process.env.JUDGE0_API_KEY || process.env.RAPIDAPI_KEY || process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  const RAPIDAPI_HOST = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";

  // console.log("Judge0 key exists:", !!RAPIDAPI_KEY);

  // Language ID mapping for Judge0
  const languageIds = {
    javascript: 63,
    python: 71,
    java: 62,
  };

  const lang = language.toLowerCase();
  const languageId = languageIds[lang];
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Wrapping Logic for LeetCode-style code
  let finalCode = code;
  const runnerLogic = options.runnerLogic?.[lang];

  if (lang === "java") {
    const javaRunner = runnerLogic || `
      Scanner sc = new Scanner(System.in);
      if (sc.hasNextLine()) {
          String input = sc.nextLine();
          Solution sol = new Solution();
      }
    `;
    finalCode = `
import java.util.*;
import java.io.*;

${code}

public class Main {
    public static void main(String[] args) {
        try {
            ${javaRunner}
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
    `;
  } else if (lang === "python") {
    const pythonRunner = runnerLogic || `
if __name__ == "__main__":
    import sys, json, inspect
    input_str = sys.stdin.read().strip()
    if input_str:
        try:
            parsed = json.loads(input_str)
        except:
            parsed = input_str
            if isinstance(parsed, str) and parsed.startswith('"') and parsed.endswith('"'):
                parsed = parsed[1:-1]
                
        try:
            sol = Solution()
            methods = [m for m in dir(sol) if not m.startswith('_')]
            if methods:
                method = getattr(sol, methods[0])
                params = len(inspect.signature(method).parameters) - 1
                if isinstance(parsed, list) and params > 1:
                    res = method(*parsed)
                else:
                    res = method(parsed)
                    
                if res is not None:
                    if isinstance(res, bool):
                        print(str(res).lower())
                    else:
                        print(json.dumps(res).replace(" ", "") if isinstance(res, (list, dict)) else res)
        except Exception as e:
            print(f"Execution Error: {str(e)}", file=sys.stderr)
`;
    finalCode = `${code}\n\n${pythonRunner}`;
  } else if (lang === "javascript") {
    const funcMatch = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
    const funcName = funcMatch ? funcMatch[1] : "solution";
    
    const jsRunner = runnerLogic || `
const fs = require('fs');
try {
    const inputStr = fs.readFileSync(0, 'utf8').trim();
    if (inputStr) {
        let parsed;
        try {
            parsed = JSON.parse(inputStr);
        } catch(e) {
            parsed = inputStr;
            if (typeof parsed === 'string' && parsed.startsWith('"') && parsed.endsWith('"')) {
                parsed = parsed.slice(1, -1);
            }
        }
        
        const func = typeof ${funcName} === 'function' ? ${funcName} : null;
        if (func) {
            const res = (Array.isArray(parsed) && func.length > 1) ? func(...parsed) : func(parsed);
            if (res !== undefined) {
                console.log(typeof res === 'object' ? JSON.stringify(res) : res);
            }
        } else {
            console.error("Function ${funcName} not found.");
        }
    }
} catch (e) {
    console.error("Runner Error:", e.message);
}
`;
    finalCode = `${code}\n\n${jsRunner}`;
  }

  console.log(`[JUDGE0] Running ${lang} code (First 100 chars):\n${finalCode.substring(0, 100)}...`);

  const isRapidAPI = JUDGE0_URL.includes("rapidapi.com");
  const headers = { "Content-Type": "application/json" };
  if (isRapidAPI) {
    if (!RAPIDAPI_KEY) throw new Error("RapidAPI Key missing for Judge0");
    headers["x-rapidapi-key"] = RAPIDAPI_KEY;
    headers["x-rapidapi-host"] = RAPIDAPI_HOST;
  }

  const results = [];
  let passedCount = 0;

  for (const testCase of testCases) {
    const payload = {
      source_code: Buffer.from(finalCode).toString("base64"),
      language_id: languageId,
      stdin: Buffer.from(testCase.input || "").toString("base64"),
      expected_output: Buffer.from(testCase.expected_output || "").toString("base64"),
    };

    try {
      const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.message && data.message.includes("quota")) {
        throw new Error("JUDGE0_QUOTA_EXCEEDED");
      }
      
      const expectedRaw = testCase.expected_output || testCase.expectedOutput || "";
      const expected = expectedRaw.toString().trim();

      // 1. Explicitly check for compilation or runtime errors
      const stderr = data.stderr ? Buffer.from(data.stderr, "base64").toString() : null;
      const compile_output = data.compile_output ? Buffer.from(data.compile_output, "base64").toString() : null;
      const message = data.message ? (typeof data.message === 'string' ? data.message : Buffer.from(data.message, "base64").toString()) : null;

      if (stderr || compile_output || message) {
        results.push({
          input: testCase.input,
          expected: expected,
          got: compile_output || stderr || message || "Execution Error",
          passed: false,
          status: data.status?.description || "Error",
          status_id: data.status?.id,
          time: data.time,
          memory: data.memory,
        });
        continue;
      }

      const stdout = data.stdout ? Buffer.from(data.stdout, "base64").toString().trim() : "";
      
      // 2. Strict Comparison:
      // Status must be 3 (Accepted) AND output must match exactly
      const isAccepted = data.status?.id === 3;
      const isOutputMatch = stdout === expected;
      const passed = isAccepted && isOutputMatch;

      console.log(`[TEST CASE] Status: ${data.status?.description} (${data.status?.id})`);
      console.log(`EXPECTED: "${expected}"`);
      console.log(`GOT: "${stdout}"`);
      console.log(`RESULT: ${passed ? "PASSED" : "FAILED"}`);

      if (passed) passedCount++;

      // If not passed, ensure 'got' has useful info
      let gotFeedback = stdout;
      if (!passed && !stdout) {
        gotFeedback = `Status: ${data.status?.description}${message ? `\nMessage: ${message}` : ""}`;
      }

      results.push({
        input: testCase.input,
        expected: expected,
        got: gotFeedback,
        passed: passed,
        status: data.status?.description,
        status_id: data.status?.id,
        time: data.time,
        memory: data.memory,
      });
    } catch (error) {
      console.error("Judge0 Execution Error:", error);
      results.push({
        input: testCase.input,
        error: error.message,
        passed: false,
        status: "Internal Error"
      });
    }
  }

  return {
    passed: passedCount,
    total: testCases.length,
    results: results,
  };
}
