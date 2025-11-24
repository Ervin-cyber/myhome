import { db } from "@/src/db";
import { temperatureReadings } from "@/src/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const encoder = new TextEncoder();

  let interval: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      interval = setInterval(async () => {// Send new data every second
        try {
          const latestTemp = await db
            .select()
            .from(temperatureReadings)
            .orderBy(desc(temperatureReadings.timestamp))
            .limit(1);

          if (latestTemp.length === 0) return;

          controller.enqueue(// Try sending only if controller is still open
            encoder.encode(`data: ${JSON.stringify(latestTemp[0])}\n\n`)
          );
        } catch (err) {
          console.error("SSE send error:", err);
        }
      }, 2000);
    },

    cancel() {
      clearInterval(interval); // When client disconnects, cleanup
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