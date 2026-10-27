from django.db.models import Avg, Count, Q, Sum
from datetime import date
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import csv

from django.http import HttpResponse

from organizacion.models import (
    Directiva,
    IntegranteDirectiva,
    JuntaVecinos,
    Sector,
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
            personas_0_17=Sum("cantidad_menores_18"),
            personas_18_29=Sum("cantidad_18_29"),
            personas_30_44=Sum("cantidad_30_44"),
            personas_45_59=Sum("cantidad_45_59"),
            personas_60_mas=Sum("cantidad_adultos_mayores"),
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

    @staticmethod
    def fecha_hace_anios(fecha_base, anios):
        try:
            return fecha_base.replace(year=fecha_base.year - anios)
        except ValueError:
            return fecha_base.replace(
                year=fecha_base.year - anios,
                month=2,
                day=28,
            )

    @classmethod
    def filtrar_por_rango_etario(cls, queryset, rango_etario):
        hoy = date.today()

        fecha_18 = cls.fecha_hace_anios(hoy, 18)
        fecha_30 = cls.fecha_hace_anios(hoy, 30)
        fecha_45 = cls.fecha_hace_anios(hoy, 45)
        fecha_60 = cls.fecha_hace_anios(hoy, 60)

        if rango_etario == "0_17":
            return queryset.filter(usuario__fecha_nacimiento__gt=fecha_18)

        if rango_etario == "18_29":
            return queryset.filter(
                usuario__fecha_nacimiento__lte=fecha_18,
                usuario__fecha_nacimiento__gt=fecha_30,
            )

        if rango_etario == "30_44":
            return queryset.filter(
                usuario__fecha_nacimiento__lte=fecha_30,
                usuario__fecha_nacimiento__gt=fecha_45,
            )

        if rango_etario == "45_59":
            return queryset.filter(
                usuario__fecha_nacimiento__lte=fecha_45,
                usuario__fecha_nacimiento__gt=fecha_60,
            )

        if rango_etario == "60_MAS":
            return queryset.filter(usuario__fecha_nacimiento__lte=fecha_60)

        return queryset

    def get(self, request):
        caracterizaciones = CaracterizacionComunitaria.objects.filter(
            usuario__is_active=True,
            usuario__sector__isnull=False,
            usuario__sector__junta_vecinos__activa=True,
            usuario__estado_asociacion_sector=("CONFIRMADA"),
        )
        rango_etario = request.query_params.get("rango_etario")
        junta_id = request.query_params.get("junta_id")
        sector_id = request.query_params.get("sector_id")

        if junta_id:
            caracterizaciones = caracterizaciones.filter(
                usuario__sector__junta_vecinos_id=junta_id
            )

        if sector_id:
            caracterizaciones = caracterizaciones.filter(usuario__sector_id=sector_id)

        if rango_etario:
            caracterizaciones = self.filtrar_por_rango_etario(
                caracterizaciones,
                rango_etario,
            )

        sectores_disponibles = Sector.objects.filter(
            activo=True,
            junta_vecinos__activa=True,
        )

        if junta_id:
            sectores_disponibles = sectores_disponibles.filter(
                junta_vecinos_id=junta_id
            )

        sectores_disponibles = sectores_disponibles.order_by(
            "junta_vecinos__nombre",
            "nombre",
        )

        total_general = caracterizaciones.count()

        juntas = JuntaVecinos.objects.filter(activa=True)

        if junta_id:
            juntas = juntas.filter(id=junta_id)
        elif sector_id:
            juntas = juntas.filter(sectores__id=sector_id)

        juntas = juntas.order_by("nombre")

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
                personas_0_17=Sum("cantidad_menores_18"),
                personas_18_29=Sum("cantidad_18_29"),
                personas_30_44=Sum("cantidad_30_44"),
                personas_45_59=Sum("cantidad_45_59"),
                personas_60_mas=Sum("cantidad_adultos_mayores"),
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
                    "personas_0_17": resumen["personas_0_17"] or 0,
                    "personas_18_29": resumen["personas_18_29"] or 0,
                    "personas_30_44": resumen["personas_30_44"] or 0,
                    "personas_45_59": resumen["personas_45_59"] or 0,
                    "personas_60_mas": resumen["personas_60_mas"] or 0,
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
                "minimo_requerido": self.MINIMO_RESPUESTAS,
                "sectores": [
                    {
                        "sector_id": sector.id,
                        "sector_nombre": sector.nombre,
                        "junta_id": sector.junta_vecinos_id,
                        "junta_nombre": sector.junta_vecinos.nombre,
                    }
                    for sector in sectores_disponibles
                ],
                "juntas": resumen_juntas,
            }
        )


