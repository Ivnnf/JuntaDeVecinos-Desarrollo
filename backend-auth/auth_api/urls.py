from django.urls import path

from .views import LoginView, LogoutView, SesionUsuarioView, health

urlpatterns = [
    path("health/", health, name="health"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("sesion/", SesionUsuarioView.as_view(), name="sesion-usuario"),
]