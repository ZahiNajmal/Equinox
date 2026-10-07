import { BeakerIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function ExperimentCard({ experiment }) {
  return (
    <Link
      to={`/prisma/${experiment.id}`}
      className="bg-white rounded-xl shadow hover:shadow-xl transition transform hover:-translate-y-1 p-6 block"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{experiment.title}</h3>
          <p className="text-gray-600 mt-2">{experiment.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {experiment.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <BeakerIcon className="h-16 w-16 text-accent1 opacity-80 ml-4 flex-shrink-0" />
      </div>
    </Link>
  );
}