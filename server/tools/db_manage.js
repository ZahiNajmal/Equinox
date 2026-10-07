// server/tools/db_manage.js
const path = require('path');
const Database = require('better-sqlite3');

const DB_FILE = path.resolve(__dirname, '..', 'data', 'equinox.db');
const db = new Database(DB_FILE);

const arg = process.argv[2];
const target = (process.argv[3] || '').toLowerCase().trim();

if (!arg) {
  console.log('Usage: node db_manage.js <list|find|delete|wipe> [usernameOrEmail]');
  process.exit(1);
}

try {
  if (arg === 'list') {
    const rows = db.prepare("SELECT id, username, email, created_at FROM users ORDER BY id DESC LIMIT 1000").all();
    console.table(rows);
  } else if (arg === 'find') {
    if (!target) { console.log('Pass username or email'); process.exit(1); }
    const rows = db.prepare("SELECT id, username, email, created_at FROM users WHERE lower(username)=? OR lower(email)=?").all(target, target);
    console.table(rows);
  } else if (arg === 'delete') {
    if (!target) { console.log('Pass username or email'); process.exit(1); }
    const info = db.prepare("DELETE FROM users WHERE lower(username)=? OR lower(email)=?").run(target, target);
    console.log('Deleted rows:', info.changes);
    db.prepare("VACUUM;").run();
  } else if (arg === 'wipe') {
    const info = db.prepare("DELETE FROM users").run();
    console.log('Deleted rows:', info.changes);
    db.prepare("VACUUM;").run();
  } else {
    console.log('Unknown command:', arg);
  }
} catch (err) {
  console.error('Error:', err);
} finally {
  db.close();
}
