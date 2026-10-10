import type { VercelRequest, VercelResponse } from "@vercel/node";
import mysql, { type Pool } from "mysql2/promise";

const interests = new Set([
  "Cupo laboral travesti-trans",
  "Activismos travesti, trans, transgénero",
  "Otro taller / acompañar la red",
]);

let pool: Pool | null = null;

function getPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("Base de datos no configurada.");
  if (!pool) pool = mysql.createPool(databaseUrl);
  return pool;
}

function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const email = text(body.email, 320).toLowerCase();
  const name = text(body.name, 120) || null;
  const territory = text(body.territory, 120) || null;
  const workshopInterest = text(body.workshopInterest, 180);
  const consent = body.consent === true;
  const honeypot = text(body.website, 200);

  if (honeypot) return res.status(400).json({ error: "No se pudo procesar la inscripción." });
  if (!consent) return res.status(400).json({ error: "Es necesario aceptar el uso de los datos para inscribirte." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Ingresá un correo electrónico válido." });
  }
  if (!interests.has(workshopInterest)) {
    return res.status(400).json({ error: "Seleccioná un taller o espacio válido." });
  }

  try {
    const now = new Date();
    await getPool().execute(
      `INSERT INTO contact_subscriptions
        (email, name, territory, workshopInterest, consentVersion, consentAt, status, source, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'v1-2026-10', ?, 'subscribed', 'sitio-encuentro', ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         territory = VALUES(territory),
         workshopInterest = VALUES(workshopInterest),
         consentVersion = 'v1-2026-10',
         consentAt = VALUES(consentAt),
         status = 'subscribed',
         updatedAt = VALUES(updatedAt)`,
      [email, name, territory, workshopInterest, now, now, now],
    );

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error("[contact] No se pudo guardar la inscripción", error);
    return res.status(500).json({ error: "La red de contacto no está disponible en este momento. Probá nuevamente en unos minutos." });
  }
}
