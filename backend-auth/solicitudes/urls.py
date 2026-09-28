from django.urls import path

from .views import SolicitudVecinoListCreateView


urlpatterns = [
    path(
        "solicitudes/",
        SolicitudVecinoListCreateView.as_view(),
        name="solicitudes-vecino-list-create",
    ),
]