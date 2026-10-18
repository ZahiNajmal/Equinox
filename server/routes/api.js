// server/routes/api.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const xp = require('../services/xp');
const fs = require('fs');
const path = require('path');
const ai = require('../services/ai');
const { fetchNews } = require('../services/news');
const { enqueueLevelUpReport } = require('../services/email');
const { createVaultProgressPdfBuffer } = require('../reports/vaultProgressPdf');
const { XP_PER_CORRECT, quizUnlockError, reflectionXpAward } = require('../services/progression');

const JWT_SECRET = process.env.JWT_SECRET || 'equinox-secret-key-2025-change-in-production';

// -------------------
// Auth middleware
// -------------------
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.split?.(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.username = decoded.username;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// -------------------
// SIGNUP
// -------------------
router.post('/auth/signup', async (req, res) => {
  const { username = '', email = '', password = '', emailReportsEnabled = false } = req.body || {};
  const normalizedEmail = email.trim().toLowerCase();
  const isGmailAddress = /^[^\s@]+@(?:gmail\.com|googlemail\.com)$/i.test(normalizedEmail);
  if (!username.trim() || !isGmailAddress || !password || password.length < 6) {
    return res.status(400).json({ error: 'Enter a valid Gmail address, username, and password (at least 6 characters).' });
  }

  try {
    const exists = await req.db.query(
      'SELECT id FROM users WHERE lower(email) = $1 OR lower(username) = $2',
      [normalizedEmail, username.toLowerCase().trim()]
    );

    if (exists.rows.length > 0) return res.status(400).json({ error: 'User exists' });

    const hash = await bcrypt.hash(password, 10);
    const result = await req.db.query(
      'INSERT INTO users (username, email, password, email_reports_enabled) VALUES ($1, $2, $3, $4) RETURNING id',
      [username.trim(), normalizedEmail, hash, emailReportsEnabled === true]
    );

    const token = jwt.sign({ id: result.rows[0].id, username: username.trim() }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------
// LOGIN
// -------------------
router.post('/auth/login', async (req, res) => {
  const { email = '', password = '', emailReportPreference = 'keep' } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Invalid input' });

  try {
    const result = await req.db.query('SELECT * FROM users WHERE lower(email) = $1', [email.toLowerCase().trim()]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    if (emailReportPreference === 'enable' || emailReportPreference === 'disable') {
      await req.db.query(
        'UPDATE users SET email_reports_enabled = $1 WHERE id = $2',
        [emailReportPreference === 'enable', user.id]
      );
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------
// USER PROGRESS
// -------------------
router.get('/user/progress', authMiddleware, async (req, res) => {
  try {
    const userRes = await req.db.query('SELECT username, xp, level FROM users WHERE id = $1', [req.userId]);
    const activityRes = await req.db.query(
      "SELECT * FROM progress WHERE user_id = $1 AND type != 'interaction.click' ORDER BY date DESC",
      [req.userId]
    );
    const reflectionsRes = await req.db.query(
      'SELECT id, sdg_id, reflection, evidence, date FROM missions WHERE user_id = $1 ORDER BY date DESC',
      [req.userId]
    );

    const user = userRes.rows[0] || {};
    res.json({
      username: user.username || "Student",
      xp: user.xp || 0,
      level: user.level || 1,
      activity: activityRes.rows || [],
      reflections: reflectionsRes.rows || [],
      badges: []
    });
  } catch (err) {
    console.error('Progress fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------
// INTERACTION-BASED XP
// -------------------
router.post('/user/interaction', authMiddleware, async (req, res) => {
  const body = req.body || {};
  const event = (body.event || '').toString();
  const rawPath = (body.path || '').toString();
  const safePath = rawPath.startsWith('/') ? rawPath.slice(0, 120) : `/${rawPath}`.slice(0, 120);
  const dwellMs = Number.isFinite(Number(body.dwellMs)) ? Math.max(0, Number(body.dwellMs)) : 0;
  const rawCorrect = Number.isFinite(Number(body.correct)) ? Math.max(0, Math.floor(Number(body.correct))) : 0;
  const rawTotal = Number.isFinite(Number(body.total)) ? Math.max(0, Math.floor(Number(body.total))) : 0;
  const total = Math.min(5, rawTotal);
  const correct = Math.min(total > 0 ? total : 5, rawCorrect);
  const rawQuizId = (body.quizId || '').toString();
  const quizId = rawQuizId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);

  let type = 'interaction.unknown';
  let xpToAdd = 0;
  let description = 'Interaction';
  let cooldownSeconds = 0;

  if (event === 'click') {
    type = 'interaction.click'; xpToAdd = 1; description = 'Interacted with the app'; cooldownSeconds = 2;
  } else if (event === 'pageview') {
    if (dwellMs < 10000) {
      const u = await req.db.query('SELECT username, xp, level FROM users WHERE id = $1', [req.userId]);
      return res.json({ xpAdded: 0, user: u.rows[0] });
    }
    type = `interaction.pageview:${safePath}`; xpToAdd = 5; description = `Visited ${safePath}`; cooldownSeconds = 20;
  } else if (event === 'activeMinute') {
    type = 'interaction.activeMinute'; xpToAdd = 5; description = ''; cooldownSeconds = 60;
  } else if (event === 'quizComplete' || event === 'quizProgress') {
    if (rawTotal !== 5 || rawCorrect > 5 || !quizId) {
      return res.status(400).json({ error: 'A valid five-question quiz session is required.' });
    }
    const difficulty = String(body.difficulty || 'easy').toLowerCase();
    const categoryId = Number(body.categoryId || 9);
    let levelRes;
    try {
      levelRes = await req.db.query('SELECT level FROM users WHERE id = $1', [req.userId]);
    } catch (error) {
      console.error('Quiz level check failed:', error.message);
      return res.status(500).json({ error: 'Could not verify quiz unlocks.' });
    }
    const currentLevel = Number(levelRes.rows[0]?.level || 1);
    const unlockError = quizUnlockError(currentLevel, categoryId, difficulty);
    if (unlockError) return res.status(403).json({ error: unlockError });
    const xpPerQuestion = XP_PER_CORRECT[difficulty];
    if (correct < 5) {
      type = 'interaction.quiz'; xpToAdd = 0; description = `Quiz progress (${correct}/${total || correct} complete)`;
    } else if (quizId) {
      type = `interaction.quiz:${quizId}`;
      description = `Quiz progress (${correct}/${total || correct} complete)`;
      const already = await req.db.query('SELECT COALESCE(SUM(xp), 0) AS xp FROM progress WHERE user_id = $1 AND type = $2', [req.userId, type]);
      const alreadyXp = Number(already.rows[0]?.xp || 0);
      xpToAdd = Math.max(0, (correct * xpPerQuestion) - alreadyXp);
    } else {
      type = 'interaction.quizComplete'; xpToAdd = correct * xpPerQuestion; description = `Completed a quiz (${correct}/${total || correct} complete)`; cooldownSeconds = 10;
    }
  }

  if (xpToAdd <= 0) {
    const u = await req.db.query('SELECT username, xp, level FROM users WHERE id = $1', [req.userId]);
    return res.json({ xpAdded: 0, user: u.rows[0] });
  }

  try {
    if (cooldownSeconds > 0) {
      const recent = await req.db.query(
        "SELECT 1 FROM progress WHERE user_id = $1 AND type = $2 AND date >= NOW() - CAST($3 || ' seconds' AS INTERVAL) LIMIT 1",
        [req.userId, type, cooldownSeconds]
      );
      if (recent.rows.length > 0) {
        const u = await req.db.query('SELECT username, xp, level FROM users WHERE id = $1', [req.userId]);
        return res.json({ xpAdded: 0, user: u.rows[0] });
      }
    }

    await req.db.query('BEGIN');
    await req.db.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [xpToAdd, req.userId]);
    const updatedRes = await req.db.query('SELECT username, xp, level FROM users WHERE id = $1', [req.userId]);
    const updated = updatedRes.rows[0];
    const previousLevel = Number(updated.level || 1);
    const newLevel = xp.levelFromXp(updated.xp || 0);
    if (previousLevel !== newLevel) {
      await req.db.query('UPDATE users SET level = $1 WHERE id = $2', [newLevel, req.userId]);
      updated.level = newLevel;
    }
    await req.db.query('INSERT INTO progress (user_id, type, description, xp) VALUES ($1, $2, $3, $4)', [req.userId, type, description, xpToAdd]);
    await req.db.query('COMMIT');
    if (newLevel > previousLevel) {
      await enqueueLevelUpReport(req.db, { userId: req.userId, previousLevel, newLevel, xp: Number(updated.xp || 0) });
    }
    return res.json({ xpAdded: xpToAdd, user: updated });
  } catch (err) {
    await req.db.query('ROLLBACK');
    console.error('Interaction error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// -------------------
// SDG reflections
// -------------------
router.post('/sdg/reflection', authMiddleware, async (req, res) => {
  const rawSdgId = Number(req.body?.sdgId);
  const sdgId = Number.isFinite(rawSdgId) ? Math.max(1, Math.min(17, Math.floor(rawSdgId))) : null;
  const reflection = (req.body?.reflection || '').toString().trim().slice(0, 4000);

  if (!sdgId || !reflection) return res.status(400).json({ error: 'sdgId and reflection required' });

  const type = `sdg.reflection:${sdgId}`;
  const description = `Saved SDG reflection (Goal ${sdgId})`;

  try {
    await req.db.query('BEGIN');
    const lockedUserRes = await req.db.query('SELECT level FROM users WHERE id = $1 FOR UPDATE', [req.userId]);
    const currentLevel = Number(lockedUserRes.rows[0]?.level || 1);
    const alreadyEarned = await req.db.query('SELECT 1 FROM progress WHERE user_id = $1 AND type = $2 LIMIT 1', [req.userId, type]);
    const xpForReflection = reflectionXpAward(currentLevel, alreadyEarned.rows.length > 0);
    await req.db.query('INSERT INTO missions (user_id, sdg_id, reflection) VALUES ($1, $2, $3)', [req.userId, sdgId, reflection]);
    if (xpForReflection > 0) {
      await req.db.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [xpForReflection, req.userId]);
    }
    const updatedRes = await req.db.query('SELECT username, xp, level FROM users WHERE id = $1', [req.userId]);
    const updated = updatedRes.rows[0];
    const previousLevel = Number(updated.level || 1);
    const newLevel = xp.levelFromXp(updated.xp || 0);
    if (previousLevel !== newLevel) {
      await req.db.query('UPDATE users SET level = $1 WHERE id = $2', [newLevel, req.userId]);
      updated.level = newLevel;
    }
    if (xpForReflection > 0) {
      await req.db.query('INSERT INTO progress (user_id, type, description, xp) VALUES ($1, $2, $3, $4)', [req.userId, type, description, xpForReflection]);
    }
    await req.db.query('COMMIT');
    if (newLevel > previousLevel) {
      await enqueueLevelUpReport(req.db, { userId: req.userId, previousLevel, newLevel, xp: Number(updated.xp || 0) });
    }
    return res.json({ xpAdded: xpForReflection, firstRewardForGoal: xpForReflection > 0, user: updated });
  } catch (err) {
    await req.db.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------
// AI & MISC
// -------------------
router.post('/ai/qa', authMiddleware, async (req, res) => {
  const { message = '', level = 'intermediate' } = req.body || {};
  if (!message.trim()) return res.status(400).json({ error: 'Message is required' });
  try {
    const response = await ai.askQuestion({ question: message.slice(0, 1000), level });
    return res.json({ reply: response.answer });
  } catch (err) {
    console.error('AI QA error:', err.message);
    // Provide more specific error message for missing API key
    if (err.message.includes('GOOGLE_AI_KEY')) {
      return res.status(500).json({ error: 'AI service not configured: GOOGLE_AI_KEY missing' });
    }
    return res.status(500).json({ error: 'AI service unavailable' });
  }
});

router.get('/news', async (req, res) => {
  const q = (req.query.q || req.query.topic || 'science').toString();
  try {
    const articles = await fetchNews(q);
    return res.json({ articles: Array.isArray(articles) ? articles : [] });
  } catch (err) {
    console.error('News fetch error:', err.message);
    // Return placeholder data if API key is missing or API fails
    return res.json({
      articles: [
        {
          title: `Sample Article about ${q}`,
          url: 'https://example.com/article1',
          description: `This is a placeholder article about ${q}. Configure NEWSAPI_KEY to see real news.`,
          source: { name: 'Equinox News' },
          publishedAt: new Date().toISOString(),
          urlToImage: ''
        }
      ]
    });
  }
});

router.get('/experiments', (req, res) => res.json([
  { id: 1, name: "Photosynthesis Lab", category: "Biology" },
  { id: 2, name: "Newton's Laws", category: "Physics" }
]));

// -------------------
// VAULT PROGRESS PDF EXPORT
// -------------------
router.get('/vault/export', authMiddleware, async (req, res) => {
  try {
    const userRes = await req.db.query('SELECT username, xp, level FROM users WHERE id = $1', [req.userId]);
    const user = userRes.rows[0] || { username: req.username, xp: 0, level: 1 };

    const activityRes = await req.db.query(
      "SELECT id, type, description, xp, date FROM progress WHERE user_id = $1 AND type != 'interaction.click' ORDER BY date DESC LIMIT 250",
      [req.userId]
    );
    const reflectionsRes = await req.db.query(
      'SELECT id, sdg_id, reflection, evidence, date FROM missions WHERE user_id = $1 ORDER BY date DESC LIMIT 100',
      [req.userId]
    );

    const pdfBuffer = await createVaultProgressPdfBuffer({
      user,
      activity: activityRes.rows || [],
      reflections: reflectionsRes.rows || [],
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=equinox-progress-${new Date().toISOString().slice(0, 10)}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).send('Error');
  }
});

router.get('/countries', (req, res) => {
  fs.readFile(path.join(__dirname, '../data/countries.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed' });
    res.json(JSON.parse(data));
  });
});

module.exports = router;
