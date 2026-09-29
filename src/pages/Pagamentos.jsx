import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import Layout from "../components/Layout";
import EmptyState from "../components/EmptyState";
import ModalPagamento from "../components/ModalPagamento";
import { useAuth } from "../contexts/AuthContext";
import { socioService } from "../services/socioService";
import { mensalidadeService } from "../services/mensalidadeService";
import { pagamentoService } from "../services/pagamentoService";
import { dependenteService } from "../services/dependenteService";
import { useToast } from "../contexts/ToastContext";
import { MESES_NOMES, iniciais, parseMoeda } from "../utils/formattingUtils";

const MESES_CURTOS = MESES_NOMES.map((m) => m.slice(0, 3));

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

// Cálculo focado APENAS no sócio titular (Mensalidade Social - dependente_id nulo)
function calcularCelulaMensalidade(socio, meMensalidades, mePagamentos, mesNum, anoNum) {
  const m = meMensalidades.find(
    (mm) =>
      mm.socio_id === socio.id &&
      mm.mes === mesNum &&
      mm.ano === anoNum &&
      !mm.dependente_id,
  );

  if (!m) {
    return {
      mes: mesNum,
      ano: anoNum,
      valor: 0,
      status: statusPresumido(socio.data_entrada, mesNum, anoNum),
      data: null,
      existentes: [],
    };
  }

  const p = mePagamentos.find((pg) => pg.mensalidade_id === m.id);
  const pago = m.status === "Pago";

  return {
    mes: mesNum,
    ano: anoNum,
    valor: Number(p ? p.valor_pago : m.valor),
    status: m.status,
    data: pago && p ? p.data_pagamento : null,
    existentes: [{ mensalidade: m, pagamento: p, pago }],
  };
}

// Cálculo focado em Instrutor (Dependentes e/ou Sócio Dançarino)
function calcularCelulaInstrutor(socio, deps, meMensalidades, mePagamentos, mesNum, anoNum) {
  const danca = socio.danca || socio.is_dancarino || socio.dancarino;
  const temDeps = deps && deps.length > 0;

  if (!temDeps && !danca) {
    return {
      mes: mesNum,
      ano: anoNum,
      valor: 0,
      status: "N/A",
      data: null,
      dependentesIncluidos: [],
      existentes: [],
    };
  }

  if (temDeps) {
    const detalhes = deps.map((d) => {
      const m = meMensalidades.find(
        (mm) =>
          mm.socio_id === socio.id &&
          mm.mes === mesNum &&
          mm.ano === anoNum &&
          mm.dependente_id === d.id,
      );
      if (!m) return { dependente: d, existe: false };
      const p = mePagamentos.find((pg) => pg.mensalidade_id === m.id);
      return {
        dependente: d,
        existe: true,
        mensalidade: m,
        pagamento: p,
        pago: m.status === "Pago",
      };
    });

    const existentes = detalhes.filter((d) => d.existe);

    if (existentes.length === 0) {
      return {
        mes: mesNum,
        ano: anoNum,
        valor: 0,
        status: statusPresumido(socio.data_entrada, mesNum, anoNum),
        data: null,
        dependentesIncluidos: [],
        existentes: [],
      };
    }

    const valor = existentes.reduce(
      (acc, d) => acc + Number(d.pagamento ? d.pagamento.valor_pago : d.mensalidade.valor),
      0,
    );

    let status;
    if (existentes.every((d) => d.pago)) {
      status = "Pago";
    } else if (existentes.some((d) => d.mensalidade.status === "Atrasado")) {
      status = "Atrasado";
    } else {
      status = "Pendente";
    }

    const dataPagamento =
      existentes
        .filter((d) => d.pago && d.pagamento)
        .map((d) => d.pagamento.data_pagamento)
        .sort()
        .at(-1) || null;

    const dependentesIncluidos = existentes.map((d) => d.nome_completo || d.nome);

    return {
      mes: mesNum,
      ano: anoNum,
      valor,
      status,
      data: dataPagamento,
      dependentesIncluidos,
      existentes,
    };
  }

  return {
    mes: mesNum,
    ano: anoNum,
    valor: 0,
    status: statusPresumido(socio.data_entrada, mesNum, anoNum),
    data: null,
    dependentesIncluidos: [socio.nome],
    existentes: [],
  };
}

