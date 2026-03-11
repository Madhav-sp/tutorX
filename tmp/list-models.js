import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const models = await genAI.listModels();
    console.log("Available Gemini Models:");
    models.models.forEach((m) => {
      console.log(`- ${m.name} (${m.displayName})`);
    });
    process.exit(0);
  } catch (err) {
    console.error("FAILED to list models:", err.message);
    process.exit(1);
  }
}

listModels();
