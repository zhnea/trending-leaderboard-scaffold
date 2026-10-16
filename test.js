import { upvote, getTop, redis } from "./leaderboard.js";

async function runTest() {
  const target = "post:50";

  // Upvote post:50 50 times
  for (let i = 0; i < 50; i++) {
    await upvote(target);
  }

  const topPosts = await getTop(10);
  console.log("Top 10:");
  topPosts.forEach((post, index) => {
    console.log(`  #${index + 1}  ${post.id}  score=${post.score}  ${post.title} (${post.author})`);
  });

  const isInTop10 = topPosts.some((post) => post.id === target);
  if (isInTop10) {
    console.log(`\nPASS ✅  ${target} reached the top 10`);
  } else {
    console.error(`\nFAIL ❌  ${target} did not reach the top 10`);
  }

  redis.disconnect();
}

runTest();