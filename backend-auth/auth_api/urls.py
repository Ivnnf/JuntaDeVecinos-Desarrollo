from django.urls import path

from .views import LoginView, health

urlpatterns = [
    path("health/", health, name="health"),
    path("login/", LoginView.as_view(), name="login"),
]