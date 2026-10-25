from rest_framework import serializers

from .models import CaracterizacionComunitaria


class CaracterizacionComunitariaSerializer(serializers.ModelSerializer):
    fecha_nacimiento = serializers.DateField(
        required=False,
        allow_null=True,
    )

    class Meta:
        model = CaracterizacionComunitaria

        fields = [
            "id",
            "fecha_nacimiento",
            "cantidad_personas_hogar",
            "cantidad_menores_18",
            "cantidad_18_29",
            "cantidad_30_44",
            "cantidad_45_59",
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

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["fecha_nacimiento"] = (
            instance.usuario.fecha_nacimiento
            if instance.usuario.fecha_nacimiento
            else None
        )

        return data

    def update(self, instance, validated_data):
        fecha_nacimiento = validated_data.pop(
            "fecha_nacimiento",
            None,
        )

        instance = super().update(
            instance,
            validated_data,
        )

        if fecha_nacimiento is not None:
            instance.usuario.fecha_nacimiento = fecha_nacimiento
            instance.usuario.save(update_fields=["fecha_nacimiento"])

        return instance

    def validate(self, attrs):
        cantidad_personas = attrs.get(
            "cantidad_personas_hogar",
        )

        cantidad_menores = attrs.get(
            "cantidad_menores_18",
            0,
        )
        cantidad_18_29 = attrs.get(
            "cantidad_18_29",
            0,
        )

        cantidad_30_44 = attrs.get(
            "cantidad_30_44",
            0,
        )

        cantidad_45_59 = attrs.get(
            "cantidad_45_59",
            0,
        )
        cantidad_adultos_mayores = attrs.get(
            "cantidad_adultos_mayores",
            0,
        )

        if self.instance is not None:
            if cantidad_personas is None:
                cantidad_personas = self.instance.cantidad_personas_hogar

            if "cantidad_menores_18" not in attrs:
                cantidad_menores = self.instance.cantidad_menores_18

            if "cantidad_adultos_mayores" not in attrs:
                cantidad_adultos_mayores = self.instance.cantidad_adultos_mayores

        if cantidad_personas is not None:
            if cantidad_personas < 1:
                raise serializers.ValidationError(
                    {
                        "cantidad_personas_hogar": (
                            "El hogar debe tener al menos " "una persona."
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
            if "cantidad_18_29" not in attrs:
                cantidad_18_29 = self.instance.cantidad_18_29

            if "cantidad_30_44" not in attrs:
                cantidad_30_44 = self.instance.cantidad_30_44

            if "cantidad_45_59" not in attrs:
                cantidad_45_59 = self.instance.cantidad_45_59
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

            total_rangos_etarios = (
                cantidad_menores
                + cantidad_18_29
                + cantidad_30_44
                + cantidad_45_59
                + cantidad_adultos_mayores
            )

            if total_rangos_etarios != cantidad_personas:
                raise serializers.ValidationError(
                    {
                        "rangos_etarios": (
                            "La suma de los rangos etarios debe "
                            "coincidir con el total de personas "
                            "del hogar."
                        )
                    }
                )

        return attrs
