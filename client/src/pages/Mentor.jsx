import React, { useState } from "react";
import api from "../utils/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const CustomParagraph = ({ children }) => {
  // ReactMarkdown passes children as strings or arrays of nodes; rendering directly preserves inline elements.
  return <p className="mb-2 last:mb-0">{children}</p>;
};

const CustomHeading = ({ level, children }) => {
  const baseClasses = "font-bold mb-2 mt-4";
  const sizeClasses = {
    1: "text-2xl",
    2: "text-xl",
    3: "text-lg",
    4: "text-base",
    5: "text-sm",
    6: "text-xs",
  };
  return React.createElement(`h${level}`, { className: `${baseClasses} ${sizeClasses[level]}` }, children);
};

export default function Mentor() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI Science Mentor. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setMessages((current) => [...current, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      // The API helper adds the user's auth token and uses /api on Render.
      const { data } = await api.post("/ai/qa", {
        message: question,
        level: "intermediate",
      });
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data?.reply || "I couldn't make a reply. Please try again." },
      ]);
    } catch (error) {
      console.error("Mentor request failed", error.response?.status || error.message);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4 sm:p-6">
      <section className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl min-h-[70vh] flex flex-col">
        <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 sm:p-8 rounded-t-3xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-center tracking-tight">
            Equinox AI Mentor
          </h1>
        </header>

        <div className="flex-1 px-4 py-6 sm:px-8 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={`${index}-${message.role}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-full sm:max-w-lg p-4 rounded-2xl shadow-sm ${
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
                }`}
              >
                {message.role === "user" ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: CustomParagraph,
                      h1: ({ children }) => <CustomHeading level={1}>{children}</CustomHeading>,
                      h2: ({ children }) => <CustomHeading level={2}>{children}</CustomHeading>,
                      h3: ({ children }) => <CustomHeading level={3}>{children}</CustomHeading>,
                      h4: ({ children }) => <CustomHeading level={4}>{children}</CustomHeading>,
                      h5: ({ children }) => <CustomHeading level={5}>{children}</CustomHeading>,
                      h6: ({ children }) => <CustomHeading level={6}>{children}</CustomHeading>,
                      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      code: ({ inline, children }) =>
                        inline ? (
                          <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">{children}</code>
                        ) : (
                          <code className="block bg-gray-200 p-2 rounded text-sm overflow-x-auto">{children}</code>
                        ),
                      pre: ({ children }) => <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">{children}</pre>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 mb-2">
                          {children}
                        </blockquote>
                      ),
                      a: ({ href, children }) => (
                        <a href={href} className="text-purple-600 hover:text-purple-800 underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                      hr: () => <hr className="my-4 border-gray-300" />,
                      table: ({ children }) => (
                        <div className="overflow-x-auto mb-2">
                          <table className="min-w-full border border-gray-300">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
                      tbody: ({ children }) => <tbody>{children}</tbody>,
                      tr: ({ children }) => <tr className="border-b border-gray-300">{children}</tr>,
                      th: ({ children }) => <th className="px-4 py-2 text-left font-bold">{children}</th>,
                      td: ({ children }) => <td className="px-4 py-2">{children}</td>,
                      del: ({ children }) => <del className="line-through text-gray-500">{children}</del>,
                      input: ({ checked, type, disabled }) => (
                        <input
                          type={type}
                          checked={checked}
                          disabled={disabled}
                          className="mr-2"
                        />
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-sm text-gray-500" role="status">
              Mentor is thinking…
            </div>
          )}
        </div>

        <form
          className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={loading}
            placeholder={loading ? "Waiting for a response…" : "Ask me a science question…"}
            className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:border-purple-500 disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-lg disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </form>
      </section>
    </div>
  );
}
