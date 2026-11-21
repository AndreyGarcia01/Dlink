import axios from "axios";

export const SESSAO_EXPIRADA = "dlink:sessao-expirada";

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@DLink:token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const estavaLogado = Boolean(localStorage.getItem("@DLink:token"));
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      estavaLogado
    ) {
      localStorage.removeItem("@DLink:token");
      localStorage.removeItem("@DLink:user");
      window.dispatchEvent(new Event(SESSAO_EXPIRADA));
    }
    return Promise.reject(error);
  },
);
