const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testFlash() {
  const modelName = "gemini-1.5-flash";
  process.stdout.write(`Testing model: ${modelName}... `);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say 'Flash OK'");
    const response = await result.response;
    const text = response.text();
    process.stdout.write(`SUCCESS: ${text}\n`);
    process.exit(0);
  } catch (err) {
    process.stdout.write(`FAILED: ${err.message}\n`);
    process.exit(1);
  }
}

testFlash();
