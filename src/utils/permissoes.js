/**
 * Níveis de permissão — cópia da matriz definida no backend
 * (back-gerencia-socios-ctg/src/Util/Permissao.php).
 *
 * ATENÇÃO: isto serve APENAS para esconder ou desabilitar botões. Não é
 * controle de acesso — quem decide de fato é o backend, que valida o token
 * e o perfil a cada requisição. Ao alterar a matriz aqui, altere lá também.
 */

export const PAPEIS = {
  ADMIN: 'admin',
  FINANCEIRO: 'financeiro',
  SOCIOS: 'socios',
  CONSULTA: 'consulta',
}

/** Rótulos legíveis, para exibição na interface */
export const ROTULO_PAPEL = {
  admin: 'Administrador',
  financeiro: 'Financeiro',
  socios: 'Sócios',
  consulta: 'Consulta',
}

/** Descrição do que cada perfil pode fazer — usada na tela de usuários */
export const DESCRICAO_PAPEL = {
  admin: 'Acesso total, incluindo a gestão de usuários',
  financeiro: 'Vê tudo e altera mensalidades e pagamentos',
  socios: 'Vê tudo e altera sócios, dependentes, categorias e cartões',
  consulta: 'Somente visualização, sem nenhuma alteração',
}

/** Recursos que cada perfil pode alterar (criar, editar, excluir) */
const ESCRITA = {
  admin: [
    'socios',
    'dependentes',
    'categorias',
    'cartao-tradicionalista',
    'mensalidades',
    'pagamentos',
    'usuarios',
  ],
  socios: ['socios', 'dependentes', 'categorias', 'cartao-tradicionalista'],
  financeiro: ['mensalidades', 'pagamentos'],
  consulta: [],
}

/** Recursos visíveis apenas para o admin, inclusive na leitura */
const SOMENTE_ADMIN = ['usuarios']

/** Indica se o perfil pode alterar o recurso */
export function podeEscrever(papel, recurso) {
  return (ESCRITA[papel] ?? []).includes(recurso)
}

/** Indica se o perfil pode ao menos visualizar o recurso */
export function podeLer(papel, recurso) {
  if (SOMENTE_ADMIN.includes(recurso)) return papel === PAPEIS.ADMIN
  return Boolean(papel)
}
