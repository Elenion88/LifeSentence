import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  habits: defineTable({
    name: v.string(),
    category: v.string(),
    isActive: v.boolean(),
    order: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_category_order", ["category", "order"])
    .index("by_active", ["isActive"]),

  habitCompletions: defineTable({
    habitId: v.id("habits"),
    date: v.string(),
    completed: v.boolean(),
  })
    .index("by_habit_date", ["habitId", "date"])
    .index("by_date", ["date"])
    .index("by_habit", ["habitId"]),

  tasks: defineTable({
    title: v.string(),
    date: v.string(),
    completed: v.boolean(),
    isRecurring: v.boolean(),
    habitId: v.optional(v.id("habits")),
  })
    .index("by_date", ["date"])
    .index("by_recurring", ["isRecurring"]),

  taskCompletions: defineTable({
    taskId: v.id("tasks"),
    date: v.string(),
    completed: v.boolean(),
  })
    .index("by_task_date", ["taskId", "date"])
    .index("by_date", ["date"]),

  moodEntries: defineTable({
    date: v.string(),
    mood: v.number(),
    motivation: v.number(),
  }).index("by_date", ["date"]),
});
