CREATE TABLE `admin_audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_user_id` text NOT NULL,
	`actor_email` text NOT NULL,
	`action` text NOT NULL,
	`target_email` text NOT NULL,
	`target_company` text DEFAULT '' NOT NULL,
	`request_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_admin_audit_log_created` ON `admin_audit_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `request_rate_limits` (
	`scope` text NOT NULL,
	`actor_hash` text NOT NULL,
	`window_start` integer NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`scope`, `actor_hash`, `window_start`)
);
--> statement-breakpoint
CREATE INDEX `idx_request_rate_limits_updated` ON `request_rate_limits` (`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_beta_requests_created` ON `beta_requests` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_demo_access_expires` ON `demo_access` (`expires_at`);