DROP INDEX `users_email_unique`;--> statement-breakpoint
DROP INDEX `users_phone_number_unique`;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `cover` text;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `phone_number`;