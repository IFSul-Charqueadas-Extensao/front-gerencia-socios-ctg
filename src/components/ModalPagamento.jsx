import { useState, useEffect } from "react";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function gerarMeses() {
  const hoje = new Date();
  const opcoes = [];
  for (let i = 0; i < 13; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    opcoes.push(`${MESES[d.getMonth()]}/${d.getFullYear()}`);
  }
  return opcoes;
}

function hojeISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Filtra os alvos com base no tipo de exibição ativo (Mensalidades vs Instrutor)
function buscarAlvos(
  socioId,
  mesNum,
  anoNum,
  mensalidades,
  pagamentos,
  dependentesDoSocio,
  tipoExibicao = "Mensalidades",
) {
  const alvos =
    tipoExibicao === "Mensalidades"
      ? [{ dependenteId: null, nome: null }]
      : dependentesDoSocio.map((d) => ({
          dependenteId: d.id,
          nome: d.nome_completo || d.nome,
        }));

  return alvos.map((alvo) => {
    const m = mensalidades.find(
      (mens) =>
        mens.socio_id === Number(socioId) &&
        mens.mes === mesNum &&
        mens.ano === anoNum &&
        (alvo.dependenteId
          ? mens.dependente_id === alvo.dependenteId
          : !mens.dependente_id),
    );

    if (!m) return { alvo, existe: false };

    const p = pagamentos.find((pg) => pg.mensalidade_id === m.id);

    return {
      alvo,
      existe: true,
      mensalidade: m,
      pagamento: p,
      pago: m.status === "Pago",
    };
  });
}

function statusPresumido(dataEntrada, mesNum, anoNum) {
  const hoje = new Date();
  const atualAno = hoje.getFullYear();
  const atualMes = hoje.getMonth() + 1;

  const isPast =
    anoNum < atualAno || (anoNum === atualAno && mesNum < atualMes);

  let admissaoAno = 0;
  let admissaoMes = 0;

  if (dataEntrada) {
    const partes = dataEntrada.split("-");
    admissaoAno = parseInt(partes[0], 10);
    admissaoMes = parseInt(partes[1], 10);
  }

  const jaEstavaCadastrado =
    admissaoAno > 0 &&
    (anoNum > admissaoAno || (anoNum === admissaoAno && mesNum >= admissaoMes));

  if (isPast && jaEstavaCadastrado) return "Atrasado";

  return "Pendente";
}

function statusCombinado(detalhes, dataEntrada, mesNum, anoNum) {
  const existentes = detalhes.filter((d) => d.existe);

  if (existentes.length === 0)
    return statusPresumido(dataEntrada, mesNum, anoNum);

  if (existentes.every((d) => d.pago)) return "Pago";

  if (existentes.some((d) => d.mensalidade.status === "Atrasado"))
    return "Atrasado";

  return "Pendente";
}

const MESES_OPCOES = gerarMeses();

