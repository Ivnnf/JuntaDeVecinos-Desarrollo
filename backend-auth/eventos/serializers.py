from rest_framework import serializers

from .models import Evento, InscripcionEvento


class EventoSerializer(serializers.ModelSerializer):
    creador_username = serializers.CharField(
        source="creador.username",
        read_only=True,
    )

    junta_nombre = serializers.CharField(
        source="directiva.junta_vecinos.nombre",
        read_only=True,
    )

    inscrito = serializers.SerializerMethodField()
    inscripcion_id = serializers.SerializerMethodField()
    inscritos_actuales = serializers.SerializerMethodField()

    class Meta:
        model = Evento
        fields = [
            "id",
            "directiva",
            "junta_nombre",
            "creador",
            "creador_username",
            "titulo",
            "descripcion",
            "lugar",
            "fecha_inicio",
            "fecha_fin",
            "cupo_maximo",
            "estado",
            "inscrito",
            "inscripcion_id",
            "inscritos_actuales",
            "fecha_creacion",
            "fecha_actualizacion",
        ]

        read_only_fields = [
            "id",
            "creador",
            "creador_username",
            "junta_nombre",
            "fecha_creacion",
            "fecha_actualizacion",
        ]

    def get_inscrito(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        return obj.inscripciones.filter(
            usuario=request.user,
            estado=InscripcionEvento.Estado.INSCRITO,
        ).exists()

    def get_inscritos_actuales(self, obj):
        return obj.inscripciones.filter(
            estado=InscripcionEvento.Estado.INSCRITO,
        ).count()

    def validate(self, attrs):
        fecha_inicio = attrs.get(
            "fecha_inicio",
            getattr(self.instance, "fecha_inicio", None),
        )

        fecha_fin = attrs.get(
            "fecha_fin",
            getattr(self.instance, "fecha_fin", None),
        )

        if fecha_inicio and fecha_fin and fecha_fin <= fecha_inicio:
            raise serializers.ValidationError(
                {
                    "fecha_fin": (
                        "La fecha de término debe ser posterior "
                        "a la fecha de inicio."
                    )
                }
            )

        cupo_maximo = attrs.get(
            "cupo_maximo",
            getattr(self.instance, "cupo_maximo", None),
        )

        if cupo_maximo is not None and cupo_maximo < 1:
            raise serializers.ValidationError(
                {"cupo_maximo": ("El cupo máximo debe ser mayor a cero.")}
            )

        return attrs

    def get_inscripcion_id(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return None

        inscripcion = obj.inscripciones.filter(
            usuario=request.user,
            estado=InscripcionEvento.Estado.INSCRITO,
        ).first()

        return inscripcion.id if inscripcion else None


class InscripcionEventoSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(
        source="usuario.username",
        read_only=True,
    )

    evento_titulo = serializers.CharField(
        source="evento.titulo",
        read_only=True,
    )

    class Meta:
        model = InscripcionEvento
        fields = [
            "id",
            "evento",
            "evento_titulo",
            "usuario",
            "usuario_username",
            "estado",
            "fecha_inscripcion",
            "fecha_cancelacion",
        ]

        read_only_fields = [
            "id",
            "usuario",
            "usuario_username",
            "evento_titulo",
            "fecha_inscripcion",
            "fecha_cancelacion",
        ]
