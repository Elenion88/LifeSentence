import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const getForDateRange = query({
    args: { startDate: v.string(), endDate: v.string() },
    handler: async (ctx, { startDate, endDate }) => {
        return await ctx.db
            .query("habitCompletions")
            .withIndex("by_date", (q) => q.gte("date", startDate).lte("date", endDate))
            .collect();
    },
});
export const getForMonth = query({
    args: { yearMonth: v.string() },
    handler: async (ctx, { yearMonth }) => {
        const start = `${yearMonth}-01`;
        const end = `${yearMonth}-31`;
        return await ctx.db
            .query("habitCompletions")
            .withIndex("by_date", (q) => q.gte("date", start).lte("date", end))
            .collect();
    },
});
export const toggle = mutation({
    args: { habitId: v.id("habits"), date: v.string(), completed: v.boolean() },
    handler: async (ctx, { habitId, date, completed }) => {
        const existing = await ctx.db
            .query("habitCompletions")
            .withIndex("by_habit_date", (q) => q.eq("habitId", habitId).eq("date", date))
            .unique();
        if (existing) {
            await ctx.db.patch(existing._id, { completed });
        }
        else {
            await ctx.db.insert("habitCompletions", { habitId, date, completed });
        }
    },
});
