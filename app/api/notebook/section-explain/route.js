import { NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { section, fullNotes } = await req.json();

    if (!section) {
      return NextResponse.json({ error: "No section provided" }, { status: 400 });
    }

    const prompt = `
You are a brilliant AI research assistant. 
Explain the following section of text from a larger document in a deep, yet easy-to-understand way.
Provide more context, examples, and breakdown complex terms.

Larger Document Context:
${fullNotes.slice(0, 2000)}

Selected Section to Explain:
"${section}"

STRICT RULES:
1. Provide a professional, detailed explanation.
2. Use markdown for formatting (bolding, lists, etc).
3. If there are formulas or code, explain them line by line.
4. Keep the tone academic but accessible.

Return the explanation in a neat, professional layout.
`;

    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({
      success: true,
      explanation: responseText,
    });
  } catch (err) {
    console.error("SECTION EXPLAIN ERROR:", err);
    return NextResponse.json(
      { error: "Failed to explain section", details: err.message },
      { status: 500 }
    );
  }
}
