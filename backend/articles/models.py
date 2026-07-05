from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Article(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    summary = models.TextField(blank=True)
    history = models.TextField(blank=True)
    features = models.TextField(blank=True)
    applications = models.TextField(blank=True)
    references = models.TextField(blank=True)
    external_links = models.TextField(blank=True)
    content = models.TextField()

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="articles"
    )

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="articles"
    )

    image = models.ImageField(
        upload_to="articles/",
        blank=True,
        null=True
    )
    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )
    views = models.PositiveIntegerField(default=0)
    reading_time = models.PositiveIntegerField(default=0)
    ai_summary = models.TextField(blank=True)
    keywords = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image = models.ImageField(upload_to="profiles/", blank=True, null=True)
    cover_image = models.ImageField(upload_to="covers/", blank=True, null=True)

    bio = models.TextField(blank=True)
    profession = models.CharField(max_length=100, blank=True)

    location = models.CharField(max_length=100, blank=True)

    website = models.URLField(blank=True)

    github = models.URLField(blank=True)

    linkedin = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    followers = models.ManyToManyField(User, blank=True, related_name="following")
    updated_at = models.DateTimeField(auto_now=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class Comment(models.Model):
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name="comments"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="comments"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author.username}: {self.content[:30]}"


class Like(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name="likes"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "article")

    def __str__(self):
        return f"{self.user.username} likes {self.article.title}"


class Bookmark(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name="bookmarks"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "article")

    def __str__(self):
        return f"{self.user.username} bookmarked {self.article.title}"


class Share(models.Model):
    PLATFORM_CHOICES = [
        ("whatsapp", "WhatsApp"),
        ("facebook", "Facebook"),
        ("linkedin", "LinkedIn"),
        ("twitter", "X"),
        ("email", "Email"),
        ("copy", "Copy Link"),
    ]

    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name="shares"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="shares"
    )

    platform = models.CharField(
        max_length=20,
        choices=PLATFORM_CHOICES
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.article.title} - {self.platform}"