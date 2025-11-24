import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const temperatureReadings = sqliteTable("temperature_readings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  value: real("value").notNull(),
  timestamp: integer("timestamp").notNull(),
});

export type TemperatureReading = typeof temperatureReadings.$inferSelect;

export const temperatureDaily = sqliteTable("temperature_daily", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  min: real("min").notNull(),
  average: real("average").notNull(),
  max: real("max").notNull(),
});

export type TemperatureDaily = typeof temperatureDaily.$inferSelect;

export const systemState = sqliteTable("system_state", {
  id: integer("id").primaryKey().default(1),
  targetTemp: real("target_temp").notNull(),
  heatingUntil: integer("heating_util"),
  heatingOn: integer("heating_on", { mode: "boolean" }).notNull(),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP")
});

export type SystemState = typeof systemState.$inferSelect;

export const heatingLog = sqliteTable("heating_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromState: integer("from_state", { mode: "boolean" }).notNull(),
  toState: integer("to_state", { mode: "boolean" }).notNull(),
  timestamp: text("timestamp").default("CURRENT_TIMESTAMP")
});

export type HeatingLog = typeof heatingLog.$inferSelect;