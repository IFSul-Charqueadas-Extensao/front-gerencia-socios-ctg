import { apiRequest } from "./api";

export const verificacaoService = {
  /**
   * Consulta pública (sem login): o sócio informa o próprio CPF.
   * Devolve { encontrado: false } ou
   * { encontrado: true, nome, adimplente, em_dia_ate: "AAAA-MM" (só se adimplente), verificado_em }.
   * Usa POST para o CPF não aparecer na URL.
   */
  async verificar(cpf) {
    return apiRequest("/verificacao", {
      method: "POST",
      body: JSON.stringify({ cpf }),
    });
  },
};
