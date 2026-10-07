import { useState, useEffect } from "react";
import { 
  GlobeAltIcon, 
  BeakerIcon, 
  AcademicCapIcon, 
  CalculatorIcon,
  NewspaperIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

// --- ENVIRONMENT CONFIGURATION ---
// We safely access the API key to prevent crashes in environments
// where import.meta.env might be undefined or not supported.
const getApiKey = () => {
  try {
    return (import.meta && import.meta.env) ? import.meta.env.VITE_NEWSAPI_KEY : "";
  } catch (e) {
    console.warn("Environment variables not accessible via import.meta");
    return "";
  }
};

const API_KEY = getApiKey();
// --------------------------------

export default function Insight() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("science");

  const categories = [
    { id: "science", label: "Science", icon: BeakerIcon, query: "science" },
    { id: "world", label: "World", icon: GlobeAltIcon, query: "world" },
    { id: "geography", label: "Geography", icon: AcademicCapIcon, query: "geography" },
    { id: "mathematics", label: "Mathematics", icon: CalculatorIcon, query: "mathematics" }
  ];

  const fetchNews = async (category) => {
    setLoading(true);
    setError(null);

    // CRITICAL: Check for API Key presence first
    if (!API_KEY) {
        setError("API Key is missing. Please ensure VITE_NEWSAPI_KEY is configured in your environment variables.");
        setLoading(false);
        setArticles([]);
        return; // Stop execution if key is missing
    }

    const categoryConfig = categories.find(cat => cat.id === category);
    const query = categoryConfig?.query || "science";

    // Helper to process response
    const processData = (data) => {
      // Check for common API errors in the response body
      if (data.status === "error") {
          throw new Error(`News API Error: ${data.code} - ${data.message}`);
      }
      if (data.status === "ok" && data.articles) {
        const validArticles = data.articles.filter(
          article => article.title !== "[Removed]" && article.description
        );
        return validArticles.slice(0, 9);
      }
      return null;
    };

    try {
      let articlesData = null;
      let errorDetail = "";

      // ATTEMPT 1: Direct Call 
      try {
        const directUrl = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=12&apiKey=${API_KEY}`;
        const res = await fetch(directUrl);
        if (res.ok) {
          const data = await res.json();
          articlesData = processData(data);
        } else {
           errorDetail = `Direct fetch failed with status ${res.status}.`;
        }
      } catch (err) {
        errorDetail = `Direct fetch attempt failed: ${err.message}`;
      }

      // ATTEMPT 2: Proxy Call (If direct failed)
      if (!articlesData) {
        try {
          // Using corsproxy.io to bypass browser restrictions
          const targetUrl = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=12&apiKey=${API_KEY}`;
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
          
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const data = await res.json();
            articlesData = processData(data);
          } else {
            errorDetail = `Proxy fetch failed with status ${res.status}.`;
          }
        } catch (err) {
          errorDetail = `Proxy fetch attempt failed: ${err.message}`;
        }
      }

      if (!articlesData || articlesData.length === 0) {
        throw new Error(`Failed to fetch news after all attempts. Last error: ${errorDetail}`);
      }

      setArticles(articlesData || []);

    } catch (err) {
      console.error("All fetch attempts failed:", err);
      // Display the specific error message from the API or the failure chain
      setError(`Unable to load news: ${err.message}. Please check your API key, console logs for details, and connection.`);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleRefresh = () => {
    fetchNews(activeCategory);
  };

  const generateAISummary = (description) => {
    if (!description) return "Summary not available.";
    const words = description.split(" ");
    return words.slice(0, 15).join(" ") + (words.length > 15 ? "..." : "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 pt-10">
        <div className="inline-flex items-center justify-center gap-4 mb-4">
          <NewspaperIcon className="w-14 h-14 text-purple-600 flex-shrink-0"/>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500">
              Insight
            </h1>
          </div>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Stay curious with bite-sized news and discoveries from Science, Geography, and Mathematics — all in one place.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeCategory === cat.id
                  ? "bg-gradient-to-r from-orange-500 to-blue-500 text-white hover:from-orange-600 hover:to-blue-600 hover:scale-[1.01]"
                  : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-orange-500 hover:to-blue-500 hover:text-white shadow-md hover:shadow-lg"

                }`}
              >
                <Icon className="w-5 h-5" />
                {cat.label}
              </button>
            );
          })}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-200"
            disabled={loading}
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-8 max-w-3xl mx-auto">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error loading news</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ArrowPathIcon className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
            <p className="text-center text-gray-600 text-xl">Loading latest {activeCategory} news...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <NewspaperIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl">No articles found. Try another category or refresh.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {articles.map((article, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both`
                }}
              >
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <img
                    src={article.urlToImage || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop"}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop";
                    }}
                  />
                  {article.source?.name && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">{article.source.name}</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-xl mb-2 line-clamp-2 text-gray-900">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                    {article.description}
                  </p>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium text-indigo-700">
                      <span className="font-bold">Quick Summary:</span> {generateAISummary(article.description)}
                    </p>
                  </div>

                  {article.publishedAt && (
                    <p className="text-xs text-gray-500 mb-3">
                      {new Date(article.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  )}

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition-colors"
                  >
                    Read full article
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}