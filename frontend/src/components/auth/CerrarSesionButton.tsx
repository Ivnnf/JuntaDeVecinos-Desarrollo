import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function CerrarSesionButton() {
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(false)

  const cerrarSesion = async () => {
    setCargando(true)

    try {
      await fetch(
        'http://localhost:8000/api/auth/logout/',
        {
          method: 'POST',
          credentials: 'include',
        },
      )
    } finally {
      setCargando(false)
      navigate('/login', { replace: true })
    }
  }

  return (
    <button
      type="button"
      className="btn btn-outline"
      onClick={cerrarSesion}
      disabled={cargando}
    >
      {cargando
        ? 'Cerrando sesión...'
        : 'Cerrar sesión'}
    </button>
  )
}

export default CerrarSesionButton