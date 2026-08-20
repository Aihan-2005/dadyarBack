import { RedisDatabase } from "../config/redis";

import { RedisOtpCooldownStore } from "../stores/otp/redisOtpCooldown.store";

async function main() {
  const redisDatabase = new RedisDatabase();

  const store = new RedisOtpCooldownStore(redisDatabase);

  const key = "test:otp:cooldown";

  await store.release(key);

  console.log("first:", await store.tryAcquire(key, 10));

  console.log("second:", await store.tryAcquire(key, 10));

  console.log("remaining:", await store.getRemainingSeconds(key));

  await store.release(key);

  console.log("remaining after release:", await store.getRemainingSeconds(key));

  console.log("third:", await store.tryAcquire(key, 10));

  await store.release(key);

  await redisDatabase.disconnect();
}

void main();
