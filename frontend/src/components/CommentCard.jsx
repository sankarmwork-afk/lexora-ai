import React, { useState } from "react";
import api from "../services/api";

export default function CommentCard({ comment, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = Number(localStorage.getItem("user_id"));
  const isOwner = userId === comment.author;

  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    try {
      await api.patch(`comments/${comment.id}/`, { content });
      setIsEditing(false);
      onUpdated();
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Failed to update comment.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    setLoading(true);
    setError("");
    try {
      await api.delete(`comments/${comment.id}/`);
      onUpdated();
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Failed to delete comment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">{comment.author_name}</h3>
        <span className="text-gray-500 text-sm">
          {new Date(comment.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      {isEditing ? (
        <textarea
          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          disabled={loading}
        />
      ) : (
        <p className="mb-3 whitespace-pre-wrap">{comment.content}</p>
      )}
      {error && <p className="text-red-600 mb-3">{error}</p>}
      {isOwner && (
        <div className="flex space-x-3">
          {!isEditing ? (
            <>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                Edit
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md"
                onClick={handleUpdate}
                disabled={loading}
              >
                Save
              </button>
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded-md"
                onClick={() => {
                  setIsEditing(false);
                  setContent(comment.content);
                  setError("");
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
