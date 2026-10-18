const CATEGORY_UNLOCKS = Object.freeze({
  9: 1,  // General Knowledge
  17: 2, // Science & Nature
  18: 3, // Computers & Coding
  19: 4, // Mathematics
  22: 5, // Geography
  23: 6, // History
  21: 10, // Sports & Games
});

const DIFFICULTY_UNLOCKS = Object.freeze({ easy: 1, medium: 3, hard: 6 });
const XP_PER_CORRECT = Object.freeze({ easy: 15, medium: 20, hard: 30 });

function quizUnlockError(level, categoryId, difficulty) {
  const categoryLevel = CATEGORY_UNLOCKS[Number(categoryId)];
  const difficultyLevel = DIFFICULTY_UNLOCKS[String(difficulty || '').toLowerCase()];
  if (!categoryLevel || !difficultyLevel) return 'Choose a valid quiz genre and difficulty.';
  if (level < categoryLevel) return `This quiz genre unlocks at Level ${categoryLevel}.`;
  if (level < difficultyLevel) return `This difficulty unlocks at Level ${difficultyLevel}.`;
  return null;
}

function reflectionXpAward(level, alreadyEarned) {
  if (alreadyEarned) return 0;
  return Number(level) >= 5 ? 10 : 5;
}

module.exports = { CATEGORY_UNLOCKS, DIFFICULTY_UNLOCKS, XP_PER_CORRECT, quizUnlockError, reflectionXpAward };
