import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const temperatureReadings = sqliteTable("temperature_readings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  value: real("value").notNull(),
  timestamp: integer("timestamp").notNull().default(sql`(unixepoch())`),
});

export type TemperatureReading = typeof temperatureReadings.$inferSelect;

export const systemState = sqliteTable("system_state", {
  id: integer("id").primaryKey().default(1),
  targetTemp: real("target_temp").notNull().default(10),
  heatingUntil: integer("heating_util").default(0),
  heatingOn: integer("heating_on", { mode: "boolean" }).notNull().default(false),
  timestamp: integer("timestamp").notNull().default(sql`(unixepoch())`),
});

export type SystemState = typeof systemState.$inferSelect;

export const heatingLog = sqliteTable("heating_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromState: integer("from_state", { mode: "boolean" }).notNull(),
  toState: integer("to_state", { mode: "boolean" }).notNull(),
  runTime: integer("run_time").default(0),
  timestamp: integer("timestamp").notNull().default(sql`(unixepoch())`),
});

export type HeatingLog = typeof heatingLog.$inferSelect;