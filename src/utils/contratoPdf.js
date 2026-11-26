import jsPDF from 'jspdf'
import logoCtgUrl from '../assets/logo-ctg.jpeg'

// ------------------------------------------------------------------
// Dados fixos do contrato (modelo "Contrato de Sociedade — Revisão 1/2026").
// Quando o CTG revisar o contrato ou trocar a patronagem, altere aqui.
// ------------------------------------------------------------------
const CTG = {
  nomeContrato: 'CENTRO DE TRADIÇÕES RAÍZES DA TRADIÇÃO',
  razaoSocial: 'CTG Raízes da Tradição',
  cnpj: '74.870.676/0001-72',
  endereco: 'Rua Júlio Rosa, 361, Bairro: Centro de Charqueadas/RS - CEP 96745-000',
  enderecoRodape: 'Rua Júlio Rosa, n 361, Centro de Charqueadas/RS - CEP 96745-000',
  cidade: 'Charqueadas/RS',
  patrao: 'Giuliano Barbieri',
  revisao: 'Revisão 1/2026',
}

// Texto das cláusulas, copiado do modelo oficial.
// Cada item vira um parágrafo; { titulo } vira um título em negrito.
const CLAUSULAS = [
  { titulo: 'Cláusulas' },
  'Cláusula 1ª - O objetivo desta sociedade é a utilização dos serviços do CTG Raízes da Tradição, que inclui aluguel do salão, participação nas invernadas, desconto nos valores dos ingressos dos bailes, participação em Rodeios, entre outros.',
  'Cláusula 2ª - Os valores de Capital são mensais. Mensalidade dos Sócios R$25,00 e mensalidade de instrutor de invernada R$40,00 por dançarino e poderão sofrer reajuste anual, caso necessário. Para novos associados será cobrado um adiantamento de 4 meses, totalizando (R$100,00), e no quinto mês valor mensal a somar com a mensalidade do instrutor R$65,00.',
  'I – Dependentes completando a maior idade, automaticamente deve preencher o contrato da sociedade.',
  'II – Inadimplência: Com 2 (dois) meses consecutivos de inadimplência, o sócio e seus dependentes ficam automaticamente impedidos de participar dos ensaios e rodeios, atividades das invernadas e demais serviços disponibilizados pela entidade, até a regularização total dos débitos.',
  'III – Com 8 (oito) meses consecutivos, conforme estatuto, o sócio será automaticamente excluído da sociedade, sem necessidade de notificação prévia perdendo todos os direitos de associados. A reintegração somente será possível mediante o pagamento dos débitos existentes.',
  'IV – Liberação do cartão Tradicionalista: Após a comunicação do sócio de seu desligamento da sociedade, o patrão assinará uma carta de liberação do mesmo. Essa carta só poderá ser entregue ao sócio mediante a quitação de seus débitos na entidade (sociedade, instrutor, invernada).',
  'Aluguel de Salão será cobrado para Sócios R$350,00 e não sócios R$660,00; esses valores já estão incluídos a taxa de limpeza e gás. Esses valores são cobrados para a utilização de toda a estrutura do galpão com exceção do bolicho. Para aluguéis como: chá de fraldas, reuniões de terceiros o valor deverá ser analisado pelo patrão da entidade. As regras estarão no contrato de locação no ato da assinatura.',
  'As idas aos Rodeios serão de inteira responsabilidade dos pais e responsáveis pelos dançarinos e a instituição se reserva o direito de escolher e alugar os ônibus, alojamentos para este fim, repassando os valores individuais de cada dançarino e acompanhante.',
  'Cláusula 3ª – Cada integrante deverá ser portador da carteira tradicionalista – MTG, para poder participar de eventos dentro do estado, o valor do cartão tradicionalista é pago pelo dançarino, atualmente o valor é R$60,00, podendo ter reajustes, a informação vem do coordenador da região. Caberá ao coordenador da invernada informar a secretaria e/ou patrão da entidade a necessidade de realizar o pedido do mesmo.',
  'Cláusula 4ª – O prazo de duração da sociedade será por tempo indeterminado.',
  'Cláusula 5ª - No caso do sócio desejar retirar-se da Sociedade, deverá estar em dia com as mensalidades e notificar a instituição, no papel de Patrão(a), com antecedência de 30 dias.',
  'Cláusula 6ª - O sócio responsável pelos dançarinos informados acima autoriza o uso de imagem para compor materiais como apresentações em rodeios, eventos internos da entidade, destinadas ao público em geral e/ou apenas para uso interno do CTG Raízes da Tradição, desde que não haja desvirtuamento da sua finalidade.',
  'Parágrafo Único: Os valores mencionados na cláusula 2ª poderão ser reajustados de acordo com a vontade vigente da atual patronagem. Os reajustes de mensalidades serão comunicados com antecedência em reunião de sócios.',
]

