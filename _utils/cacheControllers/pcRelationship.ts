/*
a request comes for /api/v1/products

→ check Redis cache for category:productId (will have a TTL)
→ if exists: return cached full object (with populate field embedded)
→ if not: fetch from MongoDB, populate owner, store in Redis

*/