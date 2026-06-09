import { apiRequest } from './api'

function mapBackendToFrontend(d) {
  if (!d) return d
  return {
    id: d.id,
    nome: d.nome_completo || d.nome || '',
    cpf: d.cpf || '',
    telefone: d.telefone || '',
    data_nascimento: d.data_nascimento || d.nascimento || null,
    dancarino: typeof d.dancarino === 'boolean' ? d.dancarino : (d.dancarino == 1),
    socio_titular_id: d.socio_titular_id || d.socio_id || null,
  }
}

function mapFrontendToBackend(f) {
  return {
    id: f.id,
    socio_titular_id: f.socio_titular_id ?? f.socio_id ?? null,
    nome_completo: f.nome || f.nome_completo || '',
    cpf: f.cpf || '',
    telefone: f.telefone || '',
    data_nascimento: f.data_nascimento || null,
    dancarino: !!f.dancarino,
  }
}

export const dependenteService = {
  async getAll() {
    const data = await apiRequest('/dependentes')
    return Array.isArray(data) ? data.map(mapBackendToFrontend) : []
  },

  async getBySocioId(socioId) {
    // try query param
    try {
      const data = await apiRequest(`/dependentes?socio_id=${socioId}`)
      return Array.isArray(data) ? data.map(mapBackendToFrontend) : []
    } catch (err) {
      // fallback to nested route
      const data = await apiRequest(`/socios/${socioId}/dependentes`)
      return Array.isArray(data) ? data.map(mapBackendToFrontend) : []
    }
  },

  async create(dep) {
    const payload = mapFrontendToBackend(dep)
    // remove id if null
    if (payload.id == null) delete payload.id
    return apiRequest('/dependentes', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async update(id, dep) {
    const payload = mapFrontendToBackend(dep)
    // ensure id not duplicated in body if backend doesn't expect it
    if (payload.id == null) delete payload.id
    return apiRequest(`/dependentes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  async delete(id) {
    return apiRequest(`/dependentes/${id}`, {
      method: 'DELETE',
    })
  }
}
