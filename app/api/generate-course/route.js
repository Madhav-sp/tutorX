import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import UserProgress from "@/models/UserProgress";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function getYouTubeVideos(query) {
  const YT_KEY = process.env.YOUTUBE_API_KEY;
  if (!YT_KEY) {
    console.error("YOUTUBE_API_KEY is MISSING in environment");
    return [];
  }
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=2&videoEmbeddable=true&q=${encodeURIComponent(
    query
  )}&key=${YT_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return (data.items || []).map((item) => item.id.videoId);
  } catch (err) {
    console.error("YouTube Fetch Error:", err);
    return [];
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const { userId: serverUserId } = await auth();
    const {
      userId: clientUserId,
      title,
      description,
      difficulty,
      includeVideos,
      chaptersCount,
      category,
    } = await req.json();

    const userId = serverUserId || clientUserId;

    if (!userId) {
      return NextResponse.json({ error: "User ID missing" }, { status: 400 });
    }

    /* =========================
       FETCH USER CONTEXT
    ========================= */
    const userProgress = await UserProgress.find({ userId }).populate("courseId").lean();
    const progressSummary = userProgress.map(p => {
        return `- Course: ${p.courseId?.title || 'Unknown'}, Progress: ${p.progressPercent}%`;
    }).join("\n");

    /* =========================
       AI PROMPT
    ========================= */
    const prompt = `
Act as a Senior Software Engineer and Expert Educator. Generate an exceptionally high-quality, professional, and comprehensive educational course on: "${title}".

Description: ${description}
Difficulty: ${difficulty}
Category: ${category}
Number of Chapters: ${chaptersCount}

USER LEARNING CONTEXT:
${progressSummary || "No previous courses found. This is a new learner."}

STRICT CONTENT REQUIREMENTS:
1. DEPTH: Each topic must be a "technical deep dive". Do NOT provide summaries. Provide detailed explanations (at least 3-5 sub-sections per topic).
2. STRUCTURE: Every topic's "content" array must include:
    - At least one "heading" for the topic overview.
    - Multiple "text" blocks explaining concepts in depth (GeeksforGeeks/MDN style).
    - At least one "code" block with a practical, real-world example.
    - An "output" block showing the expected result of the code.
    - A "list" block for "Best Practices" or "Common Use Cases".
3. PEDAGOGY: Use professional terminology but explain it clearly. Relate new concepts to the USER LEARNING CONTEXT provided above.
4. ENGAGEMENT: Ensure flashcards and quizzes are challenging and test actual understanding, not just rote memorization.

JSON STRUCTURE:
{
  "chapters": [
    {
      "chapterTitle": "string",
      "duration": "string",
      "topics": [
        {
          "title": "string",
          "content": [
            { "type": "heading"|"text"|"list"|"code"|"output", "text": "string", "items": ["string"], "language": "string", "code": "string" }
          ],
          "flashcards": [ { "question": "string", "answer": "string" } ],
          "quiz": [ { "question": "string", "options": ["string"], "correctAnswer": "string" } ]
        }
      ]
    }
  ]
}

STRICT OUTPUT RULE:
Return ONLY the valid JSON object. No markdown, no pre-amble, no post-amble.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    
    // Robust JSON Extraction
    let cleaned = raw;
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = raw.substring(firstBrace, lastBrace + 1);
    }


    let aiData;
    try {
      aiData = JSON.parse(cleaned);
    } catch (error) {
      console.error("JSON Parse Error:", error);
      console.error("Raw Response:", raw);
      return NextResponse.json(
        {
          error: "AI returned invalid JSON",
          details: error.message,
          raw: cleaned.slice(0, 1000),
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(aiData.chapters)) {
      return NextResponse.json(
        { error: "Invalid course structure" },
        { status: 500 }
      );
    }

    /* =========================
       FETCH VIDEOS (IF NEEDED)
    ========================= */
    if (includeVideos) {
      const chapterPromises = aiData.chapters.map(async (chapter) => {
        const query = `${title} ${chapter.chapterTitle}`;
        const videos = await getYouTubeVideos(query);
        return { ...chapter, videos };
      });
      aiData.chapters = await Promise.all(chapterPromises);
    }

    /* =========================
       SAVE COURSE
    ========================= */
    const course = await Course.create({
      userId,
      title,
      description,
      difficulty,
      includeVideos,
      category,
      chapters: aiData.chapters,
    });

    return NextResponse.json(
      { success: true, courseId: course._id },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: "Failed to generate course",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
