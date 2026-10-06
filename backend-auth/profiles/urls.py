from django.urls import path

from .views import (
    CaracterizacionComunitariaDirectivaView,
    MiCaracterizacionComunitariaView,
)

urlpatterns = [
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
