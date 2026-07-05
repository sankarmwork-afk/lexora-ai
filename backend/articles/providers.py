

from .wiki_service import search_wikipedia


def search_all_sources(query: str):
    """
    Search external providers in priority order.
    Return the first successful result.
    """
    result = search_wikipedia(query)
    if result:
        return result

    

    return None
