import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

type RutaProtegidaProps = {
  rolPermitido: number
  children: ReactNode
}

type EstadoValidacion =
  | 'cargando'
  | 'permitido'
  | 'denegado'
  | 'sin-sesion'

type SesionUsuario = {
  roles?: number[]
}

function RutaProtegida({
  rolPermitido,
  children,
}: RutaProtegidaProps) {
  const [estado, setEstado] =
    useState<EstadoValidacion>('cargando')

  useEffect(() => {
    let componenteActivo = true

    const consultarSesion = () =>
      fetch(
        'http://localhost:8000/api/auth/sesion/',
        {
          credentials: 'include',
        },
      )

    const validarAcceso = async () => {
      try {
        let response = await consultarSesion()

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          const refreshResponse = await fetch(
            'http://localhost:8000/api/auth/refresh/',
            {
              method: 'POST',
              credentials: 'include',
            },
          )

          if (refreshResponse.ok) {
            response = await consultarSesion()
          }
        }

        if (!response.ok) {
          if (componenteActivo) {
            setEstado('sin-sesion')
          }

          return
        }

        const sesion =
          (await response.json()) as SesionUsuario

        const tieneRol =
          sesion.roles?.includes(rolPermitido) ?? false

        if (componenteActivo) {
          setEstado(
            tieneRol
              ? 'permitido'
              : 'denegado',
          )
        }
      } catch {
        if (componenteActivo) {
          setEstado('sin-sesion')
        }
      }
    }

    void validarAcceso()

    return () => {
      componenteActivo = false
    }
  }, [rolPermitido])

  if (estado === 'cargando') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </main>
    )
  }

  if (
    estado === 'sin-sesion' ||
    estado === 'denegado'
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return children
}

export default RutaProtegida