export default function ModalPagamento({
  nomeSocio,
  socioId,
  dataEntrada,
  mesPadrao,
  tipoExibicao = "Mensalidades",
  mensalidades = [],
  pagamentos = [],
  dependentesDoSocio = [],
  onFechar,
  onSalvar,
}) {
  const [mes, setMes] = useState(() => mesPadrao ?? MESES_OPCOES[0]);
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Transferencia");
  const [confirmado, setConfirmado] = useState(false);
  const [erro, setErro] = useState("");
  const [isAlreadyPaid, setIsAlreadyPaid] = useState(false);
  const [statusExibido, setStatusExibido] = useState("Pendente");

  useEffect(() => {
    if (!mes || !socioId) return;

    const [mesNome, anoStr] = mes.split("/");
    const mesNum = MESES.indexOf(mesNome) + 1;
    const anoNum = parseInt(anoStr, 10);

    const detalhes = buscarAlvos(
      socioId,
      mesNum,
      anoNum,
      mensalidades,
      pagamentos,
      dependentesDoSocio,
      tipoExibicao,
    );

    const existentes = detalhes.filter((d) => d.existe);

    const statusCalculado = statusCombinado(
      detalhes,
      dataEntrada,
      mesNum,
      anoNum,
    );

    if (statusCalculado === "Pago") {
      const total = existentes.reduce(
        (acc, d) =>
          acc +
          Number(d.pagamento ? d.pagamento.valor_pago : d.mensalidade.valor),
        0,
      );

      const dataMaisRecente = existentes
        .filter((d) => d.pago && d.pagamento)
        .map((d) => d.pagamento.data_pagamento)
        .sort()
        .at(-1);

      const formaRepresentativa =
        existentes.find((d) => d.pagamento)?.pagamento?.forma_pagamento ||
        "Transferencia";

      setValor(
        `R$ ${total.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`,
      );

      setData(dataMaisRecente || hojeISO());
      setFormaPagamento(formaRepresentativa);
      setIsAlreadyPaid(true);
    } else {
      const totalPendentes = existentes.reduce(
        (acc, d) => acc + Number(d.mensalidade.valor),
        0,
      );

      setValor(
        totalPendentes > 0
          ? `R$ ${totalPendentes.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`
          : "",
      );

      setData("");
      setFormaPagamento("Transferencia");
      setIsAlreadyPaid(false);
    }

    setStatusExibido(statusCalculado);
    setErro("");
  }, [mes, socioId, dataEntrada, mensalidades, pagamentos, dependentesDoSocio, tipoExibicao]);

  function confirmar() {
    if (isAlreadyPaid) return;

    if (!mes || !valor.trim() || !data) {
      setErro("Preencha todos os campos antes de confirmar.");
      return;
    }

    setErro("");

    onSalvar({
      mesStr: mes,
      valorStr: valor.trim(),
      status: "Pago",
      dataIso: data,
      formaPagamento,
    });

    setConfirmado(true);
  }

  if (confirmado) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-[440px] rounded-2xl p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-5 text-green-600 font-bold">
            ✓
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Pagamento ({tipoExibicao}) registrado!
          </h2>
          <p className="text-gray-500 text-sm mb-1">
            Referência: <strong>{mes}</strong>
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Sócio: <strong>{nomeSocio}</strong>
          </p>
          <button
            onClick={onFechar}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors cursor-pointer border-none shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-[#1a3560] px-6 py-5 flex justify-between items-start">
          <div>
            <h2 className="text-white text-lg font-bold">
              Registrar Pagamento ({tipoExibicao})
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-blue-200 text-sm leading-none">
                {nomeSocio}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full select-none leading-none ${
                  statusExibido === "Pago"
                    ? "text-green-700 bg-green-100"
                    : statusExibido === "Atrasado"
                      ? "text-red-700 bg-red-100"
                      : "text-amber-700 bg-amber-100"
                }`}
              >
                {statusExibido}
              </span>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="text-white/60 hover:text-white text-xl font-bold bg-transparent border-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Formulário */}
        <div className="p-6 space-y-4">
          {erro && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Mês de referência
            </label>
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-full px-3.5 py-3.5 border-none rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            >
              {MESES_OPCOES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Valor (R$)
            </label>
            <input
              type="text"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              disabled={isAlreadyPaid}
              placeholder="Ex: R$ 150,00"
              className="w-full px-3.5 py-3.5 border-none rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Data do Pagamento
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              disabled={isAlreadyPaid}
              className="w-full px-3.5 py-3.5 border-none rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Forma de Pagamento
            </label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              disabled={isAlreadyPaid}
              className="w-full px-3.5 py-3.5 border-none rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
            >
              <option value="Transferencia">PIX / Transferência</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartao">Cartão</option>
              <option value="Boleto">Boleto</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onFechar}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer bg-white"
            >
              Cancelar
            </button>

            {!isAlreadyPaid && (
              <button
                onClick={confirmar}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors cursor-pointer shadow-md border-none"
              >
                Confirmar Pagamento
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}