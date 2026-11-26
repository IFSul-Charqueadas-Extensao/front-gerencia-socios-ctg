import { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";

export default function ModalConfirmarExclusaoCopa({
  venda,
  onFechar,
  onConfirmar,
}) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  async function confirmar() {
    setErro("");
    setExcluindo(true);

    try {
      await onConfirmar(venda.id);
    } catch (err) {
      setErro(err.message || "Não foi possível excluir a venda.");
      setExcluindo(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-5">
      <div className="bg-white w-full max-w-[440px] rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#1a3560] px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-white text-lg font-bold">Confirmar exclusão</h2>
            <p className="text-blue-200 text-sm mt-1">
              Exclusão de venda da Copa.
            </p>
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={excluindo}
            className="text-blue-200 hover:text-white bg-transparent border-none disabled:opacity-50"
          >
            <X size={23} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} className="text-red-600" />
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-1">
                Deseja realmente excluir esta venda?
              </h3>

              <p className="text-sm text-gray-500">
                Produto: <strong>{venda.produto}</strong>
              </p>

              <p className="text-sm text-gray-500">
                Valor:{" "}
                <strong>
                  {Number(venda.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </strong>
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-5">
            Essa ação não poderá ser desfeita.
          </p>

          {erro && <p className="text-red-600 text-sm mt-4">{erro}</p>}

          <div className="flex gap-3 mt-7">
            <button
              type="button"
              onClick={onFechar}
              disabled={excluindo}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={confirmar}
              disabled={excluindo}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              {excluindo ? "Excluindo..." : "Excluir venda"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
