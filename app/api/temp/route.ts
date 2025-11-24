import { db } from "@/src/db";
import { temperatureReadings } from "@/src/schema";

export async function POST(req: Request) {
  const { value } = await req.json();

  if (typeof value !== "number") {
    return Response.json({ error: "Invalid value" }, { status: 400 });
  }

  await db.insert(temperatureReadings).values({
    value,
    timestamp: Date.now(),
  });

  return Response.json({ success: true });
}