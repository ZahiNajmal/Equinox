// server/services/db.js
// We no longer use SQLite. This file now simply exports the Pool 
// created in index.js to keep your routes working.

let poolInstance = null;

// This helper will be used by index.js to set the pool
const setPool = (pool) => {
  poolInstance = pool;
};

// This allows your routes to do: const db = require('../services/db')
const getDb = () => {
  if (!poolInstance) {
    // This is a fallback in case a route calls the DB before index.js initializes
    const { Pool } = require('pg');
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return poolInstance;
};

// Exporting an object that mimics the way you were using 'db'
module.exports = {
  query: (text, params) => poolInstance.query(text, params),
  setPool
};