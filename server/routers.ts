import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { upsertContactSubscription } from "./db";

const subscriptionInput = z.object({
  email: z.string().trim().email("Ingresá un correo electrónico válido.").max(320),
  name: z.string().trim().max(120).optional(),
  territory: z.string().trim().max(120).optional(),
  workshopInterest: z.enum(["Cupo laboral travesti-trans", "Activismos travesti, trans, transgénero", "Otro taller / acompañar la red"]),
  consent: z.literal(true, { error: "Es necesario aceptar el uso de estos datos para inscribirte." }),
  website: z.string().max(0).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  contact: router({
    subscribe: publicProcedure.input(subscriptionInput).mutation(async ({ input }) => {
      if (input.website) throw new Error("No se pudo procesar la inscripción.");

      const contact = await upsertContactSubscription({
        email: input.email,
        name: input.name,
        territory: input.territory,
        workshopInterest: input.workshopInterest,
      });

      await notifyOwner({
        title: "Nueva inscripción a la red de contacto",
        content: `${contact.email} · ${contact.territory || "Sin territorio informado"} · ${contact.workshopInterest}`,
      });

      return { success: true, subscribedAt: contact.consentAt } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
