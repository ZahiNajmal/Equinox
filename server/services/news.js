// server/services/news.js
// Server-side adapter for GDELT DOC API (public news search; no API key).
// The frontend must call this through GET /api/news, never call a provider directly.
const axios = require("axios");

const GDELT_URL = "https://api.gdeltproject.org/api/v2/doc/doc";

function parseSeenDate(value) {
  if (!value) return null;
  // GDELT dates commonly look like 20261007T183000Z.
  const match = String(value).match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    const parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

async function fetchNews(topic = "science") {
  const query = String(topic || "science").trim().slice(0, 100) || "science";

  try {
    const response = await axios.get(GDELT_URL, {
      params: {
        // GDELT searches worldwide by default; restrict its source language to English.
        query: `${query} sourcelang:english`,
        mode: "artlist",
        format: "json",
        maxrecords: 75,
        sort: "datedesc",
      },
      timeout: 20000,
      headers: { "User-Agent": "Equinox-Education-App/1.0" },
    });

    const rawArticles = Array.isArray(response.data?.articles) ? response.data.articles : [];
    return rawArticles
      .filter((article) => {
        const language = String(article?.language || "").trim().toLowerCase();
        return article?.url && article?.title && (language === "english" || language === "eng");
      })
      .slice(0, 12)
      .map((article) => ({
        title: article.title,
        url: article.url,
        description: "Open the source to read the full story.",
        source: { name: article.domain || article.sourcecountry || "News source" },
        publishedAt: parseSeenDate(article.seendate),
        urlToImage: article.socialimage || "",
      }));
  } catch (error) {
    // Avoid logging full request config or URLs; log only safe diagnostic details.
    console.error("News provider request failed", {
      status: error.response?.status,
      message: error.message,
    });
    const wrapped = new Error("News search is temporarily unavailable");
    wrapped.status = error.response?.status || 502;
    throw wrapped;
  }
}

module.exports = { fetchNews };
