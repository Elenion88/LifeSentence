import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const getForDate = query({
    args: { date: v.string() },
    handler: async (ctx, { date }) => {
        const oneTime = await ctx.db
            .query("tasks")
            .withIndex("by_date", (q) => q.eq("date", date))
            .filter((q) => q.eq(q.field("isRecurring"), false))
            .collect();
        const recurring = await ctx.db
            .query("tasks")
            .withIndex("by_recurring", (q) => q.eq("isRecurring", true))
            .collect();
        const completions = await ctx.db
            .query("taskCompletions")
            .withIndex("by_date", (q) => q.eq("date", date))
            .collect();
        const completionMap = new Map(completions.map((c) => [c.taskId.toString(), c.completed]));
        const result = [
            ...oneTime.map((t) => ({ ...t, completedForDate: t.completed })),
            ...recurring.map((t) => ({ ...t, completedForDate: completionMap.get(t._id.toString()) ?? false })),
        ];
        return result;
    },
});
export const getRecurring = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("tasks")
            .withIndex("by_recurring", (q) => q.eq("isRecurring", true))
            .collect();
    },
});
export const create = mutation({
    args: {
        title: v.string(),
        date: v.string(),
        isRecurring: v.boolean(),
        habitId: v.optional(v.id("habits")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("tasks", { ...args, completed: false });
    },
});
export const toggleOneTime = mutation({
    args: { id: v.id("tasks"), completed: v.boolean() },
    handler: async (ctx, { id, completed }) => {
        await ctx.db.patch(id, { completed });
    },
});
export const toggleRecurring = mutation({
    args: { taskId: v.id("tasks"), date: v.string(), completed: v.boolean() },
    handler: async (ctx, { taskId, date, completed }) => {
        const existing = await ctx.db
            .query("taskCompletions")
            .withIndex("by_task_date", (q) => q.eq("taskId", taskId).eq("date", date))
            .unique();
        if (existing) {
            await ctx.db.patch(existing._id, { completed });
        }
        else {
            await ctx.db.insert("taskCompletions", { taskId, date, completed });
        }
    },
});
export const remove = mutation({
    args: { id: v.id("tasks") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
    },
});
export const update = mutation({
    args: { id: v.id("tasks"), title: v.string() },
    handler: async (ctx, { id, title }) => {
        await ctx.db.patch(id, { title });
    },
});
