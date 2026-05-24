export function calcularStatusSocio(socio, mensalidadesData) {
  // Se o sócio estiver Inativo, seu status cadastral global de mensalidade é Inativo
  if (socio.status === 'Inativo') {
    return 'Inativo'
  }

  const hoje = new Date()
  const currentYear = hoje.getFullYear()
  const currentMonth = hoje.getMonth() + 1 // 1-12

  // Calcular o limite de lookback: 4 meses anteriores ao mês atual
  // Ex: se hoje é Maio/2026 (5), o limite de 4 meses anteriores é Janeiro/2026 (1)
  let limiteAno = currentYear
  let limiteMes = currentMonth - 4
  if (limiteMes <= 0) {
    limiteAno -= 1
    limiteMes += 12
  }

  // Parse da data de admissão (entrada) do sócio
  let entradaAno = 0
  let entradaMes = 0
  if (socio.data_entrada) {
    const partes = socio.data_entrada.split('-')
    entradaAno = parseInt(partes[0], 10)
    entradaMes = parseInt(partes[1], 10)
  }

  // Filtrar as mensalidades do sócio titular
  const socioMensalidades = (mensalidadesData || []).filter(
    m => m.socio_id === socio.id && !m.dependente_id
  )

  // 1. Verificar se há alguma mensalidade de MESES ANTERIORES que não esteja paga,
  // mas SOMENTE dentro da janela de lookback de 4 meses E após a admissão do sócio
  const temAtrasoAnterior = socioMensalidades.some(m => {
    // Competência da mensalidade é um mês anterior ao atual?
    const isPastPeriod = m.ano < currentYear || (m.ano === currentYear && m.mes < currentMonth)
    
    // Está dentro dos 4 meses retroativos?
    const dentroDoLookback = m.ano > limiteAno || (m.ano === limiteAno && m.mes >= limiteMes)

    // O sócio já estava admitido?
    const jaEstavaCadastrado = m.ano > entradaAno || (m.ano === entradaAno && m.mes >= entradaMes)

    return isPastPeriod && dentroDoLookback && jaEstavaCadastrado && m.status === 'Atrasado'
  })

  if (temAtrasoAnterior) {
    return 'Atrasado'
  }

  // 2. Verificar o status do MÊS ATUAL
  const jaEstavaCadastradoNoMesAtual = currentYear > entradaAno || (currentYear === entradaAno && currentMonth >= entradaMes)

  if (jaEstavaCadastradoNoMesAtual) {
    const mensalidadeAtual = socioMensalidades.find(m => m.ano === currentYear && m.mes === currentMonth)
    
    if (mensalidadeAtual) {
      if (mensalidadeAtual.status === 'Pago') {
        return 'Em dia'
      } else {
        // no mês atual, fica pendente até o final do mês antes de ser considerado em atraso
        return 'Pendente'
      }
    }

    // Se ainda não foi criada no banco, fica como Pendente
    return 'Pendente'
  }

  // Se a admissão for no futuro, considera-se em dia
  return 'Em dia'
}
