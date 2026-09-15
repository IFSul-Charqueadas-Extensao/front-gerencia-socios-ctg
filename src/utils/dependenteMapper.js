import { apiRequest } from '../services/api'

export function mapBackendToFrontendDependente(d) {
  if (!d) return d
  return {
    id: d.id,
    nome: d.nome_completo || d.nome || '',
    cpf: d.cpf || '',
    telefone: d.telefone || '',
    data_nascimento: d.data_nascimento || d.nascimento || null,
    dancarino: typeof d.dancarino === 'boolean' ? d.dancarino : (d.dancarino == 1),
    categoria: d.categoria || null,
    socio_titular_id: d.socio_titular_id || d.socio_id || null,
    // Espelha sempre o status do sócio titular, exceto quando o
    // dependente já é maior de idade (regra aplicada no back-end);
    // não é um campo editável independentemente pelo usuário.
    status: d.status || 'Ativo',
    // Calculada pelo banco a partir de data_nascimento (18 anos depois).
    // Mostrada só como informação; não é editável.
    data_maioridade: d.data_maioridade || null,
  }
}

export function mapFrontendToBackendDependente(f) {
  return {
    id: f.id,
    socio_titular_id: f.socio_titular_id ?? f.socio_id ?? null,
    nome_completo: f.nome || f.nome_completo || '',
    cpf: f.cpf || '',
    telefone: f.telefone || '',
    data_nascimento: f.data_nascimento || null,
    dancarino: !!f.dancarino,
    categoria: f.categoria || null,
  }
}