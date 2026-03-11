import { geminiModel } from "@/lib/gemini";

console.log("Using Gemini model from lib/gemini");

/**
 * Generates DSA problems using Gemini AI based on pattern and difficulty.
 * @param {string} pattern - DSA pattern (e.g., "Sliding Window")
 * @param {number} count - Number of problems (1-10)
 * @param {string} difficulty - Difficulty level (Easy, Medium, Hard)
 * @returns {Promise<Array>} - Array of generated problems
 */
export async function generateDSAProblems(pattern, count, difficulty) {
  const prompt = `
Generate ${count} LeetCode-style coding problems for the DSA pattern: "${pattern}".
Difficulty Level: ${difficulty}

For each problem, provide:
1. Title
2. Description (clear and concise)
3. Constraints
4. Input format and Output format
5. Sample input and Sample output
6. 5 test cases (including edge cases)
7. Starter code in JavaScript, Java, and Python.

STRICT INSTRUCTIONS:
- Return ONLY a valid JSON array of objects.
- Do NOT include markdown code blocks, pre-amble, or post-amble.
- Structure for each object:
  {
    "title": "Problem Title",
    "description": "Full problem description",
    "constraints": "Constraints text",
    "input_format": "Input format description",
    "output_format": "Output format description",
    "sample_input": "Input for example",
    "sample_output": "Output for example",
    "test_cases": [
      { "input": "input string", "expected_output": "output string" }
    ],
    "method_name": "actualMethodName",
    "runner_logic": {
        "javascript": "// Logic to parse stdin string (could be JSON array) and call solution()",
        "python": "# Logic to parse stdin string (json.loads if array) and call Solution().method()",
        "java": "// Logic to parse stdin (e.g., String to int[]) and call sol.method()"
    },
    "starter_code": {
        "javascript": "function solution(nums) {\\n\\n}",
        "java": "class Solution {\\n    public int methodName(int[] nums) {\\n\\n    }\\n}",
        "python": "class Solution:\\n    def methodName(self, nums: List[int]) -> int:\\n"
    }
  }

STRICT PARSING RULES:
- The input from STDIN could be a JSON array (e.g., "[1,2,3]") OR a raw string (e.g., "0P" or " ").
- YOU MUST HANDLE BOTH GRACEFULLY using try-catch or safe parsing.
- In JavaScript: \`let input; try { input = JSON.parse(str); } catch { input = str; }\`
- In Python: \`import json; try: input_data = json.loads(str) except: input_data = str\`
- In Java: Check if the string starts with '[' before parsing as an array, otherwise treat as a String.
- THE RUNNER LOGIC MUST EXPLICITLY PRINT THE RESULT TO STDOUT.
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();

    function extractJSON(text) {
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No JSON array returned from Gemini");
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        // Fallback to object search if array fails
        const braceMatch = text.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          const parsed = JSON.parse(braceMatch[0]);
          return Array.isArray(parsed)
            ? parsed
            : parsed.problems || (parsed.count ? [parsed] : []);
        }
        throw e;
      }
    }

    const problems = extractJSON(raw);
    return problems;
  } catch (error) {
    console.error("Gemini AI Problem Generation Error:", error);
    throw new Error("Failed to generate problems with Gemini: " + error.message);
  }
}
