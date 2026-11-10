import { useState } from "react";
import { X } from "lucide-react";

const inputClass =
  "w-full px-3.5 py-3 border-none rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-200";

export default function ModalVendaCopa({ onFechar, onSalvar }) {
  const [produto, setProduto] = useState("");
  const [valor, setValor] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Pix");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function confirmar(e) {
    e.preventDefault();

    const valorNumerico = Number(valor.replace(",", "."));

    if (!produto.trim()) {
      setErro("Informe o nome do produto.");
      return;
    }

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setErro("Informe um valor válido.");
      return;
    }

    setErro("");
    setSalvando(true);

    try {
      await onSalvar({
        produto: produto.trim(),
        valor: valorNumerico,
        forma_pagamento: formaPagamento,
      });
    } catch (err) {
      setErro(err.message || "Não foi possível registrar a venda.");
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-5">
      <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#1a3560] px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-white text-lg font-bold">Registrar venda</h2>
            <p className="text-blue-200 text-sm mt-1">
              Informe os dados da venda realizada.
            </p>
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            className="text-blue-200 hover:text-white cursor-pointer bg-transparent border-none"
          >
            <X size={23} />
          </button>
        </div>

        <form onSubmit={confirmar} className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Produto
              </label>
              <input
                type="text"
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                placeholder="Ex.: Refrigerante, água, pastel..."
                maxLength={150}
                className={inputClass}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valor da venda (R$)
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Forma de pagamento
              </label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className={inputClass}
              >
                <option value="Dinheiro">Dinheiro</option>
                <option value="Pix">Pix</option>
                <option value="Cartão">Cartão</option>
              </select>
            </div>
          </div>

          {erro && <p className="text-red-600 text-sm mt-4">{erro}</p>}

          <div className="flex gap-3 mt-7">
            <button
              type="button"
              onClick={onFechar}
              disabled={salvando}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="flex-1 px-4 py-3 rounded-xl bg-[#1a3560] text-white font-semibold text-sm hover:bg-blue-900 disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Registrar venda"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
