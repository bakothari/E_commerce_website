const API = process.env.NEXT_PUBLIC_API_URL;

export async function cartRequest(path = "", method = "GET", body?: object) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("NOT_LOGGED_IN");

    const res = await fetch(`${API}/cart${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Something went wrong");

    // tells the Navbar badge to refresh after any change
    if (method !== "GET") window.dispatchEvent(new Event("cart-change"));
    return data;
}