class AnalisisCaracterizacionMunicipalView(CaracterizacionComunitariaMunicipalView):
    def get(self, request):
        caracterizaciones = CaracterizacionComunitaria.objects.filter(
            usuario__is_active=True,
            usuario__sector__isnull=False,
            usuario__sector__junta_vecinos__activa=True,
            usuario__estado_asociacion_sector="CONFIRMADA",
        )

        junta_id = request.query_params.get("junta_id")
        sector_id = request.query_params.get("sector_id")
        rango_etario = request.query_params.get("rango_etario")

        if junta_id:
            caracterizaciones = caracterizaciones.filter(
                usuario__sector__junta_vecinos_id=junta_id
            )

        if sector_id:
            caracterizaciones = caracterizaciones.filter(usuario__sector_id=sector_id)

        if rango_etario:
            caracterizaciones = self.filtrar_por_rango_etario(
                caracterizaciones,
                rango_etario,
            )

        total = caracterizaciones.count()

        if total < self.MINIMO_RESPUESTAS:
            return Response(
                {
                    "total_caracterizaciones": total,
                    "minimo_requerido": self.MINIMO_RESPUESTAS,
                    "datos_suficientes": False,
                    "distribucion_etaria": None,
                    "rango_etario_predominante": None,
                }
            )

        caracterizaciones_con_etario_completo = 0

        for caracterizacion in caracterizaciones:
            total_etario = (
                caracterizacion.cantidad_menores_18
                + caracterizacion.cantidad_18_29
                + caracterizacion.cantidad_30_44
                + caracterizacion.cantidad_45_59
                + caracterizacion.cantidad_adultos_mayores
            )

            if total_etario == caracterizacion.cantidad_personas_hogar:
                caracterizaciones_con_etario_completo += 1

        porcentaje_cobertura_etaria = round(
            (caracterizaciones_con_etario_completo / total) * 100,
            2,
        )

        distribucion_etaria = {
            "0_17": caracterizaciones.aggregate(total=Sum("cantidad_menores_18"))[
                "total"
            ]
            or 0,
            "18_29": caracterizaciones.aggregate(total=Sum("cantidad_18_29"))["total"]
            or 0,
            "30_44": caracterizaciones.aggregate(total=Sum("cantidad_30_44"))["total"]
            or 0,
            "45_59": caracterizaciones.aggregate(total=Sum("cantidad_45_59"))["total"]
            or 0,
            "60_MAS": caracterizaciones.aggregate(
                total=Sum("cantidad_adultos_mayores")
            )["total"]
            or 0,
        }

        rango_predominante = (
            max(
                distribucion_etaria,
                key=distribucion_etaria.get,
            )
            if any(distribucion_etaria.values())
            else None
        )

        etiquetas_rangos = {
            "0_17": "0 a 17 años",
            "18_29": "18 a 29 años",
            "30_44": "30 a 44 años",
            "45_59": "45 a 59 años",
            "60_MAS": "60 años o más",
        }

        rango_predominante_texto = (
            etiquetas_rangos.get(rango_predominante) if rango_predominante else None
        )

        resumen_internet = caracterizaciones.aggregate(
            hogares_con_internet=Count(
                "id",
                filter=Q(acceso_internet=True),
            ),
            hogares_sin_internet=Count(
                "id",
                filter=Q(acceso_internet=False),
            ),
            respuestas_internet=Count(
                "id",
                filter=Q(acceso_internet__isnull=False),
            ),
        )

        respuestas_internet = resumen_internet["respuestas_internet"] or 0

        porcentaje_internet = (
            round(
                (resumen_internet["hogares_con_internet"] / respuestas_internet) * 100,
                2,
            )
            if respuestas_internet > 0
            else None
        )

        if porcentaje_internet is None:
            nivel_conectividad = None
        elif porcentaje_internet >= 80:
            nivel_conectividad = "ALTA"
        elif porcentaje_internet >= 50:
            nivel_conectividad = "MEDIA"
        else:
            nivel_conectividad = "BAJA"

        distribucion_laboral = {
            item["situacion_laboral"]: item["total"]
            for item in (
                caracterizaciones.values("situacion_laboral")
                .annotate(total=Count("id"))
                .order_by("situacion_laboral")
            )
        }

        if distribucion_laboral:
            maximo_laboral = max(distribucion_laboral.values())

            situaciones_maximas = [
                situacion
                for situacion, cantidad in distribucion_laboral.items()
                if cantidad == maximo_laboral
            ]

            situacion_laboral_predominante = (
                situaciones_maximas[0] if len(situaciones_maximas) == 1 else None
            )

            empate_laboral = len(situaciones_maximas) > 1
        else:
            situacion_laboral_predominante = None
            empate_laboral = False

        conectividad_por_vivienda = []

        resumen_vivienda_internet = (
            caracterizaciones.values("tipo_vivienda")
            .annotate(
                total=Count("id"),
                respuestas_internet=Count(
                    "id",
                    filter=Q(acceso_internet__isnull=False),
                ),
                con_internet=Count(
                    "id",
                    filter=Q(acceso_internet=True),
                ),
            )
            .order_by("tipo_vivienda")
        )

        for item in resumen_vivienda_internet:
            respuestas = item["respuestas_internet"] or 0

            if (
                item["total"] < self.MINIMO_RESPUESTAS
                or respuestas < self.MINIMO_RESPUESTAS
            ):
                continue

            porcentaje = (
                round(
                    (item["con_internet"] / respuestas) * 100,
                    2,
                )
                if respuestas > 0
                else None
            )

            conectividad_por_vivienda.append(
                {
                    "tipo_vivienda": item["tipo_vivienda"],
                    "total": item["total"],
                    "respuestas_internet": respuestas,
                    "con_internet": item["con_internet"],
                    "porcentaje_internet": porcentaje,
                }
            )

        hallazgos = []

        if porcentaje_cobertura_etaria == 100 and rango_predominante_texto:
            hallazgos.append(
                {
                    "tipo": "DEMOGRAFIA",
                    "titulo": "Rango etario predominante",
                    "descripcion": (
                        "El rango etario con mayor presencia en las "
                        f"caracterizaciones seleccionadas es "
                        f"{rango_predominante_texto}."
                    ),
                }
            )
        elif porcentaje_cobertura_etaria < 100:
            hallazgos.append(
                {
                    "tipo": "DEMOGRAFIA",
                    "titulo": "Cobertura etaria incompleta",
                    "descripcion": (
                        f"El {porcentaje_cobertura_etaria}% de las "
                        "caracterizaciones seleccionadas cuenta con "
                        "distribución etaria completa. Se recomienda "
                        "completar los datos antes de interpretar un "
                        "rango etario predominante."
                    ),
                }
            )

        if nivel_conectividad:
            hallazgos.append(
                {
                    "tipo": "CONECTIVIDAD",
                    "titulo": "Nivel de conectividad",
                    "descripcion": (
                        f"El {porcentaje_internet}% de los hogares con "
                        "respuesta sobre conectividad dispone de acceso "
                        f"a Internet. El nivel se clasifica como "
                        f"{nivel_conectividad.lower()}."
                    ),
                }
            )

        if empate_laboral:
            hallazgos.append(
                {
                    "tipo": "SITUACION_LABORAL",
                    "titulo": "Distribución laboral equilibrada",
                    "descripcion": (
                        "No existe una situación laboral claramente "
                        "predominante entre las caracterizaciones "
                        "seleccionadas."
                    ),
                }
            )
        elif situacion_laboral_predominante:
            hallazgos.append(
                {
                    "tipo": "SITUACION_LABORAL",
                    "titulo": "Situación laboral predominante",
                    "descripcion": (
                        "La situación laboral con mayor presencia es "
                        f"{situacion_laboral_predominante}."
                    ),
                }
            )

        return Response(
            {
                "total_caracterizaciones": total,
                "minimo_requerido": self.MINIMO_RESPUESTAS,
                "datos_suficientes": (total >= self.MINIMO_RESPUESTAS),
                "caracterizaciones_con_etario_completo": (
                    caracterizaciones_con_etario_completo
                ),
                "porcentaje_cobertura_etaria": (porcentaje_cobertura_etaria),
                "distribucion_etaria": distribucion_etaria,
                "rango_etario_predominante": rango_predominante,
                "rango_etario_predominante_texto": (rango_predominante_texto),
                "hogares_con_internet": resumen_internet["hogares_con_internet"],
                "porcentaje_internet": porcentaje_internet,
                "nivel_conectividad": nivel_conectividad,
                "conectividad_por_vivienda": conectividad_por_vivienda,
                "distribucion_laboral": distribucion_laboral,
                "situacion_laboral_predominante": (situacion_laboral_predominante),
                "empate_laboral": empate_laboral,
                "situaciones_laborales_principales": (
                    situaciones_maximas if distribucion_laboral else []
                ),
                "hallazgos": hallazgos,
            }
        )


