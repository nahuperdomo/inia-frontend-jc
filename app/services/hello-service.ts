import { apiFetch } from "./api";

export async function getHello() {
  return apiFetch("/api/hello"); 
}
