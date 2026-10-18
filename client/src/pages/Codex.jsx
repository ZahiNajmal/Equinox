import PeriodicTable from "../components/PeriodicTable";

export default function Codex({ level = 1 }) {
  const currentLevel = Math.max(1, Number(level) || 1);

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-12">
      <div className="mx-auto max-w-7xl text-center">
        <h1 className="mb-4 text-5xl font-bold text-white">Codex – Reference Zone</h1>
        <p className="mb-8 text-xl text-gray-300">Interactive periodic table • Glossary • Quick facts</p>

        {currentLevel >= 12 ? (
          <section className="mx-auto mb-10 max-w-3xl rounded-3xl border border-amber-300/40 bg-gradient-to-br from-amber-100 to-violet-100 p-6 text-left shadow-xl sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-700">Codex Secret · Unlocked at Level 12</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">A tiny drop made of countless atoms</h2>
            <p className="mt-3 leading-7 text-slate-700">A single drop of water contains an enormous number of molecules—roughly 1.7 sextillion in a typical drop. Each water molecule is made from two hydrogen atoms bonded to one oxygen atom.</p>
          </section>
        ) : (
          <p className="mx-auto mb-10 max-w-xl rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-gray-300">Reach Level 12 to unlock a secret chemistry fact in the Codex.</p>
        )}

        <PeriodicTable />
      </div>
    </div>
  );
}
