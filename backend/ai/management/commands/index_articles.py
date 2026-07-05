from django.core.management.base import BaseCommand

from ai.services import RAGService


class Command(BaseCommand):
    help = "Index all articles into ChromaDB"

    def handle(self, *args, **options):
        rag = RAGService()
        rag.index_articles()
        self.stdout.write(self.style.SUCCESS("Articles indexed successfully!"))
