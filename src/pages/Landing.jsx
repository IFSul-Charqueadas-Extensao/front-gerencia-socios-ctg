import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  LogIn, Eye, EyeOff, LayoutDashboard, Users, Wallet, FileSignature,
  ShieldCheck, Camera, IdCard, ChartColumn, Mail, HeartHandshake, X, Lock,
} from 'lucide-react'
import '@fontsource/alegreya/latin-700.css'
import '@fontsource/alegreya/latin-800.css'
import '@fontsource/alegreya/latin-900.css'
import '@fontsource/alegreya-sans/latin-400.css'
import '@fontsource/alegreya-sans/latin-500.css'
import '@fontsource/alegreya-sans/latin-700.css'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import PampaIlustracao from '../components/landing/PampaIlustracao'
import {
  MockupNotebook, MockupCelular, MiniFamilia, MiniMensalidades,
  MiniContrato, MiniCartao, MiniPerfis, MiniRelatorio,
} from '../components/landing/Mockups'
import simboloIFSul from '../assets/landing/ifsul-simbolo.png'
import logoIFSul from '../assets/landing/ifsul-vertical.png'
import logoTSI from '../assets/landing/tsi.png'
import fotoFandango from '../assets/landing/fandango.jpg'
import './Landing.css'

/*
 * Landing page pública do sistema. Faz duas coisas:
 *  1. Divulga o sistema (para o próprio CTG e para outros CTGs).
 *  2. É a porta de entrada: o login abre num painel lateral e usa o mesmo
 *     AuthContext / authService do Login antigo, que fala com o
 *     POST /api/auth/login do back-end. Nada muda no back.
 */

// E-mail para outros CTGs pedirem o sistema. Deixe vazio para esconder o botão.
const CONTATO_EMAIL = ''

// Fotos reais do CTG (invernadas, fandangos, rodeios). Para usar:
//   import foto1 from '../assets/landing/invernada-juvenil.jpg'
//   const FOTOS = [{ src: foto1, legenda: 'Invernada Juvenil no rodeio de 2026' }]
// Com a lista vazia, a seção de fotos não aparece.
const FOTOS = []

const RECURSOS = [
  { id: 'familia', tom: 'claro', largo: true, titulo: 'A família inteira no cadastro',
    texto: 'Sócio titular com cônjuge, filhos, parentesco, foto e invernada de cada um.', mini: MiniFamilia },
  { id: 'mens', tom: 'verde', titulo: 'Mensalidades sem caderno',
    texto: 'Pagamentos registrados num lugar só, com quem está em dia e quem está devendo.', mini: MiniMensalidades },
  { id: 'contrato', tom: 'ouro', titulo: 'Contrato pronto em PDF',
    texto: 'Os dados do sócio já entram no contrato de sociedade. É só imprimir e assinar.', mini: MiniContrato },
  { id: 'cartao', tom: 'noite', titulo: 'Cartão tradicionalista',
    texto: 'Controle do cartão de cada sócio e dependente.', mini: MiniCartao },
  { id: 'rel', tom: 'vermelho', titulo: 'Relatórios para a prestação de contas',
    texto: 'Sócios, pagamentos e inadimplentes em PDF, prontos para a reunião.', mini: MiniRelatorio },
  { id: 'perfis', tom: 'claro', largo: true, cheio: true, titulo: 'Cada um com o acesso certo',
    texto: 'Login próprio para cada pessoa da diretoria. O tesoureiro mexe no financeiro, a secretaria nos cadastros, e quem só consulta não altera nada.', mini: MiniPerfis },
]

const PERFIS = [
  {
    quem: 'Patronagem',
    papel: 'Administrador',
    ganhos: [
      { icone: LayoutDashboard, texto: 'Painel com o total de sócios, quem está em dia e quem está devendo, assim que entra no sistema.' },
      { icone: ShieldCheck, texto: 'Cada pessoa da diretoria recebe o próprio login, com acesso só ao que é da função dela.' },
    ],
  },
  {
    quem: 'Tesouraria',
    papel: 'Financeiro',
    ganhos: [
      { icone: Wallet, texto: 'Mensalidades e pagamentos registrados num lugar só, sem caderno nem planilha paralela.' },
      { icone: ChartColumn, texto: 'Lista de inadimplentes pronta para a cobrança, e relatórios em PDF para a prestação de contas.' },
    ],
  },
  {
    quem: 'Secretaria',
    papel: 'Sócios',
    ganhos: [
      { icone: Users, texto: 'Cadastro do sócio com a família junto: cônjuge, filhos e invernada de cada um.' },
      { icone: FileSignature, texto: 'Contrato de sociedade gerado em PDF com os dados preenchidos, pronto para assinar.' },
      { icone: IdCard, texto: 'Controle do cartão tradicionalista de cada sócio.' },
    ],
  },
  {
    quem: 'Sócios e famílias',
    papel: 'Quem é atendido',
    ganhos: [
      { icone: Camera, texto: 'Ficha com foto de cada dependente, para o CTG reconhecer quem é da casa nos eventos.' },
      { icone: HeartHandshake, texto: 'Atendimento mais rápido na secretaria: a situação do sócio aparece na hora.' },
    ],
  },
]

