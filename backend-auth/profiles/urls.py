from django.urls import path

from .views import (
    CaracterizacionComunitariaDirectivaView,
    CaracterizacionComunitariaMunicipalCsvView,
    CaracterizacionComunitariaMunicipalView,
    MiCaracterizacionComunitariaView,
    AnalisisCaracterizacionMunicipalView,
)

urlpatterns = [
    path(
        "municipal/caracterizacion/analisis/",
        AnalisisCaracterizacionMunicipalView.as_view(),
        name="municipal-caracterizacion-analisis",
    ),
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
