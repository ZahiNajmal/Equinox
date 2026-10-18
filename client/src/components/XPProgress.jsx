import { getNextReward, LEVEL_REWARDS, REWARD_TRACK_FINAL_LEVEL, XP_PER_LEVEL } from "../utils/progression";

export default function XPProgress({ xp = 0, level = 1 }) {
  const safeXp = Number.isFinite(Number(xp)) ? Math.max(0, Math.floor(Number(xp))) : 0;
  const safeLevel = Number.isFinite(Number(level)) ? Math.max(1, Math.floor(Number(level))) : 1;
  const levelStartXp = (safeLevel - 1) * XP_PER_LEVEL;
  const nextLevelTotalXp = safeLevel * XP_PER_LEVEL;
  const currentInLevel = Math.max(0, safeXp - levelStartXp);
  const remaining = Math.max(0, nextLevelTotalXp - safeXp);
  const percentage = Math.min(100, (currentInLevel / XP_PER_LEVEL) * 100);
  const latestUnlock = LEVEL_REWARDS.find((reward) => reward.level === safeLevel);
  const nextReward = getNextReward(safeLevel);
  const trackComplete = safeLevel >= REWARD_TRACK_FINAL_LEVEL;

  return (
    <div className="rounded-2xl bg-white p-6 text-left shadow-lg">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Level {safeLevel} Explorer</h3>
        <span className="text-2xl font-bold text-primary">{safeXp.toLocaleString()} XP</span>
      </div>
      {trackComplete ? (
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-violet-50 p-4 text-center" role="status">
          <p className="text-xl font-extrabold text-violet-900">All reward levels complete!</p>
          <p className="mt-1 text-sm text-violet-800">You reached Level {REWARD_TRACK_FINAL_LEVEL} and unlocked the full Equinox reward track. Keep learning and earning XP!</p>
        </div>
      ) : (
        <>
          <div className="h-5 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-label={`Progress to Level ${safeLevel + 1}`} aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-valuenow={currentInLevel}>
            <div className="h-full bg-gradient-to-r from-primary to-accent4 transition-all duration-700" style={{ width: `${percentage}%` }} />
          </div>
          <p className="mt-2 text-right text-sm text-gray-600">{remaining.toLocaleString()} XP to Level {safeLevel + 1}</p>
        </>
      )}
      {latestUnlock && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Unlocked at Level {safeLevel}</p>
          <p className="mt-1 font-semibold text-emerald-950">{latestUnlock.title}</p>
        </div>
      )}
      {nextReward ? (
        <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-700">Next unlock · Level {nextReward.level}</p>
          <p className="mt-1 font-semibold text-violet-950">{nextReward.title}</p>
          <p className="mt-1 text-sm text-violet-800">{nextReward.detail}</p>
        </div>
      ) : !trackComplete && <p className="mt-4 text-sm font-semibold text-violet-700">You’ve unlocked every reward currently on the track. More adventures ahead!</p>}
    </div>
  );
}
