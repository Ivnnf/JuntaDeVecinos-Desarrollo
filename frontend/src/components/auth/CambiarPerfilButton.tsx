import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Sesion = {
  roles?: number[]
}

function CambiarPerfilButton() {
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/auth/sesion/',
          {
            credentials: 'include',
          },
        )

        if (!response.ok) {
          return
        }

        const sesion =
          (await response.json()) as Sesion

        setMostrar(
          (sesion.roles ?? []).length > 1,
        )
      } catch {
        setMostrar(false)
      }
    }

    void cargarSesion()
  }, [])

  if (!mostrar) {
    return null
  }

  return (
    <Link
      to="/seleccionar-perfil"
      className="btn btn-outline"
    >
      Cambiar perfil
    </Link>
  )
}

export default CambiarPerfilButton