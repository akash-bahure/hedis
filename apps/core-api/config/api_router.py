"""Central API router — register your app routers here."""

from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter

from django.conf import settings

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

# Register your viewsets:
# from myapp.users.api.views import UserViewSet
# router.register("users", UserViewSet)

app_name = "api"
urlpatterns = router.urls
