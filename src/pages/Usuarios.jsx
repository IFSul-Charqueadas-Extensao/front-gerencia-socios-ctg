import { useState, useEffect, useCallback } from 'react'
import { UserPlus, Pencil, Trash2, KeyRound, ShieldCheck, X } from 'lucide-react'
import Layout from '../components/Layout'
import EmptyState from '../components/EmptyState'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { usuarioService } from '../services/usuarioService'
import { ROTULO_PAPEL, DESCRICAO_PAPEL, PAPEIS } from '../utils/permissoes'

const inputClass = 'w-full px-3.5 py-3 border-none rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-colors'

const CORES_PAPEL = {
  admin: 'bg-purple-100 text-purple-700',
  financeiro: 'bg-emerald-100 text-emerald-700',
  socios: 'bg-blue-100 text-blue-700',
  consulta: 'bg-gray-200 text-gray-600',
}

const FORMULARIO_VAZIO = { nome: '', email: '', senha: '', role: PAPEIS.CONSULTA, ativo: true }

export default function Usuarios() {
  const toast = useToast()
  const { usuario: usuarioLogado } = useAuth()

  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORMULARIO_VAZIO)
  const [salvando, setSalvando] = useState(false)
  // usuário cuja senha está sendo trocada, e a nova senha digitada
  const [trocandoSenha, setTrocandoSenha] = useState(null)
  const [novaSenha, setNovaSenha] = useState('')
  // id do usuário aguardando confirmação de exclusão (confirmação inline)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null)

  // sem setState síncrono: o estado inicial de `carregando` já é true,
  // e as atualizações acontecem apenas nos callbacks da promessa
  const carregar = useCallback(() => {
    return usuarioService.getAll()
      .then(setUsuarios)
      .catch(err => toast.error(`Erro ao carregar usuários: ${err.message}`))
      .finally(() => setCarregando(false))
  }, [toast])

  useEffect(() => { carregar() }, [carregar])

  function abrirCriacao() {
    setEditando(null)
    setForm(FORMULARIO_VAZIO)
    setModalAberto(true)
  }

  function abrirEdicao(u) {
    setEditando(u)
    setForm({ nome: u.nome, email: u.email, senha: '', role: u.role, ativo: u.ativo })
    setModalAberto(true)
  }

  async function salvar(e) {
    e.preventDefault()
    setSalvando(true)

    try {
      if (editando) {
        await usuarioService.update(editando.id, form)
        toast.success('Usuário atualizado.')
      } else {
        await usuarioService.create(form)
        toast.success('Usuário criado.')
      }

      setModalAberto(false)
      carregar()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSalvando(false)
    }
  }

  function abrirTrocaDeSenha(u) {
    setTrocandoSenha(u)
    setNovaSenha('')
  }

  async function salvarSenha(e) {
    e.preventDefault()
    setSalvando(true)

    try {
      await usuarioService.alterarSenha(trocandoSenha.id, novaSenha)
      toast.success('Senha alterada. As sessões abertas foram encerradas.')
      setTrocandoSenha(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(u) {
    try {
      await usuarioService.delete(u.id)
      toast.success('Usuário excluído.')
      setConfirmandoExclusao(null)
      carregar()
    } catch (err) {
      toast.error(err.message)
      setConfirmandoExclusao(null)
    }
  }

  return (
    <Layout>
      <div className="p-5 lg:p-8 max-w-6xl w-full mx-auto">

        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3560] flex items-center gap-2">
              <ShieldCheck size={24} />
              Usuários
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Quem acessa o sistema e o que cada um pode alterar
            </p>
          </div>

          <button
            onClick={abrirCriacao}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl border-none cursor-pointer transition-colors"
          >
            <UserPlus size={17} />
            Novo usuário
          </button>
        </div>

        {carregando ? (
          <p className="text-gray-500 text-sm">Carregando...</p>
        ) : usuarios.length === 0 ? (
          <EmptyState mensagem="Nenhum usuário cadastrado." />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3 font-semibold">Nome</th>
                    <th className="px-5 py-3 font-semibold">E-mail</th>
                    <th className="px-5 py-3 font-semibold">Perfil</th>
                    <th className="px-5 py-3 font-semibold">Situação</th>
                    <th className="px-5 py-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id} className="border-t border-gray-100">
                      <td className="px-5 py-3.5 font-semibold text-gray-800">
                        {u.nome}
                        {u.id === usuarioLogado?.id && (
                          <span className="ml-2 text-[11px] font-normal text-gray-400">(você)</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span
                          title={DESCRICAO_PAPEL[u.role]}
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${CORES_PAPEL[u.role] ?? ''}`}
                        >
                          {ROTULO_PAPEL[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={u.ativo ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {confirmandoExclusao === u.id ? (
                          // confirmação inline, no lugar dos botões de ação
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-gray-600">Excluir?</span>
                            <button
                              onClick={() => excluir(u)}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold border-none cursor-pointer"
                            >
                              Sim, excluir
                            </button>
                            <button
                              onClick={() => setConfirmandoExclusao(null)}
                              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold border-none cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => abrirEdicao(u)}
                              aria-label={`Editar ${u.nome}`}
                              className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 bg-transparent border-none cursor-pointer"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => abrirTrocaDeSenha(u)}
                              aria-label={`Alterar senha de ${u.nome}`}
                              className="p-2 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 bg-transparent border-none cursor-pointer"
                            >
                              <KeyRound size={16} />
                            </button>
                            <button
                              onClick={() => setConfirmandoExclusao(u.id)}
                              aria-label={`Excluir ${u.nome}`}
                              className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 bg-transparent border-none cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legenda dos perfis */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            O que cada perfil pode fazer
          </p>
          <ul className="flex flex-col gap-2">
            {Object.entries(DESCRICAO_PAPEL).map(([papel, descricao]) => (
              <li key={papel} className="flex items-start gap-3 text-sm">
                <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold ${CORES_PAPEL[papel]}`}>
                  {ROTULO_PAPEL[papel]}
                </span>
                <span className="text-gray-600">{descricao}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal de criação/edição */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#1a3560]">
                {editando ? 'Editar usuário' : 'Novo usuário'}
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none p-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={salvar} className="p-6 flex flex-col gap-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-1.5">Nome</label>
                <input
                  id="nome"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              {/* Na edição a senha tem botão próprio na listagem */}
              {!editando && (
                <div>
                  <label htmlFor="senha" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Senha <span className="font-normal text-gray-400">(mínimo 8 caracteres)</span>
                  </label>
                  <input
                    id="senha"
                    type="password"
                    value={form.senha}
                    onChange={e => setForm({ ...form, senha: e.target.value })}
                    className={inputClass}
                    minLength={8}
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1.5">Perfil</label>
                <select
                  id="role"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className={inputClass}
                >
                  {Object.entries(ROTULO_PAPEL).map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>{rotulo}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1.5">{DESCRICAO_PAPEL[form.role]}</p>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={e => setForm({ ...form, ativo: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
                Usuário ativo
                <span className="text-xs text-gray-400">
                  (desativar encerra as sessões abertas)
                </span>
              </label>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl border-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl border-none cursor-pointer"
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de troca de senha */}
      {trocandoSenha && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#1a3560]">Alterar senha</h2>
              <button
                onClick={() => setTrocandoSenha(null)}
                aria-label="Fechar"
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none p-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={salvarSenha} className="p-6 flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                Definir uma nova senha para <strong>{trocandoSenha.nome}</strong>.
              </p>

              <div>
                <label htmlFor="nova-senha" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nova senha <span className="font-normal text-gray-400">(mínimo 8 caracteres)</span>
                </label>
                <input
                  id="nova-senha"
                  type="password"
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  className={inputClass}
                  minLength={8}
                  autoFocus
                  required
                />
              </div>

              <p className="text-xs text-gray-500">
                As sessões abertas deste usuário serão encerradas.
              </p>

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setTrocandoSenha(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl border-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl border-none cursor-pointer"
                >
                  {salvando ? 'Salvando...' : 'Alterar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
