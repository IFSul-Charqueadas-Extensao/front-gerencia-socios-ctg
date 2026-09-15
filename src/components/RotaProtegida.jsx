import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Protege uma rota: sem sessão, manda para o login.
 *
 * `papeis` restringe ainda mais o acesso a perfis específicos
 * (ex.: <RotaProtegida papeis={['admin']}>). Isto é conveniência de interface —
 * o backend valida o perfil em toda requisição, independentemente disto.
 */
export default function RotaProtegida({ children, papeis }) {
  const { autenticado, carregando, papel } = useAuth()
  const location = useLocation()

  // enquanto a sessão guardada é revalidada, não decide nada:
  // redirecionar aqui jogaria o usuário para o login a cada F5
  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5]">
        <p className="text-gray-500 text-sm">Carregando...</p>
      </div>
    )
  }

  if (!autenticado) {
    // guarda a rota pretendida para voltar a ela depois do login
    return <Navigate to="/login" replace state={{ de: location.pathname }} />
  }

  if (papeis && !papeis.includes(papel)) {
    return <Navigate to="/" replace />
  }

  return children
}
