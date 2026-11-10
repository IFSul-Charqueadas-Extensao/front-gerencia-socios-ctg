import { useState } from "react";
import { X, Calendar } from "lucide-react";

const inputClass =
  "w-full px-3.5 py-3 border-none rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-200";

function paraDatetimeLocal(dataStr) {
  if (!dataStr) {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    const hora = String(agora.getHours()).padStart(2, "0");
    const min = String(agora.getMinutes()).padStart(2, "0");
    return `${ano}-${mes}-${dia}T${hora}:${min}`;
  }

  const limpo = dataStr.replace(" ", "T");
  return limpo.slice(0, 16);
}

export default function ModalRecurso({ recurso, onFechar, onSalvar }) {
  const editando = Boolean(recurso?.id);

  const [descricao, setDescricao] = useState(recurso?.descricao || "");
  const [valor, setValor] = useState(recurso?.valor ? String(recurso.valor) : "");
  const [formaPagamento, setFormaPagamento] = useState(
    recurso?.forma_pagamento || "Pix"
  );
  const [dataHora, setDataHora] = useState(() =>
    paraDatetimeLocal(recurso?.data)
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function confirmar(e) {
    e.preventDefault();

    const descFormatada = descricao.trim();
    const valorNumerico = Number(valor.toString().replace(",", "."));

    if (!descFormatada) {
      setErro("Informe a descrição do recurso.");
      return;
    }

    if (descFormatada.length > 255) {
      setErro("A descrição deve conter no máximo 255 caracteres.");
      return;
    }

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setErro("Informe um valor válido maior que zero.");
      return;
    }

    setErro("");
    setSalvando(true);

    try {
      const payload = {
        descricao: descFormatada,
        valor: valorNumerico,
        forma_pagamento: formaPagamento,
      };

      if (dataHora) {
        // Converte de YYYY-MM-DDTHH:mm para YYYY-MM-DD HH:mm:ss
        payload.data = `${dataHora.replace("T", " ")}:00`;
      }

      await onSalvar(payload);
    } catch (err) {
      setErro(err.message || "Não foi possível salvar o recurso.");
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-5">
      <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="bg-[#1a3560] px-6 py-5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-white text-lg font-bold">
              {editando ? "Editar recurso" : "Registrar recurso"}
            </h2>
            <p className="text-blue-200 text-sm mt-1">
              {editando
                ? "Altere as informações do recurso selecionado."
                : "Registre entradas como rifas, doações, investimentos e outros."}
            </p>
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar"
            className="text-blue-200 hover:text-white cursor-pointer bg-transparent border-none p-1 rounded-lg transition-colors"
          >
            <X size={23} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={confirmar} className="p-6 overflow-y-auto flex-1">
          <div className="flex flex-col gap-4">
            {/* Descrição */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição
              </label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex.: Rifa, doação, valor investido..."
                maxLength={255}
                className={inputClass}
                autoFocus
              />
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valor (R$)
              </label>
              <input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                min="0.01"
                step="0.01"
                className={inputClass}
              />
            </div>

            {/* Forma de Pagamento */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Forma de pagamento
              </label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className={inputClass}
              >
                <option value="Pix">Pix</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão">Cartão</option>
              </select>
            </div>

            {/* Data e Hora */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Calendar size={15} className="text-[#1a3560]" />
                Data e hora do registro
              </label>
              <input
                type="datetime-local"
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">
                Data do recebimento ou arrecadação do recurso.
              </p>
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mt-4">
              {erro}
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={onFechar}
              disabled={salvando}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="flex-1 px-4 py-3 rounded-xl bg-[#1a3560] text-white font-semibold text-sm hover:bg-blue-900 disabled:opacity-50 transition-colors"
            >
              {salvando
                ? "Salvando..."
                : editando
                ? "Salvar alterações"
                : "Registrar recurso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