class CaracterizacionComunitariaMunicipalCsvView(
    CaracterizacionComunitariaMunicipalView
):
    def get(self, request):
        caracterizaciones = CaracterizacionComunitaria.objects.filter(
            usuario__is_active=True,
            usuario__sector__isnull=False,
            usuario__sector__junta_vecinos__activa=True,
            usuario__estado_asociacion_sector="CONFIRMADA",
        )

        junta_id = request.query_params.get("junta_id")
        sector_id = request.query_params.get("sector_id")
        rango_etario = request.query_params.get("rango_etario")

        if junta_id:
            caracterizaciones = caracterizaciones.filter(
                usuario__sector__junta_vecinos_id=junta_id
            )

        if sector_id:
            caracterizaciones = caracterizaciones.filter(usuario__sector_id=sector_id)

        if rango_etario:
            caracterizaciones = self.filtrar_por_rango_etario(
                caracterizaciones,
                rango_etario,
            )

        juntas = JuntaVecinos.objects.filter(activa=True)

        if junta_id:
            juntas = juntas.filter(id=junta_id)
        elif sector_id:
            juntas = juntas.filter(sectores__id=sector_id)

        juntas = juntas.order_by("nombre")

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="reporte_municipal.csv"'

        response.write("\ufeff")

        writer = csv.writer(response)

        writer.writerow(
            [
                "Junta de Vecinos",
                "Total caracterizaciones",
                "Estado de datos",
                "Promedio personas por hogar",
                "Hogares con menores",
                "Hogares con adultos mayores",
                "Personas 0 a 17 años",
                "Personas 18 a 29 años",
                "Personas 30 a 44 años",
                "Personas 45 a 59 años",
                "Personas 60 años o más",
                "Acceso a internet (%)",
            ]
        )

        for junta in juntas:
            datos = caracterizaciones.filter(usuario__sector__junta_vecinos_id=junta.id)

            total = datos.count()

            if total < self.MINIMO_RESPUESTAS:
                writer.writerow(
                    [
                        junta.nombre,
                        total,
                        "Datos insuficientes",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                    ]
                )
                continue

            resumen = datos.aggregate(
                personas_0_17=Sum("cantidad_menores_18"),
                personas_18_29=Sum("cantidad_18_29"),
                personas_30_44=Sum("cantidad_30_44"),
                personas_45_59=Sum("cantidad_45_59"),
                personas_60_mas=Sum("cantidad_adultos_mayores"),
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
                respuestas_internet=Count(
                    "id",
                    filter=Q(acceso_internet__isnull=False),
                ),
            )

            respuestas_internet = resumen["respuestas_internet"] or 0

            porcentaje_internet = (
                round(
                    (resumen["hogares_con_internet"] / respuestas_internet) * 100,
                    2,
                )
                if respuestas_internet > 0
                else 0
            )

            promedio = resumen["promedio_personas_hogar"]

            writer.writerow(
                [
                    junta.nombre,
                    total,
                    "Datos disponibles",
                    round(float(promedio), 2) if promedio is not None else 0,
                    resumen["hogares_con_menores"],
                    resumen["hogares_con_adultos_mayores"],
                    resumen["personas_0_17"] or 0,
                    resumen["personas_18_29"] or 0,
                    resumen["personas_30_44"] or 0,
                    resumen["personas_45_59"] or 0,
                    resumen["personas_60_mas"] or 0,
                    porcentaje_internet,
                ]
            )

        return response
