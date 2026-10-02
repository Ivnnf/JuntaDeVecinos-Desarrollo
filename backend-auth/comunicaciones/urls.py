from django.urls import path

from .views import (
    AdjuntoPublicacionCreateView,
    AdjuntoPublicacionDescargaView,
    NotificacionDetailView,
    NotificacionListView,
    PublicacionDetalleVecinoView,
    PublicacionDirectivaListCreateView,
    ConversacionVecinoListCreateView,
    ConversacionDirectivaListView,
    MensajeDirectivaCreateView,
    MensajeVecinoCreateView,
    ConversacionVecinoDetailView,
    ConversacionDirectivaDetailView,
    ConversacionDirectivaEstadoView,
)

urlpatterns = [
    path(
        "directiva/conversaciones/<int:pk>/estado/",
        ConversacionDirectivaEstadoView.as_view(),
        name="conversacion-directiva-estado",
    ),
    path(
        "conversaciones/",
        ConversacionVecinoListCreateView.as_view(),
        name="conversaciones-vecino-list-create",
    ),
    path(
        "conversaciones/<int:pk>/",
        ConversacionVecinoDetailView.as_view(),
        name="conversacion-vecino-detail",
    ),
    path(
        "conversaciones/<int:conversacion_id>/mensajes/",
        MensajeVecinoCreateView.as_view(),
        name="mensajes-vecino-create",
    ),
    # MENSAJERÍA - DIRECTIVA
    path(
        "directiva/conversaciones/",
        ConversacionDirectivaListView.as_view(),
        name="conversaciones-directiva-list",
    ),
    path(
        "directiva/conversaciones/<int:pk>/",
        ConversacionDirectivaDetailView.as_view(),
        name="conversacion-directiva-detail",
    ),
    path(
        "directiva/conversaciones/<int:conversacion_id>/mensajes/",
        MensajeDirectivaCreateView.as_view(),
        name="mensajes-directiva-create",
    ),
    # PUBLICACIONES
    path(
        "publicaciones/",
        PublicacionDirectivaListCreateView.as_view(),
        name="publicaciones-directiva-list-create",
    ),
    path(
        "publicaciones/<int:pk>/detalle/",
        PublicacionDetalleVecinoView.as_view(),
        name="publicacion-detalle-vecino",
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
    # NOTIFICACIONES
    path(
        "notificaciones/",
        NotificacionListView.as_view(),
        name="notificaciones-list",
    ),
    path(
        "notificaciones/<int:pk>/",
        NotificacionDetailView.as_view(),
        name="notificaciones-detail",
    ),
]
