import { apiRequest } from "./api";

export const authService = {
  /** Autentica e devolve { access_token, refresh_token, usuario } */
  async login(email, senha) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
  },

  /** Troca o refresh token por um novo access token */
  async refresh(refreshToken) {
    return apiRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  /** Revoga o refresh token no servidor */
  async logout(refreshToken) {
    return apiRequest("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  /** Dados do usuário da sessão atual */
  async me() {
    return apiRequest("/auth/me");
  },
};
