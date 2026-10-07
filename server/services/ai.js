// server/services/ai.js
// Thin wrapper around Google AI Studio (Gemini). Uses the env key when
// present, but falls back to the provided project key so the app works
// out-of-the-box in this demo.

const axios = require('axios');

// Important: the user requested this specific key; we still allow override via env.
const key = process.env.GOOGLE_AI_KEY || 'AIzaSyA7TBg6BVg-j8IvaCv5Fa874myCKjx-iyM';
const MODEL = 'gemini-2.5-flash-latest';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function askQuestion({ question, level = 'beginner' }) {
  const prompt = `You are the Equinox AI Mentor.\nAudience level: ${level}.\nAnswer concisely and encourage exploration.\nQuestion: ${question}`;

  // If key missing, return a friendly mock so UI stays usable.
  if (!key) {
    return { answer: `(mock) ${prompt.slice(0, 180)}` };
  }

  try {
    const resp = await axios.post(
      `${BASE_URL}?key=${key}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' }
        ]
      },
      { timeout: 20000 }
    );

    const text =
      resp.data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n').trim() ||
      resp.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response from model.';

    return { answer: text };
  } catch (err) {
    console.error('AI error', err.response?.data || err.message);
    throw new Error('AI service failed');
  }
}

async function explainLabStep({ step, context }) {
  return askQuestion({ question: `Explain step: ${step}. Context: ${JSON.stringify(context)}`, level: 'intermediate' });
}

async function generateQuiz({ topic, difficulty = 'medium', count = 5 }) {
  if (!key) {
    const questions = [];
    for (let i = 1; i <= count; i++) {
      questions.push({ id: `q${i}`, question: `${difficulty} Q${i} about ${topic}`, choices: ['A','B','C','D'], answer: 'A' });
    }
    return { topic, difficulty, questions };
  }
  const prompt = `Create ${count} ${difficulty} multiple-choice questions about ${topic} in JSON.`;
  const resp = await askQuestion({ question: prompt, level: 'expert' });
  try {
    return JSON.parse(resp.answer);
  } catch (e) {
    return { raw: resp.answer };
  }
}

async function generateMission({ sdg, level }) {
  return askQuestion({ question: `Generate mission for SDG ${sdg} at level ${level}`, level: 'intermediate' });
}

async function reflect({ evidence, notes }) {
  return askQuestion({ question: `Reflect on evidence: ${evidence}. Notes: ${notes}` });
}

async function summarize({ text }) {
  return askQuestion({ question: `Summarize: ${text}`, level: 'intermediate' });
}

module.exports = { askQuestion, explainLabStep, generateQuiz, generateMission, reflect, summarize };