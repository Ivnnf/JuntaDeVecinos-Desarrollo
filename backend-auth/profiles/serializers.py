from rest_framework import serializers

from .models import CaracterizacionComunitaria


class CaracterizacionComunitariaSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = CaracterizacionComunitaria

        fields = [
            "id",
            "cantidad_personas_hogar",
            "cantidad_menores_18",
            "cantidad_adultos_mayores",
            "nivel_educacional",
            "situacion_laboral",
            "tipo_vivienda",
            "acceso_internet",
            "fecha_creacion",
            "fecha_actualizacion",
        ]

        read_only_fields = [
            "id",
            "fecha_creacion",
            "fecha_actualizacion",
        ]

    def validate(self, attrs):
        cantidad_personas = attrs.get(
            "cantidad_personas_hogar",
        )

        cantidad_menores = attrs.get(
            "cantidad_menores_18",
            0,
        )

        cantidad_adultos_mayores = attrs.get(
            "cantidad_adultos_mayores",
            0,
        )

        if self.instance is not None:
            if cantidad_personas is None:
                cantidad_personas = (
                    self.instance.cantidad_personas_hogar
                )

            if "cantidad_menores_18" not in attrs:
                cantidad_menores = (
                    self.instance.cantidad_menores_18
                )

            if "cantidad_adultos_mayores" not in attrs:
                cantidad_adultos_mayores = (
                    self.instance.cantidad_adultos_mayores
                )

        if cantidad_personas is not None:
            if cantidad_personas < 1:
                raise serializers.ValidationError(
                    {
                        "cantidad_personas_hogar": (
                            "El hogar debe tener al menos "
                            "una persona."
                        )
                    }
                )

            if cantidad_menores > cantidad_personas:
                raise serializers.ValidationError(
                    {
                        "cantidad_menores_18": (
                            "La cantidad de menores no puede "
                            "superar el total de personas "
                            "del hogar."
                        )
                    }
                )

            if cantidad_adultos_mayores > cantidad_personas:
                raise serializers.ValidationError(
                    {
                        "cantidad_adultos_mayores": (
                            "La cantidad de adultos mayores "
                            "no puede superar el total de "
                            "personas del hogar."
                        )
                    }
                )

            if (
                cantidad_menores
                + cantidad_adultos_mayores
                > cantidad_personas
            ):
                raise serializers.ValidationError(
                    (
                        "La suma de menores de edad y adultos "
                        "mayores no puede superar el total de "
                        "personas del hogar."
                    )
                )

        return attrs