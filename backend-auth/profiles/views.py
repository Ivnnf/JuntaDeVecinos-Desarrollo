from django.db.models import Avg, Count, Q

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from organizacion.models import (
    Directiva,
    IntegranteDirectiva,
    JuntaVecinos,
)
from organizacion.permissions import EsDirectiva, EsMunicipal

from .models import CaracterizacionComunitaria
from .serializers import CaracterizacionComunitariaSerializer


class MiCaracterizacionComunitariaView(generics.RetrieveUpdateAPIView):
    serializer_class = CaracterizacionComunitariaSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        caracterizacion, _ = CaracterizacionComunitaria.objects.get_or_create(
            usuario=self.request.user,
            defaults={
                "cantidad_personas_hogar": 1,
                "cantidad_menores_18": 0,
                "cantidad_adultos_mayores": 0,
                "nivel_educacional": (
                    CaracterizacionComunitaria.NivelEducacional.PREFIERE_NO_RESPONDER
                ),
                "situacion_laboral": (
                    CaracterizacionComunitaria.SituacionLaboral.PREFIERE_NO_RESPONDER
                ),
                "tipo_vivienda": (
                    CaracterizacionComunitaria.TipoVivienda.PREFIERE_NO_RESPONDER
                ),
                "acceso_internet": None,
            },
        )

        return caracterizacion


class CaracterizacionComunitariaDirectivaView(generics.GenericAPIView):
    permission_classes = [EsDirectiva]

    MINIMO_RESPUESTAS = 3

    def get(self, request):
        juntas_directiva = IntegranteDirectiva.objects.filter(
            usuario=request.user,
            activo=True,
            directiva__estado=(Directiva.EstadoDirectiva.VIGENTE),
        ).values_list(
            "directiva__junta_vecinos_id",
            flat=True,
        )

        caracterizaciones = CaracterizacionComunitaria.objects.filter(
            usuario__is_active=True,
            usuario__sector__junta_vecinos_id__in=(juntas_directiva),
            usuario__estado_asociacion_sector=("CONFIRMADA"),
        )

        total = caracterizaciones.count()

        if total < self.MINIMO_RESPUESTAS:
            return Response(
                {
                    "datos_disponibles": False,
                    "total_caracterizados": total,
                    "minimo_requerido": (self.MINIMO_RESPUESTAS),
                    "detail": (
                        "Se requieren al menos "
                        f"{self.MINIMO_RESPUESTAS} "
                        "caracterizaciones para mostrar "
                        "resultados agregados."
                    ),
                }
            )

        resumen = caracterizaciones.aggregate(
            promedio_personas_hogar=Avg("cantidad_personas_hogar"),
            hogares_con_menores=Count(
                "id",
                filter=Q(cantidad_menores_18__gt=0),
            ),
            hogares_con_adultos_mayores=Count(
                "id",
                filter=Q(cantidad_adultos_mayores__gt=0),
            ),
            hogares_con_internet=Count(
                "id",
                filter=Q(acceso_internet=True),
            ),
            hogares_sin_internet=Count(
                "id",
                filter=Q(acceso_internet=False),
            ),
            internet_sin_respuesta=Count(
                "id",
                filter=Q(acceso_internet__isnull=True),
            ),
        )

        def distribucion(campo):
            return {
                item[campo]: item["total"]
                for item in (
                    caracterizaciones.values(campo)
                    .annotate(total=Count("id"))
                    .order_by(campo)
                )
            }

        promedio = resumen["promedio_personas_hogar"]

        return Response(
            {
                "datos_disponibles": True,
                "total_caracterizados": total,
                "promedio_personas_hogar": (
                    round(float(promedio), 2) if promedio is not None else 0
                ),
                "hogares_con_menores": resumen["hogares_con_menores"],
                "hogares_con_adultos_mayores": resumen["hogares_con_adultos_mayores"],
                "acceso_internet": {
                    "si": resumen["hogares_con_internet"],
                    "no": resumen["hogares_sin_internet"],
                    "sin_respuesta": resumen["internet_sin_respuesta"],
                },
                "nivel_educacional": distribucion("nivel_educacional"),
                "situacion_laboral": distribucion("situacion_laboral"),
                "tipo_vivienda": distribucion("tipo_vivienda"),
            }
        )


class CaracterizacionComunitariaMunicipalView(generics.GenericAPIView):
    permission_classes = [EsMunicipal]

    MINIMO_RESPUESTAS = 3

    def get(self, request):
        caracterizaciones = CaracterizacionComunitaria.objects.filter(
            usuario__is_active=True,
            usuario__sector__isnull=False,
            usuario__sector__junta_vecinos__activa=True,
            usuario__estado_asociacion_sector=("CONFIRMADA"),
        )

        total_general = caracterizaciones.count()

        juntas = JuntaVecinos.objects.filter(activa=True).order_by("nombre")

        resumen_juntas = []

        for junta in juntas:
            junta_id = junta.id

            caracterizaciones_junta = caracterizaciones.filter(
                usuario__sector__junta_vecinos_id=junta_id
            )

            total = caracterizaciones_junta.count()

            datos_junta = {
                "junta_id": junta_id,
                "junta_nombre": junta.nombre,
                "datos_disponibles": (total >= self.MINIMO_RESPUESTAS),
                "total_caracterizados": total,
                "minimo_requerido": self.MINIMO_RESPUESTAS,
            }

            if total < self.MINIMO_RESPUESTAS:
                resumen_juntas.append(datos_junta)
                continue

            def distribucion(campo):
                return {
                    item[campo]: item["total"]
                    for item in (
                        caracterizaciones_junta.values(campo)
                        .annotate(total=Count("id"))
                        .order_by(campo)
                    )
                }

            resumen = caracterizaciones_junta.aggregate(
                promedio_personas_hogar=Avg("cantidad_personas_hogar"),
                hogares_con_menores=Count(
                    "id",
                    filter=Q(cantidad_menores_18__gt=0),
                ),
                hogares_con_adultos_mayores=Count(
                    "id",
                    filter=Q(cantidad_adultos_mayores__gt=0),
                ),
                hogares_con_internet=Count(
                    "id",
                    filter=Q(acceso_internet=True),
                ),
                hogares_sin_internet=Count(
                    "id",
                    filter=Q(acceso_internet=False),
                ),
                internet_sin_respuesta=Count(
                    "id",
                    filter=Q(acceso_internet__isnull=True),
                ),
            )

            promedio = resumen["promedio_personas_hogar"]

            datos_junta.update(
                {
                    "promedio_personas_hogar": (
                        round(float(promedio), 2) if promedio is not None else 0
                    ),
                    "hogares_con_menores": resumen["hogares_con_menores"],
                    "hogares_con_adultos_mayores": resumen[
                        "hogares_con_adultos_mayores"
                    ],
                    "acceso_internet": {
                        "si": resumen["hogares_con_internet"],
                        "no": resumen["hogares_sin_internet"],
                        "sin_respuesta": resumen["internet_sin_respuesta"],
                    },
                    "nivel_educacional": distribucion("nivel_educacional"),
                    "situacion_laboral": distribucion("situacion_laboral"),
                    "tipo_vivienda": distribucion("tipo_vivienda"),
                }
            )

            resumen_juntas.append(datos_junta)

        return Response(
            {
                "total_caracterizados": total_general,
                "minimo_requerido": (self.MINIMO_RESPUESTAS),
                "juntas": resumen_juntas,
            }
        )
