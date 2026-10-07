// server/services/ai.js
// Keep the Gemini credential on the server. Never use a VITE_ variable here.
const axios = require("axios");

const MODEL = "gemini-2.5-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function askQuestion({ question, level = "beginner" }) {
  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    console.error("GOOGLE_AI_KEY is not configured on the server");
    throw new Error("GOOGLE_AI_KEY is not configured on the server");
  }

  console.log("AI request received for model:", MODEL);

  const prompt = [
    "You are the Equinox AI Mentor.",
    `Audience level: ${level}.`,
    "Answer concisely, focus on learning, and encourage exploration.",
    `Question: ${String(question || "").slice(0, 4000)}`,
  ].join("\n");

  try {
    const response = await axios.post(
      API_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings: [
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
        ],
      },
      {
        params: { key: apiKey },
        timeout: 25000,
      }
    );

    const answer = response.data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n")
      .trim();

    if (!answer) {
      console.error("Gemini returned no text in response");
      throw new Error("Gemini returned no text");
    }

    console.log("AI request successful");
    return { answer };
  } catch (error) {
    // Do not log the request URL/config: the API key is sent as a query parameter.
    console.error("Gemini API request failed", {
      status: error.response?.status,
      message: error.response?.data?.error?.message || error.message,
      model: MODEL,
    });
    throw new Error("AI service failed");
  }
}

async function explainLabStep({ step, context }) {
  return askQuestion({
    question: `Explain this lab step: ${step}. Context: ${JSON.stringify(context || {})}`,
    level: "intermediate",
  });
}

async function generateQuiz({ topic, difficulty = "medium", count = 5 }) {
  const result = await askQuestion({
    question: `Create ${count} ${difficulty} multiple-choice questions about ${topic}. Return only valid JSON with a questions array.`,
    level: "expert",
  });
  try {
    const cleaned = result.answer.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    return JSON.parse(cleaned);
  } catch {
    return { raw: result.answer };
  }
}

async function generateMission({ sdg, level }) {
  return askQuestion({ question: `Generate a learning mission for SDG ${sdg}.`, level: level || "intermediate" });
}

async function reflect({ evidence, notes }) {
  return askQuestion({ question: `Help reflect on this evidence: ${evidence}. Notes: ${notes || ""}` });
}

async function summarize({ text }) {
  return askQuestion({ question: `Summarize this text: ${text}`, level: "intermediate" });
}

module.exports = { askQuestion, explainLabStep, generateQuiz, generateMission, reflect, summarize };
