import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

/**
 * Increment a post's engagement score atomically using ZINCRBY.
 */
export async function upvote(postId) {
  return redis.zincrby("trending:posts", 1, postId);
}

/**
 * Fetch top N ranked posts and merge metadata using one pipelined round trip.
 */
export async function getTop(n) {
  // 1. Fetch ranked post IDs and scores
  const flat = await redis.zrevrange("trending:posts", 0, n - 1, "WITHSCORES");

  const rows = [];
  const pipeline = redis.pipeline();

  // 2. Queue HGETALL commands into the pipeline
  for (let i = 0; i < flat.length; i += 2) {
    const id = flat[i];
    rows.push({ id, score: Number(flat[i + 1]) });
    pipeline.hgetall(id + ":meta");
  }

  // 3. Execute all queued reads in a single network round trip
  const results = await pipeline.exec();

  // 4. Merge metadata (results[k][1]) into the corresponding row
  return rows.map((row, k) => ({ ...row, ...results[k][1] }));
}

export { redis };