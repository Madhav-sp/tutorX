const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function check(m) {
  try {
    const model = genAI.getGenerativeModel({ model: m });
    const result = await model.generateContent("hello");
    const text = (await result.response).text();
    console.log(`[OK] ${m}: ${text.substring(0, 20)}...`);
  } catch (e) {
    console.log(`[FAIL] ${m}: ${e.message}`);
  }
}

async function run() {
  const models = [
    "models/gemini-1.5-flash", 
    "models/gemini-1.5-pro", 
    "models/gemini-pro",
    "gemini-1.5-flash-latest"
  ];
  for (const m of models) await check(m);
}

run();
