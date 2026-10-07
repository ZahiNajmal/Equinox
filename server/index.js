// server/index.js
const express = require('express'); // <--- ADD THIS
const cors = require('cors');       // <--- ADD THIS
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg'); 

const app = express();

// --- 2. POSTGRESQL DATABASE CONNECTION SETUP ---
// The Pool will automatically use the DATABASE_URL environment variable 
// provided by Render or from your local .env file.
// Database connection configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
};

// Only enable SSL if DATABASE_URL contains 'render.com' or other cloud providers
if (process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('render.com') || process.env.DATABASE_URL.includes('amazonaws.com') || process.env.DATABASE_URL.includes('neon.tech'))) {
  dbConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(dbConfig);

// Test the database connection and initialize tables
pool.connect(async (err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to the database:', err.message);
    console.error('💡 Tip: Make sure DATABASE_URL in your .env file is correct.');
    console.error('   For local development, use: postgres://user:password@localhost:5432/dbname');
    console.error('   For cloud databases, ensure the full hostname is included (e.g., hostname.region.provider.com)');
    // Don't exit - allow server to start even if DB fails (routes will handle errors)
    return;
  }
  console.log('✅ PostgreSQL connection successful!');
  release(); // Release the client back to the pool

  // Initialize database tables
  try {
    const initializeDatabase = require('./db/init');
    await initializeDatabase(pool);
  } catch (initErr) {
    console.error('⚠️  Database initialization warning:', initErr.message);
    // Don't exit - tables might already exist
  }
});

// --- 3. MAKE POOL ACCESSIBLE TO ROUTES ---
// We attach the database pool to the request object so routes can access it.
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// --- CORS configuration ---
const corsOptions = {
  // In a monorepo, origin is handled differently. We allow the frontend URL.
  origin: (origin, callback) => {
    // 1. Allow server-to-server or requests with no origin (e.g., Postman)
    if (!origin) return callback(null, true); 
    
    // 2. Allow if in development environment
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    
    // 3. Allow only the specified CLIENT_URL in production
    if (process.env.CLIENT_URL) {
      return process.env.CLIENT_URL === origin
        ? callback(null, true)
        : callback(new Error(`CORS blocked: Origin ${origin} not allowed`));
    }
    
    // Default fallback (e.g., if CLIENT_URL is not set, allow all in production)
    return callback(null, true); 
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Serve uploaded files if any ---
// This is required if your app handles file uploads (e.g., profile pictures)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API routes ---
// Make sure your routes/api.js file uses req.db for database queries
app.use('/api', require('./routes/api'));

// --- Serve React frontend ---
// When deployed on Render, the 'client/dist' folder will exist in production.
const frontendPath = path.join(__dirname, '../client/dist');
app.use(express.static(frontendPath));

// SPA fallback (React Router): This ensures all non-API requests serve index.html
app.get('*', (req, res) => {
  // Check if the file exists before sending to prevent crashes
  if (path.basename(req.url).includes('.') || req.url.startsWith('/api')) {
    return res.status(404).send('Not Found');
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- Start server ---
// Render will automatically set process.env.PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log('🌐 Frontend Dev Server → http://localhost:5173 (Note: API calls go to port ${PORT})');
  }
});