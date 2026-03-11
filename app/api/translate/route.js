import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { text, targetLanguage } = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: "Missing text or targetLanguage" }, { status: 400 });
    }

    const prompt = `Translate the following educational content to ${targetLanguage}. 

STRICT INSTRUCTIONS:
1. Return ONLY the translated content. No pre-amble, no explanations.
2. Keep technical terms like "Variable", "Loop", "Function", "Array", "Object-Oriented Programming" in English (using standard transliteration or English characters if appropriate for ${targetLanguage} technical writing).
3. If the input is a JSON array of objects (content blocks), translate ONLY the "text" and "items" values. Keep keys and structure exactly the same.
4. Ensure the tone is educational and professional.
5. If the content is in Markdown, maintain the Markdown structure.

Content to translate (may be a JSON string):
${text}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 4000,
    });

    const translatedText = completion.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ translatedText });
  } catch (err) {
    console.error("Translation Error:", err);
    return NextResponse.json({ error: "Failed to translate", details: err.message }, { status: 500 });
  }
}
