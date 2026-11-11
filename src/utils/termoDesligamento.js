import jsPDF from 'jspdf'
import logoTermo from '../assets/logo_ctg_termo.jpg'
import { formatDateBR } from './formattingUtils'

export function gerarTermoDesligamentoPdf(socio, dataDesligamento) {
  const data = formatDateBR(dataDesligamento)

  const doc = new jsPDF({ unit: 'in', format: 'letter' })
  const pageW = 8.5
  const margemX = 1.25
  const larguraTexto = pageW - margemX * 2
  const alturaLinha = 0.2

  const logo = 1.8
  doc.addImage(logoTermo, 'JPEG', (pageW - logo) / 2, 1, logo, logo)

  let y = 1 + logo + 0.55
  doc.setFont('times', 'bold').setFontSize(16)
  doc.text('TERMO DE DESLIGAMENTO DE SÓCIO', pageW / 2, y, { align: 'center' })

  doc.setFont('times', 'normal').setFontSize(12)
  const paragrafos = [
    `Eu, ${socio.nome}, portador(a) do CPF nº ${socio.cpf}, na condição de sócio(a) do CTG Raízes da Tradição, venho por meio deste solicitar meu desligamento do quadro social da entidade, a partir da data ${data}.`,
    'Declaro estar ciente de que, a partir desta data, deixarei de usufruir dos direitos e benefícios concedidos aos sócios, bem como das obrigações e responsabilidades inerentes à condição de associado(a), observadas as disposições estatutárias da entidade.',
    'Sem mais para o momento, firmo o presente termo para os devidos fins.',
  ]

  y += 0.65
  paragrafos.forEach(texto => {
    const linhas = doc.splitTextToSize(texto, larguraTexto)
    doc.text(linhas, margemX, y, { align: 'justify', maxWidth: larguraTexto })
    y += linhas.length * alturaLinha + alturaLinha
  })

  y += alturaLinha
  doc.text(`Charqueadas, ${data}`, margemX, y)
  y += alturaLinha * 4
  doc.text('_'.repeat(46), margemX, y)
  y += alturaLinha
  doc.text('Assinatura do(a) Sócio(a)', margemX, y)

  const nomeArquivo = `Termo_Desligamento_${socio.nome.trim().replace(/\s+/g, '_')}.pdf`
  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  const aba = window.open(url, '_blank')
  if (!aba) {
    doc.save(nomeArquivo)
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
