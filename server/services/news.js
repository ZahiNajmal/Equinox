// server/services/news.js
const axios = require('axios');

const NEWSAPI_KEY = process.env.NEWSAPI_KEY || process.env.VITE_NEWSAPI_KEY || ''; // prefer NEWSAPI_KEY // server-only key (must be set in .env)

async function fetchNews(topic = 'science') {
  // If no key, return a placeholder article so UI still shows something in dev
  if (!NEWSAPI_KEY) {
    return [
      {
        title: `Sample Article about ${topic}`,
        url: 'https://example.com/article1',
        description: `This is a placeholder article about ${topic}`,
        source: { name: 'Equinox News' },
        publishedAt: new Date().toISOString(),
        urlToImage: ''
      }
    ];
  }

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&pageSize=10&apiKey=${NEWSAPI_KEY}`;

  try {
    const resp = await axios.get(url);
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
    const err = new Error(message);
    err.status = status;
    throw err;
  }
}

module.exports = { fetchNews };
