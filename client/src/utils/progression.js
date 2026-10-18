export const XP_PER_LEVEL = 250;

export const QUIZ_GENRES = [
  { id: "general", label: "General Knowledge", categoryId: 9, minLevel: 1, description: "A little bit of everything" },
  { id: "science", label: "Science & Nature", categoryId: 17, minLevel: 2, description: "The natural world and how it works" },
  { id: "computers", label: "Computers & Coding", categoryId: 18, minLevel: 3, description: "Technology, computers, and code" },
  { id: "math", label: "Mathematics", categoryId: 19, minLevel: 4, description: "Numbers, logic, and problem solving" },
  { id: "geography", label: "Geography", categoryId: 22, minLevel: 5, description: "Places, people, and our planet" },
  { id: "history", label: "History", categoryId: 23, minLevel: 6, description: "People and events that shaped the world" },
  { id: "sports", label: "Sports & Games", categoryId: 21, minLevel: 10, description: "Records, rules, and memorable moments" },
];

export const QUIZ_DIFFICULTIES = [
  { id: "easy", label: "Easy", minLevel: 1, xpPerCorrect: 15 },
  { id: "medium", label: "Medium", minLevel: 3, xpPerCorrect: 20 },
  { id: "hard", label: "Hard", minLevel: 6, xpPerCorrect: 30 },
];

export const LEVEL_REWARDS = [
  { level: 2, title: "Science & Nature quizzes + 1 hint per quiz", detail: "Explore a new genre and get a clue when you need it." },
  { level: 3, title: "Medium difficulty + Computers & Coding", detail: "Take on a tougher challenge and test your tech knowledge." },
  { level: 4, title: "Mathematics quizzes + a second hint", detail: "Unlock number challenges and another lifeline." },
  { level: 5, title: "Geography quizzes + 10 XP for new SDG goals", detail: "Earn 10 XP for each goal's first reflection; repeat reflections remain available without repeat XP." },
  { level: 6, title: "Hard difficulty + History quizzes", detail: "Unlock the toughest questions and a new subject." },
  { level: 7, title: "Prisma Lab Pack II", detail: "Experiments 7–10 become available." },
  { level: 8, title: "Atlas Population Insights", detail: "Reveal each selected place's population rank in the Atlas." },
  { level: 9, title: "Third quiz hint", detail: "Get one extra lifeline in each quiz." },
  { level: 10, title: "Sports & Games quizzes + Champion badge", detail: "Unlock a new quiz genre and celebrate reaching double digits." },
];

export function hintsPerQuiz(level) {
  const safeLevel = Math.max(1, Number(level) || 1);
  return safeLevel >= 9 ? 3 : safeLevel >= 4 ? 2 : safeLevel >= 2 ? 1 : 0;
}

export function getNextReward(level) {
  const safeLevel = Math.max(1, Number(level) || 1);
  return LEVEL_REWARDS.find((reward) => reward.level > safeLevel) || null;
}
