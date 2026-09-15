/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { authService } from '../services/authService'
import { sessao } from '../services/sessao'
import { podeEscrever as checarEscrita, podeLer as checarLeitura } from '../utils/permissoes'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  // Inicia a partir do localStorage para a sessão sobreviver ao F5.
  // O usuário guardado só vale se houver token: sem ele não há como falar com
  // a API, e considerar a sessão válida faria a página renderizar e só então
  // cair no 401, com um erro desnecessário na tela.
  const [usuario, setUsuario] = useState(
    () => (sessao.getAccessToken() ? sessao.getUsuario() : null)
  )
  // só há o que revalidar se existir um token guardado; sem ele já começamos
  // prontos, o que evita um setState síncrono dentro do efeito abaixo
  const [carregando, setCarregando] = useState(() => Boolean(sessao.getAccessToken()))

  const encerrarSessao = useCallback(() => {
    sessao.limpar()
    setUsuario(null)
  }, [])

  // Revalida a sessão guardada contra o servidor ao abrir a aplicação.
  // O token pode ter expirado, o perfil pode ter mudado ou a conta pode ter
  // sido desativada enquanto a aba estava fechada.
  useEffect(() => {
    if (!sessao.getAccessToken()) return

    authService.me()
      .then(atual => {
        sessao.salvar({ usuario: atual })
        setUsuario(atual)
      })
      .catch(() => encerrarSessao())
      .finally(() => setCarregando(false))
  }, [encerrarSessao])

  // O api.js dispara este evento ao receber 401 numa rota autenticada
  useEffect(() => {
    const aoExpirar = () => setUsuario(null)

    window.addEventListener('ctg:sessao-expirada', aoExpirar)
    return () => window.removeEventListener('ctg:sessao-expirada', aoExpirar)
  }, [])

  const login = useCallback(async (email, senha) => {
    const dados = await authService.login(email, senha)

    sessao.salvar(dados)
    setUsuario(dados.usuario)

    return dados.usuario
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = sessao.getRefreshToken()

    // revoga no servidor; se a chamada falhar, a sessão local sai de qualquer forma
    if (refreshToken) {
      try {
        await authService.logout(refreshToken)
      } catch {
        // sessão já inválida no servidor — nada a fazer
      }
    }

    encerrarSessao()
  }, [encerrarSessao])

  const valor = useMemo(() => ({
    usuario,
    carregando,
    autenticado: Boolean(usuario),
    papel: usuario?.role ?? null,
    login,
    logout,
    /** Só para habilitar/ocultar botões — a regra real está no backend */
    podeEscrever: recurso => checarEscrita(usuario?.role, recurso),
    podeLer: recurso => checarLeitura(usuario?.role, recurso),
  }), [usuario, carregando, login, logout])

  return (
    <AuthCtx.Provider value={valor}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
