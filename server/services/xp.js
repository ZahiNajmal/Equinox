// server/services/xp.js

const XP_PER_LEVEL = Number(process.env.XP_PER_LEVEL || 250);

function levelFromXp(xp) {
  const safeXp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
  return Math.floor(safeXp / XP_PER_LEVEL) + 1;
}

function nextLevelTotalXp(level) {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return safeLevel * XP_PER_LEVEL;
}

module.exports = {
  XP_PER_LEVEL,
  levelFromXp,
  nextLevelTotalXp
};
