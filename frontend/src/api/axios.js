import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV ? "http://localhost:5000/api" : "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const API_ORIGIN = import.meta.env.DEV ? "http://localhost:5000" : "";

export function fileUrl(path) {
  if (!path) return null;
  return `${API_ORIGIN}${path}`;
}

export default api;