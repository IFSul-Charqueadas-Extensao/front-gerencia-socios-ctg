import { MESES_NOMES } from '../utils/formattingUtils'

const moeda = v => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

export default function ModalDesligamento({ nomeSocio, pendencias, processando, onCancelar, onConfirmar }) {
  const { mensalidades, total, temPendencia } = pendencias

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-desligamento"
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <h2 id="titulo-desligamento" className="text-[#1a3560] text-xl font-bold mb-3">
          Desligar sócio
        </h2>

        <p className="text-sm text-gray-700 mb-4">
          Deseja realmente desligar <strong>{nomeSocio}</strong>? O sócio e seus dependentes
          passarão a <strong>Inativo</strong>, a data de hoje será registrada como data de
          desligamento e o Termo de Desligamento (PDF) será gerado.
        </p>

        {temPendencia && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            <p className="font-bold mb-1">⚠ Este sócio possui pendência financeira.</p>
            {mensalidades.length > 0 && (
              <>
                <ul className="list-disc ml-5 mb-1">
                  {mensalidades.map(m => (
                    <li key={m.id}>
                      {MESES_NOMES[m.mes - 1]}/{m.ano} — {moeda(m.valor)} ({m.status})
                    </li>
                  ))}
                </ul>
                <p>Total em aberto: <strong>{moeda(total)}</strong></p>
              </>
            )}
            {mensalidades.length === 0 && (
              <p>Há meses recentes sem pagamento registrado.</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancelar}
            disabled={processando}
            className="bg-white border border-slate-300 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={processando}
            className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {processando ? 'Desligando...' : temPendencia ? 'Desligar mesmo assim' : 'Confirmar desligamento'}
          </button>
        </div>
      </div>
    </div>
  )
}
