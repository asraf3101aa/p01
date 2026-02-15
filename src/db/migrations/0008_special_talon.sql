PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_threads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`author_id` integer NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_threads`("id", "content", "author_id", "is_deleted", "created_at", "updated_at") SELECT "id", "content", "author_id", "is_deleted", "created_at", "updated_at" FROM `threads`;--> statement-breakpoint
DROP TABLE `threads`;--> statement-breakpoint
ALTER TABLE `__new_threads` RENAME TO `threads`;--> statement-breakpoint
PRAGMA foreign_keys=ON;