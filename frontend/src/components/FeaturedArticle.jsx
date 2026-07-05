
import { Link } from "react-router-dom";

function FeaturedArticle({ article }) {
  if (!article) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

        <img
          src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1600"
          alt={article.title}
          className="h-96 w-full object-cover"
        />

        <div className="p-8">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            {article.category.name}
          </span>

          <h2 className="mt-4 text-4xl font-bold">
            {article.title}
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            {article.content.substring(0, 220)}...
          </p>

          <Link
            to={`/article/${article.slug}`}
            className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Read Article
          </Link>
        </div>

      </div>
    </section>
  );
}

export default FeaturedArticle;