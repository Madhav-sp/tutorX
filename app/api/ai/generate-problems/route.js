import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateProblems } from "@/controllers/aiController";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pattern, count, difficulty } = await req.json();

    if (!pattern || !count || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await generateProblems(userId, pattern, count, difficulty);

    return NextResponse.json(
      { success: true, problems: session.problems, session },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error (generate-problems):", error);
    return NextResponse.json(
      {
        success: false,
        message: "AI generation failed",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
