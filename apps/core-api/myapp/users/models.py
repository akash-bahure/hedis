"""Custom User model for myapp."""

import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Default custom user model for myapp.

    If adding fields that need to be filled at user signup,
    check forms.py as well.
    """

    # Use UUID as the primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Remove username in favour of email login (configured in settings)
    first_name = models.CharField(_("first name"), blank=True, max_length=255)
    last_name = models.CharField(_("last name"), blank=True, max_length=255)
    email = models.EmailField(_("email address"), unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self) -> str:
        return self.email
