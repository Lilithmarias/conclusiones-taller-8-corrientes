import type { VercelRequest, VercelResponse } from "@vercel/node";

const sourceUrl = "https://raw.githubusercontent.com/Lilithmarias/conclusiones-taller-8-corrientes/c090206/vercel-direct/index.html";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).end();
  }

  try {
    const upstream = await fetch(sourceUrl, { headers: { "User-Agent": "Taller8-Consejo-Web/1.0" } });
    if (!upstream.ok) throw new Error(`Fuente no disponible (${upstream.status})`);

    const html = await upstream.text();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(html);
  } catch (error) {
    console.error("[page] No se pudo cargar la página pública", error);
    return res.status(503).send("El sitio se está actualizando. Probá nuevamente en unos minutos.");
  }
}
