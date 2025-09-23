import { apiFetch } from "./api";

const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImF1dGhvcml0aWVzIjpbIlJPTEVfQURNSU4iXSwidXNlcklkIjoxLCJlbWFpbCI6ImFkbWluQGluaWEuZ3ViLnV5Iiwibm9tYnJlcyI6IkFkbWluaXN0cmFkb3IiLCJhcGVsbGlkb3MiOiJkZWwgU2lzdGVtYSIsImlhdCI6MTc1ODYzMTI2NiwiZXhwIjoxNzU4NzE3NjY2fQ.OAWsWYSmggpTRn6_lWCU6AiF_9p6u4eS_T9tsX_nRaY";

export const getLotes = async () => {
    const response = await apiFetch("/lotes", {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });
    return response.data;
};

export const createLote = async (loteData: any) => {
    return apiFetch("/api/lotes", {
        method: "POST",
        body: JSON.stringify(loteData),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        },
    });
};
