from django.urls import path

from .views import SearchView, HomeSearchView, GenerateArticleView

urlpatterns = [
    path("search/", SearchView.as_view(), name="ai-search"),
    path("home/search/", HomeSearchView.as_view(), name="home-search"),
    path("generate-article/", GenerateArticleView.as_view(), name="generate-article"),
]
