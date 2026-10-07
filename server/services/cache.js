// server/services/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache();
module.exports = {
  get(key) {
    return cache.get(key);
  },
  set(key, value, ttlSeconds = 60) {
    cache.set(key, value, ttlSeconds);
  },
  del(key) {
    cache.del(key);
  }
};