from django.urls import path

from .views import (
    SolicitudDirectivaDetailView,
    SolicitudVecinoListCreateView,
    SolicitudesDirectivaListView,
)


urlpatterns = [
    path(
        "solicitudes/",
        SolicitudVecinoListCreateView.as_view(),
        name="solicitudes-vecino-list-create",
    ),
    path(
        "directiva/solicitudes/",
        SolicitudesDirectivaListView.as_view(),
        name="solicitudes-directiva-list",
    ),
    path(
        "directiva/solicitudes/<int:pk>/",
        SolicitudDirectivaDetailView.as_view(),
        name="solicitud-directiva-detail",
    ),
]