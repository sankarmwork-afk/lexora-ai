from .wiki_service import search_wikipedia
from .query_rewriter import rewrite_query
from .providers import search_all_sources


def search_internet(query: str):
    """
    Search external sources through the provider pipeline.
    The query is rewritten first, then passed to the configured providers.
    """
    query = (query or "").strip()

    if not query:
        return None

    query = rewrite_query(query)

    return search_all_sources(query)
