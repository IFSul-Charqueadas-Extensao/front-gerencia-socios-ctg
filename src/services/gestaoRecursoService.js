import { apiRequest } from "./api";

export const gestaoRecursoService = {
  getAll() {
    return apiRequest("/gestao-recursos");
  },

  getById(id) {
    return apiRequest(`/gestao-recursos/${id}`);
  },

  create(data) {
    return apiRequest("/gestao-recursos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return apiRequest(`/gestao-recursos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id) {
    return apiRequest(`/gestao-recursos/${id}`, {
      method: "DELETE",
    });
  },
};

