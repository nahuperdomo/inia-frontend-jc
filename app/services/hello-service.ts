import { apiFetch } from "./api";

export async function getHello() {
  return apiFetch("/api/hello"); // Se conecta a http://localhost:8080/hello
}
