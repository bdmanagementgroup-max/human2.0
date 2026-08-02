import { pgTable, uuid, varchar, text, timestamp, boolean, integer, pgEnum, index, uniqueIndex, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["member", "admin", "super_admin"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "trialing",
  "incomplete",
  "paused",
]);
export const contentTypeEnum = pgEnum("content_type", [
  "workflow",
  "notebook",
  "case-study",
  "workshop",
  "template",
  "playbook",
  "guide",
  "video",
  "audio",
  "code",
]);
export const contentTrackEnum = pgEnum("content_track", [
  "infrastructure",
  "video",
  "agents",
  "voice",
  "marketing",
  "creative",
  "sales",
  "privacy",
  "finetuning",
]);

// Users table (synced with Clerk)
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    imageUrl: text("image_url"),
    role: userRoleEnum("role").default("member").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    clerkIdIdx: uniqueIndex("users_clerk_id_idx").on(table.clerkId),
    emailIdx: index("users_email_idx").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
  })
);

// Subscriptions table
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    paypalPayerId: varchar("paypal_payer_id", { length: 255 }),
    paypalSubscriptionId: varchar("paypal_subscription_id", { length: 255 }).unique(),
    paypalPlanId: varchar("paypal_plan_id", { length: 255 }),
    status: subscriptionStatusEnum("status").default("incomplete").notNull(),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    trialStart: timestamp("trial_start", { withTimezone: true }),
    trialEnd: timestamp("trial_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: uniqueIndex("subscriptions_user_id_idx").on(table.userId),
    paypalPayerIdx: index("subscriptions_paypal_payer_idx").on(table.paypalPayerId),
    paypalSubscriptionIdx: uniqueIndex("subscriptions_paypal_subscription_idx").on(table.paypalSubscriptionId),
    statusIdx: index("subscriptions_status_idx").on(table.status),
  })
);

// Content tracks
export const tracks = pgTable(
  "tracks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: contentTrackEnum("key").notNull().unique(),
    title: varchar("title", { length: 100 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }), // lucide icon name
    color: varchar("color", { length: 20 }).default("cyan"), // tailwind color
    order: integer("order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    keyIdx: uniqueIndex("tracks_key_idx").on(table.key),
    orderIdx: index("tracks_order_idx").on(table.order),
  })
);

// Content items
export const content = pgTable(
  "content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trackId: uuid("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    type: contentTypeEnum("type").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    description: text("description"),
    body: text("body"), // markdown content
    videoUrl: text("video_url"), // YouTube, Vimeo, etc.
    videoProvider: varchar("video_provider", { length: 20 }), // youtube, vimeo, mux
    thumbnailUrl: text("thumbnail_url"),
    downloadUrl: text("download_url"), // for templates, code, pdfs
    durationMinutes: integer("duration_minutes"),
    n8nWorkflowJson: jsonb("n8n_workflow_json"),
    demoVideoUrl: text("demo_video_url"),
    estimatedTimeMinutes: integer("estimated_time_minutes"),
    difficulty: varchar("difficulty", { length: 20 }).default("beginner"), // beginner, intermediate, advanced
    tags: text("tags").array(),
    isPublished: boolean("is_published").default(false).notNull(),
    isPremium: boolean("is_premium").default(true).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    trackIdIdx: index("content_track_id_idx").on(table.trackId),
    slugIdx: uniqueIndex("content_slug_idx").on(table.slug),
    publishedIdx: index("content_published_idx").on(table.isPublished, table.publishedAt),
    typeIdx: index("content_type_idx").on(table.type),
  })
);

// User progress tracking
export const userProgress = pgTable(
  "user_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contentId: uuid("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    completed: boolean("completed").default(false).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    progressPercent: integer("progress_percent").default(0).notNull(), // for videos
    lastPositionSeconds: integer("last_position_seconds").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userContentIdx: uniqueIndex("user_progress_user_content_idx").on(table.userId, table.contentId),
    userIdIdx: index("user_progress_user_id_idx").on(table.userId),
    contentIdIdx: index("user_progress_content_id_idx").on(table.contentId),
  })
);

// Webhooks log for debugging
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paypalEventId: varchar("paypal_event_id", { length: 255 }).notNull().unique(),
    type: varchar("type", { length: 100 }).notNull(),
    payload: text("payload").notNull(), // JSON string
    processed: boolean("processed").default(false).notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    paypalEventIdx: uniqueIndex("webhook_events_paypal_event_idx").on(table.paypalEventId),
    typeIdx: index("webhook_events_type_idx").on(table.type),
    processedIdx: index("webhook_events_processed_idx").on(table.processed),
  })
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  progress: many(userProgress),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const tracksRelations = relations(tracks, ({ many }) => ({
  content: many(content),
}));

export const contentRelations = relations(content, ({ one, many }) => ({
  track: one(tracks, {
    fields: [content.trackId],
    references: [tracks.id],
  }),
  progress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  content: one(content, {
    fields: [userProgress.contentId],
    references: [content.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;
export type Content = typeof content.$inferSelect;
export type NewContent = typeof content.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;