from django.urls import path

from .views import (
    EventoDirectivaDetailView,
    EventoDirectivaListCreateView,
    EventoVecinoListView,
    InscripcionEventoCancelarView,
    InscripcionEventoCreateView,
)

urlpatterns = [
    path(
        "inscripciones/<int:pk>/cancelar/",
        InscripcionEventoCancelarView.as_view(),
        name="inscripciones-evento-cancelar",
    ),
    path(
        "inscripciones/",
        InscripcionEventoCreateView.as_view(),
        name="inscripciones-evento-create",
    ),
    path(
        "vecino/eventos/",
        EventoVecinoListView.as_view(),
        name="eventos-vecino-list",
    ),
    path(
        "eventos/<int:pk>/",
        EventoDirectivaDetailView.as_view(),
        name="eventos-directiva-detail",
    ),
    path(
        "eventos/",
        EventoDirectivaListCreateView.as_view(),
        name="eventos-directiva-list-create",
    ),
]
