import { connectDB } from "@/lib/db";
import AIPracticeSession from "@/models/AIPracticeSession";
import { generateDSAProblems } from "@/services/aiService";
import { executeCode } from "@/services/judgeService";

console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);

/**
 * Controller for AI Practice Lab logic.
 */

export const generateProblems = async (userId, pattern, count, difficulty) => {
  try {
    await connectDB();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found in .env");
    }

    if (!pattern || !count || !difficulty) {
      throw new Error("Missing required fields: pattern, count, or difficulty");
    }

    if (count > 10) {
      throw new Error("Max 10 problems allowed");
    }

    const problems = await generateDSAProblems(pattern, count, difficulty);

    const session = await AIPracticeSession.create({
      userId,
      pattern,
      difficulty,
      problems,
      solvedProblems: [],
    });

    return session;
  } catch (error) {
    console.error("AI GENERATION ERROR:", error);
    throw error;
  }
};

export const runCode = async (code, language, testCases, options = {}) => {
  try {
    return await executeCode(code, language, testCases, options);
  } catch (error) {
    console.error("RUN CODE ERROR:", error);
    throw error;
  }
};

export const submitCode = async (
  userId,
  sessionId,
  problemIndex,
  code,
  language,
  results
) => {
  try {
    await connectDB();

    const session = await AIPracticeSession.findById(sessionId);
    if (!session) throw new Error("Session not found");

    const existingIndex = session.solvedProblems.findIndex(
      (p) => p.problemIndex === problemIndex
    );

    const submission = {
      problemIndex,
      passed: results.passed,
      total: results.total,
      code,
      language,
      submittedAt: new Date(),
    };

    if (existingIndex !== -1) {
      session.solvedProblems[existingIndex] = submission;
    } else {
      session.solvedProblems.push(submission);
    }

    await session.save();
    return session;
  } catch (error) {
    console.error("SUBMIT CODE ERROR:", error);
    throw error;
  }
};

export const getSessions = async (userId) => {
  try {
    await connectDB();
    return await AIPracticeSession.find({ userId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error("GET SESSIONS ERROR:", error);
    throw error;
  }
};

export const getSession = async (sessionId) => {
  try {
    await connectDB();
    return await AIPracticeSession.findById(sessionId);
  } catch (error) {
    console.error("GET SESSION ERROR:", error);
    throw error;
  }
};
