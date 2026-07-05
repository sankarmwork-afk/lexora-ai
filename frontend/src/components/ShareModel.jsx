

import React from "react";
import api from "../services/api";

const ShareModal = ({ isOpen, onClose, article }) => {
  if (!isOpen) return null;

  const share = async (platform, url) => {
    try {
      await api.post("shares/", { article: article.id, platform });
      if (url) {
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      await api.post("shares/", { article: article.id, platform: "copy" });
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const title = encodeURIComponent(article.title || "");
  const url = encodeURIComponent(window.location.href);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg p-8 z-60 min-w-[320px] flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-6">Share Article</h2>
        <div className="flex flex-col gap-3 w-full">
          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded mb-1"
            onClick={() =>
              share(
                "whatsapp",
                `https://wa.me/?text=${title}%20${url}`
              )
            }
          >
            WhatsApp
          </button>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mb-1"
            onClick={() =>
              share(
                "facebook",
                `https://www.facebook.com/sharer/sharer.php?u=${url}`
              )
            }
          >
            Facebook
          </button>
          <button
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded mb-1"
            onClick={() =>
              share(
                "linkedin",
                `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`
              )
            }
          >
            LinkedIn
          </button>
          <button
            className="w-full bg-black hover:bg-gray-900 text-white py-2 rounded mb-1"
            onClick={() =>
              share(
                "x",
                `https://twitter.com/intent/tweet?url=${url}&text=${title}`
              )
            }
          >
            X (Twitter)
          </button>
          <button
            className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded mb-1"
            onClick={() =>
              share(
                "email",
                `mailto:?subject=${title}&body=${url}`
              )
            }
          >
            Email
          </button>
          <button
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded mb-1"
            onClick={handleCopyLink}
          >
            Copy Link
          </button>
        </div>
        <button
          className="mt-6 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareModal;