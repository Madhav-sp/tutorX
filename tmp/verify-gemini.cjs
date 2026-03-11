const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel(modelName) {
  process.stdout.write(`Testing model: ${modelName}... `);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say 'Model OK'");
    const response = await result.response;
    const text = response.text();
    process.stdout.write(`SUCCESS: ${text}\n`);
    return true;
  } catch (err) {
    process.stdout.write(`FAILED: ${err.message}\n`);
    return false;
  }
}

async function runTests() {
  console.log("Starting Gemini Model Verification...");
  const models = [
    "gemini-1.5-pro", 
    "gemini-1.5-flash", 
    "gemini-pro", 
    "models/gemini-1.5-pro", 
    "models/gemini-1.5-flash",
    "models/gemini-pro"
  ];
  for (const m of models) {
    await testModel(m);
  }
  console.log("Verification Complete.");
}

runTests();
