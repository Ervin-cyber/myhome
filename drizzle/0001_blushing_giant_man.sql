CREATE TABLE `heating_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_state` integer NOT NULL,
	`to_state` integer NOT NULL,
	`timestamp` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `system_state` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`target_temp` real NOT NULL,
	`heating_on` integer NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `temperature_daily` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`min` real NOT NULL,
	`average` real NOT NULL,
	`max` real NOT NULL
);
