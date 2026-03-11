const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel(modelName) {
  console.log(`Testing model: ${modelName}...`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    console.log(`SUCCESS for ${modelName}: ${response.text()}`);
    return true;
  } catch (err) {
    console.error(`FAILED for ${modelName}: ${err.message}`);
    return false;
  }
}

async function runTests() {
  const models = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro", "models/gemini-1.5-pro", "models/gemini-1.5-flash"];
  for (const m of models) {
    await testModel(m);
    console.log("---");
  }
}

runTests();
