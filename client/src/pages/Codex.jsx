import PeriodicTable from "../components/PeriodicTable";

export default function Codex() {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Codex – Reference Zone</h1>
        <p className="text-xl text-gray-300 mb-12">
          Interactive periodic table • Glossary • Quick facts
        </p>
        <PeriodicTable />
      </div>
    </div>
  );
}