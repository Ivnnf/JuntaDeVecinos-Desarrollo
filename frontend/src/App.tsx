import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import LoginPage from './pages/auth/LoginPage'
import AdminInicioPage from './pages/admin/AdminInicioPage'
import DirectivaInicioPage from './pages/directiva/DirectivaInicioPage'
import VecinoInicioPage from './pages/vecino/VecinoInicioPage'
import MunicipalInicioPage from './pages/municipal/MunicipalInicioPage'
import RecuperarPasswordPage from './pages/auth/RecuperarPasswordPage'
import RestablecerPasswordPage from './pages/auth/RestablecerPasswordPage'
import RutaProtegida from './components/routing/RutaProtegida'
import RegistroVecinoPage from './pages/auth/RegistroVecinoPage'
import MiPerfilPage from './pages/vecino/MiPerfilPage'
import JuntasVecinosPage from './pages/admin/JuntasVecinosPage'
import SectoresPage from './pages/admin/SectoresPage'
import AsociacionesSectorPage from './pages/admin/AsociacionesSectorPage'
import UsuariosPage from './pages/admin/UsuariosPage'
import GestionDirectivaPage from './pages/directiva/GestionDirectivaPage'
import CargosPage from './pages/admin/CargosPage'
import DirectivasPage from './pages/admin/DirectivasPage'
import PublicacionesPage from './pages/directiva/PublicacionesPage'
import PublicacionDetallePage from './pages/vecino/PublicacionDetallePage'
import EventosPage from './pages/directiva/EventosPage'
import EventosVecinoPage from './pages/vecino/EventosVecinoPage'
import AsistenciaEventoPage from './pages/directiva/AsistenciaEventoPage'
import SolicitudesVecinoPage from './pages/vecino/SolicitudesVecinoPage'
import SolicitudesDirectivaPage from "./pages/directiva/SolicitudesDirectivaPage";
import SolicitudesDocumentoDirectivaPage from './pages/directiva/SolicitudesDocumentoDirectivaPage'
import SolicitudesDocumentoPage from './pages/vecino/SolicitudesDocumentoPage'
import SeleccionRolPage from './pages/SeleccionRolPage'
import SeguimientoSolicitudesPage from './pages/vecino/SeguimientoSolicitudesPage'

function App() {
  return (
    <Routes>
      <Route
        path="/vecino/seguimiento"
        element={
          <RutaProtegida rolPermitido={3}>
            <SeguimientoSolicitudesPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/seleccionar-perfil"
        element={<SeleccionRolPage />}
      />
      <Route
        path="/directiva/solicitudes"
        element={
          <RutaProtegida rolPermitido={2}>
            <SolicitudesDirectivaPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/directiva/documentos"
        element={
          <RutaProtegida rolPermitido={2}>
            <SolicitudesDocumentoDirectivaPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/vecino/solicitudes"
        element={
          <RutaProtegida rolPermitido={3}>
            <SolicitudesVecinoPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/vecino/documentos"
        element={
          <RutaProtegida rolPermitido={3}>
            <SolicitudesDocumentoPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/directiva/eventos/:id/asistencia"
        element={
          <RutaProtegida rolPermitido={2}>
            <AsistenciaEventoPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/vecino/eventos"
        element={
          <RutaProtegida rolPermitido={3}>
            <EventosVecinoPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/directiva/eventos"
        element={
          <RutaProtegida rolPermitido={2}>
            <EventosPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/vecino/publicaciones/:id"
        element={
          <RutaProtegida rolPermitido={3}>
            <PublicacionDetallePage />
          </RutaProtegida>
        }
      />
      <Route
        path="/directiva/publicaciones"
        element={
          <RutaProtegida rolPermitido={2}>
            <PublicacionesPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/admin/directivas"
        element={
          <RutaProtegida rolPermitido={1}>
            <DirectivasPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/admin/cargos"
        element={
          <RutaProtegida rolPermitido={1}>
            <CargosPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/admin/usuarios"
        element={
          <RutaProtegida rolPermitido={1}>
            <UsuariosPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/admin/asociaciones"
        element={
          <RutaProtegida rolPermitido={1}>
            <AsociacionesSectorPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/admin/sectores"
        element={
          <RutaProtegida rolPermitido={1}>
            <SectoresPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/admin/juntas"
        element={
          <RutaProtegida rolPermitido={1}>
            <JuntasVecinosPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/vecino/perfil"
        element={
          <RutaProtegida rolPermitido={3}>
            <MiPerfilPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/registro"
        element={<RegistroVecinoPage />}
      />

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/admin"
        element={
          <RutaProtegida rolPermitido={1}>
            <AdminInicioPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/directiva"
        element={
          <RutaProtegida rolPermitido={2}>
            <DirectivaInicioPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/directiva/gestion"
        element={
          <RutaProtegida rolPermitido={[1, 2]}>
            <GestionDirectivaPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/vecino"
        element={
          <RutaProtegida rolPermitido={3}>
            <VecinoInicioPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/municipal"
        element={
          <RutaProtegida rolPermitido={4}>
            <MunicipalInicioPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/recuperar-password"
        element={<RecuperarPasswordPage />}
      />

      <Route
        path="/restablecer-password/:uid/:token"
        element={<RestablecerPasswordPage />}
      />

    </Routes>
  )
}

export default App