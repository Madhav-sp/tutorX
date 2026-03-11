import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { runCode, submitCode } from "@/controllers/aiController";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, problemIndex, code, language, testCases, isSubmit, runnerLogic } = await req.json();

    if (!code || code.trim() === "" || !language || !testCases) {
      return NextResponse.json({ 
        success: false, 
        message: "Code cannot be empty" 
      }, { status: 400 });
    }

    console.log("EXECUTE_CODE TRIGGERED:");
    console.log("Language:", language);
    console.log("Runner Logic:", runnerLogic);

    const results = await runCode(code, language, testCases, { runnerLogic });

    if (isSubmit && sessionId && problemIndex !== undefined) {
      await submitCode(userId, sessionId, problemIndex, code, language, results);
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("API Error (execute-code):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
