import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import { AuthProvider } from './contexts/AuthContext'
import RotaProtegida from './components/RotaProtegida'

// Lazy loading: cada página vira um chunk separado carregado sob demanda.
// jspdf (~1.4 MiB) só será carregado quando o usuário acessar /relatorios.
const Painel      = lazy(() => import('./pages/Painel'))
const Socios      = lazy(() => import('./pages/Socios'))
const NovoSocio   = lazy(() => import('./pages/NovoSocio'))
const Relatorios  = lazy(() => import('./pages/Relatorios'))
const SocioDetalhe = lazy(() => import('./pages/SocioDetalhe'))
const Pagamentos  = lazy(() => import('./pages/Pagamentos'))
const Login       = lazy(() => import('./pages/Login'))
const Usuarios    = lazy(() => import('./pages/Usuarios'))

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Carregando...</p>
      </div>
    </div>
  )
}

// Leva o usuário ao login quando o api.js detecta que a sessão caiu.
// Precisa ficar dentro do BrowserRouter para poder usar useNavigate.
function RedirecionaSessaoExpirada() {
  const navigate = useNavigate()

  useEffect(() => {
    const aoExpirar = () => navigate('/login', { replace: true })

    window.addEventListener('ctg:sessao-expirada', aoExpirar)
    return () => window.removeEventListener('ctg:sessao-expirada', aoExpirar)
  }, [navigate])

  return null
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <RedirecionaSessaoExpirada />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Única rota pública */}
              <Route path="/login" element={<Login />} />

              <Route path="/"            element={<RotaProtegida><Painel /></RotaProtegida>} />
              <Route path="/socios"      element={<RotaProtegida><Socios /></RotaProtegida>} />
              <Route path="/socios/novo" element={<RotaProtegida><NovoSocio /></RotaProtegida>} />
              <Route path="/socios/:id"  element={<RotaProtegida><SocioDetalhe /></RotaProtegida>} />
              <Route path="/relatorios"  element={<RotaProtegida><Relatorios /></RotaProtegida>} />
              <Route path="/pagamentos"  element={<RotaProtegida><Pagamentos /></RotaProtegida>} />

              {/* Gestão de usuários: somente admin */}
              <Route
                path="/usuarios"
                element={
                  <RotaProtegida papeis={['admin']}>
                    <Usuarios />
                  </RotaProtegida>
                }
              />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  )
}
