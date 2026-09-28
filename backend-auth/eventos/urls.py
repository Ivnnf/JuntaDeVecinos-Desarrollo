from django.urls import path

from .views import (
    AsistenciaEventoDetailView,
    AsistenciaEventoListCreateView,
    EventoDirectivaDetailView,
    EventoDirectivaListCreateView,
    EventoVecinoListView,
    InscripcionEventoCancelarView,
    InscripcionEventoCreateView,
    InscripcionesEventoDirectivaListView,
)

urlpatterns = [
    path(
        "asistencias/<int:pk>/",
        AsistenciaEventoDetailView.as_view(),
        name="asistencia-evento-detail",
    ),
    path(
        "eventos/<int:evento_id>/inscripciones/",
        InscripcionesEventoDirectivaListView.as_view(),
        name="inscripciones-evento-directiva-list",
    ),
    path(
        "eventos/<int:evento_id>/asistencias/",
        AsistenciaEventoListCreateView.as_view(),
        name="asistencias-evento-list-create",
    ),
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
