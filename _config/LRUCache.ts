import { LRUCache } from "lru-cache";

const options = {
    max:500,
    ttl: 1000 * 60 * 30 // time to live is half an hour
}

const lruCache = new LRUCache(options);

export default lruCache;
