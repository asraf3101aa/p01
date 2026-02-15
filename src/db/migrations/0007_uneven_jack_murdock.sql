ALTER TABLE `users` ADD `name` text(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `first_name`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `last_name`;