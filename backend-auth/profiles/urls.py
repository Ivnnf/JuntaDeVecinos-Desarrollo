from django.urls import path

from .views import (
    CaracterizacionComunitariaDirectivaView,
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
