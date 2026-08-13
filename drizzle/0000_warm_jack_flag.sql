CREATE TABLE `beta_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`full_name` text NOT NULL,
	`company` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`product_type` text NOT NULL,
	`priority` text NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`case_summary` text DEFAULT '' NOT NULL,
	`marketing_consent` integer DEFAULT false NOT NULL,
	`locale` text DEFAULT 'it' NOT NULL,
	`utm_source` text DEFAULT '' NOT NULL,
	`utm_medium` text DEFAULT '' NOT NULL,
	`utm_campaign` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Nuova' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
