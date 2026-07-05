

import { Link } from "react-router-dom";

export default function About() {
  const features = [
    { icon: "🤖", title: "AI Search", text: "Ask questions in natural language and get contextual answers." },
    { icon: "📚", title: "Wikipedia Import", text: "Import and enrich Wikipedia articles with AI-generated sections." },
    { icon: "🧠", title: "RAG", text: "Retrieval-Augmented Generation powered by ChromaDB and Gemini." },
    { icon: "⚡", title: "Fast Reading", text: "Modern reading experience with structured content and navigation." },
    { icon: "🗂️", title: "Categories", text: "Browse knowledge by organized categories." },
    { icon: "👤", title: "User Accounts", text: "Create, edit and manage your own articles." },
  ];

  const tech = ["React", "Tailwind CSS", "Django", "Django REST Framework", "PostgreSQL", "ChromaDB", "Gemini AI", "Docker"];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-5xl font-extrabold">About Lexora</h1>
          <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
            Lexora is an AI-powered knowledge platform that combines structured articles,
            Retrieval-Augmented Generation (RAG), and modern search to make learning faster.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/" className="rounded-xl bg-white px-6 py-3 font-semibold text-blue-700">Explore Articles</Link>
            <Link to="/create-article" className="rounded-xl border border-white px-6 py-3 font-semibold">Create Article</Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-16 space-y-16">
        <section className="rounded-3xl bg-white p-10 shadow-lg">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="mt-4 text-lg text-gray-700">Our mission is to make reliable knowledge accessible through AI-assisted search, beautiful reading experiences, and community-created content.</p>
        </section>

        <section>
          <h2 className="mb-8 text-3xl font-bold text-center">Key Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <div key={item.title} className="rounded-3xl bg-white p-8 shadow-lg">
                <div className="text-4xl">{item.icon}</div>
                <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-10 shadow-lg">
          <h2 className="text-3xl font-bold">Technology Stack</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {tech.map((t) => (
              <span key={t} className="rounded-full bg-blue-100 px-4 py-2 font-medium text-blue-700">{t}</span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}