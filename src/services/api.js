import { sessao } from "./sessao";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Endpoints que não exigem token — precisam ficar de fora do tratamento
// automático de 401, senão um login com senha errada derrubaria a sessão.
const ROTAS_PUBLICAS = ["/auth/login", "/auth/refresh", "/auth/logout"];

// Avisa a aplicação de que a sessão caiu. O AuthContext escuta este evento
// e faz o redirecionamento — assim o api.js não precisa conhecer o router.
function notificarSessaoExpirada() {
  sessao.limpar();
  window.dispatchEvent(new CustomEvent("ctg:sessao-expirada"));
}

async function parseError(res, defaultMsg) {
  try {
    const data = await res.json();
    return new Error(data.message || defaultMsg);
  } catch {
    return new Error(defaultMsg);
  }
}

export async function apiRequest(endpoint, options = {}) {
  const ehPublica = ROTAS_PUBLICAS.some((rota) =>
    endpoint.startsWith(rota)
  );

  const token = sessao.getAccessToken();

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        // O token vai em X-Auth-Token porque o servidor do IFSul usa
        // HTTP Basic Auth e já ocupa o cabeçalho Authorization.
        ...(token && !ehPublica ? { "X-Auth-Token": token } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      // 401 em rota autenticada = token ausente, inválido ou expirado.
      // Tratado num único ponto, já que todo acesso HTTP passa por aqui.
      if (res.status === 401 && !ehPublica) {
        notificarSessaoExpirada();
        throw new Error("Sua sessão expirou. Entre novamente.");
      }

      throw await parseError(res, "Erro na requisição");
    }

    if (res.status === 204) {
      return null;
    }

    return await res.json();
  } catch (err) {
    if (
      err instanceof TypeError ||
      err.message === "Failed to fetch"
    ) {
      const networkErr = new Error(
        "Falha de comunicação com o servidor."
      );

      networkErr.isNetworkError = true;
      throw networkErr;
    }

    throw err;
  }
}