export default function Pagamentos() {
  const { podeEscrever } = useAuth();
  const podeRegistrar = podeEscrever("pagamentos");

  const toast = useToast();
  const [socios, setSocios] = useState([]);
  const [mensalidades, setMensalidades] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [dependentes, setDependentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anoFoco, setAnoFoco] = useState(() => new Date().getFullYear());
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [tipoExibicao, setTipoExibicao] = useState("Mensalidades");
  const [modalAlvo, setModalAlvo] = useState(null);

  const carregarDados = useCallback(() => {
    setLoading(true);
    Promise.all([
      socioService.getAll(),
      mensalidadeService.getAll(),
      pagamentoService.getAll(),
      dependenteService.getAll(),
    ])
      .then(([sociosData, mensalidadesData, pagamentosData, dependentesData]) => {
        setSocios(sociosData);
        setMensalidades(mensalidadesData);
        setPagamentos(pagamentosData);
        setDependentes(dependentesData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error(`Erro ao carregar dados de pagamentos: ${err.message}`);
        setLoading(false);
      });
  }, [toast]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const hoje = new Date();
  const mesAtualReal = hoje.getMonth() + 1;
  const anoAtualReal = hoje.getFullYear();
  const colFocoIdx = anoFoco === anoAtualReal ? mesAtualReal - 1 : 0;
  const mesFocoLabel = `${MESES_NOMES[colFocoIdx]}/${anoFoco}`;

  const dependentesPorSocio = useMemo(() => {
    const mapa = {};
    for (const d of dependentes) {
      if (!mapa[d.socio_titular_id]) mapa[d.socio_titular_id] = [];
      mapa[d.socio_titular_id].push(d);
    }
    return mapa;
  }, [dependentes]);

  const linhas = useMemo(() => {
    return socios.map((s) => {
      const deps = dependentesPorSocio[s.id] || [];
      const colunas = MESES_CURTOS.map((_, i) => {
        const mesNum = i + 1;
        return tipoExibicao === "Mensalidades"
          ? calcularCelulaMensalidade(s, mensalidades, pagamentos, mesNum, anoFoco)
          : calcularCelulaInstrutor(s, deps, mensalidades, pagamentos, mesNum, anoFoco);
      });
      return { ...s, deps, colunas, statusFoco: colunas[colFocoIdx].status };
    });
  }, [socios, mensalidades, pagamentos, dependentesPorSocio, anoFoco, tipoExibicao, colFocoIdx]);

  const totalPagos = linhas.filter((l) => l.statusFoco === "Pago").length;
  const totalPendentes = linhas.filter(
    (l) => l.statusFoco === "Pendente" || l.statusFoco === "Atrasado",
  ).length;
  const totalArrecadado = linhas
    .filter((l) => l.statusFoco === "Pago")
    .reduce((acc, l) => acc + parseMoeda(l.colunas[colFocoIdx].valor), 0);

  const STATUS_ORDEM = { Atrasado: 0, Pendente: 1, Pago: 2, "N/A": 3 };

  const filtrados = linhas
    .filter((l) => {
      const matchBusca = (l.nome || "")
        .toLowerCase()
        .includes(busca.toLowerCase());

      const matchStatus =
        filtroStatus === "Todos" ||
        l.colunas.some((c) => c.status === filtroStatus);

      return matchBusca && matchStatus;
    })
    .sort((a, b) => {
      const ordemA = STATUS_ORDEM[a.statusFoco] ?? 1;
      const ordemB = STATUS_ORDEM[b.statusFoco] ?? 1;
      if (ordemA !== ordemB) return ordemA - ordemB;
      return (a.nome || "").localeCompare(b.nome || "", "pt-BR");
    });

  function abrirModal(socio, mesNum, anoNum) {
    if (!podeRegistrar) return;

    const deps = dependentesPorSocio[socio.id] || [];
    const danca = socio.danca || socio.is_dancarino || socio.dancarino;

    if (tipoExibicao === "Instrutor" && !danca && deps.length === 0) {
      toast.error("Este sócio não dança e não possui dependentes para pagamento de instrutor.");
      return;
    }

    setModalAlvo({
      socio,
      deps,
      mesStr: `${MESES_NOMES[mesNum - 1]}/${anoNum}`,
      tipoExibicao,
    });
  }

  async function handleSalvarPagamento(payload) {
    const { mesStr, valorStr, dataIso, formaPagamento } = payload;
    const [mesNome, anoStr] = mesStr.split("/");
    const mesNum = MESES_NOMES.indexOf(mesNome) + 1;
    const anoNum = parseInt(anoStr, 10);
    const valorNum = parseMoeda(valorStr);
    const { socio, deps, tipoExibicao: tipoModal } = modalAlvo;

    setLoading(true);
    try {
      if (tipoModal === "Mensalidades") {
        const mSocio = mensalidades.find(
          (mm) =>
            mm.socio_id === socio.id &&
            mm.mes === mesNum &&
            mm.ano === anoNum &&
            !mm.dependente_id,
        );
        let mSocioId;
        if (mSocio) {
          await mensalidadeService.update(mSocio.id, {
            ...mSocio,
            status: "Pago",
          });
          mSocioId = mSocio.id;
        } else {
          const dataVenc = `${anoNum}-${String(mesNum).padStart(2, "0")}-28`;
          const nova = await mensalidadeService.create({
            socio_id: socio.id,
            dependente_id: null,
            mes: mesNum,
            ano: anoNum,
            valor: valorNum,
            status: "Pago",
            data_vencimento: dataVenc,
          });
          mSocioId = nova.id;
        }
        await pagamentoService.create({
          mensalidade_id: mSocioId,
          data_pagamento: dataIso,
          forma_pagamento: formaPagamento,
          valor_pago: mSocio ? mSocio.valor : valorNum,
          multa_juros_aplicados: 0,
        });
      } else {
        // Pagamento de Instrutor
        const danca = socio.danca || socio.is_dancarino || socio.dancarino;
        let listaDeps = [...(deps || [])];

        // Se o sócio é dançarino e não possui dependente, cadastra o dependente automático com a estrutura esperada pelo banco
        if (danca && listaDeps.length === 0) {
          let autoDep = dependentes.find(
            (d) => d.socio_titular_id === socio.id && d.is_titular_dancarino
          );

          if (!autoDep) {
            autoDep = await dependenteService.create({
              socio_titular_id: socio.id,
              nome: `${socio.nome} (Titular)`,
              cpf: socio.cpf || "000.000.000-00",
              data_nascimento: socio.data_nascimento || null,
              dancarino: true,
              is_titular_dancarino: true,
            });
          }
          listaDeps.push(autoDep);
        }

        if (listaDeps.length === 0) {
          toast.error("Não há cobrança de instrutor para este sócio.");
          setLoading(false);
          setModalAlvo(null);
          return;
        }

        for (const dep of listaDeps) {
          const mDep = mensalidades.find(
            (mm) =>
              mm.socio_id === socio.id &&
              mm.mes === mesNum &&
              mm.ano === anoNum &&
              mm.dependente_id === dep.id,
          );
          let mDepId;
          const valorPorDep = valorNum / listaDeps.length;

          if (mDep) {
            if (mDep.status === "Pago") continue;
            await mensalidadeService.update(mDep.id, { ...mDep, status: "Pago" });
            mDepId = mDep.id;
          } else {
            const dataVenc = `${anoNum}-${String(mesNum).padStart(2, "0")}-28`;
            const nova = await mensalidadeService.create({
              socio_id: socio.id,
              dependente_id: dep.id,
              mes: mesNum,
              ano: anoNum,
              valor: valorPorDep,
              status: "Pago",
              data_vencimento: dataVenc,
            });
            mDepId = nova.id;
          }

          await pagamentoService.create({
            mensalidade_id: mDepId,
            data_pagamento: dataIso,
            forma_pagamento: formaPagamento,
            valor_pago: mDep ? mDep.valor : valorPorDep,
            multa_juros_aplicados: 0,
          });
        }
      }

      toast.success("Pagamento registrado com sucesso!");
      carregarDados();
    } catch (err) {
      console.error(err);
      toast.error(`Erro ao salvar pagamento: ${err.message}`);
      setLoading(false);
    }
    setModalAlvo(null);
  }

  if (loading) {
    return (
      <Layout>
        <main className="flex-1 bg-[#f0f2f5] flex items-center justify-center py-24">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-500 text-sm">Carregando dados de pagamentos...</p>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="flex-1 bg-[#f0f2f5]">
        <div className="max-w-7xl mx-auto px-6 py-7">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-7 flex-wrap gap-4">
            <div>
              <h1 className="text-[#1a3560] text-3xl font-bold mb-1">Pagamentos</h1>
              <p className="text-gray-500">
                Grade de mensalidades por mês, estilo planilha
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Switch Tipo de Exibição */}
              <div className="bg-gray-200 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
                <button
                  onClick={() => setTipoExibicao("Mensalidades")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                    tipoExibicao === "Mensalidades"
                      ? "bg-white text-[#1a3560] shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Mensalidades
                </button>
                <button
                  onClick={() => setTipoExibicao("Instrutor")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                    tipoExibicao === "Instrutor"
                      ? "bg-white text-[#1a3560] shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Instrutor
                </button>
              </div>

              {/* Navegação de Ano */}
              <div className="flex items-center gap-1 bg-white rounded-2xl px-3 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                <button
                  onClick={() => setAnoFoco((a) => a - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#1a3560] hover:bg-gray-100 cursor-pointer bg-transparent border-none transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[#1a3560] font-bold text-sm min-w-[64px] text-center px-1">
                  {anoFoco}
                </span>
                <button
                  onClick={() => setAnoFoco((a) => a + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#1a3560] hover:bg-gray-100 cursor-pointer bg-transparent border-none transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <CreditCard size={22} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">
                  Total {tipoExibicao} — {mesFocoLabel}
                </p>
                <p className="text-2xl font-bold text-[#1a3560]">
                  R${" "}
                  {totalArrecadado.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <CheckCircle size={22} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pagamentos confirmados</p>
                <p className="text-2xl font-bold text-green-700">
                  {totalPagos}
                  <span className="text-sm font-normal text-gray-400 ml-1">
                    de {socios.length}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Aguardando pagamento</p>
                <p className="text-2xl font-bold text-amber-600">
                  {totalPendentes}
                </p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <section className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)] mb-6">
            <div className="flex gap-3 flex-wrap items-center">
              <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-gray-100 rounded-xl px-3.5">
                <Search size={15} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar sócio..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="flex-1 py-3 border-none bg-transparent text-sm outline-none"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["Todos", "Pago", "Pendente", "Atrasado"].map((label) => (
                  <button
                    key={label}
                    onClick={() => setFiltroStatus(label)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer border-none ${
                      filtroStatus === label
                        ? "bg-[#1a3560] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Grade Planilha */}
          <section className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="bg-[#eef1f8] px-6 py-4 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#1a3560]">
                  {tipoExibicao} — {anoFoco}
                </span>

                <span className="text-xs font-semibold text-[#1a3560] bg-white px-3 py-1 rounded-full shadow-sm">
                  Mês de foco: {MESES_NOMES[colFocoIdx]}
                </span>
              </div>

              <span className="text-sm text-gray-400">
                {filtrados.length}{" "}
                {filtrados.length === 1 ? "resultado" : "resultados"}
              </span>
            </div>

            {filtrados.length === 0 ? (
              <EmptyState
                icon={<Users size={40} />}
                title="Nenhum sócio encontrado"
                description="Tente ajustar os filtros."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="border-collapse text-xs whitespace-nowrap w-full">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-white text-left px-4 py-2 border-r border-gray-100 min-w-[200px] text-gray-600">
                        Sócio
                      </th>
                      {MESES_CURTOS.map((nome, i) => (
                        <th
                          key={nome}
                          colSpan={2}
                          className={`text-center px-2 py-2 font-semibold border-l border-gray-100 ${
                            i === colFocoIdx
                              ? "bg-[#2f5fa7] text-white"
                              : "text-gray-500"
                          }`}
                        >
                          {nome}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((l) => (
                      <tr
                        key={l.id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="sticky left-0 z-10 bg-white px-4 py-2 border-r border-gray-100">
                          <Link
                            to={`/socios/${l.id}`}
                            className="flex items-center gap-2 group"
                          >
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px] shrink-0 group-hover:bg-[#1a3560] group-hover:text-white transition-colors">
                              {iniciais(l.nome)}
                            </div>
                            <span className="font-semibold truncate group-hover:text-[#1a3560] transition-colors">
                              {l.nome}
                            </span>
                          </Link>
                        </td>
                        {l.colunas.map((c, i) => {
                          const estaDestacado =
                            filtroStatus !== "Todos" &&
                            c.status === filtroStatus;

                          const corTexto = estaDestacado
                            ? c.status === "Pago"
                              ? "text-green-700"
                              : c.status === "Atrasado"
                                ? "text-red-700"
                                : "text-amber-700"
                            : c.status === "Pago"
                              ? "text-green-600"
                              : "text-gray-500";

                          const destaqueFiltro = estaDestacado
                            ? c.status === "Atrasado"
                              ? "bg-red-50"
                              : c.status === "Pago"
                                ? "bg-green-50"
                                : "bg-amber-50"
                            : "";

                          const titulo = c.dependentesIncluidos?.length
                            ? `Instrutor para: ${c.dependentesIncluidos.join(", ")}`
                            : undefined;

                          return (
                            <td
                              key={i}
                              colSpan={2}
                              title={
                                titulo || "Clique para registrar o pagamento"
                              }
                              onClick={() => abrirModal(l, c.mes, c.ano)}
                              className={`
                                text-right px-2 py-2 border-l border-gray-100 cursor-pointer
                                ${destaqueFiltro}
                                ${
                                  i === colFocoIdx && filtroStatus === "Todos"
                                    ? "ring-1 ring-inset ring-blue-200"
                                    : ""
                                }
                                hover:bg-gray-50 transition-colors
                              `}
                            >
                              <div className={`font-semibold ${corTexto}`}>
                                {c.valor
                                  ? `R$ ${c.valor.toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                    })}`
                                  : "—"}
                              </div>

                              <div className="text-[10px] text-gray-400">
                                {c.data
                                  ? c.data.split("-").reverse().join("/")
                                  : ""}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {modalAlvo && (
        <ModalPagamento
          nomeSocio={modalAlvo.socio.nome}
          socioId={modalAlvo.socio.id}
          dataEntrada={modalAlvo.socio.data_entrada}
          mesPadrao={modalAlvo.mesStr}
          tipoExibicao={modalAlvo.tipoExibicao}
          mensalidades={mensalidades}
          pagamentos={pagamentos}
          dependentesDoSocio={modalAlvo.deps}
          onFechar={() => setModalAlvo(null)}
          onSalvar={handleSalvarPagamento}
        />
      )}
    </Layout>
  );
}