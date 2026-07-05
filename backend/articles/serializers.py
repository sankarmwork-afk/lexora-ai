from rest_framework import serializers
from django.contrib.auth.models import User

from .models import Category, Article, Profile, Comment, Like, Bookmark, Share


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source="category.name")
    author_name = serializers.ReadOnlyField(source="author.username")
    likes_count = serializers.SerializerMethodField()
    bookmarks_count = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "summary",
            "history",
            "features",
            "applications",
            "references",
            "external_links",
            "content",
            "category",
            "category_name",
            "author",
            "author_name",
            "image",
            "image_url",
            "views",
            "likes_count",
            "bookmarks_count",
            "reading_time",
            "ai_summary",
            "keywords",
            "created_at",
            "updated_at",
            "is_published",
        ]

        read_only_fields = [
            "slug",
            "author",
            "created_at",
            "updated_at",
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_bookmarks_count(self, obj):
        return obj.bookmarks.count()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")
    email = serializers.ReadOnlyField(source="user.email")

    class Meta:
        model = Profile
        fields = [
            "id",
            "username",
            "email",
            "profile_image",
            "cover_image",
            "bio",
            "profession",
            "location",
            "website",
            "github",
            "linkedin",
            "twitter",
            "followers",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "username",
            "email",
            "created_at",
            "updated_at",
        ]





class CommentSerializer(serializers.ModelSerializer):

    author_name = serializers.CharField(

        source="author.username",

        read_only=True

    )

    class Meta:

        model = Comment

        fields = [

            "id",

            "article",

            "author",

            "author_name",

            "content",

            "created_at",

            "updated_at",

        ]

        read_only_fields = [

            "author",

            "created_at",

            "updated_at",

        ]




class LikeSerializer(serializers.ModelSerializer):

    username = serializers.ReadOnlyField(source="user.username")

    class Meta:

        model = Like

        fields = [

            "id",

            "article",

            "user",

            "username",

            "created_at",

        ]

        read_only_fields = [

            "user",

            "created_at",

        ]

class BookmarkSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Bookmark
        fields = [
            "id",
            "article",
            "user",
            "username",
            "created_at",
        ]
        read_only_fields = [
            "user",
            "created_at",
        ]


class ShareSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")
    article_title = serializers.ReadOnlyField(source="article.title")

    class Meta:
        model = Share
        fields = [
            "id",
            "article",
            "article_title",
            "user",
            "username",
            "platform",
            "created_at",
        ]
        read_only_fields = [
            "user",
            "created_at",
            "article_title",
            "username",
        ]