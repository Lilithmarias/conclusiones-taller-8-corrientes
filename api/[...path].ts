import { createApp } from "../server/app";

/**
 * Vercel ejecuta esta aplicación Express para /api/*.
 * El frontend continúa llamando a /api/trpc sin cambios.
 */
export default createApp();
