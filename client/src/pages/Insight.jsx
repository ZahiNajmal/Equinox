import { useCallback, useEffect, useState } from "react";
import {
  AcademicCapIcon,
  ArrowPathIcon,
  BeakerIcon,
  CalculatorIcon,
  GlobeAltIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
import api from "../utils/api";

const categories = [
  { id: "science", label: "Science", icon: BeakerIcon, query: "science" },
  { id: "world", label: "World", icon: GlobeAltIcon, query: "world news" },
  { id: "geography", label: "Geography", icon: AcademicCapIcon, query: "geography" },
  { id: "mathematics", label: "Mathematics", icon: CalculatorIcon, query: "mathematics" },
];

const fallbackImage =
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop";

export default function Insight() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("science");

  const fetchNews = useCallback(async (categoryId) => {
    const category = categories.find((item) => item.id === categoryId) || categories[0];
    setLoading(true);
    setError("");

    try {
      // The API key (if the selected news provider needs one) stays on the server.
      const { data } = await api.get("/news", { params: { q: category.query } });
      setArticles(Array.isArray(data?.articles) ? data.articles : []);
    } catch (requestError) {
      console.error("News request failed", requestError.response?.status || requestError.message);
      setError("Unable to load news right now. Please try again later.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory, fetchNews]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10 pt-6">
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <NewspaperIcon className="w-12 h-12 text-purple-600" />
            <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500">
              Insight
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore recent reporting and discoveries in science, geography, mathematics, and the world.
          </p>
        </header>

        <nav className="flex flex-wrap justify-center gap-3 mb-10" aria-label="News categories">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveCategory(id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition ${
                activeCategory === id
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-white text-gray-700 shadow hover:bg-purple-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => fetchNews(activeCategory)}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-white text-gray-700 shadow hover:bg-gray-100 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </nav>

        {error && (
          <div className="max-w-3xl mx-auto mb-8 rounded-lg border-l-4 border-red-500 bg-red-50 p-5 text-red-800" role="alert">
            <h2 className="font-semibold">Error loading news</h2>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600" role="status">
            <ArrowPathIcon className="w-12 h-12 animate-spin mb-4 text-purple-600" />
            Loading recent {activeCategory} news…
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <NewspaperIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            No articles found. Try another category or refresh.
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Articles">
            {articles.map((article, index) => (
              <article
                key={article.url || `${article.title}-${index}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col"
              >
                <div className="h-48 overflow-hidden bg-gray-200">
                  <img
                    src={article.urlToImage || fallbackImage}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackImage;
                    }}
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-xs uppercase tracking-wide text-purple-700 font-semibold mb-2">
                    {article.source?.name || "News source"}
                  </p>
                  <h2 className="font-bold text-xl mb-3 text-gray-900">{article.title}</h2>
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    {article.description || "Open the source to read the full story."}
                  </p>
                  {article.publishedAt && (
                    <p className="text-xs text-gray-500 mb-3">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  )}
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Read the article ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
