

import { useState } from "react";
import api from "../services/api";

export default function AskAI() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      const res = await api.post("/ai/search/", {
        query: question,
      });

      setAnswer(res.data.answer);
      setSources(res.data.sources || []);
    } catch (err) {
      console.error(err);
      setAnswer("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🤖 Ask Lexora AI</h1>

      <textarea
        className="w-full border rounded-lg p-3"
        rows={4}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask anything about the articles..."
      />

      <button
        onClick={askAI}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
      >
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {answer && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Answer</h2>
          <p className="mt-2">{answer}</p>

          <h3 className="text-lg font-semibold mt-6">Sources</h3>
          <ul className="list-disc ml-6 mt-2">
            {sources.map((source, index) => (
              <li key={index}>{source.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}