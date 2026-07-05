import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const CreateArticle = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [history, setHistory] = useState("");
  const [features, setFeatures] = useState("");
  const [applications, setApplications] = useState("");
  const [references, setReferences] = useState("");
  const [externalLinks, setExternalLinks] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [wikiTitle, setWikiTitle] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("categories/");
        setCategories(response.data);
      } catch (err) {
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
    // Cleanup preview URL on unmount
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line
  }, []);

  // Image preview effect
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [image]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    } else {
      setImage(null);
    }
  };

  const handleImportWikipedia = async () => {
    if (!wikiTitle.trim()) {
      setError("Please enter a Wikipedia article title.");
      return;
    }

    try {
      setImportLoading(true);
      setError("");

      const res = await api.post("import-wikipedia/", {
        title: wikiTitle,
      });

      if (res.data.slug) {
        navigate(`/article/${encodeURIComponent(res.data.slug)}`);
        return;
      }

      setSuccess(res.data.message || "Article imported successfully!");
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to import Wikipedia article."
      );
    } finally {
      setImportLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!title.trim()) {
      setError("Please enter a title first.");
      return;
    }

    try {
      setAiLoading(true);
      setError("");

      const res = await api.post("/ai/generate-article/", {
        title,
      });

      setSummary(res.data.summary || "");
      setHistory(res.data.history || "");
      setFeatures(res.data.features || "");
      setApplications(res.data.applications || "");
      setReferences(res.data.references || "");
      setContent(res.data.content || "");
    } catch (err) {
      setError("Failed to generate article with AI.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("summary", summary);
      formData.append("history", history);
      formData.append("features", features);
      formData.append("applications", applications);
      formData.append("references", references);
      formData.append("external_links", externalLinks);
      formData.append("content", content);
      formData.append("category", category);
      if (image) {
        formData.append("image", image);
      }
      await api.post("articles/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSuccess("Article created successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setError("Failed to create article. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Create Article</h2>
      {error && (
        <div className="mb-4 text-red-700 bg-red-100 border border-red-300 p-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 text-green-700 bg-green-100 border border-green-300 p-3 rounded">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-3 text-lg font-semibold text-blue-800">
            📥 Import from Wikipedia
          </h3>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={wikiTitle}
              onChange={(e) => setWikiTitle(e.target.value)}
              placeholder="Example: Python (programming language)"
              className="flex-1 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />

            <button
              type="button"
              onClick={handleImportWikipedia}
              disabled={importLoading}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {importLoading ? "Importing..." : "📥 Import"}
            </button>
          </div>
        </div>
        {/* Title */}
        <div>
          <label className="block mb-1 font-medium" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            maxLength={200}
            placeholder="Enter the article title"
          />
        </div>
        {/* Short Description */}
        <div>
          <label className="block mb-1 font-medium" htmlFor="description">
            Short Description
          </label>
          <input
            id="description"
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={loading}
            maxLength={256}
            placeholder="A brief summary of the article"
          />
        </div>
        {/* Category */}
        <div>
          <label className="block mb-1 font-medium" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {/* Featured Image */}
        <div>
          <label className="block mb-1 font-medium" htmlFor="image">
            Featured Image
          </label>
          <input
            id="image"
            type="file"
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
          />
        </div>
        {/* Image Preview */}
        {preview && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 rounded border"
            />
          </div>
        )}
        {/* Summary */}
        <div>
          <label className="block mb-1 font-medium" htmlFor="summary">
            Summary
          </label>
          <textarea
            id="summary"
            className="w-full border rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={loading}
            placeholder="Provide a detailed summary of the article"
          />
        </div>
        {/* History */}
        <div>
          <label className="block mb-1 font-medium" htmlFor="history">
            History
          </label>
          <textarea
            id="history"
            className="w-full border rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={history}
            onChange={(e) => setHistory(e.target.value)}
            disabled={loading}
            placeholder="Describe the history related to the article topic"
          />
        </div>
        {/* Features */}
        <div>
          <label className="block mb-1 font-medium" htmlFor="features">
            Features
          </label>
          <textarea
            id="features"
            className="w-full border rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            disabled={loading}
            placeholder="List and describe key features"
          />
        </div>
        {/* Applications */}
        <div>
          <label className="block mb-1 font-medium" htmlFor="applications">
            Applications
          </label>
          <textarea
            id="applications"
            className="w-full border rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={applications}
            onChange={(e) => setApplications(e.target.value)}
            disabled={loading}
            placeholder="Explain the applications or uses"
          />
        </div>
        {/* References */}
        <div>
          <label className="block mb-1 font-medium" htmlFor="references">
            References
          </label>
          <textarea
            id="references"
            className="w-full border rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={references}
            onChange={(e) => setReferences(e.target.value)}
            disabled={loading}
            placeholder="Add any references or citations"
          />
        </div>
        {/* External Links */}
        <div>
          <label className="block mb-1 font-medium" htmlFor="externalLinks">
            External Links
          </label>
          <textarea
            id="externalLinks"
            className="w-full border rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={externalLinks}
            onChange={(e) => setExternalLinks(e.target.value)}
            disabled={loading}
            placeholder="Provide relevant external links"
          />
        </div>
        {/* Content */}
        <div>
          <label className="block mb-1 font-medium" htmlFor="content">
            Content
          </label>
          <textarea
            id="content"
            className="w-full border rounded px-3 py-2 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={loading}
            maxLength={10000}
            placeholder="Write the main content of the article here..."
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
            <span>{charCount} character{charCount !== 1 ? "s" : ""}</span>
          </div>
        </div>
        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            onClick={handleGenerateAI}
            disabled={aiLoading || loading}
          >
            {aiLoading ? "Generating..." : "🤖 Generate with AI"}
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
            disabled={loading}
          >
            {loading ? "Publishing..." : "Create Article"}
          </button>
          <Link
            to="/"
            className="text-gray-600 hover:underline"
            tabIndex={loading ? -1 : 0}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CreateArticle;
