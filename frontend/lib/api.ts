const Api = process.env.NEXT_PUBLIC_API_URL;

export async function getData(path: string) {
  const res = await fetch(`${Api}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error("request failed");
  return res.json();
}