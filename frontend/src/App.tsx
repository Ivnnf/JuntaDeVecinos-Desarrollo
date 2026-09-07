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



function App() {
  return (
    <Routes>
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