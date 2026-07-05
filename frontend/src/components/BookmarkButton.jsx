import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function BookMarkButton({ articleId, onUpdated }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = Number(localStorage.getItem("user_id"));

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const res = await api.get("bookmarks/");
      const items = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];
      const filtered = items.filter((b) => b.article === articleId);
      setBookmarks(filtered);
      setBookmarked(filtered.some((b) => b.user === userId));
      if (onUpdated) {
        onUpdated(filtered.length);
      }
    } catch (err) {
      console.error(err.response?.data || err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBookmarks();
    // eslint-disable-next-line
  }, [articleId]);

  const toggleBookmark = async () => {
    setLoading(true);
    try {
      if (bookmarked) {
        // Remove bookmark
        const userBookmark = bookmarks.find((b) => b.user === userId);
        if (userBookmark) {
          await api.delete(`bookmarks/${userBookmark.id}/`);
        }
      } else {
        // Add bookmark
        await api.post("bookmarks/", { article: articleId });
      }
      await loadBookmarks();
    } catch (err) {
      console.error(err.response?.data || err);
    }
    setLoading(false);
  };

  const count = bookmarks.length;
  return (
    <button
      className="rounded-lg px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
      disabled={loading}
      onClick={toggleBookmark}
    >
      {bookmarked
        ? `⭐ Bookmarked (${count})`
        : `🔖 Bookmark (${count})`}
    </button>
  );
}