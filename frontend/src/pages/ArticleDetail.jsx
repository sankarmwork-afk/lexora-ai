import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import CommentSection from "../components/CommentSection";
import LikeButton from "../components/LikeButton";
import BookmarkButton from "../components/BookmarkButton";
import ShareModal from "../components/ShareModel";

function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const userId = Number(localStorage.getItem("user_id"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const loadArticle = async () => {
    try {
      if (!article) {
        setLoading(true);
      }
      setError(null);

      const response = await api.get(`articles/${slug}/`);
      setArticle(response.data);
    } catch (error) {
      console.error(error);
      setError("Failed to load article.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setArticle(null);
    setLoading(true);
    loadArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const readingTime = useMemo(() => {
    const words = (article?.content || article?.summary || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    return article?.reading_time || Math.max(1, Math.ceil(words / 200));
  }, [article]);

  const updateArticleStats = (changes) => {
    setArticle((prev) => (prev ? { ...prev, ...changes } : prev));
  };

  const askAI = async () => {
    if (!article) return;
    if (!aiQuestion.trim()) return;

    try {
      setAiLoading(true);
      const res = await api.post("ai/search/", {
        article: article.slug,
        query: aiQuestion,
      });
      setAiAnswer(res.data.answer);
    } catch (err) {
      console.error(err);
      setAiAnswer("Failed to get AI response.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="mx-auto max-w-7xl animate-pulse px-4 sm:px-6 lg:px-8">
        <div className="h-10 w-64 rounded bg-slate-300 dark:bg-slate-700"></div>

        <div className="mt-6 h-[420px] rounded-3xl bg-slate-300 dark:bg-slate-700"></div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-slate-300 dark:bg-slate-700"></div>
          ))}
        </div>

        <div className="mt-10 space-y-4">
          <div className="h-6 rounded bg-slate-300 dark:bg-slate-700"></div>
          <div className="h-6 w-5/6 rounded bg-slate-300 dark:bg-slate-700"></div>
          <div className="h-6 w-4/6 rounded bg-slate-300 dark:bg-slate-700"></div>
        </div>
      </div>
    </div>
  );
}
  
if (error) {
  return (
    <div className="flex min-h-screen items-center justify-center dark:bg-slate-950">
      <div className="text-xl text-red-500">
        {error}
      </div>
    </div>
  );
}

if (!article) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <p className="text-slate-600 dark:text-slate-300">Loading article...</p>
    </div>
  );
}

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'history', title: 'History', show: !!article.history },
  { id: 'features', title: 'Features', show: !!article.features },
  { id: 'applications', title: 'Applications', show: !!article.applications },
  { id: 'references', title: 'References', show: !!article.references },
];


  const imageUrl = article.image_url
    ? article.image_url
    : article.image
      ? (
          article.image.startsWith("http")
            ? article.image
            : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${article.image}`
        )
      : "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200";

  return (
    <div className="min-h-screen scroll-smooth bg-slate-50 py-8 pb-36 sm:py-12 sm:pb-16 dark:bg-slate-950">
      <div className="mx-auto max-w-[1700px] px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <Link
          to="/"
          className="mb-8 inline-block text-blue-600 hover:underline"
        >
          ← Back to Home
        </Link>

        {/* Category */}
        <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
          {article.category?.name || article.category_name || "Uncategorized"}
        </span>

        {/* Title */}
        <h1 className="mt-8 text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="mt-6 flex flex-wrap gap-8 text-sm text-gray-500 dark:text-slate-400">
          <span>👨 {article.author_name || "Lexora Team"}</span>

          <span>
            📅{" "}
            {new Date(article.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>

          <span>⏱️ {readingTime} min read</span>
        </div>

        {article.author === userId && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/edit-article/${article.slug}`}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              ✏️ Edit Article
            </Link>

            <button
              className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
              onClick={async () => {
                if (!window.confirm("Delete this article?")) return;
                try {
                  await api.delete(`articles/${article.slug}/`);
                  navigate("/");
                } catch (error) {
                  console.error(error);
                  alert("Failed to delete article.");
                }
              }}
            >
              🗑 Delete Article
            </button>
          </div>
        )}

        {/* Cover Image */}
        <img
          src={imageUrl}
          alt={article.title}
          className="mt-8 h-52 sm:h-64 md:h-[420px] xl:h-[520px] w-full rounded-3xl object-cover shadow-2xl transition duration-500 hover:scale-[1.02] hover:shadow-2xl"
          loading="lazy"
        />

        {/* Statistic Cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 text-center shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="text-2xl font-bold text-blue-600">{readingTime} min</div>
            <div className="mt-1 text-sm font-semibold text-gray-600 dark:text-slate-400">Reading Time</div>
          </div>
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 text-center shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="text-2xl font-bold text-blue-600">{article.views || 0}</div>
            <div className="mt-1 text-sm font-semibold text-gray-600 dark:text-slate-400">Views</div>
          </div>
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 text-center shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="text-2xl font-bold text-blue-600">{article.likes_count || 0}</div>
            <div className="mt-1 text-sm font-semibold text-gray-600 dark:text-slate-400">Likes</div>
          </div>
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 text-center shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="text-2xl font-bold text-blue-600">{article.bookmarks_count || 0}</div>
            <div className="mt-1 text-sm font-semibold text-gray-600 dark:text-slate-400">Bookmarks</div>
          </div>
        </div>

        {/* Premium Reading Layout */}
        <div className="mt-12 grid grid-cols-1 gap-6 xl:grid-cols-[180px_minmax(0,1fr)_280px] 2xl:grid-cols-[200px_minmax(0,1fr)_300px]">
          {/* Left Sidebar */}
          <aside className="hidden xl:block xl:w-[160px] 2xl:w-[180px]">
            <div className="sticky top-24 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">On this page</h3>
              <div className="space-y-3">
                {sections
                  .filter(section => section.show !== false)
                  .map((section, index) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-semibold text-slate-900 transition hover:bg-blue-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                    >
                      {`${index + 1}️⃣ ${section.title}`}
                    </a>
                  ))
                }
              </div>
            </div>
          </aside>

          {/* Article */}
          <div className="min-w-0 rounded-[32px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 md:p-8 xl:p-10 2xl:p-12 shadow-xl">
            <div className="mb-8 flex flex-wrap gap-3 text-sm">
              {article.is_featured && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 dark:bg-blue-900 dark:text-blue-300">⭐ Featured</span>
              )}
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:text-slate-300">👁 {article.views || 0} Views</span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">Updated {new Date(article.updated_at || article.created_at).toLocaleDateString("en-IN")}</span>
            </div>
            <section id="introduction" className="mt-10 rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-6 md:p-8 xl:p-10 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
              <h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">Introduction</h2>
              <div className="mt-3 mb-8 h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
              <p className="whitespace-pre-line break-words text-base leading-8 md:text-lg md:leading-9 lg:text-xl lg:leading-10 tracking-wide text-gray-700 dark:text-slate-300">
                {article.summary || article.content}
              </p>
            </section>

            {article.history && (
              <section id="history" className="mt-10 rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-6 md:p-8 xl:p-10 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
                <h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">History</h2>
                <div className="mt-3 mb-8 h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
                <p className="whitespace-pre-line break-words text-base leading-8 md:text-lg md:leading-9 lg:text-xl lg:leading-10 tracking-wide text-gray-700 dark:text-slate-300">{article.history}</p>
              </section>
            )}

            {article.features && (
              <section id="features" className="mt-10 rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-6 md:p-8 xl:p-10 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
                <h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">Features</h2>
                <div className="mt-3 mb-8 h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
                <p className="whitespace-pre-line break-words text-base leading-8 md:text-lg md:leading-9 lg:text-xl lg:leading-10 tracking-wide text-gray-700 dark:text-slate-300">{article.features}</p>
              </section>
            )}

            {article.applications && (
              <section id="applications" className="mt-10 rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-6 md:p-8 xl:p-10 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
                <h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">Applications</h2>
                <div className="mt-3 mb-8 h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
                <p className="whitespace-pre-line break-words text-base leading-8 md:text-lg md:leading-9 lg:text-xl lg:leading-10 tracking-wide text-gray-700 dark:text-slate-300">{article.applications}</p>
              </section>
            )}

            {article.references && (
              <section id="references" className="mt-10 rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-6 md:p-8 xl:p-10 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
                <h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">References</h2>
                <div className="mt-3 mb-8 h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
                <p className="whitespace-pre-line break-words text-base leading-8 md:text-lg md:leading-9 lg:text-xl lg:leading-10 tracking-wide text-gray-700 dark:text-slate-300">{article.references}</p>
              </section>
            )}

            {/* AI Sidebar on mobile */}
            <aside className="order-none xl:w-[280px] 2xl:w-[300px] xl:hidden w-full mt-10">
              <div className="sticky top-20 space-y-6">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-xl">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">🤖 Lexora AI Assistant</h3>
                  <p className="mt-2 mb-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Ask questions, generate summaries, explain concepts, or quiz yourself.
                  </p>
                  <div className="mt-4 mb-4 flex flex-wrap gap-2">
                    {['Explain Simply','Summarize','Key Facts','Quiz Me'].map((item)=>(
                      <button
                        key={item}
                        type="button"
                        onClick={()=>setAiQuestion(item)}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-blue-100 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="mt-4 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                    rows={7}
                    placeholder="Ask anything about this article..."
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                  />

                  <button
                    onClick={askAI}
                    disabled={aiLoading}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {aiLoading ? "Thinking..." : "Ask Lexora AI"}
                  </button>

                  {aiAnswer && (
                    <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-slate-100 p-3 text-sm whitespace-pre-wrap break-words dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {aiAnswer.includes("No relevant article") ? (
                        <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                          ⚠️ {aiAnswer}
                        </div>
                      ) : (
                        aiAnswer
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl">
                  <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Recommended Reading</h3>
                  <ul className="space-y-3">
                    {article.related_articles?.length ? (
                      article.related_articles.map((item) => (
                        <li key={item.slug}>
                          <Link
                            to={`/article/${item.slug}`}
                            className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-blue-500 hover:bg-white dark:border-slate-700 dark:bg-slate-800"
                          >
                            <div className="font-semibold text-slate-900 dark:text-white">{item.title}</div>
                            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">Read article →</div>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li>
                        <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4 text-center text-slate-500 dark:text-slate-400">
                          <div className="text-2xl">📚</div>
                          <p className="mt-2 font-semibold">No related articles yet</p>
                          <p className="mt-1 text-sm">Search another topic to discover related content.</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </aside>
            <div className="mt-10">
              <CommentSection articleId={article.id} />
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="order-none xl:w-[280px] 2xl:w-[300px] hidden xl:block">
            <div className="sticky top-20 space-y-6">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">🤖 Lexora AI Assistant</h3>
                <p className="mt-2 mb-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Ask questions, generate summaries, explain concepts, or quiz yourself.
                </p>
                <div className="mt-4 mb-4 flex flex-wrap gap-2">
                  {['Explain Simply','Summarize','Key Facts','Quiz Me'].map((item)=>(
                    <button
                      key={item}
                      type="button"
                      onClick={()=>setAiQuestion(item)}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-blue-100 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <textarea
                  className="mt-4 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                  rows={7}
                  placeholder="Ask anything about this article..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                />

                <button
                  onClick={askAI}
                  disabled={aiLoading}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {aiLoading ? "Thinking..." : "Ask Lexora AI"}
                </button>

                {aiAnswer && (
                  <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-slate-100 p-3 text-sm whitespace-pre-wrap break-words dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {aiAnswer.includes("No relevant article") ? (
                      <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                        ⚠️ {aiAnswer}
                      </div>
                    ) : (
                      aiAnswer
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Recommended Reading</h3>
                <ul className="space-y-3">
                  {article.related_articles?.length ? (
                    article.related_articles.map((item) => (
                      <li key={item.slug}>
                        <Link
                          to={`/article/${item.slug}`}
                          className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-blue-500 hover:bg-white dark:border-slate-700 dark:bg-slate-800"
                        >
                          <div className="font-semibold text-slate-900 dark:text-white">{item.title}</div>
                          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">Read article →</div>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li>
                      <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4 text-center text-slate-500 dark:text-slate-400">
                        <div className="text-2xl">📚</div>
                        <p className="mt-2 font-semibold">No related articles yet</p>
                        <p className="mt-1 text-sm">Search another topic to discover related content.</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* Share */}
        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-2 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:bottom-6 sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2 sm:rounded-2xl sm:border">
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 sm:px-6 sm:py-3 sm:text-base"
            onClick={() => setShowShareModal(true)}
          >
            🔗 Share
          </button>
          <BookmarkButton
  articleId={article.id}
  onUpdated={(bookmarksCount) =>
    updateArticleStats({ bookmarks_count: bookmarksCount })
  }
/>
          
          <LikeButton
            articleId={article.id}
            onUpdated={(likesCount) =>
              updateArticleStats({ likes_count: likesCount })
            }
          />
        </div>
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          article={article}
        />
      </div>
      {/* Back to Top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-24 right-5 sm:bottom-6 sm:right-6 rounded-full bg-blue-600 p-4 text-white shadow-2xl transition hover:bg-blue-700"
      >
        ↑
      </button>

      {/* Premium Footer */}
      <footer className="hidden lg:block mt-20 border-t border-slate-200 bg-white/80 py-8 backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 lg:flex-row">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Lexora
            </h3>
            <p className="mt-2 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-400">
              Discover trusted knowledge with AI-powered explanations,
              structured articles, and an immersive reading experience.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">⚛️ React</span>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">🐍 Django</span>
            <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">🗄 PostgreSQL</span>
            <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">🐳 Docker</span>
            <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">🤖 AI + RAG</span>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          © 2026 Lexora • Built with ❤️ using React, Django REST Framework, PostgreSQL, Docker & AI.
        </div>
      </footer>
    </div>
  );
}

export default ArticleDetail;