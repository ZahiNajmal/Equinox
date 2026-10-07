// server/services/news.js
// Server-side adapter for NewsAPI.org.
// The frontend must call this through GET /api/news, never call a provider directly.
const axios = require("axios");

const NEWSAPI_KEY = process.env.NEWSAPI_KEY || ''; // server-only key (must be set in .env)

async function fetchNews(topic = 'science') {
  // If no key, return a placeholder article so UI still shows something in dev
  if (!NEWSAPI_KEY) {
    console.warn('NEWSAPI_KEY not configured, returning placeholder data');
    return [
      {
        title: `Sample Article about ${topic}`,
        url: 'https://example.com/article1',
        description: `This is a placeholder article about ${topic}. Configure NEWSAPI_KEY to see real news.`,
        source: { name: 'Equinox News' },
        publishedAt: new Date().toISOString(),
        urlToImage: ''
      }
    ];
  }

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&pageSize=10&apiKey=${NEWSAPI_KEY}`;

  try {
    const resp = await axios.get(url, { timeout: 10000 });
    // NewsAPI responds with status code 200 even for some error states; check payload
    if (resp.data && resp.data.status === 'ok' && Array.isArray(resp.data.articles)) {
      return resp.data.articles;
    } else {
      // Keep the message from the API if present for debugging
      const msg = (resp.data && resp.data.message) ? resp.data.message : 'Unexpected response from NewsAPI';
      const err = new Error(`NewsAPI error: ${msg}`);
      err.status = resp.status || 500;
      throw err;
    }
  } catch (error) {
    // Rewrap axios errors to include status if available
    const status = error.response ? error.response.status : 500;
    const message = error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : error.message || 'Failed to fetch news';
    console.error('NewsAPI fetch error:', message);
    const err = new Error(message);
    err.status = status;
    throw err;
  }
}

module.exports = { fetchNews };
