from rest_framework import viewsets, generics, status, filters
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.core.mail import send_mail
from django.conf import settings
from .wiki_service import search_wikipedia

from ai.services import RAGService

from .models import Article, Category, Profile, Comment, Like, Bookmark, Share
from .serializers import (
    ArticleSerializer,
    CategorySerializer,
    UserRegisterSerializer,
    ProfileSerializer,
    CommentSerializer,
    LikeSerializer,
    BookmarkSerializer,
    ShareSerializer,
)


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = (
        Article.objects.all()
        .select_related("category", "author")
        .order_by("-created_at")
    )
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [filters.SearchFilter]
    search_fields = [
        "title",
        "description",
        "summary",
        "history",
        "features",
        "applications",
        "references",
        "content",
    ]




    
    lookup_field = "slug"

    def retrieve(self, request, *args, **kwargs):
        article = self.get_object()

        # Increment view count
        article.views = (article.views or 0) + 1
        article.save(update_fields=["views"])

        serializer = self.get_serializer(article)
        data = serializer.data

        data["related_articles"] = []
        try:
            rag = RAGService()
            related = rag.get_related_articles(article.title)
            if related:
                data["related_articles"] = related
        except Exception as e:
            print("Related Articles Error:", e)

        return Response(data)

    def perform_create(self, serializer):
        article = serializer.save(author=self.request.user)
        try:
            RAGService().index_articles()
        except Exception as e:
            print("RAG Create Error:", e)

    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise PermissionDenied("You can only edit your own articles.")

        article = serializer.save()
        try:
            RAGService().index_articles()
        except Exception as e:
            print("RAG Update Error:", e)

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied("You can only delete your own articles.")

        instance.delete()
        try:
            RAGService().index_articles()
        except Exception as e:
            print("RAG Delete Error:", e)


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "User registered successfully."},
            status=status.HTTP_201_CREATED,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


class TestEmailView(APIView):
    def post(self, request):
        send_mail(
            subject="Lexora Test Email",
            message="Congratulations! Your Django email configuration is working.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],
            fail_silently=False,
        )

        return Response(
            {"message": "Test email sent successfully."},
            status=status.HTTP_200_OK,
        )


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = (
            Comment.objects.select_related("author", "article")
            .order_by("-created_at")
        )

        article_id = self.request.query_params.get("article")
        if article_id:
            queryset = queryset.filter(article_id=article_id)

        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise PermissionDenied("You can only edit your own comments.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied("You can only delete your own comments.")
        instance.delete()


class LikeViewSet(viewsets.ModelViewSet):
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Like.objects.select_related(
            "user",
            "article",
            "article__category",
            "article__author",
        )
        article_id = self.request.query_params.get("article")
        if article_id:
            queryset = queryset.filter(article_id=article_id)

        queryset = queryset.order_by("-created_at")
        return queryset

    def perform_create(self, serializer):
        article = serializer.validated_data["article"]
        if Like.objects.filter(user=self.request.user, article=article).exists():
            raise PermissionDenied("You already liked this article.")
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only remove your own likes.")
        instance.delete()


class BookmarkViewSet(viewsets.ModelViewSet):
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Bookmark.objects.filter(user=self.request.user)
            .select_related(
                "user",
                "article",
                "article__category",
                "article__author",
            )
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        article = serializer.validated_data["article"]
        if Bookmark.objects.filter(user=self.request.user, article=article).exists():
            raise PermissionDenied("You already bookmarked this article.")
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only remove your own bookmarks.")
        instance.delete()



class ShareViewSet(viewsets.ModelViewSet):
    serializer_class = ShareSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return (
            Share.objects.select_related(
                "user",
                "article",
                "article__category",
                "article__author",
            )
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()


# Import Wikipedia API view
class ImportWikipediaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        title = request.data.get("title", "").strip()

        if not title:
            return Response(
                {"error": "Title is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = search_wikipedia(title)

        if not data:
            return Response(
                {"error": "Wikipedia article not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if article already exists
        existing_article = Article.objects.filter(
            title__iexact=data.get("title", title)
        ).first()

        if existing_article:
            return Response(
                {
                    "message": "Article already exists.",
                    "id": existing_article.id,
                    "slug": existing_article.slug,
                },
                status=status.HTTP_200_OK,
            )

        # Get or create default category
        default_category, _ = Category.objects.get_or_create(
            name="Wikipedia"
        )

        # Create new article
        article_text = data.get("article_text") or data.get("extract", "")

        # Calculate reading time (200 words/minute)
        word_count = len(article_text.split()) if article_text else 0
        reading_time = max(1, (word_count + 199) // 200) if word_count else 1

        rag = RAGService()

        try:
            sections = rag.generate_article_sections(article_text)
        except Exception as e:
            print("RAG Error:", e)
            sections = {
                "summary": article_text[:1000],
                "history": "",
                "features": "",
                "applications": "",
                "references": "",
            }

        summary = sections.get("summary", "").strip()
        if not summary:
            summary = article_text[:500].rsplit(" ", 1)[0] + "..." if len(article_text) > 500 else article_text

        article = Article.objects.create(
            title=data.get("title", title),
            description=data.get("description", ""),
            summary=summary,
            history=sections.get("history", ""),
            features=sections.get("features", ""),
            applications=sections.get("applications", ""),
            references=sections.get("references", ""),
            content=article_text,
            image_url=data.get("image") or "",
            reading_time=reading_time,
            category=default_category,
            author=request.user,
        )
        article.ai_summary = summary
        article.save(update_fields=["ai_summary"])
        # Refresh the RAG index so newly imported articles are searchable
        try:
            rag.index_articles()
        except Exception as e:
            print("RAG Index Error:", e)
        return Response(
            {
                "message": "Article imported successfully.",
                "id": article.id,
                "slug": article.slug,
            },
            status=status.HTTP_201_CREATED,
        )