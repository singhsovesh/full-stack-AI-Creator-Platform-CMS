import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Toggle like on a post
export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.optional(v.id("users")), // Optional for anonymous likes
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post || post.status !== "published") {
      throw new Error("Post not found or not published");
    }

    let userId = args.userId;

    // If no userId provided, try to get from auth
    if (!userId) {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        const user = await ctx.db
          .query("users")
          .filter((q) =>
            q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier)
          )
          .unique();
        userId = user?._id;
      }
    }

    // Check if already liked
    let existingLike;
    if (userId) {
      existingLike = await ctx.db
        .query("likes")
        .filter((q) =>
          q.and(
            q.eq(q.field("postId"), args.postId),
            q.eq(q.field("userId"), userId)
          )
        )
        .unique();
    }

    // Ensure post.likes is a valid number
    const currentLikes = Number.isFinite(post.likes) ? post.likes : 0;

    if (existingLike) {
      // Unlike - remove the like
      await ctx.db.delete(existingLike._id);

      const updatedLikes = Math.max(0, currentLikes - 1);

      await ctx.db.patch(args.postId, {
        likes: updatedLikes, // ✅ use `likes`
      });

      return { liked: false, likes: updatedLikes };
    } else {
      // Like - add the like
      await ctx.db.insert("likes", {
        postId: args.postId,
        userId: userId,
        createdAt: Date.now(),
      });

      const updatedLikes = currentLikes + 1;

      await ctx.db.patch(args.postId, {
        likes: updatedLikes, // ✅ use `likes`
      });

      return { liked: true, likes: updatedLikes };
    }
  },
});

// Check if user has liked a post
export const hasUserLiked = query({
  args: {
    postId: v.id("posts"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let userId = args.userId;

    // If no userId provided, try to get from auth
    if (!userId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return false;
      }

      const user = await ctx.db
        .query("users")
        .filter((q) =>
          q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier)
        )
        .unique();

      if (!user) {
        return false;
      }

      userId = user._id;
    }

    const like = await ctx.db
      .query("likes")
      .filter((q) =>
        q.and(
          q.eq(q.field("postId"), args.postId),
          q.eq(q.field("userId"), userId)
        )
      )
      .unique();

    return !!like;
  },
});
