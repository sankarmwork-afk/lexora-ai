import React, { useEffect, useState } from 'react';
import api from '../services/api';
import CommentForm from './CommentForm';
import CommentCard from './CommentCard';

export default function CommentSection({ articleId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadComments() {
    if (!articleId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`comments/?article=${articleId}`);
      setComments(response.data);
    } catch (err) {
      console.error(err.response?.data || err);
      setError('Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, [articleId]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600">
        Loading comments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">
        Comments ({comments.length})
      </h2>
      <CommentForm articleId={articleId} onCommentAdded={loadComments} />
      {comments.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <div className="text-5xl">💬</div>
          <p className="mt-3 text-gray-600">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onUpdated={loadComments}
            />
          ))}
        </div>
      )}
    </section>
  );
}
