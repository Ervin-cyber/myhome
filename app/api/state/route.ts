import { db } from "@/src/db";
import { systemState, heatingLog } from "@/src/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const state = await db.select().from(systemState).where(eq(systemState.id, 1));
  return Response.json(state[0]);
}

export async function POST(req: Request) {
  const body = await req.json();
  let { targetTemp, heatingUntil, heatingOn } = body;

  const current_ts = Math.floor(Date.now() / 1000);

  if (heatingUntil > current_ts + 3610) {
    heatingUntil = 0;
  }

  // Get current system state
  const old = await db
    .select()
    .from(systemState)
    .where(eq(systemState.id, 1));

  const previous = old[0];

  // If heating state changed → log it
  if (previous != null && previous?.heatingOn !== heatingOn) {
    await db.insert(heatingLog).values({
      fromState: previous.heatingOn,
      toState: heatingOn
    });
  } else if (previous?.heatingOn !== heatingOn) {
    await db
      .insert(systemState)
      .values({
        id: 1,
        targetTemp,
        heatingUntil,
        heatingOn,
        updatedAt: new Date().toISOString()
      })
  }

  // Update the actual system state
  await db
    .update(systemState)
    .set({
      targetTemp,
      heatingUntil,
      heatingOn,
      updatedAt: new Date().toISOString()
    })
    .where(eq(systemState.id, 1));

  return Response.json({ ok: true });
}