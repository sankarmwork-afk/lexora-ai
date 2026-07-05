

import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function LikeButton({ articleId, onUpdated }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = Number(localStorage.getItem("user_id"));

  const loadLikes = async () => {
    try {
      setLoading(true);
      const res = await api.get(`likes/?article=${articleId}`);
      const likeList = res.data || [];
      setLikes(likeList.length);
      if (onUpdated) {
        onUpdated(likeList.length);
      }
      setLiked(likeList.some(like => like.user === userId));
    } catch (err) {
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articleId) {
      loadLikes();
    }
    // eslint-disable-next-line
  }, [articleId]);

  const toggleLike = async () => {
    setLoading(true);
    try {
      if (liked) {
        // Find the current user's like and delete it
        const res = await api.get(`likes/?article=${articleId}`);
        const likeList = res.data || [];
        const myLike = likeList.find(like => like.user === userId);
        if (myLike) {
          await api.delete(`likes/${myLike.id}/`);
        }
        await loadLikes();
      } else {
        await api.post("likes/", { article: articleId });
        await loadLikes();
      }
    } catch (err) {
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={toggleLike}
      className={`bg-blue-600 text-white rounded-lg px-4 py-2 transition-opacity hover:bg-blue-700 ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {liked ? `❤️ Liked (${likes})` : `🤍 Like (${likes})`}
    </button>
  );
}