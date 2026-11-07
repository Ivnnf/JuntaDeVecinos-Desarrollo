from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from organizacion.models import JuntaVecinos, Sector

from .models import (
    CaracterizacionComunitaria,
    Rol,
    Usuario,
    UsuarioRol,
)

from .views import (
    AnalisisCaracterizacionMunicipalView,
    MiCaracterizacionComunitariaView,
)


class AnalisisCaracterizacionMunicipalTests(TestCase):

    def setUp(self):
        self.factory = APIRequestFactory()

        self.rol_municipal, _ = Rol.objects.get_or_create(
            nombre="Municipal",
        )

        self.junta = JuntaVecinos.objects.create(
            nombre="Junta Test Municipal",
            comuna="Puente Alto",
            activa=True,
        )

        self.sector = Sector.objects.create(
            junta_vecinos=self.junta,
            nombre="Sector Test Municipal",
            activo=True,
        )

        self.municipal = Usuario.objects.create_user(
            username="municipal_test",
            email="municipal_test@test.cl",
            password="ClaveSegura123!",
        )

        UsuarioRol.objects.create(
            usuario=self.municipal,
            rol=self.rol_municipal,
            activo=True,
        )

    def test_municipal_no_puede_crear_caracterizacion_personal(self):
        request = self.factory.get(
            "/api/profiles/mi-caracterizacion/"
        )

        force_authenticate(
            request,
            user=self.municipal,
        )

        response = MiCaracterizacionComunitariaView.as_view()(
            request
        )

        self.assertEqual(
            response.status_code,
            403,
        )

        self.assertFalse(
            CaracterizacionComunitaria.objects.filter(
                usuario=self.municipal,
            ).exists()
        )

    def test_vecino_no_confirmado_no_puede_crear_caracterizacion(self):
        rol_vecino, _ = Rol.objects.get_or_create(
            nombre="Vecino",
        )

        vecino = Usuario.objects.create_user(
            username="vecino_pendiente_caracterizacion",
            email="vecino.pendiente.caracterizacion@test.cl",
            password="ClaveSegura123!",
            sector=self.sector,
            estado_asociacion_sector="PENDIENTE",
        )

        UsuarioRol.objects.create(
            usuario=vecino,
            rol=rol_vecino,
            activo=True,
        )

        request = self.factory.get(
            "/api/profiles/mi-caracterizacion/"
        )

        force_authenticate(
            request,
            user=vecino,
        )

        response = MiCaracterizacionComunitariaView.as_view()(
            request
        )

        self.assertEqual(
            response.status_code,
            403,
        )

        self.assertFalse(
            CaracterizacionComunitaria.objects.filter(
                usuario=vecino,
            ).exists()
        )

    def crear_caracterizacion(
        self,
        numero,
        tipo_vivienda="CASA",
        acceso_internet=True,
        situacion_laboral="TRABAJANDO",
        nivel_educacional="MEDIA",
    ):
        usuario = Usuario.objects.create_user(
            username=f"vecino_test_{numero}",
            email=f"vecino_test_{numero}@test.cl",
            password="ClaveSegura123!",
            sector=self.sector,
            estado_asociacion_sector="CONFIRMADA",
        )

        return CaracterizacionComunitaria.objects.create(
            usuario=usuario,
            cantidad_personas_hogar=3,
            cantidad_menores_18=1,
            cantidad_18_29=1,
            cantidad_30_44=1,
            cantidad_45_59=0,
            cantidad_adultos_mayores=0,
            nivel_educacional=nivel_educacional,
            situacion_laboral=situacion_laboral,
            tipo_vivienda=tipo_vivienda,
            acceso_internet=acceso_internet,
        )

    def test_no_expone_analisis_con_menos_de_tres_caracterizaciones(self):
        self.crear_caracterizacion(1)
        self.crear_caracterizacion(2)

        request = self.factory.get("/api/profiles/municipal/caracterizacion/analisis/")

        force_authenticate(
            request,
            user=self.municipal,
        )

        response = AnalisisCaracterizacionMunicipalView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["total_caracterizaciones"],
            2,
        )
        self.assertEqual(
            response.data["minimo_requerido"],
            3,
        )
        self.assertFalse(response.data["datos_suficientes"])
        self.assertIsNone(response.data["distribucion_etaria"])
        self.assertIsNone(response.data["rango_etario_predominante"])

    def test_expone_analisis_con_tres_caracterizaciones(self):
        self.crear_caracterizacion(1)
        self.crear_caracterizacion(2)
        self.crear_caracterizacion(3)

        request = self.factory.get("/api/profiles/municipal/caracterizacion/analisis/")

        force_authenticate(
            request,
            user=self.municipal,
        )

        response = AnalisisCaracterizacionMunicipalView.as_view()(request)

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.data["total_caracterizaciones"],
            3,
        )

        self.assertTrue(response.data["datos_suficientes"])

        self.assertIsNotNone(response.data["distribucion_etaria"])

        self.assertEqual(
            len(response.data["conectividad_por_vivienda"]),
            1,
        )

        self.assertEqual(
            response.data["conectividad_por_vivienda"][0]["tipo_vivienda"],
            "CASA",
        )

        self.assertEqual(
            response.data["conectividad_por_vivienda"][0]["total"],
            3,
        )

    def test_detecta_brecha_conectividad_por_tipo_vivienda(self):
        for numero in range(1, 4):
            self.crear_caracterizacion(
                numero,
                tipo_vivienda="CASA",
                acceso_internet=True,
            )

        for numero in range(4, 7):
            self.crear_caracterizacion(
                numero,
                tipo_vivienda="DEPARTAMENTO",
                acceso_internet=False,
            )

        request = self.factory.get("/api/profiles/municipal/caracterizacion/analisis/")

        force_authenticate(
            request,
            user=self.municipal,
        )

        response = AnalisisCaracterizacionMunicipalView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["datos_suficientes"])

        brecha = response.data["brecha_conectividad_vivienda"]

        self.assertIsNotNone(brecha)

        self.assertEqual(
            brecha["tipo_vivienda_mayor"],
            "CASA",
        )

        self.assertEqual(
            brecha["porcentaje_mayor"],
            100.0,
        )

        self.assertEqual(
            brecha["tipo_vivienda_menor"],
            "DEPARTAMENTO",
        )

        self.assertEqual(
            brecha["porcentaje_menor"],
            0.0,
        )

        self.assertEqual(
            brecha["diferencia_puntos"],
            100.0,
        )

    def test_detecta_conectividad_homogenea_por_tipo_vivienda(self):
        for numero in range(1, 4):
            self.crear_caracterizacion(
                numero,
                tipo_vivienda="CASA",
                acceso_internet=True,
            )

        for numero in range(4, 7):
            self.crear_caracterizacion(
                numero,
                tipo_vivienda="DEPARTAMENTO",
                acceso_internet=True,
            )

        request = self.factory.get("/api/profiles/municipal/caracterizacion/analisis/")

        force_authenticate(
            request,
            user=self.municipal,
        )

        response = AnalisisCaracterizacionMunicipalView.as_view()(request)

        self.assertEqual(response.status_code, 200)

        self.assertIsNone(response.data["brecha_conectividad_vivienda"])

        self.assertTrue(response.data["conectividad_vivienda_homogenea"])

        tipos_hallazgo = [hallazgo["tipo"] for hallazgo in response.data["hallazgos"]]

        self.assertIn(
            "PATRON_TERRITORIAL",
            tipos_hallazgo,
        )

    def test_excluye_subgrupo_con_menos_de_tres_registros(self):
        for numero in range(1, 4):
            self.crear_caracterizacion(
                numero,
                tipo_vivienda="CASA",
                acceso_internet=True,
            )

        for numero in range(4, 6):
            self.crear_caracterizacion(
                numero,
                tipo_vivienda="DEPARTAMENTO",
                acceso_internet=False,
            )

        request = self.factory.get("/api/profiles/municipal/caracterizacion/analisis/")

        force_authenticate(
            request,
            user=self.municipal,
        )

        response = AnalisisCaracterizacionMunicipalView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["datos_suficientes"])

        grupos = response.data["conectividad_por_vivienda"]

        self.assertEqual(len(grupos), 1)

        self.assertEqual(
            grupos[0]["tipo_vivienda"],
            "CASA",
        )

        self.assertIsNone(response.data["brecha_conectividad_vivienda"])

    def test_no_define_rango_etario_predominante_con_cobertura_incompleta(self):
        self.crear_caracterizacion(1)
        self.crear_caracterizacion(2)
        self.crear_caracterizacion(3)

        caracterizacion = CaracterizacionComunitaria.objects.get(
            usuario__username="vecino_test_3"
        )

        caracterizacion.cantidad_30_44 = 0
        caracterizacion.save()

        request = self.factory.get("/api/profiles/municipal/caracterizacion/analisis/")

        force_authenticate(
            request,
            user=self.municipal,
        )

        response = AnalisisCaracterizacionMunicipalView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["datos_suficientes"])

        self.assertIsNone(response.data["rango_etario_predominante"])

        titulos_hallazgo = [
            hallazgo["titulo"] for hallazgo in response.data["hallazgos"]
        ]

        self.assertIn(
            "Cobertura etaria incompleta",
            titulos_hallazgo,
        )

    def test_detecta_brecha_conectividad_por_situacion_laboral(self):
        for numero in range(1, 4):
            self.crear_caracterizacion(
                numero,
                situacion_laboral="TRABAJANDO",
                acceso_internet=True,
            )

        for numero in range(4, 7):
            self.crear_caracterizacion(
                numero,
                situacion_laboral="DESEMPLEADO",
                acceso_internet=False,
            )

        request = self.factory.get("/api/profiles/municipal/caracterizacion/analisis/")

        force_authenticate(
            request,
            user=self.municipal,
        )

        response = AnalisisCaracterizacionMunicipalView.as_view()(request)

        self.assertEqual(response.status_code, 200)

        brecha = response.data["brecha_conectividad_laboral"]

        self.assertIsNotNone(brecha)

        self.assertEqual(
            brecha["situacion_laboral_mayor"],
            "TRABAJANDO",
        )

        self.assertEqual(
            brecha["porcentaje_mayor"],
            100.0,
        )

        self.assertEqual(
            brecha["situacion_laboral_menor"],
            "DESEMPLEADO",
        )

        self.assertEqual(
            brecha["porcentaje_menor"],
            0.0,
        )

        self.assertEqual(
            brecha["diferencia_puntos"],
            100.0,
        )

    def test_detecta_brecha_conectividad_por_nivel_educacional(self):
        for numero in range(1, 4):
            self.crear_caracterizacion(
                numero,
                nivel_educacional="SUPERIOR",
                acceso_internet=True,
            )

        for numero in range(4, 7):
            self.crear_caracterizacion(
                numero,
                nivel_educacional="BASICA",
                acceso_internet=False,
            )

        request = self.factory.get("/api/profiles/municipal/caracterizacion/analisis/")

        force_authenticate(
            request,
            user=self.municipal,
        )

        response = AnalisisCaracterizacionMunicipalView.as_view()(request)

        self.assertEqual(response.status_code, 200)

        brecha = response.data["brecha_conectividad_educacional"]

        self.assertIsNotNone(brecha)

        self.assertEqual(
            brecha["nivel_educacional_mayor"],
            "SUPERIOR",
        )

        self.assertEqual(
            brecha["porcentaje_mayor"],
            100.0,
        )

        self.assertEqual(
            brecha["nivel_educacional_menor"],
            "BASICA",
        )

        self.assertEqual(
            brecha["porcentaje_menor"],
            0.0,
        )

        self.assertEqual(
            brecha["diferencia_puntos"],
            100.0,
        )
