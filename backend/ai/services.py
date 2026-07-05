from sentence_transformers import SentenceTransformer
import chromadb
from google import genai
from django.conf import settings
from articles.models import Article

SIMILARITY_THRESHOLD = 0.8


class RAGService:
    def __init__(self):
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.chroma_client.get_or_create_collection(name="articles")
        self.client_ai = genai.Client(api_key=settings.GEMINI_API_KEY)

    def index_articles(self):
        articles = Article.objects.all()
        for article in articles:
            content = (article.content or "").strip()
            if not content:
                continue

            embedding = self.embedding_model.encode(content)
            self.collection.upsert(
                documents=[content],
                metadatas=[{"id": article.id, "title": article.title}],
                ids=[str(article.id)],
                embeddings=[embedding],
            )

    def index_article(self, article):
        content = (article.content or "").strip()

        if not content:
            return

        embedding = self.embedding_model.encode(content)

        self.collection.upsert(
            ids=[str(article.id)],
            documents=[content],
            metadatas=[{
                "id": article.id,
                "title": article.title,
            }],
            embeddings=[embedding],
        )

    def search(self, query, top_k=5):
        query_embedding = self.embedding_model.encode(query)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["distances", "metadatas", "documents"]
        )
        return results

    def get_related_articles(self, results):
        if not results.get("ids") or not results["ids"][0]:
            return Article.objects.none()
        article_ids = [int(id) for id in results['ids'][0]]
        articles = Article.objects.in_bulk(article_ids)
        return [articles[article_id] for article_id in article_ids if article_id in articles]

    def ask(self, query):
        # First, perform semantic search and check semantic distance
        results = self.search(query, top_k=5)
        print("Query:", query)
        print("Distances:", results.get("distances"))
        print("IDs:", results.get("ids"))
        print("Metadatas:", results.get("metadatas"))
        distances = results.get("distances")
        if not distances or not distances[0]:
            return {
                "answer": "",
                "sources": [],
                "no_match": True,
            }

        best_distance = distances[0][0]
        print(f"Best distance: {best_distance}")

        if best_distance > SIMILARITY_THRESHOLD:
            return {
                "answer": "",
                "sources": [],
                "no_match": True,
            }
        related_articles = self.get_related_articles(results)
        if not related_articles:
            return {
                "answer": "",
                "sources": [],
                "no_match": True,
            }
        context = "\n".join(article.content for article in related_articles)
        prompt = (
            "Use ONLY the supplied context to answer. "
            "If the context does not answer the question, reply exactly: NO_MATCH.\n\n"
            f"Context:\n{context}\n\nQuestion: {query}"
        )
        try:
            response = self.client_ai.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            answer = getattr(response, "text", "") or "No answer generated."
            if answer.strip().upper() == "NO_MATCH":
                return {
                    "answer": "",
                    "sources": [],
                    "no_match": True,
                }
        except Exception:
            return {
                "error": True,
                "answer": "AI service temporarily unavailable.",
                "sources": [],
            }
        sources = [{"id": article.id, "title": article.title} for article in related_articles]
        return {"answer": answer, "sources": sources}

    def generate_article_sections(self, article_id):
        article = Article.objects.get(id=article_id)
        prompt = f"Generate detailed sections for the article titled '{article.title}'. Content: {article.content}"
        response = self.client_ai.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        sections = getattr(response, "text", "")
        return sections