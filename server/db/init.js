// server/db/init.js
// Database initialization script for PostgreSQL
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initializeDatabase(pool) {
  // If no pool provided, create one (for standalone execution)
  const shouldClosePool = !pool;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('render.com') ? {
        rejectUnauthorized: false
      } : false
    });
  }

  try {
    // Read the SQL schema file
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the schema
    await pool.query(sql);
    console.log('✅ Database tables initialized successfully!');

    // Verify tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('📊 Created tables:', tables.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    // If tables already exist, that's okay
    if (err.code === '42P07' || err.message.includes('already exists')) {
      console.log('ℹ️  Database tables already exist, skipping initialization.');
    } else {
      console.error('❌ Error initializing database:', err.message);
      throw err;
    }
  } finally {
    // Only close pool if we created it
    if (shouldClosePool) {
      await pool.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization complete!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Database initialization failed:', err);
      process.exit(1);
    });
}

module.exports = initializeDatabase;

