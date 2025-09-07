CREATE TABLE `admin_controls` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`control_type` text DEFAULT 'normal',
	`is_active` integer DEFAULT true,
	`created_by` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `balances` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`symbol` text NOT NULL,
	`available` text DEFAULT '0',
	`locked` text DEFAULT '0',
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `market_data` (
	`id` text PRIMARY KEY NOT NULL,
	`symbol` text NOT NULL,
	`price` text NOT NULL,
	`change_24h` text,
	`volume_24h` text,
	`high_24h` text,
	`low_24h` text,
	`timestamp` integer
);
--> statement-breakpoint
CREATE TABLE `options_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`duration` integer NOT NULL,
	`min_amount` text NOT NULL,
	`profit_percentage` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `trades` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`symbol` text NOT NULL,
	`type` text NOT NULL,
	`direction` text NOT NULL,
	`amount` text NOT NULL,
	`price` text,
	`entry_price` text,
	`exit_price` text,
	`status` text DEFAULT 'pending',
	`duration` integer,
	`expires_at` integer,
	`profit` text,
	`fee` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trading_pairs` (
	`id` text PRIMARY KEY NOT NULL,
	`symbol` text NOT NULL,
	`base_asset` text NOT NULL,
	`quote_asset` text NOT NULL,
	`is_active` integer DEFAULT true,
	`min_trade_amount` text,
	`max_trade_amount` text,
	`price_decimals` integer DEFAULT 8,
	`quantity_decimals` integer DEFAULT 8,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trading_pairs_symbol_unique` ON `trading_pairs` (`symbol`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`symbol` text NOT NULL,
	`amount` text NOT NULL,
	`fee` text,
	`status` text DEFAULT 'pending',
	`tx_hash` text,
	`from_address` text,
	`to_address` text,
	`method` text,
	`currency` text,
	`network_fee` text,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`username` text,
	`password` text,
	`first_name` text,
	`last_name` text,
	`profile_image_url` text,
	`wallet_address` text,
	`role` text DEFAULT 'user',
	`is_active` integer DEFAULT true,
	`admin_notes` text,
	`last_login` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_wallet_address_unique` ON `users` (`wallet_address`);