import { Link } from "react-router-dom";

function ArticleCard({ article }) {
  const imageUrl = article.image
    ? (article.image.startsWith("http")
        ? article.image
        : `http://localhost:8000${article.image}`)
    : "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200";

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <img
        src={imageUrl}
        alt={article.title}
        className="h-56 w-full object-cover"
      />

      <div className="p-6">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
          {article.category?.name || article.category_name || "Uncategorized"}
        </span>

        <h2 className="mt-4 text-2xl font-bold text-slate-900">
          {article.title}
        </h2>

        <p className="mt-3 text-gray-600">
          {(article.content || "").substring(0, 150)}...
        </p>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {new Date(article.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>

          <Link
            to={`/article/${article.slug}`}
            className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Read Article
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ArticleCard;