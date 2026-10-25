from django.urls import path

from .views import (
    CaracterizacionComunitariaDirectivaView,
    CaracterizacionComunitariaMunicipalCsvView,
    CaracterizacionComunitariaMunicipalView,
    MiCaracterizacionComunitariaView,
)

urlpatterns = [
    path(
        "municipal/caracterizacion/",
        CaracterizacionComunitariaMunicipalView.as_view(),
        name="municipal-caracterizacion",
    ),
    path(
        "municipal/caracterizacion/exportar/",
        CaracterizacionComunitariaMunicipalCsvView.as_view(),
        name="municipal-caracterizacion-exportar",
    ),
    path(
        "mi-caracterizacion/",
        MiCaracterizacionComunitariaView.as_view(),
        name="mi-caracterizacion",
    ),
    path(
        "directiva/caracterizacion/",
        CaracterizacionComunitariaDirectivaView.as_view(),
        name="directiva-caracterizacion",
    ),
]
