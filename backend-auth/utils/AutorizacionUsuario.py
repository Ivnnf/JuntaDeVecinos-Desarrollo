"""
Lógica de autorización para usuarios autenticados.

Permite obtener los roles activos asociados a un usuario,
consultar información de su perfil y determinar si su estado
permite acceder al sistema.
"""

from profiles.models import EstadoUsuario, UsuarioRol


class AutorizacionUsuario:
    def __init__(self, usuario):
        self.usuario = usuario
        self.perfil = getattr(usuario, "perfil", None)

    def getRoles(self):
        return list(
            UsuarioRol.objects.filter(
                usuario=self.usuario,
                activo=True,
            )
            .order_by("rol_id")
            .values_list("rol_id", flat=True)
        )

    def getRol(self):
        """
        Compatibilidad temporal con el código existente.

        Retorna el primer rol activo del usuario.
        Más adelante las vistas trabajarán directamente
        con getRoles().
        """
        roles = self.getRoles()

        if roles:
            return roles[0]

        return None

    def tieneRol(self, rol_id):
        return UsuarioRol.objects.filter(
            usuario=self.usuario,
            rol_id=rol_id,
            activo=True,
        ).exists()

    def getEstado(self):
        if self.perfil:
            return self.perfil.estado

        return None

    def getCargo(self):
        if self.perfil:
            return self.perfil.cargo_id

        return None

    def puede_acceder(self):
        if not self.usuario.is_active:
            return False, "Usuario inactivo"

        if not self.getRoles():
            return False, "Usuario sin roles activos"

        # Compatibilidad temporal con perfiles heredados.
        if self.perfil:
            if self.perfil.estado == EstadoUsuario.BANEADO:
                return False, "Usuario baneado"

            if self.perfil.estado == EstadoUsuario.SUSPENDIDO:
                return False, "Usuario suspendido"

        return True, "Acceso permitido"
