from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .services import RAGService
from articles.serializers import ArticleSerializer
from articles.models import Article
from articles.utils import save_external_article

from google import genai
from django.conf import settings
from django.db.models import Q
from articles.internet_service import search_internet


def build_external_response(wiki):
    return {
        "articles": [],
        "answer": wiki.get("summary") or wiki.get("content") or "",
        "sources": ["Wikipedia"],
        "matched": False,
        "external": True,
        "external_article": {
            "title": wiki.get("title"),
            "description": wiki.get("description"),
            "summary": wiki.get("summary") or wiki.get("content") or "",
            "image_url": wiki.get("image"),
        },
    }


class SearchView(APIView):
    def post(self, request):
        query = (request.data.get("query") or "").strip()

        if not query:
            return Response(
                {"error": "Query is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Search local database for exact title match
        article = Article.objects.filter(title__iexact=query).first()
        if article:
            return Response(
                {
                    "articles": [ArticleSerializer(article).data],
                    "answer": article.summary or article.description or article.content[:300],
                    "sources": [article.title],
                    "matched": True,
                },
                status=status.HTTP_200_OK,
            )

        # Search Internet before using RAG
        result = search_internet(query)
        if result and result.get("title"):
            try:
                save_external_article(result)
            except Exception as exc:
                print(f"External article import failed: {exc}")

            return Response(build_external_response(result), status=status.HTTP_200_OK)

        # Fallback to RAGService
        rag = RAGService()
        ai_result = rag.ask(query)

        if ai_result.get("error"):
            return Response(
                {
                    "articles": [],
                    "answer": "The AI service is temporarily unavailable.",
                    "sources": [],
                    "matched": False,
                    "external": False,
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if ai_result.get("no_match"):
            return Response(
                {
                    "articles": [],
                    "answer": "No results found.",
                    "sources": [],
                    "matched": False,
                    "external": False,
                },
                status=status.HTTP_200_OK,
            )

        return Response(ai_result, status=status.HTTP_200_OK)


class HomeSearchView(APIView):
    def post(self, request):
        query = (request.data.get("query") or "").strip()
        normalized_query = query.lower()
        for prefix in ["tell me about ", "what is ", "who is ", "explain "]:
            if normalized_query.startswith(prefix):
                query = query[len(prefix):].strip()
                break

        if not query:
            return Response(
                {"error": "Query is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Exact title lookup
        exact_article = Article.objects.filter(title__iexact=query).first()
        if exact_article:
            serializer = ArticleSerializer(exact_article)
            return Response(
                {
                    "articles": [serializer.data],
                    "answer": exact_article.summary or exact_article.description or exact_article.content[:300],
                    "sources": [exact_article.title],
                    "matched": True,
                },
                status=status.HTTP_200_OK,
            )

        # 4. Search Internet before using RAG
        result = search_internet(query)
        if not result and " " in query:
            result = search_internet(query.replace("history of ", "").strip())

        if result and result.get("title"):
            try:
                save_external_article(result)
            except Exception as exc:
                print(f"External article import failed: {exc}")

            return Response(build_external_response(result), status=status.HTTP_200_OK)

        # Fuzzy title lookup (istartswith or icontains)
        fuzzy_articles = Article.objects.filter(
            Q(title__istartswith=query) | Q(title__icontains=query)
        ).distinct()[:5]

        if fuzzy_articles.exists():
            article_data = ArticleSerializer(fuzzy_articles, many=True).data
            first = fuzzy_articles.first()
            return Response(
                {
                    "articles": article_data,
                    "answer": first.summary or first.description or first.content[:300],
                    "sources": [first.title],
                    "matched": True,
                },
                status=status.HTTP_200_OK,
            )

        # 2. Keep the existing articles query
        articles = Article.objects.filter(
            Q(title__icontains=query)
            | Q(description__icontains=query)
            | Q(summary__icontains=query)
            | Q(history__icontains=query)
            | Q(features__icontains=query)
            | Q(applications__icontains=query)
            | Q(content__icontains=query)
        ).distinct()[:5]
        article_data = ArticleSerializer(articles, many=True).data

        # 3. If any articles found, return first's data
        if articles.exists():
            first = articles.first()
            return Response(
                {
                    "articles": article_data,
                    "answer": first.summary or first.description or first.content[:300],
                    "sources": [first.title],
                    "matched": True,
                },
                status=status.HTTP_200_OK,
            )

        # 5. Final fallback to RAG only if internet search failed
        rag = RAGService()
        ai_result = rag.ask(query)

        if ai_result.get("error") or ai_result.get("no_match"):
            return Response(
                {
                    "articles": [],
                    "answer": "No results found.",
                    "sources": [],
                    "matched": False,
                    "external": False,
                },
                status=status.HTTP_200_OK,
            )

        # Ignore unrelated semantic matches
        if ai_result.get("sources"):
            first_source_data = ai_result["sources"][0]
            if isinstance(first_source_data, dict):
                first_source = first_source_data.get("title", "").lower()
            else:
                first_source = str(first_source_data).lower()
            if query.lower() not in first_source:
                return Response(
                    {
                        "articles": [],
                        "answer": "No results found.",
                        "sources": [],
                        "matched": False,
                        "external": False,
                    },
                    status=status.HTTP_200_OK,
                )

        return Response(ai_result, status=status.HTTP_200_OK)


class GenerateArticleView(APIView):
    def post(self, request):
        title = request.data.get("title")

        if not title:
            return Response(
                {"error": "Title is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        prompt = f"""
Generate a Wikipedia-style article about: {title}

Return only these sections:
Summary:
History:
Features:
Applications:
References:
Content:
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        text = response.text if hasattr(response, "text") else ""

        sections = {
            "Summary": "",
            "History": "",
            "Features": "",
            "Applications": "",
            "References": "",
            "Content": text,
        }

        current = None
        for line in text.splitlines():
            stripped = line.strip()
            matched = False
            for key in sections.keys():
                if stripped.lower().startswith(f"{key.lower()}:"):
                    current = key
                    value = stripped[len(key) + 1 :].strip()
                    if value:
                        sections[key] = value
                    matched = True
                    break
            if not matched and current:
                sections[current] += ("\n" if sections[current] else "") + stripped

        return Response(
            {
                "content": sections["Content"],
                "summary": sections["Summary"],
                "history": sections["History"],
                "features": sections["Features"],
                "applications": sections["Applications"],
                "references": sections["References"],
            },
            status=status.HTTP_200_OK,
        )