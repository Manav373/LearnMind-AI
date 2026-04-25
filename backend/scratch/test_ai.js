const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: __dirname + '/../.env' });

async function testAI() {
  console.log("Checking API Key...");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing in .env");
    return;
  }
  console.log("API Key found (starts with):", apiKey.substring(0, 5) + "...");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log("Testing Gemini content generation...");
    const result = await model.generateContent("Say 'AI is working' if you can read this.");
    console.log("✅ Gemini Response:", result.response.text());
  } catch (err) {
    console.error("❌ Gemini Error:", err.message);
    if (err.stack) console.error(err.stack);
  }
}

testAI();
