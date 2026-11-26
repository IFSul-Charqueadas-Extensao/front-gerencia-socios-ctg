import { useState, useEffect, useMemo, useCallback } from "react";
import {
  HandCoins,
  Plus,
  DollarSign,
  Receipt,
  CalendarDays,
  Search,
  RefreshCw,
  Trash2,
  Pencil,
  PiggyBank,
  Landmark,
  Wallet,
} from "lucide-react";

import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ModalRecurso from "../components/ModalRecurso";
import ModalConfirmarExclusaoRecurso from "../components/ModalConfirmarExclusaoRecurso";
import { gestaoRecursoService } from "../services/gestaoRecursoService";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

function hojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

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

function obterDataISO(data) {
  return data?.slice(0, 10) || "";
}

export default function GestaoRecursos() {
  const { podeEscrever } = useAuth();
  const podeRegistrar =
    podeEscrever("gestao-recursos") || podeEscrever("gestao_recursos");
  const toast = useToast();

  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [recursoEmEdicao, setRecursoEmEdicao] = useState(null);
  const [recursoParaExcluir, setRecursoParaExcluir] = useState(null);

  const [periodo, setPeriodo] = useState("mes");
  const [dataInicio, setDataInicio] = useState(hojeISO().slice(0, 8) + "01");
  const [dataFim, setDataFim] = useState(hojeISO());

  const [busca, setBusca] = useState("");
  const [filtroPagamento, setFiltroPagamento] = useState("Todos");

  const carregarRecursos = useCallback(async () => {
    setLoading(true);

    try {
      const dados = await gestaoRecursoService.getAll();
      setRecursos(Array.isArray(dados) ? dados : []);
    } catch (err) {
      console.error(err);
      toast.error(`Erro ao carregar recursos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let ativo = true;

    gestaoRecursoService
      .getAll()
      .then((dados) => {
        if (ativo) {
          setRecursos(Array.isArray(dados) ? dados : []);
        }
      })
      .catch((err) => {
        if (ativo) {
          console.error(err);
          toast.error(`Erro ao carregar recursos: ${err.message}`);
        }
      })
      .finally(() => {
        if (ativo) {
          setLoading(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [toast]);

  const recursosDoPeriodo = useMemo(() => {
    const hoje = hojeISO();

    let inicio = "";
    let fim = "";

    if (periodo === "hoje") {
      inicio = hoje;
      fim = hoje;
    } else if (periodo === "mes") {
      inicio = `${hoje.slice(0, 7)}-01`;
      fim = hoje;
    } else if (periodo === "ano") {
      inicio = `${hoje.slice(0, 4)}-01-01`;
      fim = hoje;
    } else if (periodo === "personalizado") {
      inicio = dataInicio;
      fim = dataFim;
    }

    return recursos.filter((item) => {
      const dataItem = obterDataISO(item.data);

      if (inicio && dataItem < inicio) return false;
      if (fim && dataItem > fim) return false;

      return true;
    });
  }, [recursos, periodo, dataInicio, dataFim]);

  const recursosFiltrados = useMemo(() => {
    return recursosDoPeriodo
      .filter((item) => {
        const desc = (item.descricao || "").toLowerCase();
        const correspondeBusca = desc.includes(busca.toLowerCase());

        const correspondePagamento =
          filtroPagamento === "Todos" ||
          item.forma_pagamento === filtroPagamento;

        return correspondeBusca && correspondePagamento;
      })
      .sort((a, b) => {
        const dataA = new Date(a.data || 0);
        const dataB = new Date(b.data || 0);
        if (dataB - dataA !== 0) return dataB - dataA;
        return (b.id || 0) - (a.id || 0);
      });
  }, [recursosDoPeriodo, busca, filtroPagamento]);

  const totalArrecadado = recursosDoPeriodo.reduce(
    (total, item) => total + Number(item.valor || 0),
    0
  );

  const quantidadeRecursos = recursosDoPeriodo.length;

  const mediaPorLancamento =
    quantidadeRecursos > 0 ? totalArrecadado / quantidadeRecursos : 0;

  const totalHoje = recursos
    .filter((item) => obterDataISO(item.data) === hojeISO())
    .reduce((total, item) => total + Number(item.valor || 0), 0);

  async function handleSalvarRecurso(dados) {
    if (recursoEmEdicao?.id) {
      await gestaoRecursoService.update(recursoEmEdicao.id, dados);
      toast.success("Recurso atualizado com sucesso!");
    } else {
      await gestaoRecursoService.create(dados);
      toast.success("Recurso registrado com sucesso!");
    }

    setModalAberto(false);
    setRecursoEmEdicao(null);
    await carregarRecursos();
  }

  async function handleExcluirRecurso(id) {
    await gestaoRecursoService.delete(id);
    toast.success("Recurso excluído com sucesso!");
    setRecursoParaExcluir(null);
    await carregarRecursos();
  }

  function abrirModalCriacao() {
    setRecursoEmEdicao(null);
    setModalAberto(true);
  }

  function abrirModalEdicao(recurso) {
    setRecursoEmEdicao(recurso);
    setModalAberto(true);
  }

  return (
    <Layout>
      <main className="flex-1 bg-[#f0f2f5]">
        <div className="max-w-7xl mx-auto px-6 py-7">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-7 flex-wrap gap-4">
            <div>
              <h1 className="text-[#1a3560] text-3xl font-bold mb-1">
                Gestão de Recursos
              </h1>
              <p className="text-gray-500">
                Controle e registro de arrecadações, rifas, doações, investimentos e outros recursos do CTG.
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={carregarRecursos}
                disabled={loading}
                className="flex items-center gap-2 bg-white text-gray-600 px-4 py-3 rounded-xl shadow-sm hover:bg-gray-50 text-sm font-semibold disabled:opacity-50 cursor-pointer transition-colors"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Atualizar
              </button>

              {podeRegistrar && (
                <button
                  onClick={abrirModalCriacao}
                  className="flex items-center gap-2 bg-[#1a3560] text-white px-5 py-3 rounded-xl shadow-sm hover:bg-blue-900 text-sm font-semibold cursor-pointer transition-colors"
                >
                  <Plus size={18} />
                  Registrar recurso
                </button>
              )}
            </div>
          </div>

          {/* Filtro de período */}
          <section className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={18} className="text-[#1a3560]" />
              <h2 className="font-bold text-gray-700">Período dos recursos</h2>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="px-4 py-3 rounded-xl bg-gray-100 text-sm border-none outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
              >
                <option value="hoje">Hoje</option>
                <option value="mes">Este mês</option>
                <option value="ano">Este ano</option>
                <option value="personalizado">Personalizado</option>
                <option value="todos">Todo o histórico</option>
              </select>

              {periodo === "personalizado" && (
                <>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Data inicial
                    </label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="px-3 py-2.5 rounded-xl bg-gray-100 text-sm border-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Data final
                    </label>
                    <input
                      type="date"
                      value={dataFim}
                      min={dataInicio}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="px-3 py-2.5 rounded-xl bg-gray-100 text-sm border-none"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Indicadores / Estatísticas */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
            <StatCard
              label="Total arrecadado no período"
              value={formatarMoeda(totalArrecadado)}
              icon={<DollarSign size={25} />}
              colorClass="bg-green-100 text-green-700"
            />

            <StatCard
              label="Lançamentos no período"
              value={quantidadeRecursos}
              icon={<Receipt size={25} />}
              colorClass="bg-blue-100 text-blue-700"
            />

            <StatCard
              label="Média por lançamento"
              value={formatarMoeda(mediaPorLancamento)}
              icon={<PiggyBank size={25} />}
              colorClass="bg-purple-100 text-purple-700"
            />

            <StatCard
              label="Arrecadado hoje"
              value={formatarMoeda(totalHoje)}
              icon={<Landmark size={25} />}
              colorClass="bg-amber-100 text-amber-700"
            />
          </section>

          {/* Histórico e Filtros */}
          <section className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#1a3560]">
                    Histórico de recursos
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {recursosFiltrados.length} lançamento(s) encontrado(s)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por descrição (rifa, doação, patrocinador...)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 text-sm border-none outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <select
                  value={filtroPagamento}
                  onChange={(e) => setFiltroPagamento(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-gray-100 text-sm border-none outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                >
                  <option value="Todos">Todas as formas de pagamento</option>
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão">Cartão</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3" />
                <p className="text-gray-500 text-sm">Carregando recursos...</p>
              </div>
            ) : recursosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-[#1a3560]">
                  <HandCoins size={28} />
                </div>
                <h3 className="font-bold text-gray-700 mb-1">
                  Nenhum recurso encontrado
                </h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Tente alterar os filtros de período e busca, ou registre um novo recurso arrecadado (rifa, doação, investimento).
                </p>
                {podeRegistrar && (
                  <button
                    onClick={abrirModalCriacao}
                    className="mt-4 inline-flex items-center gap-2 bg-[#1a3560] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors"
                  >
                    <Plus size={16} />
                    Registrar primeiro recurso
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Descrição do Recurso</th>
                      <th className="px-5 py-4 font-semibold">Valor</th>
                      <th className="px-5 py-4 font-semibold">Forma de Pagamento</th>
                      <th className="px-5 py-4 font-semibold">Data e Hora</th>
                      {podeRegistrar && (
                        <th className="px-5 py-4 font-semibold text-center">
                          Ações
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {recursosFiltrados.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#1a3560] shrink-0">
                              <HandCoins size={18} />
                            </div>
                            <span className="font-semibold text-gray-800 text-sm">
                              {item.descricao}
                            </span>
                          </div>
                        </td>

                          <td className="px-5 py-4 text-sm font-bold text-gray-800 whitespace-nowrap">
                            {formatarMoeda(item.valor)}
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                item.forma_pagamento === "Pix"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                  : item.forma_pagamento === "Dinheiro"
                                  ? "bg-green-50 text-green-700 border border-green-200/60"
                                  : "bg-blue-50 text-blue-700 border border-blue-200/60"
                              }`}
                            >
                              {item.forma_pagamento}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatarData(item.data)}
                          </td>

                          {podeRegistrar && (
                            <td className="px-5 py-4 text-center whitespace-nowrap">
                              <div className="inline-flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => abrirModalEdicao(item)}
                                  title="Editar recurso"
                                  className="inline-flex items-center justify-center p-2 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                                >
                                  <Pencil size={17} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setRecursoParaExcluir(item)}
                                  title="Excluir recurso"
                                  className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {modalAberto && (
        <ModalRecurso
          recurso={recursoEmEdicao}
          onFechar={() => {
            setModalAberto(false);
            setRecursoEmEdicao(null);
          }}
          onSalvar={handleSalvarRecurso}
        />
      )}

      {recursoParaExcluir && (
        <ModalConfirmarExclusaoRecurso
          recurso={recursoParaExcluir}
          onFechar={() => setRecursoParaExcluir(null)}
          onConfirmar={handleExcluirRecurso}
        />
      )}
    </Layout>
  );
}