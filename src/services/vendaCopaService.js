import { apiRequest } from "./api";

export const vendaCopaService = {
  getAll() {
    return apiRequest("/copa");
  },

  create(data) {
    return apiRequest("/copa", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return apiRequest(`/copa/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id) {
    return apiRequest(`/copa/${id}`, {
      method: "DELETE",
    });
  },
};
