import { pgTable, text, integer, boolean, timestamp, uuid, jsonb, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Characters table
export const characters = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  strength: integer("strength").default(10).notNull(),
  endurance: integer("endurance").default(10).notNull(),
  agility: integer("agility").default(10).notNull(),
  health: integer("health").default(100).notNull(),
  maxHealth: integer("max_health").default(100).notNull(),
  coins: integer("coins").default(100).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Fitness data table
export const fitnessData = pgTable("fitness_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  calories: integer("calories").default(0).notNull(),
  steps: integer("steps").default(0).notNull(),
  exerciseMinutes: integer("exercise_minutes").default(0).notNull(),
  activityType: text("activity_type").default("general").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Quests table
export const quests = pgTable("quests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "daily", "weekly", "achievement"
  target: integer("target").notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  xpReward: integer("xp_reward").default(50).notNull(),
  coinReward: integer("coin_reward").default(25).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Battles table
export const battles = pgTable("battles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  enemyType: text("enemy_type").notNull(),
  playerAction: text("player_action").notNull(),
  victory: boolean("victory").notNull(),
  xpGained: integer("xp_gained").default(0).notNull(),
  coinsGained: integer("coins_gained").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Story progress table
export const storyProgress = pgTable("story_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  currentChapter: integer("current_chapter").default(1).notNull(),
  completedChapters: jsonb("completed_chapters").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  character: one(characters, {
    fields: [users.id],
    references: [characters.userId],
  }),
  fitnessData: many(fitnessData),
  quests: many(quests),
  battles: many(battles),
  storyProgress: one(storyProgress, {
    fields: [users.id],
    references: [storyProgress.userId],
  }),
  achievements: many(achievements),
}));

export const charactersRelations = relations(characters, ({ one }) => ({
  user: one(users, {
    fields: [characters.userId],
    references: [users.id],
  }),
}));

export const fitnessDataRelations = relations(fitnessData, ({ one }) => ({
  user: one(users, {
    fields: [fitnessData.userId],
    references: [users.id],
  }),
}));

export const questsRelations = relations(quests, ({ one }) => ({
  user: one(users, {
    fields: [quests.userId],
    references: [users.id],
  }),
}));

export const battlesRelations = relations(battles, ({ one }) => ({
  user: one(users, {
    fields: [battles.userId],
    references: [users.id],
  }),
}));

export const storyProgressRelations = relations(storyProgress, ({ one }) => ({
  user: one(users, {
    fields: [storyProgress.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertCharacterSchema = createInsertSchema(characters);
export const selectCharacterSchema = createSelectSchema(characters);

export const insertFitnessDataSchema = createInsertSchema(fitnessData);
export const selectFitnessDataSchema = createSelectSchema(fitnessData);

export const insertQuestSchema = createInsertSchema(quests);
export const selectQuestSchema = createSelectSchema(quests);

export const insertBattleSchema = createInsertSchema(battles);
export const selectBattleSchema = createSelectSchema(battles);

export const insertStoryProgressSchema = createInsertSchema(storyProgress);
export const selectStoryProgressSchema = createSelectSchema(storyProgress);

export const insertAchievementSchema = createInsertSchema(achievements);
export const selectAchievementSchema = createSelectSchema(achievements);

// Type exports
export type User = z.infer<typeof selectUserSchema>;
export type Character = z.infer<typeof selectCharacterSchema>;
export type FitnessData = z.infer<typeof selectFitnessDataSchema>;
export type Quest = z.infer<typeof selectQuestSchema>;
export type Battle = z.infer<typeof selectBattleSchema>;
export type StoryProgress = z.infer<typeof selectStoryProgressSchema>;
export type Achievement = z.infer<typeof selectAchievementSchema>;