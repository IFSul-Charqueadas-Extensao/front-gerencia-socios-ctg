import { apiRequest } from "./api";

/**
 * Usuários do sistema — recurso restrito ao perfil admin.
 *
 * Não há mapper aqui: o backend já devolve o formato usado na interface
 * (id, nome, email, role, ativo), e nunca o hash da senha.
 */
export const usuarioService = {
  async getAll() {
    return apiRequest("/usuarios");
  },

  async getById(id) {
    return apiRequest(`/usuarios/${id}`);
  },

  async create(usuario) {
    return apiRequest("/usuarios", {
      method: "POST",
      body: JSON.stringify({
        nome: usuario.nome,
        email: usuario.email,
        senha: usuario.senha,
        role: usuario.role,
        ativo: usuario.ativo ?? true,
      }),
    });
  },

  async update(id, usuario) {
    return apiRequest(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        ativo: usuario.ativo,
      }),
    });
  },

  /** Troca apenas a senha; derruba as sessões abertas do usuário */
  async alterarSenha(id, senha) {
    return apiRequest(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify({ senha }),
    });
  },

  async delete(id) {
    return apiRequest(`/usuarios/${id}`, {
      method: "DELETE",
    });
  },
};
