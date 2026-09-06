"""
Lógica de autorización para usuarios autenticados.

Permite obtener información del perfil asociado al usuario
y determinar si su estado permite acceder al sistema.
"""

from profiles.models import EstadoUsuario


class AutorizacionUsuario:
    def __init__(self, usuario):
        self.usuario = usuario
        self.perfil = getattr(usuario, "perfil", None)

    def getRol(self):
        if self.perfil and self.perfil.rol:
            return self.perfil.rol.id

        return None

    def getEstado(self):
        if self.perfil:
            return self.perfil.estado

        return None

    def getCargo(self):
        if self.perfil:
            return self.perfil.cargo_id

        return None

    def puede_acceder(self):
        if not self.perfil:
            return False, "Perfil no encontrado"

        if self.perfil.estado == EstadoUsuario.BANEADO:
            return False, "Usuario baneado"

        if self.perfil.estado == EstadoUsuario.SUSPENDIDO:
            return False, "Usuario suspendido"

        if self.perfil.estado in [
            EstadoUsuario.VERIFICACION,
            EstadoUsuario.ACTIVO,
        ]:
            return True, "Acceso permitido"

        return (
            False,
            f"Estado {self.perfil.estado} no permite acceso",
        )