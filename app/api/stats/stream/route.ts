import { db } from "@/src/db";
import { heatingLog, temperatureReadings } from "@/src/schema";
import { and, eq, sql } from "drizzle-orm";

export async function GET() {
    const encoder = new TextEncoder();

    let interval: NodeJS.Timeout;

    const stream = new ReadableStream({
        start(controller) {

            async function sendTemperature() {
                try {
                    const tempStats = await db
                        .select({
                            min: sql<number>`MIN(${temperatureReadings.value})`,
                            max: sql<number>`MAX(${temperatureReadings.value})`,
                            avg: sql<number>`AVG(${temperatureReadings.value})`,
                        })
                        .from(temperatureReadings)
                        .where(
                            sql`${temperatureReadings.timestamp} >= strftime('%s', 'now') - 86400` //last 24h
                        )
                        .limit(1) ?? [];

                    const runTimeStat = await db
                        .select({
                            sum: sql<number>`SUM(${heatingLog.runTime})`,
                        })
                        .from(heatingLog)
                        .where(
                            sql`${heatingLog.timestamp} >= strftime('%s', 'now') - 86400` //last 24h
                        )
                        .limit(1) ?? [];

                    const countOnStat = await db
                        .select({
                            count: sql<number>`COUNT(${heatingLog.runTime})`,
                        })
                        .from(heatingLog)
                        .where(
                            and(
                                sql`${heatingLog.timestamp} >= strftime('%s', 'now') - 86400`,
                                eq(heatingLog.fromState, false),
                                eq(heatingLog.toState, true),
                            )
                        )
                        .limit(1) ?? [];

                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({
                            'temp_min': tempStats[0]?.min,
                            'temp_max': tempStats[0]?.max,
                            'temp_avg': tempStats[0]?.avg,
                            'run_time': runTimeStat[0]?.sum,
                            'count_on': countOnStat[0]?.count,
                        })}\n\n`)
                    );
                } catch (error) {
                    console.error("SSE send error:", error);
                }
            }

            sendTemperature();

            interval = setInterval(async () => {
                await sendTemperature();
            }, 20000);
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