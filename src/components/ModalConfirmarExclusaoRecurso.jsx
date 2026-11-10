import { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  if (!data) return "—";
  const dataLimpa = data.replace("T", " ");
  const [dia, hora] = dataLimpa.split(" ");
  if (!dia) return "—";
  const [ano, mes, diaMes] = dia.split("-");
  if (!ano || !mes || !diaMes) return data;
  return `${diaMes}/${mes}/${ano} ${hora ? hora.slice(0, 5) : ""}`;
}

export default function ModalConfirmarExclusaoRecurso({
  recurso,
  onFechar,
  onConfirmar,
}) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  async function confirmar() {
    setErro("");
    setExcluindo(true);

    try {
      await onConfirmar(recurso.id);
    } catch (err) {
      setErro(err.message || "Não foi possível excluir o recurso.");
      setExcluindo(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-5">
      <div className="bg-white w-full max-w-[460px] rounded-2xl shadow-xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-[#1a3560] px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-white text-lg font-bold">Confirmar exclusão</h2>
            <p className="text-blue-200 text-sm mt-1">
              Exclusão de lançamento de recurso.
            </p>
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={excluindo}
            aria-label="Fechar"
            className="text-blue-200 hover:text-white bg-transparent border-none disabled:opacity-50 p-1 cursor-pointer transition-colors"
          >
            <X size={23} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} className="text-red-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 mb-2">
                Deseja realmente excluir este recurso?
              </h3>

              <div className="space-y-1.5 bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-700">Descrição:</span>{" "}
                  <span className="text-gray-900 font-medium break-words">
                    {recurso.descricao}
                  </span>
                </p>

                <p className="text-gray-600">
                  <span className="font-semibold text-gray-700">Valor:</span>{" "}
                  <strong className="text-emerald-700">
                    {formatarMoeda(recurso.valor)}
                  </strong>
                </p>

                <p className="text-gray-600">
                  <span className="font-semibold text-gray-700">Pagamento:</span>{" "}
                  <span className="text-gray-800">{recurso.forma_pagamento}</span>
                </p>

                <p className="text-gray-600">
                  <span className="font-semibold text-gray-700">Data:</span>{" "}
                  <span className="text-gray-800">
                    {formatarData(recurso.data)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-red-500 font-medium mt-4">
            Atenção: Essa ação não poderá ser desfeita e removerá o registro do caixa.
          </p>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mt-4">
              {erro}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onFechar}
              disabled={excluindo}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={confirmar}
              disabled={excluindo}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 size={16} />
              {excluindo ? "Excluindo..." : "Excluir recurso"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

