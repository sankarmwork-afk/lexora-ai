import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import DarkModeToggle from "../components/DarkModeToggle";

function Home() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("user_email") || "");
  const isLoggedIn = !!localStorage.getItem("access");

  const [loading, setLoading] = useState(true);
  const [articleError, setArticleError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [externalArticle, setExternalArticle] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_id");
    setUserEmail("");
    navigate("/login");
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const requests = [
        api.get("articles/"),
        api.get("categories/"),
      ];
      if (localStorage.getItem("access")) {
        requests.push(api.get("profile/"));
      }

      const results = await Promise.allSettled(requests);

      // Articles result
      const articlesResult = results[0];
      if (articlesResult.status === "fulfilled") {
        setArticles(articlesResult.value.data);
        setArticleError("");
      } else {
        console.error("Articles error:", articlesResult.reason.response?.status, articlesResult.reason.response?.data);
        setArticleError("Failed to load articles.");
      }

      // Categories result
      const categoriesResult = results[1];
      if (categoriesResult.status === "fulfilled") {
        setCategories(categoriesResult.value.data);
        setCategoryError("");
      } else {
        console.error("Categories error:", categoriesResult.reason.response?.status, categoriesResult.reason.response?.data);
        setCategoryError("Failed to load categories.");
      }

      // Profile result (if requested)
      if (results.length > 2) {
        const profileResult = results[2];
        if (profileResult.status === "fulfilled") {
          const email =
            profileResult.value.data.email ||
            profileResult.value.data.username ||
            profileResult.value.data.user?.email ||
            profileResult.value.data.user?.username ||
            localStorage.getItem("user_email") ||
            "User";

          setUserEmail(email);
          localStorage.setItem("user_email", email);
        } else {
          console.error("Profile error:", profileResult.reason);

          const savedEmail = localStorage.getItem("user_email");
          if (savedEmail) {
            setUserEmail(savedEmail);
          }
        }
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const handleSearch = async (query = searchTerm) => {
    if (!query.trim()) return;
    setSearchLoading(true);

    // Clear previous results before making the API request
    setAiAnswer("");
    setSearchResults([]);
    setExternalArticle(null);

    try {
      const res = await api.post("/ai/home/search/", {
        query,
      });

      const articles = res.data.articles || [];
      setSearchResults(articles);
      setAiAnswer(res.data.answer || "No answer found.");

      if (res.data.external && res.data.external_article) {
        setExternalArticle(res.data.external_article);
      }

      console.log("Home search response:", res.data);
    } catch (error) {
      console.error("Home search error:", error.response?.status, error.response?.data);
      alert(error.response?.data?.detail || error.response?.data?.error || "Search failed.");
    } finally {
      setSearchLoading(false);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const search = searchTerm.toLowerCase();
    return (
      article.title.toLowerCase().includes(search) ||
      (article.description || "").toLowerCase().includes(search)
    );
  });

  const displayArticles = searchResults.length > 0 ? searchResults : filteredArticles;

  // Updated popular search chips
  const popularSearches = [
    "Python",
    "AI",
    "History",
    "Space",
    "Quantum",
  ];

  const categoryIcons = ["💻", "🧪", "🏛️", "🌍", "🎨", "❤️", "📚", "🚀"];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-pulse text-2xl font-semibold text-slate-700 dark:text-slate-300">
          Loading Lexora...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm dark:bg-slate-900 dark:border-b dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-extrabold text-blue-600 tracking-wide select-none hover:text-blue-700"
          >
            LEXORA
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg border border-slate-300 px-3 py-2 text-xl dark:border-slate-700"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
          <ul className="hidden md:flex space-x-8 font-semibold text-gray-700 dark:text-slate-300">
            <li>
              <Link to="/" className="hover:text-blue-600 transition">Home</Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-blue-600 transition">Categories</Link>
            </li>
            <li>
              <Link 
                to="/about" className="hover:text-blue-600 transition">About</Link>
            </li>
          </ul>
          <div className="hidden md:flex items-center space-x-4">
            <DarkModeToggle />
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 hover:opacity-80 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {(userEmail || localStorage.getItem("user_email") || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {userEmail || localStorage.getItem("user_email") || "User"}
                    </span>
                  </div>
                </Link>
                <Link
                  to="/create-article"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Create Article
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-6 py-5 space-y-4 shadow-lg">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block font-medium">Home</Link>
            <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="block font-medium">Categories</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block font-medium">About</Link>

            <div className="pt-2"><DarkModeToggle /></div>

            {isLoggedIn ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block">Profile</Link>
                <Link to="/create-article" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg bg-green-600 px-4 py-2 text-center font-semibold text-white">Create Article</Link>
                <button onClick={logout} className="w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg border px-4 py-2 text-center">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg bg-blue-600 px-4 py-2 text-center font-semibold text-white">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-white py-16 md:py-24 px-5 md:px-6 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-gray-900 dark:text-white max-w-3xl mx-auto">
            Discover Knowledge Without Limits
          </h1>
          <p className="text-lg text-gray-700 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            Explore technology, science, history and thousands of well-organized articles with a clean reading experience.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-gray-300 shadow-lg dark:border-slate-700"
            role="search"
            aria-label="Search articles"
          >
            <input
              type="text"
              placeholder="Search anything..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow rounded-l-2xl bg-white px-6 py-4 text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
            <button
              type="submit"
              aria-label="Search"
              disabled={searchLoading}
              className={`px-6 text-white font-semibold transition flex items-center justify-center rounded-r-lg ${searchLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {searchLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              )}
            </button>
          </form>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchTerm(term);
                  handleSearch(term);
                }}
                className="cursor-pointer rounded-full bg-blue-100 text-blue-700 px-5 py-2 text-sm font-medium hover:bg-blue-200 transition"
                aria-label={`Search for ${term}`}
              >
                {term}
              </button>
            ))}
          </div>
          {searchLoading && (
            <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-2xl font-bold dark:text-white">🤖 Lexora AI</h2>
              <div className="mb-6 flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <span className="font-medium text-blue-600">Thinking...</span>
              </div>
              <div className="space-y-3 animate-pulse">
                <div className="h-4 rounded bg-gray-200 dark:bg-slate-700"></div>
                <div className="h-4 w-11/12 rounded bg-gray-200 dark:bg-slate-700"></div>
                <div className="h-4 w-9/12 rounded bg-gray-200 dark:bg-slate-700"></div>
                <div className="h-4 w-10/12 rounded bg-gray-200 dark:bg-slate-700"></div>
              </div>
            </div>
          )}
          {aiAnswer && (
            <div className="mt-10 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 text-left shadow-xl">
              <h2 className="text-2xl font-bold mb-3 dark:text-white">🤖 Lexora AI</h2>
              <div className="prose max-w-none whitespace-pre-line text-gray-700 dark:prose-invert dark:text-slate-300">
                {aiAnswer}
              </div>
              {externalArticle && (
                <div className="mt-6 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                  {externalArticle.image_url && (
                    <img
                      src={externalArticle.image_url}
                      alt={externalArticle.title}
                      className="mb-4 h-56 w-full rounded-lg object-cover"
                    />
                  )}
                  <h3 className="text-xl font-bold">
                    <a
                      href={
                        externalArticle.url ||
                        `https://en.wikipedia.org/wiki/${encodeURIComponent(
                          externalArticle.title.replace(/ /g, "_")
                        )}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {externalArticle.title}
                    </a>
                  </h3>
                  <p className="mt-2 text-gray-700 dark:text-slate-300 whitespace-pre-line">
                    {externalArticle.summary || externalArticle.description || "No summary available."}
                  </p>
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                {["Summary", "History", "Features", "Applications"].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSearchTerm(`${searchTerm} ${item}`);
                      handleSearch(`${searchTerm} ${item}`);
                    }}
                    className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-200 dark:bg-slate-800 dark:text-blue-300"
                  >
                    {item}
                  </button>
                ))}
              </div>
              {searchResults.length > 0 && (
                <>
                  <h3 className="mt-6 mb-2 text-lg font-semibold dark:text-white">Matching Articles</h3>
                  <ul className="list-disc ml-6">
                    {searchResults.map((article) => (
                      <li key={article.id}>
                        <Link to={`/article/${article.slug}`} className="text-blue-600 hover:underline">
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-screen-2xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
        {/* Main Content */}
        <main className="min-w-0">
          {/* Categories Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {categories.map((category, idx) => (
                <Link
                  key={category.id}
                  to="/categories"
                  className="group block rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 shadow-xl hover:shadow-xl transition-transform transform hover:scale-[1.035] border border-transparent hover:border-blue-400"
                  aria-label={`View articles in ${category.name}`}
                >
                  <div className="flex items-center mb-4 space-x-4">
                    <div className="text-4xl">{categoryIcons[idx % categoryIcons.length]}</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    {category.description ? category.description : "Explore articles in this category."}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-300">
                    {`Articles: ${
                      articles.filter(
                        (article) =>
                          article.category === category.id ||
                          article.category?.id === category.id
                      ).length
                    }`}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {searchResults.length > 0 && (
            <section className="mb-16">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Search Results</h2>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((article) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    className="rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 shadow-xl hover:shadow-xl transition"
                  >
                    <h3 className="text-xl font-bold text-blue-600">{article.title}</h3>
                    <p className="mt-2 text-gray-600 dark:text-slate-300">
                      {article.description || `${article.content?.slice(0, 120) || ""}...`}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Latest Articles Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Latest Articles</h2>
            {articleError && <p className="mb-2 text-red-600">{articleError}</p>}
            {categoryError && <p className="mb-4 text-red-600">{categoryError}</p>}
            {displayArticles.length === 0 && (
              <p className="text-gray-700 dark:text-slate-300">No articles found.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {displayArticles.map((article) => {
                // Support both image and image_url
                const imageSrc = article.image || article.image_url;
                return (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    className="group block rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
                    aria-label={`Read article ${article.title}`}
                  >
                    <div className="h-48 w-full overflow-hidden bg-gray-200 dark:bg-slate-800">
                      {imageSrc ? (
                        <img
                          src={
                            imageSrc.startsWith("http")
                              ? imageSrc
                              : `${API_BASE_URL}${imageSrc}`
                          }
                          alt={article.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                          <div className="text-5xl">📖</div>
                          <p className="mt-3 text-sm font-medium text-slate-500">No image available</p>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <span className="inline-block mb-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-blue-300 text-xs font-semibold select-none">
                        {categories.find(
                          (cat) => cat.id === (article.category?.id || article.category)
                        )?.name || article.category_name || "Unknown"}
                      </span>
                      <h3 className="text-xl font-semibold text-blue-600 group-hover:underline mb-2">{article.title}</h3>
                      <p className="text-gray-700 dark:text-slate-300 line-clamp-3 mb-3">
                        {article.description || `${(article.content || "").slice(0, 150)}...`}
                      </p>
                      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                        <div className="mb-3 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span>👁 {article.views || 0}</span>
                          <span>❤️ {article.likes_count || 0}</span>
                          <span>🔖 {article.bookmarks_count || 0}</span>
                          <span>⏱ {article.reading_time || 5} min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-600">Read article</span>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-600 dark:bg-slate-800 dark:text-blue-300">→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="block lg:sticky lg:top-24 h-fit w-full lg:w-[320px] self-start mt-12 lg:mt-0">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xl p-6">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Trending Now</h3>
            <ul className="space-y-6">
              {[...articles]
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 5)
                .map((article, idx) => {
                  const imageSrc = article.image || article.image_url;
                  return (
                    <li key={article.id} className="flex items-start space-x-4">
                      <span className="text-blue-600 font-extrabold text-lg select-none mt-2">{idx + 1}.</span>
                      <Link
                        to={`/article/${article.slug}`}
                        className="flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent hover:border-blue-500 rounded-xl p-2 transition flex-grow"
                        aria-label={`View trending article ${article.title}`}
                      >
                        <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-slate-700">
                          {imageSrc ? (
                            <img
                              src={
                                imageSrc.startsWith("http")
                                  ? imageSrc
                                  : `${API_BASE_URL}${imageSrc}`
                              }
                              alt={article.title}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="line-clamp-2 text-md font-semibold text-blue-600 hover:underline">
                            {article.title}
                          </h4>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-slate-300">
                            {article.description || `${(article.content || "").slice(0, 100)}...`}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              {articles.length === 0 && (
                <li className="text-gray-600 dark:text-slate-300">No trending articles available.</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-700 py-8 text-center text-slate-500">
        © 2026 Lexora • Built with React & Django
      </footer>
    </div>
  );
}

export default Home;