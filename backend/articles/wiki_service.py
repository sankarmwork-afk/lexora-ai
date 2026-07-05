import requests
from urllib.parse import quote

WIKIPEDIA_API = "https://en.wikipedia.org/api/rest_v1/page/summary/"


def search_wikipedia(title):
    """Search Wikipedia and return article details."""

    if not title or not title.strip():
        return None

    page_title = quote(title.strip().replace(" ", "_"))
    url = f"{WIKIPEDIA_API}{page_title}"

    headers = {
        "User-Agent": "Lexora/1.0 (Wikipedia Knowledge Platform)"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        data = response.json()

        if data.get("type") == "https://mediawiki.org/wiki/HyperSwitch/errors/not_found":
            return None

        extract_url = (
            "https://en.wikipedia.org/w/api.php"
            f"?action=query&prop=extracts&explaintext=1&titles={page_title}&format=json"
        )

        extract_response = requests.get(extract_url, headers=headers, timeout=10)
        extract_response.raise_for_status()
        extract_json = extract_response.json()

        pages = extract_json.get("query", {}).get("pages", {})
        page = next(iter(pages.values()), {})
        article_text = page.get("extract", data.get("extract", ""))

        image_url = ""
        if data.get("originalimage"):
            image_url = data["originalimage"].get("source", "")
        elif data.get("thumbnail"):
            image_url = data["thumbnail"].get("source", "")

        # Ignore images that are usually diagrams, icons, or logos.
        if image_url:
            bad_keywords = [
                "logo",
                "icon",
                "diagram",
                "flowchart",
                ".svg",
                "flag",
                "map",
                "coat_of_arms",
            ]
            lower_url = image_url.lower()
            if any(keyword in lower_url for keyword in bad_keywords):
                image_url = ""

        # If no suitable image was found, try the MediaWiki pageimages API.
        if not image_url:
            image_api = (
                "https://en.wikipedia.org/w/api.php"
                f"?action=query&prop=pageimages&piprop=original&pithumbsize=1200&titles={page_title}&format=json"
            )

            try:
                image_response = requests.get(image_api, headers=headers, timeout=10)
                image_response.raise_for_status()
                image_json = image_response.json()
                pages = image_json.get("query", {}).get("pages", {})
                page_info = next(iter(pages.values()), {})

                if page_info.get("original"):
                    image_url = page_info["original"].get("source", "")
                elif page_info.get("thumbnail"):
                    image_url = page_info["thumbnail"].get("source", "")
            except requests.RequestException:
                pass

        if not image_url:
            image_url = ""

        return {
            "title": data.get("title", ""),
            "description": data.get("description", ""),
            "summary": article_text,
            "content": article_text,
            "extract": article_text,
            "image": image_url,
            "url": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
            "pageid": data.get("pageid"),
            "lang": "en",
            "is_external": True,
        }

    except requests.exceptions.Timeout:
        print("Wikipedia request timed out.")
        return None
    except requests.exceptions.ConnectionError:
        print("Unable to connect to Wikipedia.")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"Wikipedia HTTP Error: {e}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Wikipedia Request Error: {e}")
        return None