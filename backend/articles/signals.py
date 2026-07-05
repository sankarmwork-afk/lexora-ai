from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django_rest_passwordreset.signals import reset_password_token_created


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    reset_url = (
        f"http://localhost:5173/reset-password/"
        f"{reset_password_token.key}"
    )

    send_mail(
        subject="Reset your Lexora password",
        message=f"Click the link below to reset your password:\n\n{reset_url}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[reset_password_token.user.email],
        fail_silently=False,
    )