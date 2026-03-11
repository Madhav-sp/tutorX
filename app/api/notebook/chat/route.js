import { geminiModel } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { question, notes } = await req.json();

  const prompt = `
Act as an Expert Research Assistant and Academic Tutor. 
Your goal is to provide deep, comprehensive, and highly analytical answers based ONLY on the provided research notes.

STRICT INSTRUCTIONS:
1. DEPTH: Do not give short summaries or surface-level answers. Provide a thorough breakdown of the concepts requested.
2. STRUCTURE: Use professional Markdown formatting:
   - Use ## for main sections.
   - Use bold (**text**) for key terms.
   - Use bullet points for lists.
   - Use > for important quotes or key takeaways.
3. TONE: Maintain a professional, educational, and encouraging tone.
4. EVIDENCE: Always cite or refer to the context in the NOTES to support your answers.
5. FORMATTING: If explaining a process, use numbered steps.

NOTES:
${notes}

QUESTION:
${question}
`;

  const result = await geminiModel.generateContent(prompt);
  const answer = result.response.text();

  return NextResponse.json({ answer });
}
