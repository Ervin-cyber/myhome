import { db } from "@/src/db";
import { temperatureReadings } from "@/src/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const encoder = new TextEncoder();

  let interval: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {

      async function sendTemperature() {
        try {
          const latestTemp = await db
            .select({
              value: temperatureReadings.value,
              timestamp: temperatureReadings.timestamp,
            })
            .from(temperatureReadings)
            .orderBy(desc(temperatureReadings.timestamp))
            .limit(1) ?? [];
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(latestTemp[0])}\n\n`)
          );
        } catch (error) {
          console.error("SSE send error:", error);
        }
      }

      sendTemperature();

      interval = setInterval(async () => {
        await sendTemperature();
      }, 5000);
    },

    cancel() {
      clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}