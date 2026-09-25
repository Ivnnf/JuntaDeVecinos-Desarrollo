from django.urls import path

from .views import (
    AdjuntoPublicacionCreateView,
    PublicacionDirectivaListCreateView,
)

from .views import (
    AdjuntoPublicacionCreateView,
    AdjuntoPublicacionDescargaView,
    PublicacionDirectivaListCreateView,
)

urlpatterns = [
    path(
        "publicaciones/",
        PublicacionDirectivaListCreateView.as_view(),
        name="publicaciones-directiva-list-create",
    ),
    path(
        "publicaciones/<int:publicacion_id>/adjuntos/",
        AdjuntoPublicacionCreateView.as_view(),
        name="adjuntos-publicacion-create",
    ),
    path(
        "adjuntos/<int:pk>/descargar/",
        AdjuntoPublicacionDescargaView.as_view(),
        name="adjuntos-publicacion-descargar",
    ),
]
