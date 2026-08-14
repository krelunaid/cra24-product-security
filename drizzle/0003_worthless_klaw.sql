ALTER TABLE `demo_access` ADD `expires_at` text;--> statement-breakpoint
ALTER TABLE `demo_workspaces` ADD `revision` integer DEFAULT 0 NOT NULL;