/**
 * Guarda os dados da sessão no localStorage.
 *
 * Fica separado do AuthContext porque o api.js também precisa ler o token,
 * e um módulo simples evita dependência circular entre contexto e serviço.
 *
 * Sobre o localStorage: é vulnerável a XSS. A alternativa mais robusta seria
 * um cookie HttpOnly, mas isso exigiria CORS com credenciais e domínio comum,
 * o que não se sustenta com front e back em hosts diferentes no IFSul
 * (extensao.* e php.*) e com o Basic Auth no caminho. O access token é curto
 * (60 min) justamente para reduzir a janela de risco.
 */

const CHAVE_ACCESS = 'ctg.access_token'
const CHAVE_REFRESH = 'ctg.refresh_token'
const CHAVE_USUARIO = 'ctg.usuario'

export const sessao = {
  getAccessToken() {
    return localStorage.getItem(CHAVE_ACCESS)
  },

  getRefreshToken() {
    return localStorage.getItem(CHAVE_REFRESH)
  },

  getUsuario() {
    const bruto = localStorage.getItem(CHAVE_USUARIO)
    if (!bruto) return null

    try {
      return JSON.parse(bruto)
    } catch {
      // dado corrompido: melhor tratar como sessão inexistente
      return null
    }
  },

  salvar({ access_token, refresh_token, usuario }) {
    if (access_token) localStorage.setItem(CHAVE_ACCESS, access_token)
    if (refresh_token) localStorage.setItem(CHAVE_REFRESH, refresh_token)
    if (usuario) localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario))
  },

  limpar() {
    localStorage.removeItem(CHAVE_ACCESS)
    localStorage.removeItem(CHAVE_REFRESH)
    localStorage.removeItem(CHAVE_USUARIO)
  },
}
