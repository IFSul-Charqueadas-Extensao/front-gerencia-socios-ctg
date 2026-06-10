import { useState } from 'react'
import { useToast } from '../contexts/ToastContext'
import { validarCPF, formatarCPF, formatarTelefone, formatarCEP, validarCEP } from '../utils/formattingUtils'

const campoVazio = { nome: '', cpf: '' }

const inputClass = 'w-full px-3.5 py-3.5 border-none rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-colors'

export default function ModalDependente({ onFechar, onSalvar, socioMatricula = '', socioEndereco = '', initial = null }) {
  const [form, setForm] = useState(initial || { ...campoVazio, telefone: '', data_nascimento: '', dancarino: false })
  const toast = useToast()

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function salvar() {
    if (!form.nome || !form.cpf) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    onSalvar({ ...form })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-5">
      <div className="bg-white w-full max-w-[600px] rounded-2xl p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Cadastro de Dependente</h2>
          <span onClick={onFechar} className="text-3xl text-gray-500 cursor-pointer leading-none">&times;</span>
        </div>

        <div className="flex flex-col gap-4">
          {/* Matrícula do sócio é atribuída automaticamente; não exibir no modal */}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold">Nome Completo *</label>
            <input
              type="text"
              placeholder="Nome do dependente"
              value={form.nome}
              onChange={e => setField('nome', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold">CPF *</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={e => setField('cpf', formatarCPF(e.target.value))}
              className={inputClass}
            />
          </div>

<div className="flex flex-col gap-2">
            <label className="text-sm font-bold">Data de Nascimento</label>
            <input
              type="date"
              value={form.data_nascimento || ''}
              onChange={e => setField('data_nascimento', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold">É dançarino?</label>
            <select value={String(form.dancarino)} onChange={e => setField('dancarino', e.target.value === 'true')} className={inputClass}>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold">Categoria</label>
            <select value={String(form.categoria)} onChange={e => setField('categoria', e.target.value)} className={inputClass}>
              <option value="true">Dente-de-Leite</option>
              <option value="false">Pré-Mirim</option>
              <option value="false">Mirim</option>
              <option value="false">Juvenil</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3.5 mt-6">
          <button
            onClick={onFechar}
            className="bg-white border border-slate-300 text-gray-700 px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Salvar Dependente
          </button>
        </div>
      </div>
    </div>
  )
}
