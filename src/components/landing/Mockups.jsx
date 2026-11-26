/*
 * Desenhos do sistema feitos em HTML/CSS (não são prints): ilustram as telas
 * na landing page. Os nomes e números são de exemplo. Tudo aria-hidden,
 * porque o texto ao redor já descreve o que cada coisa faz.
 */

const MESES = [
  { mes: 'Mai', valor: 62 },
  { mes: 'Jun', valor: 70 },
  { mes: 'Jul', valor: 66 },
  { mes: 'Ago', valor: 81 },
  { mes: 'Set', valor: 78 },
  { mes: 'Out', valor: 92 },
]

export function MockupNotebook() {
  return (
    <div className="lp-note" aria-hidden="true">
      <div className="lp-note-tela">
        <div className="lp-app">
          <aside className="lp-app-lateral">
            <span className="lp-app-logo" />
            <span className="lp-app-item lp-app-item-ativo" />
            <span className="lp-app-item" />
            <span className="lp-app-item" />
            <span className="lp-app-item" />
          </aside>
          <div className="lp-app-corpo">
            <div className="lp-app-topo">
              <strong>Painel</strong>
              <span className="lp-app-busca">Buscar sócio</span>
            </div>
            <div className="lp-app-stats">
              <div className="lp-app-stat"><small>Sócios ativos</small><b>248</b></div>
              <div className="lp-app-stat lp-app-stat-ok"><small>Em dia</small><b>211</b></div>
              <div className="lp-app-stat lp-app-stat-alerta"><small>Pendentes</small><b>37</b></div>
            </div>
            <div className="lp-app-grade">
              <div className="lp-app-grafico">
                <small>Mensalidades recebidas</small>
                <div className="lp-app-barras">
                  {MESES.map(m => (
                    <span key={m.mes} style={{ '--h': `${m.valor}%` }}><i>{m.mes}</i></span>
                  ))}
                </div>
              </div>
              <ul className="lp-app-lista">
                <li><span className="lp-av" style={{ '--c': '#c0533f' }}>JM</span>João Machado<em className="lp-ok">Pago</em></li>
                <li><span className="lp-av" style={{ '--c': '#2f7a52' }}>AR</span>Ana Ribeiro<em className="lp-ok">Pago</em></li>
                <li><span className="lp-av" style={{ '--c': '#3d5a99' }}>TF</span>Tiago Fagundes<em className="lp-pend">Pendente</em></li>
                <li><span className="lp-av" style={{ '--c': '#b8862a' }}>CL</span>Clara Lopes<em className="lp-ok">Pago</em></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="lp-note-base" />
    </div>
  )
}

export function MockupCelular() {
  return (
    <div className="lp-cel" aria-hidden="true">
      <div className="lp-cel-tela">
        <div className="lp-cel-capa" />
        <span className="lp-cel-foto">MR</span>
        <strong className="lp-cel-nome">Maria Rosa Fontoura</strong>
        <span className="lp-cel-cat">Sócia titular</span>
        <span className="lp-cel-status">Mensalidade em dia</span>
        <small className="lp-cel-sub">Dependentes</small>
        <ul className="lp-cel-deps">
          <li><span className="lp-av" style={{ '--c': '#3d5a99' }}>PF</span><div><b>Paulo</b><i>Cônjuge</i></div></li>
          <li><span className="lp-av" style={{ '--c': '#c0533f' }}>LF</span><div><b>Laura</b><i>Invernada Juvenil</i></div></li>
          <li><span className="lp-av" style={{ '--c': '#2f7a52' }}>BF</span><div><b>Bento</b><i>Invernada Mirim</i></div></li>
        </ul>
      </div>
    </div>
  )
}

/* ── Miniaturas para os blocos de recursos ─────────────── */

export function MiniFamilia() {
  return (
    <div className="lp-mini lp-mini-familia" aria-hidden="true">
      <span className="lp-av lp-av-g" style={{ '--c': '#b8862a' }}>MR</span>
      <span className="lp-mini-ramo" />
      <div className="lp-mini-filhos">
        <span className="lp-av" style={{ '--c': '#3d5a99' }}>PF</span>
        <span className="lp-av" style={{ '--c': '#c0533f' }}>LF</span>
        <span className="lp-av" style={{ '--c': '#2f7a52' }}>BF</span>
      </div>
    </div>
  )
}

export function MiniMensalidades() {
  return (
    <ul className="lp-mini lp-mini-mens" aria-hidden="true">
      <li>Agosto<em className="lp-ok">Pago</em></li>
      <li>Setembro<em className="lp-ok">Pago</em></li>
      <li>Outubro<em className="lp-pend">Pendente</em></li>
    </ul>
  )
}

export function MiniContrato() {
  return (
    <div className="lp-mini lp-mini-doc" aria-hidden="true">
      <b>Contrato de sociedade</b>
      <span /><span /><span className="lp-curta" /><span /><span className="lp-curta" />
      <svg viewBox="0 0 120 30" className="lp-assinatura">
        <path d="M4 22 C14 4 20 26 30 14 C36 6 40 24 50 16 C58 10 62 22 72 14 C80 8 86 20 116 12"
          fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <i className="lp-pdf">PDF</i>
    </div>
  )
}

export function MiniCartao() {
  return (
    <div className="lp-mini lp-mini-cartao" aria-hidden="true">
      <span className="lp-cartao-faixa" />
      <small>Cartão tradicionalista</small>
      <b>Laura Fontoura</b>
      <span className="lp-cartao-num">Nº 0482 · válido até 2027</span>
    </div>
  )
}

export function MiniPerfis() {
  return (
    <div className="lp-mini lp-mini-perfis" aria-hidden="true">
      <span>Administrador</span>
      <span>Financeiro</span>
      <span>Sócios</span>
      <span>Consulta</span>
    </div>
  )
}

export function MiniRelatorio() {
  return (
    <div className="lp-mini lp-mini-rel" aria-hidden="true">
      {[48, 72, 60, 88, 70].map((h, i) => <span key={i} style={{ '--h': `${h}%` }} />)}
    </div>
  )
}
