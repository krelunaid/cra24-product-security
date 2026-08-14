CREATE TABLE `project_maintenance` (
	`name` text PRIMARY KEY NOT NULL,
	`lease_until` integer NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
