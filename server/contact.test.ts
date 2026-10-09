import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  upsertContactSubscription: vi.fn(),
  notifyOwner: vi.fn(),
}));

vi.mock("./db", () => ({
  upsertContactSubscription: mocks.upsertContactSubscription,
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: mocks.notifyOwner,
}));

import { appRouter } from "./routers";

const ctx = {} as TrpcContext;

const validSubscription = {
  email: "companera@example.org",
  name: "Compañera",
  territory: "Santa Fe",
  workshopInterest: "Cupo laboral travesti-trans" as const,
  consent: true as const,
  website: "",
};

describe("contact.subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.upsertContactSubscription.mockResolvedValue({
      email: validSubscription.email,
      territory: validSubscription.territory,
      workshopInterest: validSubscription.workshopInterest,
      consentAt: new Date("2026-10-09T23:00:00.000Z"),
    });
    mocks.notifyOwner.mockResolvedValue(true);
  });

  it("guarda una inscripción consentida y avisa a la titular del proyecto", async () => {
    const caller = appRouter.createCaller(ctx);

    await expect(caller.contact.subscribe(validSubscription)).resolves.toMatchObject({ success: true });
    expect(mocks.upsertContactSubscription).toHaveBeenCalledWith({
      email: "companera@example.org",
      name: "Compañera",
      territory: "Santa Fe",
      workshopInterest: "Cupo laboral travesti-trans",
    });
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({
      title: "Nueva inscripción a la red de contacto",
      content: expect.stringContaining("companera@example.org"),
    }));
  });

  it("rechaza una inscripción sin consentimiento sin guardar datos", async () => {
    const caller = appRouter.createCaller(ctx);

    await expect(caller.contact.subscribe({ ...validSubscription, consent: false })).rejects.toThrow();
    expect(mocks.upsertContactSubscription).not.toHaveBeenCalled();
    expect(mocks.notifyOwner).not.toHaveBeenCalled();
  });

  it("rechaza el campo oculto anti-spam sin guardar datos", async () => {
    const caller = appRouter.createCaller(ctx);

    await expect(caller.contact.subscribe({ ...validSubscription, website: "https://spam.example" })).rejects.toThrow();
    expect(mocks.upsertContactSubscription).not.toHaveBeenCalled();
  });
});
