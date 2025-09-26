export async function login(user: string, password: string) {
    const response = await fetch(`http://localhost:8080/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json(); // Debe devolver el token
}
