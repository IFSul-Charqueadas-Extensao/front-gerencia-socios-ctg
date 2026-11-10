import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Store,
  Plus,
  ShoppingBag,
  DollarSign,
  Receipt,
  CalendarDays,
  Search,
  RefreshCw,
  Trash2,
} from "lucide-react";

import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ModalVendaCopa from "../components/ModalVendaCopa";
import { vendaCopaService } from "../services/vendaCopaService";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import ModalConfirmarExclusaoCopa from "../components/ModalConfirmarExclusaoCopa";

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

  const [dia, hora] = data.split(" ");
  const [ano, mes, diaMes] = dia.split("-");

  return `${diaMes}/${mes}/${ano} ${hora?.slice(0, 5) || ""}`;
}

function obterDataISO(data) {
  return data?.slice(0, 10) || "";
}

export default function Copa() {
  const { podeEscrever } = useAuth();
  const podeRegistrar = podeEscrever("copa");
  const toast = useToast();

  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);

  const [periodo, setPeriodo] = useState("mes");
  const [dataInicio, setDataInicio] = useState(hojeISO().slice(0, 8) + "01");
  const [dataFim, setDataFim] = useState(hojeISO());

  const [busca, setBusca] = useState("");
  const [filtroPagamento, setFiltroPagamento] = useState("Todos");

  const carregarVendas = useCallback(async () => {
    setLoading(true);

    try {
      const dados = await vendaCopaService.getAll();
      setVendas(Array.isArray(dados) ? dados : []);
    } catch (err) {
      console.error(err);
      toast.error(`Erro ao carregar vendas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    carregarVendas();
  }, [carregarVendas]);

  const vendasDoPeriodo = useMemo(() => {
    const hoje = hojeISO();
    const agora = new Date();

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

    return vendas.filter((venda) => {
      const dataVenda = obterDataISO(venda.data_venda);

      if (inicio && dataVenda < inicio) return false;
      if (fim && dataVenda > fim) return false;

      return true;
    });
  }, [vendas, periodo, dataInicio, dataFim]);

  const vendasFiltradas = useMemo(() => {
    return vendasDoPeriodo
      .filter((venda) => {
        const correspondeProduto = (venda.produto || "")
          .toLowerCase()
          .includes(busca.toLowerCase());

        const correspondePagamento =
          filtroPagamento === "Todos" ||
          venda.forma_pagamento === filtroPagamento;

        return correspondeProduto && correspondePagamento;
      })
      .sort((a, b) => {
        return new Date(b.data_venda) - new Date(a.data_venda);
      });
  }, [vendasDoPeriodo, busca, filtroPagamento]);

  const totalVendido = vendasDoPeriodo.reduce(
    (total, venda) => total + Number(venda.valor || 0),
    0,
  );

  const quantidadeVendas = vendasDoPeriodo.length;

  const ticketMedio =
    quantidadeVendas > 0 ? totalVendido / quantidadeVendas : 0;

  const totalHoje = vendas
    .filter((venda) => obterDataISO(venda.data_venda) === hojeISO())
    .reduce((total, venda) => total + Number(venda.valor || 0), 0);

  async function handleSalvarVenda(dados) {
    await vendaCopaService.create(dados);

    toast.success("Venda registrada com sucesso!");
    setModalAberto(false);

    await carregarVendas();
  }

  async function handleExcluirVenda(id) {
    await vendaCopaService.delete(id);

    toast.success("Venda excluída com sucesso!");

    setVendaSelecionada(null);

    await carregarVendas();
  }

  return (
    <Layout>
      <main className="flex-1 bg-[#f0f2f5]">
        <div className="max-w-7xl mx-auto px-6 py-7">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-7 flex-wrap gap-4">
            <div>
              <h1 className="text-[#1a3560] text-3xl font-bold mb-1">Copa</h1>
              <p className="text-gray-500">
                Controle de vendas e faturamento do bar do CTG.
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={carregarVendas}
                disabled={loading}
                className="flex items-center gap-2 bg-white text-gray-600 px-4 py-3 rounded-xl shadow-sm hover:bg-gray-50 text-sm font-semibold disabled:opacity-50"
              >
                <RefreshCw size={16} />
                Atualizar
              </button>

              {podeRegistrar && (
                <button
                  onClick={() => setModalAberto(true)}
                  className="flex items-center gap-2 bg-[#1a3560] text-white px-5 py-3 rounded-xl shadow-sm hover:bg-blue-900 text-sm font-semibold"
                >
                  <Plus size={18} />
                  Registrar venda
                </button>
              )}
            </div>
          </div>

          {/* Filtro de período */}
          <section className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={18} className="text-[#1a3560]" />
              <h2 className="font-bold text-gray-700">Período das vendas</h2>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="px-4 py-3 rounded-xl bg-gray-100 text-sm border-none outline-none focus:ring-2 focus:ring-blue-200"
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

          {/* Indicadores */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
            <StatCard
              label="Faturamento do período"
              value={formatarMoeda(totalVendido)}
              icon={<DollarSign size={25} />}
              colorClass="bg-green-100 text-green-700"
            />

            <StatCard
              label="Vendas realizadas"
              value={quantidadeVendas}
              icon={<ShoppingBag size={25} />}
              colorClass="bg-blue-100 text-blue-700"
            />

            <StatCard
              label="Ticket médio"
              value={formatarMoeda(ticketMedio)}
              icon={<Receipt size={25} />}
              colorClass="bg-purple-100 text-purple-700"
            />

            <StatCard
              label="Faturamento de hoje"
              value={formatarMoeda(totalHoje)}
              icon={<Store size={25} />}
              colorClass="bg-amber-100 text-amber-700"
            />
          </section>

          {/* Histórico */}
          <section className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#1a3560]">
                    Histórico de vendas
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {vendasFiltradas.length} venda(s) encontrada(s)
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
                    placeholder="Buscar produto..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 text-sm border-none outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <select
                  value={filtroPagamento}
                  onChange={(e) => setFiltroPagamento(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-gray-100 text-sm border-none outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="Todos">Todas as formas de pagamento</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Pix">Pix</option>
                  <option value="Cartão">Cartão</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3" />
                <p className="text-gray-500 text-sm">Carregando vendas...</p>
              </div>
            ) : vendasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <Store size={26} className="text-[#1a3560]" />
                </div>
                <h3 className="font-bold text-gray-700 mb-1">
                  Nenhuma venda encontrada
                </h3>
                <p className="text-sm text-gray-500">
                  Tente alterar os filtros ou registre uma nova venda.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Produto</th>
                      <th className="px-5 py-4 font-semibold">Valor</th>
                      <th className="px-5 py-4 font-semibold">Pagamento</th>
                      <th className="px-5 py-4 font-semibold">Data e hora</th>
                      {podeRegistrar && (
                        <th className="px-5 py-4 font-semibold text-center">
                          Ações
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {vendasFiltradas.map((venda) => (
                      <tr key={venda.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#1a3560]">
                              <Store size={17} />
                            </div>
                            <span className="font-semibold text-gray-700 text-sm">
                              {venda.produto}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm font-bold text-gray-800">
                          {formatarMoeda(venda.valor)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                            {venda.forma_pagamento}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatarData(venda.data_venda)}
                        </td>
                        {podeRegistrar && (
                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => setVendaSelecionada(venda)}
                              title="Excluir venda"
                              className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
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
        <ModalVendaCopa
          onFechar={() => setModalAberto(false)}
          onSalvar={handleSalvarVenda}
        />
      )}
      {vendaSelecionada && (
        <ModalConfirmarExclusaoCopa
          venda={vendaSelecionada}
          onFechar={() => setVendaSelecionada(null)}
          onConfirmar={handleExcluirVenda}
        />
      )}
    </Layout>
  );
}
