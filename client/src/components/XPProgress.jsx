const XP_PER_LEVEL = 250;

export default function XPProgress({ xp = 0, level = 1 }) {
  const safeXp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;

  const levelStartXp = (safeLevel - 1) * XP_PER_LEVEL;
  const nextLevelTotalXp = safeLevel * XP_PER_LEVEL;
  const currentInLevel = Math.max(0, safeXp - levelStartXp);
  const remaining = Math.max(0, nextLevelTotalXp - safeXp);

  const percentage = Math.min(100, (currentInLevel / XP_PER_LEVEL) * 100);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Level {safeLevel} Explorer</h3>
        <span className="text-2xl font-bold text-primary">{safeXp.toLocaleString()} XP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent4 transition-all duration-700"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 mt-2 text-right">
        {remaining.toLocaleString()} XP to Level {safeLevel + 1}
      </p>
    </div>
  );
}
