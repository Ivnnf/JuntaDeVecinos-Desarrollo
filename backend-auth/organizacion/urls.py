from django.urls import path

from .views import (
    JuntaVecinosDetailView,
    JuntaVecinosListCreateView,
    SectorDetailView,
    SectorListCreateView,
    SectoresDisponiblesView,
    SolicitarAsociacionSectorView,
    AsociacionesSectorPendientesView,
    ResolverAsociacionSectorView,
)

urlpatterns = [
    path(
        "resolver-asociacion-sector/<int:usuario_id>/",
        ResolverAsociacionSectorView.as_view(),
        name="resolver-asociacion-sector",
    ),
    path(
        "asociaciones-pendientes/",
        AsociacionesSectorPendientesView.as_view(),
        name="asociaciones-sector-pendientes",
    ),
    path(
        "solicitar-asociacion-sector/",
        SolicitarAsociacionSectorView.as_view(),
        name="solicitar-asociacion-sector",
    ),
    path(
        "sectores-disponibles/",
        SectoresDisponiblesView.as_view(),
        name="sectores-disponibles",
    ),
    path(
        "juntas/",
        JuntaVecinosListCreateView.as_view(),
        name="juntas-list-create",
    ),
    path(
        "juntas/<int:pk>/",
        JuntaVecinosDetailView.as_view(),
        name="juntas-detail",
    ),
    path(
        "sectores/",
        SectorListCreateView.as_view(),
        name="sectores-list-create",
    ),
    path(
        "sectores/<int:pk>/",
        SectorDetailView.as_view(),
        name="sectores-detail",
    ),
]
