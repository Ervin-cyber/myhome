import { db } from "@/src/db";
import { systemState, temperatureReadings } from "@/src/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
    const state = await db.select().from(systemState).where(eq(systemState.id, 1));
    const latestTemp = await db
        .select()
        .from(temperatureReadings)
        .orderBy(desc(temperatureReadings.timestamp))
        .limit(1);

    return Response.json({
        'temperature': latestTemp[0]?.value,
        'last_updated': latestTemp[0]?.timestamp,
        'set_temp': state[0]?.targetTemp,
        'heating_until': state[0]?.heatingUntil,
    });
}