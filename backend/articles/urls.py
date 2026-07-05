from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    ArticleViewSet,
    CategoryListView,
    RegisterView,
    ProfileView,
    TestEmailView,
    CommentViewSet,
    LikeViewSet,
    BookmarkViewSet,
    ShareViewSet,
    ImportWikipediaView,

)


router = DefaultRouter()
router.register(r"articles", ArticleViewSet)
router.register(r"comments", CommentViewSet, basename="comment")
router.register(r"likes", LikeViewSet, basename="like")
router.register(r"bookmarks", BookmarkViewSet, basename="bookmark")
router.register(r"shares", ShareViewSet, basename="share")

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("register/", RegisterView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("test-email/", TestEmailView.as_view(), name="test-email"),
    path(
    "import-wikipedia/",
    ImportWikipediaView.as_view(),
    name="import-wikipedia",
)

]

urlpatterns += router.urls