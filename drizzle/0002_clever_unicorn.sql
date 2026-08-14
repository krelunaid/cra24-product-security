CREATE TABLE `demo_access` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`user_id` text,
	`company` text NOT NULL,
	`role` text DEFAULT 'Tester beta' NOT NULL,
	`beta_request_id` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_demo_access_email` ON `demo_access` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_demo_access_user_id` ON `demo_access` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_demo_access_status` ON `demo_access` (`status`);--> statement-breakpoint
CREATE TABLE `demo_workspaces` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`state_json` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_demo_workspaces_email` ON `demo_workspaces` (`email`);--> statement-breakpoint
CREATE INDEX `idx_demo_workspaces_updated` ON `demo_workspaces` (`updated_at`);