import { NextResponse } from "next/server";
import type { z } from "zod";

type Parsed<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

/** Reads a JSON body and validates it, returning a 400 response on failure. */
export async function parseJson<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<Parsed<z.infer<T>>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return {
      ok: false,
      response: NextResponse.json(
        { error: issue?.message ?? "Invalid request", field: issue?.path[0] },
        { status: 400 },
      ),
    };
  }
  return { ok: true, data: result.data };
}
