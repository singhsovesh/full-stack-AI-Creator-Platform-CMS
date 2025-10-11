import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    createdAt: v.number(),
    lastActive: v.number(),
    lastActiveAt: v.optional(v.number()), // Added this field
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_email", { searchField: "email" }),

    posts: defineTable({
      title: v.string(),
      content: v.string(),
      status: v.union(v.literal("draft"), v.literal("published")), 

     // Author relationship
      authorId: v.id("users"),
      
    // Content metadata
    tags: v.array(v.string()),
    category: v.optional(v.string()), // Single category
    featuredImage: v.optional(v.string()), // ImageKit URL

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
    scheduledFor: v.optional(v.number()), // For scheduled publishing

    // Analytics
    views: v.number(),
    likes: v.number(),
    })

    .index("by_author", ["authorId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_createdAt", ["createdAt"])
    .index("by_updatedAt", ["updatedAt"])
    .index("by_publishedAt", ["publishedAt"])
    .searchIndex("search_title_content", { searchField: "title"  }),

    comments: defineTable({
      postId: v.id("posts"),
      authorId: v.optional(v.id("users")), // Optional for anonymous comments
      authorName: v.string(), // For anonymous or display name
      authorEmail: v.optional(v.string()), // Optional for anonymous comments
      
      content: v.string(),
      status: v.union(
        v.literal("approved"),
        v.literal("pending"),
        v.literal("rejected")
      ),
      createdAt: v.number(),

    })
    .index("by_post", ["postId"])
    .index("by_post_status", ["postId", "status"])
    .index("by_author", ["authorId"]),

    likes: defineTable({
      postId: v.id("posts"),
      userId: v.optional(v.id("users")), // Optional for anonymous likes


      createdAt: v.number(),
    })

    .index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_post_user", ["postId", "userId"]), // Prevent duplicate likes


    follows: defineTable({
      followerId: v.id("users"), // User doing the following
      followingId: v.id("users"), // User being followed
      createdAt: v.number(),
    })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_relationship", ["followerId", "followingId"]), // Prevent duplicate follows

    dailyStats: defineTable({
      postId: v.id("posts"),
      date: v.string(), // YYYY-MM-DD format
      views: v.number(),

      createdAt: v.number(),
      updatedAt: v.number(),
    })
    .index("by_post_date", ["postId", "date"]) // Unique constraint
    .index("by_date", ["date"])
    .index("by_post", ["postId"]),
});