const LINHA = '____________________' // campo em branco para preencher à mão

function dataBR(iso) {
  if (!iso) return LINHA
  const [a, m, d] = String(iso).slice(0, 10).split('-')
  return `${d}/${m}/${a}`
}

function valor(v) {
  return v && String(v).trim() ? String(v).trim() : LINHA
}

// jsPDF precisa da imagem em base64; no navegador buscamos o arquivo do bundle
async function carregarComoDataUrl(url) {
  const blob = await (await fetch(url)).blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Gera o PDF do Contrato de Sociedade para assinatura.
 * @param {object} socio        objeto do socioMapper (nome, cpf, telefone, logradouro, numero, bairro, cidade, estado, rg?)
 * @param {Array}  dependentes  lista do dependenteMapper (só os dançarinos entram no contrato)
 * @param {object} opcoes       { abrir: true } abre em nova aba; false baixa o arquivo.
 *                              { logo } permite passar o logo já em base64.
 */
export async function gerarContratoPdf(socio, dependentes = [], opcoes = {}) {
  const { abrir = true } = opcoes
  const logo = opcoes.logo ?? (await carregarComoDataUrl(logoCtgUrl).catch(() => null))

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const larguraPagina = doc.internal.pageSize.getWidth()
  const alturaPagina = doc.internal.pageSize.getHeight()
  const margem = 22
  const largura = larguraPagina - margem * 2
  const topo = 34            // abaixo do logo
  const limiteInferior = alturaPagina - 28 // acima do rodapé
  let y = topo

  function garantirEspaco(altura) {
    if (y + altura > limiteInferior) {
      doc.addPage()
      y = topo
    }
  }

  // Justifica uma linha: distribui a sobra de espaço entre as palavras,
  // para a linha ocupar toda a largura útil da página.
  function escreverJustificado(linha) {
    const palavras = linha.trim().split(/\s+/)
    if (palavras.length < 2) {
      doc.text(linha, margem, y)
      return
    }
    const larguraPalavras = palavras.reduce((soma, p) => soma + doc.getTextWidth(p), 0)
    const espaco = (largura - larguraPalavras) / (palavras.length - 1)
    let x = margem
    palavras.forEach(p => {
      doc.text(p, x, y)
      x += doc.getTextWidth(p) + espaco
    })
  }

  function paragrafo(texto, { negrito = false, tamanho = 11, espacoDepois = 4, justificar = true } = {}) {
    doc.setFont('helvetica', negrito ? 'bold' : 'normal')
    doc.setFontSize(tamanho)
    const alturaLinha = tamanho * 0.5
    const linhas = doc.splitTextToSize(texto, largura)
    // escreve linha a linha para poder quebrar página no meio do parágrafo
    linhas.forEach((linha, i) => {
      garantirEspaco(alturaLinha)
      const ultimaLinha = i === linhas.length - 1
      if (justificar && !ultimaLinha) {
        escreverJustificado(linha)
      } else {
        doc.text(linha, margem, y)
      }
      y += alturaLinha
    })
    y += espacoDepois
  }

  // ---------- Título ----------
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.text('CONTRATO DE SOCIEDADE', larguraPagina / 2, y, { align: 'center' })
  y += 12

  // ---------- Qualificação do sócio ----------
  paragrafo(
    `Pelo presente instrumento particular, ${valor(socio.nome)}, Fone: ${valor(socio.telefone)}, ` +
    `CPF: ${valor(socio.cpf)}, residente e domiciliado na Rua: ${valor(socio.logradouro)}, ` +
    `Nº ${valor(socio.numero)}${socio.complemento ? ` (${socio.complemento})` : ''}, Bairro: ${valor(socio.bairro)}, ` +
    `cidade: ${valor(socio.cidade)}/${socio.estado || 'RS'}, associa-se ao ${CTG.nomeContrato}, ` +
    `inscrito no CNPJ ${CTG.cnpj}, Endereço: ${CTG.endereco}.`,
    { espacoDepois: 8 }
  )

  // ---------- Dependentes dançarinos ----------
  const dancarinos = dependentes.filter(d => d.dancarino)
  if (dancarinos.length === 0) {
    paragrafo('Dependentes dançarinos: não há dependentes dançarinos vinculados a este contrato.', { espacoDepois: 8 })
  } else {
    dancarinos.forEach(d => {
      paragrafo(
        `Dependente dançarino: ${valor(d.nome)}, CPF: ${valor(d.cpf)}, DN: ${dataBR(d.data_nascimento)}.`,
        { espacoDepois: 4 }
      )
    })
    y += 4
  }

  // ---------- Cláusulas ----------
  CLAUSULAS.forEach(item => {
    if (typeof item === 'object') paragrafo(item.titulo, { negrito: true, espacoDepois: 4, justificar: false })
    else paragrafo(item)
  })

  // ---------- Local e data ----------
  const hoje = new Date()
  const mes = hoje.toLocaleDateString('pt-BR', { month: 'long' })
  y += 4
  paragrafo(`${CTG.cidade}, ${hoje.getDate()} de ${mes} de ${hoje.getFullYear()}.`, { justificar: false })

  // ---------- Assinaturas ----------
  garantirEspaco(60)
  y += 20
  const larguraLinha = 75
  const xLinha = (larguraPagina - larguraLinha) / 2
  const assinatura = (nome, papel) => {
    doc.line(xLinha, y, xLinha + larguraLinha, y)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.text(nome, larguraPagina / 2, y + 5, { align: 'center' })
    doc.text(papel, larguraPagina / 2, y + 10, { align: 'center' })
    y += 30
  }
  assinatura(CTG.patrao, 'Patrão')
  assinatura(socio.nome || 'Sócio(a)', 'Sócio(a)')

  // ---------- Cabeçalho (logo) e rodapé em todas as páginas ----------
  const totalPaginas = doc.getNumberOfPages()
  for (let p = 1; p <= totalPaginas; p++) {
    doc.setPage(p)
    if (logo) doc.addImage(logo, 'JPEG', 14, 8, 34, 12) // proporção do logo original (567x201)
    doc.setFont('helvetica', 'bolditalic')
    doc.setFontSize(8)
    const yr = alturaPagina - 18
    doc.text(`Razão Social: ${CTG.razaoSocial} – CNPJ: ${CTG.cnpj}`, larguraPagina / 2, yr, { align: 'center' })
    doc.text(`End: ${CTG.enderecoRodape}`, larguraPagina / 2, yr + 4, { align: 'center' })
    doc.text(CTG.revisao, larguraPagina / 2, yr + 8, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.text(`${p}/${totalPaginas}`, larguraPagina - margem, yr + 8, { align: 'right' })
  }

  const nomeArquivo = `contrato-sociedade-${(socio.nome || 'socio').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')}.pdf`
  if (abrir) window.open(doc.output('bloburl'), '_blank')
  else doc.save(nomeArquivo)
  return doc
}
