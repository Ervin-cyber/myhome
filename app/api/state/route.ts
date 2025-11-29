import { db } from "@/src/db";
import { systemState, heatingLog } from "@/src/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const state = await db.select().from(systemState).where(eq(systemState.id, 1));
  return Response.json(state[0]);
}

const getCurrentTimestamp = () => {
  return Math.floor(Date.now() / 1000);
}

export async function POST(req: Request) {
  const body = await req.json();
  let { targetTemp, heatingUntil, heatingOn } = body;

  if (heatingUntil == 15 || heatingUntil == 30) {
    heatingUntil = getCurrentTimestamp() + (60 * heatingUntil);
  } else if (heatingUntil > getCurrentTimestamp() + 3610) {
    heatingUntil = 0;
  }

  const old = await db
    .select()
    .from(systemState)
    .where(eq(systemState.id, 1));

  const previous = old[0];

  if (previous != null && previous?.heatingOn !== heatingOn && heatingOn != null) {
    const lastLog = await db
      .select()
      .from(heatingLog)
      .orderBy(desc(heatingLog.timestamp))
      .limit(1)
      
    await db.insert(heatingLog).values({
      fromState: previous.heatingOn,
      toState: heatingOn,
      runTime: previous?.heatingOn ? getCurrentTimestamp() - lastLog[0]?.timestamp : 0
    });
  } else if (previous?.heatingOn !== heatingOn && heatingOn != null) {
    await db
      .insert(systemState)
      .values({
        id: 1,
        targetTemp,
        heatingUntil,
        heatingOn
      })
  }

  await db
    .update(systemState)
    .set({
      targetTemp,
      heatingUntil,
      heatingOn
    })
    .where(eq(systemState.id, 1));

  return Response.json({ ok: true });
}