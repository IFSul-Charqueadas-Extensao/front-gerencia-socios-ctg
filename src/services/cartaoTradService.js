import { apiRequest } from "./api";
import { sessao } from "./sessao";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const cartaoTradService = {
  async create(socioId) {
    return apiRequest("/cartao-tradicionalista", {
      method: "POST",
      body: JSON.stringify({
        socio_id: socioId,
        dependente_id: null,
        data_solicitacao: new Date().toISOString().slice(0, 10),
        pago: false,
        valor: 0,
      }),
    });
  },

  async gerarPdf(cartaoId) {
    const token = sessao.getAccessToken();

    const res = await fetch(`${BASE_URL}/cartao-tradicionalista/${cartaoId}/pdf`, {
      headers: {
        ...(token ? { "X-Auth-Token": token } : {}),
      },
    });

    if (!res.ok) {
      let msg = "Erro ao gerar o PDF do cartão.";
      try {
        const data = await res.json();
        msg = data.message || msg;
      } catch {

      }
      throw new Error(msg);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  },

  async criarEGerarPdf(socioId) {
    const cartao = await this.create(socioId);
    await this.gerarPdf(cartao.id);
    return cartao;
  },

  async getAll() {
    return apiRequest("/cartao-tradicionalista");
  },
};
