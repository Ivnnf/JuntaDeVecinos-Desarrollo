from django.urls import path

from .views import LoginView, SesionUsuarioView, health

urlpatterns = [
    path("health/", health, name="health"),
    path("login/", LoginView.as_view(), name="login"),
    path("sesion/", SesionUsuarioView.as_view(), name="sesion-usuario"),
]