import { useState } from "react";
// Removed: import api from "../utils/api"; 
// Reason: The file "../utils/api" could not be resolved. Using standard fetch instead.

// --- REVERTING TO DIRECT API CALL FOR FUNCTIONALITY ---
// WARNING: This exposes the key in the browser. Use a secure backend in production.
const GOOGLE_AI_KEY = import.meta.env.VITE_GOOGLE_AI_KEY;
// FIX: Using the correct model name 'gemini-2.5-flash-preview-09-2025' to resolve the 404 error
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GOOGLE_AI_KEY}`;
// ----------------------------------------------------

export default function Mentor() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI Science Mentor. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Directly calls the Gemini API to get a response.
   * NOTE: This method exposes the API key.
   * @param {string} promptText The user's question.
   * @returns {Promise<string>} The AI's response text.
   */
  const callGemini = async (promptText) => {
    // The prompt includes the system instruction
    const body = {
      contents: [{ parts: [{ text: `You are the Equinox AI Mentor, made by Zahi Najmal, Ashmit Reddy, and Mohammad Najid — give clear, concise, and encouraging answers only to study-related questions, helping students understand concepts easily and stay motivated.\nQuestion: ${promptText}` }]}],
      safetySettings: [
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" }
      ]
    };
    
    // Implemented exponential backoff for robustness
    const maxRetries = 3;
    let lastError = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const res = await fetch(GEMINI_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                // If the response is not 200, throw an error with the status code
                throw new Error(`Gemini request failed with status: ${res.status}`);
            }
            
            const data = await res.json();
            
            const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n").trim();
            return text || "No response";

        } catch (error) {
            lastError = error;
            // Only retry if it's not the last attempt
            if (i < maxRetries - 1) {
                const delay = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    // If all retries fail, throw the last error caught
    throw lastError;
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    const currentInput = input; // Capture input value
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Sending only the user's question, the system instruction is prepended in callGemini
      const reply = await callGemini(currentInput); 
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      // The error now indicates a failure to communicate with the Gemini API.
      console.error("Mentor AI error", err);
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting to the Gemini API. Try again!" }]);
    }
    setLoading(false);
  };

  return (
    // REMOVED 'font-[Inter]' to revert to the system's default font
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl min-h-[70vh] flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 sm:p-8 rounded-t-3xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-center tracking-tight">
            {/* UPDATED: Added flex and items-center to the span for perfect vertical alignment */}
            <span className="inline-flex items-center transform hover:scale-105 transition duration-300">
              {/* SIZING UPDATED: Increased size for both mobile (w-12, h-12) and desktop (sm:w-14, sm:h-14) */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 16 16" 
                fill="currentColor" 
                className="w-12 h-12 sm:w-14 sm:h-14 mr-2"
              >
                <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/>
                <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
              </svg>
              Equinox AI Mentor
            </span>
          </h1>
        </div>
        <div className="flex-1 px-4 pt-4 pb-[25px] sm:px-8 sm:pt-8 overflow-y-auto space-y-4 sm:space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-full sm:max-w-lg p-4 sm:p-5 rounded-3xl text-sm sm:text-base shadow-md transition duration-300 ${
                m.role === "user" 
                  ? "bg-blue-600 text-white rounded-br-none" 
                  : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl animate-pulse">
                <div className="w-10 h-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              disabled={loading}
              placeholder={loading ? "Waiting for response..." : "Ask me anything about science..."}
              className="flex-1 px-5 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 rounded-full focus:outline-none focus:border-purple-500 text-base sm:text-lg transition duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <button 
              onClick={send} 
              disabled={loading || !input.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold shadow-lg shadow-purple-500/50 hover:scale-[1.02] active:scale-95 transition duration-200 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}