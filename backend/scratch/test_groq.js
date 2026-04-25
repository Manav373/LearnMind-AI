const Groq = require('groq-sdk');
require('dotenv').config({ path: __dirname + '/../.env' });

async function testGroq() {
  console.log("Checking Groq API Key...");
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ GROQ_API_KEY is missing in .env");
    return;
  }
  console.log("API Key found (starts with):", apiKey.substring(0, 10) + "...");

  try {
    const groq = new Groq({ apiKey });
    console.log("Testing Groq completion...");
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Hi' }],
      model: 'llama-3.3-70b-versatile',
    });
    console.log("✅ Groq Response:", response.choices[0]?.message?.content);
  } catch (err) {
    console.error("❌ Groq Error:", err.message);
    if (err.stack) console.error(err.stack);
  }
}

testGroq();
