import { describe, expect, it } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "../api/contact";

type Captured = { statusCode: number; body?: unknown; allow?: string };

function responseStub(captured: Captured): VercelResponse {
  const response = {
    status: (code: number) => {
      captured.statusCode = code;
      return response;
    },
    json: (body: unknown) => {
      captured.body = body;
      return response;
    },
    setHeader: (name: string, value: string) => {
      if (name === "Allow") captured.allow = value;
      return response;
    },
  };
  return response as unknown as VercelResponse;
}

describe("contact API", () => {
  it("no guarda datos sin consentimiento", async () => {
    const captured: Captured = { statusCode: 200 };
    await handler(
      { method: "POST", body: { email: "companera@example.org", workshopInterest: "Cupo laboral travesti-trans", consent: false } } as VercelRequest,
      responseStub(captured),
    );

    expect(captured.statusCode).toBe(400);
    expect(captured.body).toEqual({ error: "Es necesario aceptar el uso de los datos para inscribirte." });
  });

  it("rechaza métodos distintos de POST", async () => {
    const captured: Captured = { statusCode: 200 };
    await handler({ method: "GET", body: {} } as VercelRequest, responseStub(captured));

    expect(captured.statusCode).toBe(405);
    expect(captured.allow).toBe("POST");
  });
});
