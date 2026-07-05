import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../services/api";

const EditArticle = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch article details
        const articleRes = await api.get(`articles/${slug}/`);
        setTitle(articleRes.data.title || '');
        setDescription(articleRes.data.description || '');
        setContent(articleRes.data.content || '');
        setCategory(articleRes.data.category || '');
        setCurrentImage(articleRes.data.image || '');
        // Note: image is not set here; user may upload new one.

        // Fetch categories
        const categoriesRes = await api.get('categories/');
        setCategories(categoriesRes.data || []);
      } catch (err) {
        setMessage('Failed to load article or categories.');
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setImage(files[0]);
    } else {
      if (name === 'title') setTitle(value);
      if (name === 'description') setDescription(value);
      if (name === 'content') setContent(value);
      if (name === 'category') setCategory(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('content', content);
      formData.append('category', category);
      if (image) {
        formData.append('image', image);
      }
      await api.patch(`articles/${slug}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Article updated successfully!');
      setTimeout(() => {
        navigate(`/article/${slug}`);
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to update article.');
      console.error(err.response?.data || err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading article...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <h1 className="text-3xl font-bold">✏️ Edit Article</h1>
          <p className="text-blue-100 mt-1">Update your article information.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {message && (
            <div className={`rounded-lg p-3 font-medium ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <div>
            <label className="block font-semibold mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={description}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Content</label>
            <textarea
              name="content"
              value={content}
              onChange={handleChange}
              rows={10}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Category</label>
            <select
              name="category"
              value={category}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {currentImage && (
            <div>
              <label className="block font-semibold mb-2">Current Image</label>
              <img
                src={
                  currentImage.startsWith("http")
                    ? currentImage
                    : `http://localhost:8000${currentImage}`
                }
                alt="Current"
                className="w-64 rounded-lg border shadow object-cover"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold mb-2">Upload New Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="block w-full border rounded-lg p-3"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 font-semibold">
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50">
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArticle;