from google import genai
from django.conf import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def rewrite_query(query):

    query = (query or "").strip()
    if not query:
        return query

    prompt = f"""
Rewrite this user search into the best Wikipedia article title.

Rules:
- Return ONLY the title.
- No explanation.
- Maximum 6 words.

User search:
{query}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        rewritten = (getattr(response, "text", "") or "").strip()
        return rewritten if rewritten else query

    except Exception:
        return query