const PASSOS = [
  { titulo: 'Cadastre o sócio e a família', texto: 'Dados, foto, parentesco e invernada de cada dependente.', icone: Users },
  { titulo: 'Lance as mensalidades', texto: 'Registre os pagamentos conforme chegam; o sistema mostra quem está em dia.', icone: Wallet },
  { titulo: 'Acompanhe e gere documentos', texto: 'Painel, relatórios e contrato de sociedade em PDF.', icone: FileSignature },
]

/* ── Login ──────────────────────────────────────────────── */

function FormularioEntrar({ campoEmailRef }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [entrando, setEntrando] = useState(false)
  // o erro fica dentro do formulário: o aviso flutuante (toast) ficaria
  // escondido atrás do painel de login, que é um <dialog> modal
  const [erro, setErro] = useState('')

  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // rota que o usuário tentou acessar antes de cair aqui
  const destino = location.state?.de || '/'

  async function aoEnviar(e) {
    e.preventDefault()

    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.')
      return
    }

    setErro('')
    setEntrando(true)
    try {
      const usuario = await login(email.trim(), senha)
      toast.success(`Bem-vindo, ${usuario.nome}!`)
      navigate(destino, { replace: true })
    } catch (err) {
      setErro(err.message || 'Não foi possível entrar.')
      setSenha('')
    } finally {
      setEntrando(false)
    }
  }

  return (
    <form onSubmit={aoEnviar} className="lp-form" noValidate>
      <label htmlFor="lp-email" className="lp-rotulo">E-mail</label>
      <input
        id="lp-email"
        ref={campoEmailRef}
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        autoComplete="username"
        placeholder="seu.email@ctg.local"
        className="lp-campo"
      />

      <label htmlFor="lp-senha" className="lp-rotulo">Senha</label>
      <div className="lp-senha">
        <input
          id="lp-senha"
          type={mostrarSenha ? 'text' : 'password'}
          value={senha}
          onChange={e => setSenha(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
          className="lp-campo"
        />
        <button
          type="button"
          onClick={() => setMostrarSenha(v => !v)}
          aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          className="lp-olho"
        >
          {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {erro && <p className="lp-erro" role="alert">{erro}</p>}

      <button type="submit" disabled={entrando} className="lp-botao lp-botao-verde lp-botao-cheio">
        <LogIn size={18} />
        {entrando ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="lp-form-nota">Esqueceu a senha? Procure um administrador do sistema.</p>
    </form>
  )
}

function PainelEntrar({ dialogRef, campoEmailRef, aoFechar }) {
  const { autenticado, usuario } = useAuth()

  return (
    <dialog
      ref={dialogRef}
      className="lp-dialogo"
      aria-labelledby="lp-entrar-titulo"
      onClose={aoFechar}
      onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close() }}
    >
      <div className="lp-dialogo-caixa">
        <div className="lp-dialogo-capa">
          <PampaIlustracao />
          <button type="button" className="lp-fechar" aria-label="Fechar" onClick={() => dialogRef.current?.close()}>
            <X size={20} />
          </button>
          <img src={simboloIFSul} alt="" className="lp-dialogo-logo" />
        </div>
        <div className="lp-dialogo-corpo">
          <h2 id="lp-entrar-titulo" className="lp-dialogo-titulo">
            {autenticado ? `Olá, ${usuario?.nome}` : 'Entrar no sistema'}
          </h2>
          <p className="lp-dialogo-sub">
            {autenticado ? 'Você já está conectado.' : 'Acesso da diretoria e da secretaria do CTG.'}
          </p>
          {autenticado
            ? (
              <Link to="/" className="lp-botao lp-botao-verde lp-botao-cheio">
                <LayoutDashboard size={18} /> Ir para o painel
              </Link>
            )
            : <FormularioEntrar campoEmailRef={campoEmailRef} />}
          <p className="lp-seguro"><Lock size={14} aria-hidden="true" /> Conexão protegida, sessão com expiração automática.</p>
        </div>
      </div>
    </dialog>
  )
}

/* ── Faixa com o desenho de losangos dos ponchos ───────── */

function FaixaPoncho() {
  return <div className="lp-poncho" aria-hidden="true" />
}

/* ── Página ─────────────────────────────────────────────── */

export default function Landing() {
  const { autenticado, carregando } = useAuth()
  const location = useLocation()
  const dialogRef = useRef(null)
  const campoEmailRef = useRef(null)
  const [aba, setAba] = useState(0)
  const abasRef = useRef([])

  function abrirEntrar() {
    const d = dialogRef.current
    if (!d || d.open) return
    d.showModal()
    setTimeout(() => campoEmailRef.current?.focus(), 50)
  }

  // Quem foi mandado para cá ao tentar abrir uma página interna (ou porque a
  // sessão expirou) já vê o login aberto. Quem chega pela página inicial vê a landing.
  const veioDeDentro = location.state?.de && location.state.de !== '/'
  useEffect(() => {
    if (!carregando && !autenticado && veioDeDentro) abrirEntrar()
  }, [carregando, autenticado, veioDeDentro])

  function aoTeclarAba(e, i) {
    let prox = null
    if (e.key === 'ArrowRight') prox = (i + 1) % PERFIS.length
    if (e.key === 'ArrowLeft') prox = (i - 1 + PERFIS.length) % PERFIS.length
    if (prox !== null) {
      e.preventDefault()
      setAba(prox)
      abasRef.current[prox]?.focus()
    }
  }

  const perfil = PERFIS[aba]

  return (
    <div className="lp">
      {/* ── Topo ───────────────────────────────────────────── */}
      <header className="lp-topo">
        <div className="lp-topo-foto">
          <img src={fotoFandango} alt="Casais em trajes gaúchos dançando no salão do CTG" />
        </div>

        <nav className="lp-barra" aria-label="Principal">
          <span className="lp-marca">
            <img src={simboloIFSul} alt="" className="lp-logo" />
            <span>IFSul<br />Câmpus Charqueadas</span>
          </span>
          <div className="lp-barra-links">
            <a href="#recursos">Recursos</a>
            <a href="#quem-usa">Quem usa</a>
            <a href="#seu-ctg">Para seu CTG</a>
          </div>
          {autenticado
            ? <Link to="/" className="lp-botao lp-botao-ouro lp-botao-peq">Ir para o painel</Link>
            : <button type="button" className="lp-botao lp-botao-ouro lp-botao-peq" onClick={abrirEntrar}>
                <LogIn size={16} /> Entrar
              </button>}
        </nav>

        <div className="lp-heroi">
          <div className="lp-heroi-texto">
            <p className="lp-selo">Sistema de sócios para CTGs</p>
            <h1 className="lp-titulo">Do galpão à tesouraria, o CTG inteiro num lugar só.</h1>
            <p className="lp-lead">
              Cadastro das famílias, mensalidades, contratos e relatórios do seu CTG,
              organizados num sistema só. Menos papel perdido, mais tempo para a tradição.
            </p>
            <div className="lp-acoes">
              {autenticado
                ? <Link to="/" className="lp-botao lp-botao-ouro"><LayoutDashboard size={18} /> Ir para o painel</Link>
                : <button type="button" className="lp-botao lp-botao-ouro" onClick={abrirEntrar}>
                    <LogIn size={18} /> Entrar no sistema
                  </button>}
              <a href="#recursos" className="lp-botao lp-botao-vazado">Conhecer o sistema</a>
            </div>
          </div>
        </div>
      </header>

      <FaixaPoncho />

      <main>
        {/* ── Recursos ─────────────────────────────────────── */}
        <section id="recursos" className="lp-secao">
          <div className="lp-largura">
            <div className="lp-recursos-topo">
              <div>
                <h2 className="lp-h2">Tudo que a diretoria precisa, sem planilha espalhada</h2>
                <p className="lp-intro">O sistema cobre a rotina do CTG de ponta a ponta, do cadastro do sócio ao relatório da reunião.</p>
              </div>
              <div className="lp-telas">
                <MockupNotebook />
                <MockupCelular />
              </div>
            </div>

            <div className="lp-bento">
              {RECURSOS.map(r => (
                <article key={r.id} className={`lp-bloco lp-bloco-${r.tom}${r.largo ? ' lp-bloco-largo' : ''}${r.cheio ? ' lp-bloco-cheio' : ''}`}>
                  <div className="lp-bloco-texto">
                    <h3>{r.titulo}</h3>
                    <p>{r.texto}</p>
                  </div>
                  <r.mini />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quem usa (abas) ──────────────────────────────── */}
        <section id="quem-usa" className="lp-secao lp-secao-noite">
          <div className="lp-largura">
            <h2 className="lp-h2">Cada um na sua lida</h2>
            <p className="lp-intro">Escolha quem você é na diretoria e veja o que muda na sua rotina.</p>

            <div className="lp-abas" role="tablist" aria-label="Quem usa o sistema">
              {PERFIS.map((p, i) => (
                <button
                  key={p.quem}
                  ref={el => { abasRef.current[i] = el }}
                  type="button"
                  role="tab"
                  id={`lp-aba-${i}`}
                  aria-selected={aba === i}
                  aria-controls="lp-aba-painel"
                  tabIndex={aba === i ? 0 : -1}
                  className="lp-aba"
                  onClick={() => setAba(i)}
                  onKeyDown={e => aoTeclarAba(e, i)}
                >
                  {p.quem}
                  <small>{p.papel}</small>
                </button>
              ))}
            </div>

            <div id="lp-aba-painel" role="tabpanel" aria-labelledby={`lp-aba-${aba}`} className="lp-aba-painel" key={aba}>
              <ul className="lp-ganhos">
                {perfil.ganhos.map(g => (
                  <li key={g.texto} className="lp-ganho">
                    <span className="lp-ganho-icone"><g.icone size={24} aria-hidden="true" /></span>
                    <span>{g.texto}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Como funciona: sequência real, numerada ──────── */}
        <section className="lp-secao lp-secao-campo">
          <div className="lp-largura">
            <h2 className="lp-h2">Como entra na rotina</h2>
            <ol className="lp-trilha">
              {PASSOS.map(p => (
                <li key={p.titulo} className="lp-passo">
                  <span className="lp-passo-marco"><p.icone size={26} aria-hidden="true" /></span>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Fotos reais (só aparece se houver) ───────────── */}
        {FOTOS.length > 0 && (
          <section className="lp-secao">
            <div className="lp-largura">
              <h2 className="lp-h2">A tradição que o sistema ajuda a cuidar</h2>
              <div className="lp-fotos">
                {FOTOS.map(f => (
                  <figure key={f.src} className="lp-foto">
                    <img src={f.src} alt={f.legenda} loading="lazy" />
                    <figcaption>{f.legenda}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Convite a outros CTGs ────────────────────────── */}
        <section id="seu-ctg" className="lp-convite">
          <FaixaPoncho />
          <div className="lp-largura lp-convite-grade">
            <div>
              <h2 className="lp-h2">Seu CTG também pode usar</h2>
              <p className="lp-intro">
                O sistema é um projeto de extensão do IFSul Câmpus Charqueadas, desenvolvido por
                estudantes do curso de Tecnologia em Sistemas para Internet para atender CTGs da região.
                Se a sua entidade quer organizar sócios e mensalidades desse jeito, fale com a equipe.
              </p>
              <div className="lp-acoes">
                {CONTATO_EMAIL && (
                  <a href={`mailto:${CONTATO_EMAIL}`} className="lp-botao lp-botao-ouro">
                    <Mail size={18} /> Falar com a equipe
                  </a>
                )}
                {!autenticado && (
                  <button type="button" className="lp-botao lp-botao-vazado" onClick={abrirEntrar}>
                    <LogIn size={18} /> Entrar no sistema
                  </button>
                )}
              </div>
            </div>
            <figure className="lp-convite-marcas">
              <img src={logoIFSul} alt="Instituto Federal Sul-rio-grandense, Câmpus Charqueadas" className="lp-marca-ifsul" />
              <figcaption>
                <img src={logoTSI} alt="Curso de Tecnologia em Sistemas para Internet" className="lp-marca-tsi" />
              </figcaption>
            </figure>
          </div>
        </section>
      </main>

      <footer className="lp-rodape">
        <div className="lp-largura lp-rodape-linha">
          <span>IFSul Câmpus Charqueadas</span>
          <span>Projeto de extensão: sistema de sócios para CTGs</span>
        </div>
      </footer>

      <PainelEntrar dialogRef={dialogRef} campoEmailRef={campoEmailRef} aoFechar={() => {}} />
    </div>
  )
}
