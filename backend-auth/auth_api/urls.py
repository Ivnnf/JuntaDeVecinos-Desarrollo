from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    RefreshTokenView,
    RegistroVecinoView,
    RestablecerPasswordView,
    SesionUsuarioView,
    SolicitudRecuperacionView,
    health,
)

urlpatterns = [
    path("health/", health, name="health"),
    path("login/", LoginView.as_view(), name="login"),
    path("registro/", RegistroVecinoView.as_view(), name="registro-vecino"),
    path(
    "recuperar-password/",
    SolicitudRecuperacionView.as_view(),
    name="recuperar-password",
),
path(
    "restablecer-password/<uidb64>/<token>/",
    RestablecerPasswordView.as_view(),
    name="restablecer-password",
),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("sesion/", SesionUsuarioView.as_view(), name="sesion-usuario"),
    path("refresh/", RefreshTokenView.as_view(), name="refresh-token"),
]