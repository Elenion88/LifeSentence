import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getForDateRange = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, { startDate, endDate }) => {
    return await ctx.db
      .query("moodEntries")
      .withIndex("by_date", (q) => q.gte("date", startDate).lte("date", endDate))
      .collect();
  },
});

export const upsert = mutation({
  args: { date: v.string(), mood: v.number(), motivation: v.number() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("moodEntries")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { mood: args.mood, motivation: args.motivation });
    } else {
      await ctx.db.insert("moodEntries", args);
    }
  },
});
