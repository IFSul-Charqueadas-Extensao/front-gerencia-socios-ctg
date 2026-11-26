import { useState } from 'react'
import { CheckCircle2, AlertTriangle, HelpCircle, Search } from 'lucide-react'
import { verificacaoService } from '../services/verificacaoService'
import { formatarCPF, validarCPF } from '../utils/formattingUtils'
import logo from '../../modelos/css/Logo.jpg'

// "2026-11" -> "11/2026"
function formatarMesAno(aaaaMm) {
  const [ano, mes] = aaaaMm.split('-')
  return `${mes}/${ano}`
}

// "2026-11-10" -> "10/11/2026"
function formatarData(aaaaMmDd) {
  const [ano, mes, dia] = aaaaMmDd.split('-')
  return `${dia}/${mes}/${ano}`
}

function Resultado({ resultado }) {
  if (!resultado.encontrado) {
    return (
      <div role="status" className="rounded-2xl border border-gray-200 bg-gray-50 p-5 flex gap-3">
        <HelpCircle size={26} className="text-gray-400 shrink-0" />
        <div>
          <p className="font-bold text-gray-700">CPF não encontrado entre os sócios</p>
          <p className="text-sm text-gray-500 mt-1">
            Confira os números digitados. Se o CPF estiver certo, procure a secretaria do CTG.
          </p>
        </div>
      </div>
    )
  }

  if (resultado.adimplente) {
    return (
      <div role="status" className="rounded-2xl border border-green-200 bg-green-50 p-5 flex gap-3">
        <CheckCircle2 size={26} className="text-green-600 shrink-0" />
        <div>
          <p className="font-bold text-green-800 text-lg leading-tight">Adimplente</p>
          <p className="text-sm text-green-800 mt-1">
            {resultado.nome}, suas mensalidades estão em dia até{' '}
            <strong>{formatarMesAno(resultado.em_dia_ate)}</strong>.
          </p>
          <p className="text-xs text-green-700/80 mt-2">
            Verificado em {formatarData(resultado.verificado_em)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div role="status" className="rounded-2xl border border-amber-300 bg-amber-50 p-5 flex gap-3">
      <AlertTriangle size={26} className="text-amber-600 shrink-0" />
      <div>
        <p className="font-bold text-amber-900 text-lg leading-tight">Não adimplente</p>
        <p className="text-sm text-amber-900 mt-1">
          {resultado.nome}, não consta situação regular de mensalidades. Procure a
          secretaria do CTG para regularizar.
        </p>
        <p className="text-xs text-amber-800/80 mt-2">
          Verificado em {formatarData(resultado.verificado_em)}
        </p>
      </div>
    </div>
  )
}

// Página PÚBLICA: o sócio consulta a própria situação pelo CPF.
export default function Verificar() {
  const [cpf, setCpf] = useState('')
  const [consultando, setConsultando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')

  async function aoEnviar(e) {
    e.preventDefault()
    setResultado(null)
    setErro('')

    if (!validarCPF(cpf)) {
      setErro('Informe um CPF válido, com 11 dígitos.')
      return
    }

    setConsultando(true)

    try {
      setResultado(await verificacaoService.verificar(cpf))
    } catch (err) {
      setErro(
        err.isNetworkError
          ? 'Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.'
          : err.message || 'Não foi possível consultar agora. Tente novamente.'
      )
    } finally {
      setConsultando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] px-4 py-10">
      <div className="w-full max-w-sm">

        {/* Identidade (mesma da tela de login) */}
        <div className="flex flex-col items-center mb-7">
          <img
            src={logo}
            alt="CTG Raízes da Tradição"
            className="w-20 h-20 rounded-full object-contain bg-white p-1 shadow-md"
          />
          <h1 className="mt-4 text-xl font-bold text-[#1a3560] text-center leading-tight">
            CTG Raízes da Tradição
          </h1>
          <p className="text-sm text-gray-500 mt-1">Verificação de adimplência</p>
        </div>

        <form
          onSubmit={aoEnviar}
          noValidate
          className="bg-white rounded-2xl shadow-sm p-7 flex flex-col gap-5"
        >
          <div>
            <label htmlFor="cpf" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Seu CPF
            </label>
            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              value={cpf}
              onChange={e => {
                setCpf(formatarCPF(e.target.value))
                setErro('')
                setResultado(null)
              }}
              placeholder="000.000.000-00"
              aria-invalid={erro ? 'true' : undefined}
              aria-describedby={erro ? 'cpf-erro' : undefined}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-300 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            {erro && (
              <p id="cpf-erro" role="alert" className="text-sm text-red-600 mt-2">
                {erro}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={consultando}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl border-none cursor-pointer transition-colors"
          >
            <Search size={17} />
            {consultando ? 'Consultando...' : 'Verificar'}
          </button>
        </form>

        {resultado && (
          <div className="mt-5">
            <Resultado resultado={resultado} />
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Consulte apenas o seu próprio CPF. Nenhum outro dado é exibido.
        </p>
      </div>
    </div>
  )
}
