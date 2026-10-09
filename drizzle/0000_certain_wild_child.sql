CREATE TABLE `contact_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(120),
	`territory` varchar(120),
	`workshopInterest` varchar(180) NOT NULL,
	`consentVersion` varchar(24) NOT NULL DEFAULT 'v1-2026-10',
	`consentAt` timestamp NOT NULL,
	`status` enum('subscribed','unsubscribed') NOT NULL DEFAULT 'subscribed',
	`source` varchar(64) NOT NULL DEFAULT 'sitio-encuentro',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contact_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `contact_subscriptions_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` varchar(255),
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('admin','user') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
