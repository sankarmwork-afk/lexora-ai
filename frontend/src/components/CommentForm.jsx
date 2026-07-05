

import React, { useState } from "react";
import api from "../services/api";

export default function CommentForm({ articleId, onCommentAdded }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.post("comments/", {
        article: articleId,
        content,
      });
      setContent("");
      setError("");
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Failed to post comment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 border">
      <h3 className="text-lg font-semibold mb-3">Write a Comment</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-200 mb-2"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          disabled={loading}
        />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <button
          type="submit"
          className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          {loading ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </div>
  );
}