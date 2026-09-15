import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import logo from '../../modelos/css/Logo.jpg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [entrando, setEntrando] = useState(false)

  const { login, autenticado, carregando } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // rota que o usuário tentou acessar antes de ser mandado para cá
  const destino = location.state?.de || '/'

  if (carregando) return null

  // já logado: não faz sentido ver o formulário
  if (autenticado) return <Navigate to={destino} replace />

  async function aoEnviar(e) {
    e.preventDefault()

    if (!email.trim() || !senha) {
      toast.error('Informe o e-mail e a senha.')
      return
    }

    setEntrando(true)

    try {
      const usuario = await login(email.trim(), senha)

      toast.success(`Bem-vindo, ${usuario.nome}!`)
      navigate(destino, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Não foi possível entrar.')
      setSenha('')
    } finally {
      setEntrando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] px-4 py-10">
      <div className="w-full max-w-sm">

        {/* Identidade */}
        <div className="flex flex-col items-center mb-7">
          <img
            src={logo}
            alt="CTG Raízes da Tradição"
            className="w-20 h-20 rounded-full object-contain bg-white p-1 shadow-md"
          />
          <h1 className="mt-4 text-xl font-bold text-[#1a3560] text-center leading-tight">
            CTG Raízes da Tradição
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de Gerenciamento</p>
        </div>

        <form
          onSubmit={aoEnviar}
          className="bg-white rounded-2xl shadow-sm p-7 flex flex-col gap-5"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              autoFocus
              placeholder="seu.email@ctg.local"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-gray-300 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(v => !v)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none p-0 cursor-pointer"
              >
                {mostrarSenha ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={entrando}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-xl border-none cursor-pointer transition-colors"
          >
            <LogIn size={17} />
            {entrando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Esqueceu a senha? Procure um administrador do sistema.
        </p>
      </div>
    </div>
  )
}
