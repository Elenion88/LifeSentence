import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("habits").collect();
    },
});
export const getActive = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("habits")
            .withIndex("by_active", (q) => q.eq("isActive", true))
            .collect();
    },
});
export const create = mutation({
    args: { name: v.string(), category: v.string(), order: v.number() },
    handler: async (ctx, args) => {
        return await ctx.db.insert("habits", { ...args, isActive: true });
    },
});
export const update = mutation({
    args: {
        id: v.id("habits"),
        name: v.optional(v.string()),
        category: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
        order: v.optional(v.number()),
    },
    handler: async (ctx, { id, ...updates }) => {
        await ctx.db.patch(id, updates);
    },
});
export const remove = mutation({
    args: { id: v.id("habits") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
    },
});
export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("habits").first();
        if (existing)
            return { message: "Already seeded", count: 0 };
        const habits = [
            { name: "Meditate", category: "Mental", order: 1 },
            { name: "Journal", category: "Mental", order: 2 },
            { name: "Practice gratitude", category: "Mental", order: 3 },
            { name: "Read a book", category: "Mental", order: 4 },
            { name: "Limit negative self-talk", category: "Mental", order: 5 },
            { name: "Practice deep breathing", category: "Mental", order: 6 },
            { name: "Reflect on the day", category: "Mental", order: 7 },
            { name: "Learn something new", category: "Mental", order: 8 },
            { name: "Visualization/goal review", category: "Mental", order: 9 },
            { name: "Digital detox time", category: "Mental", order: 10 },
            { name: "Exercise", category: "Physical", order: 1 },
            { name: "Stretch", category: "Physical", order: 2 },
            { name: "Walk 10,000 steps", category: "Physical", order: 3 },
            { name: "Drink enough water", category: "Physical", order: 4 },
            { name: "Take vitamins", category: "Physical", order: 5 },
            { name: "Eat vegetables", category: "Physical", order: 6 },
            { name: "Avoid sugary drinks", category: "Physical", order: 7 },
            { name: "Sleep 7-8 hours", category: "Physical", order: 8 },
            { name: "Posture check", category: "Physical", order: 9 },
            { name: "Go outside/get sunlight", category: "Physical", order: 10 },
            { name: "Eat breakfast", category: "Nutrition", order: 1 },
            { name: "Cook a meal at home", category: "Nutrition", order: 2 },
            { name: "Track calories/macros", category: "Nutrition", order: 3 },
            { name: "Eat fruit", category: "Nutrition", order: 4 },
            { name: "Avoid late-night snacking", category: "Nutrition", order: 5 },
            { name: "Limit processed foods", category: "Nutrition", order: 6 },
            { name: "Work on a personal project", category: "Productivity", order: 1 },
            { name: "Study or practice a skill", category: "Productivity", order: 2 },
            { name: "Review goals", category: "Productivity", order: 3 },
            { name: "Plan the day", category: "Productivity", order: 4 },
            { name: "Prioritize top 3 tasks", category: "Productivity", order: 5 },
            { name: "Inbox/email cleanup", category: "Productivity", order: 6 },
            { name: "Declutter workspace", category: "Productivity", order: 7 },
            { name: "Practice typing or writing", category: "Productivity", order: 8 },
            { name: "Read industry news", category: "Productivity", order: 9 },
            { name: "Limit social media", category: "Focus", order: 1 },
            { name: "No phone first 30 min", category: "Focus", order: 2 },
            { name: "No phone before bed", category: "Focus", order: 3 },
            { name: "Focus work session (Pomodoro)", category: "Focus", order: 4 },
            { name: "Clear desktop files", category: "Focus", order: 5 },
            { name: "Reach out to a friend", category: "Relationships", order: 1 },
            { name: "Compliment someone", category: "Relationships", order: 2 },
            { name: "Spend quality time with family", category: "Relationships", order: 3 },
            { name: "Express appreciation", category: "Relationships", order: 4 },
            { name: "Practice active listening", category: "Relationships", order: 5 },
            { name: "Make the bed", category: "Organization", order: 1 },
            { name: "Clean for 10 minutes", category: "Organization", order: 2 },
            { name: "Track expenses", category: "Organization", order: 3 },
            { name: "Prepare for tomorrow", category: "Organization", order: 4 },
            { name: "Practice a hobby", category: "Organization", order: 5 },
        ];
        let count = 0;
        for (const h of habits) {
            await ctx.db.insert("habits", { ...h, isActive: true });
            count++;
        }
        return { message: "Seeded", count };
    },
});
