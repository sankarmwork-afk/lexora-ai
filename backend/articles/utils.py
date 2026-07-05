


from articles.models import Article
from ai.services import RAGService


def save_external_article(result: dict):
    """
    Save an externally retrieved article to the database.
    If it is newly created, index it into ChromaDB.
    Returns the Article instance.
    """

    defaults = {
        "description": result.get("description", ""),
        "summary": result.get("summary") or "",
        "content": result.get("content") or "",
        "is_published": True,
    }

    if any(field.name == "image_url" for field in Article._meta.get_fields()):
        defaults["image_url"] = result.get("image") or ""

    article, created = Article.objects.get_or_create(
        title=result.get("title"),
        defaults=defaults,
    )

    if created:
        try:
            RAGService().index_article(article)
        except Exception as exc:
            print(f"Indexing failed: {exc}")

    return article