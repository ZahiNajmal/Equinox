// client/src/pages/Dashboard.jsx
import { Link } from "react-router-dom";
import XPProgress from "../components/XPProgress";
import { 
  BeakerIcon, 
  ChatBubbleLeftRightIcon, 
  GlobeAltIcon, 
  LightBulbIcon, 
  BookOpenIcon, 
  TrophyIcon, 
  ArchiveBoxIcon, 
  QuestionMarkCircleIcon 
} from "@heroicons/react/24/solid";

export default function Dashboard({ user }) {
  const safeUser = {
    username: user?.username || "Explorer",
    xp: user?.xp || 0,
    level: user?.level || 1
  };

  const modules = [
    { name: "Prisma", path: "/prisma", icon: BeakerIcon, color: "from-orange-400 via-pink-500 to-purple-600" },
    { name: "Mentor", path: "/mentor", icon: ChatBubbleLeftRightIcon, color: "from-pink-500 via-purple-500 to-indigo-500" },
    { name: "Atlas", path: "/atlas", icon: GlobeAltIcon, color: "from-green-400 via-teal-500 to-cyan-500" },
    { name: "Insight", path: "/insight", icon: LightBulbIcon, color: "from-yellow-400 via-orange-400 to-red-400" },
    { name: "Codex", path: "/codex", icon: BookOpenIcon, color: "from-indigo-500 via-purple-500 to-pink-500" },
    { name: "SDG", path: "/sdg", icon: TrophyIcon, color: "from-teal-400 via-green-400 to-lime-400" },
    { name: "Vault", path: "/vault", icon: ArchiveBoxIcon, color: "from-red-500 via-rose-500 to-pink-500" },
    { name: "Quiz", path: "/quiz", icon: QuestionMarkCircleIcon, color: "from-amber-400 via-orange-400 to-red-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 sm:py-16 px-4 sm:px-6 animate-fadeIn">
      <div className="max-w-7xl mx-auto text-center">
        {/* PERSONALIZED WELCOME */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gradient-to-r from-orange-400 via-purple-500 to-blue-500 bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4 sm:mb-6 animate-pulse break-words drop-shadow-lg">
          Welcome Back, {safeUser.username}!
        </h1>
        
        <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 font-medium mb-10 sm:mb-16">
          Level {safeUser.level} • {safeUser.xp.toLocaleString()} XP
        </p>

        <div className="max-w-3xl mx-auto mt-8 sm:mt-10">
          <XPProgress xp={safeUser.xp} level={safeUser.level} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 mt-10 sm:mt-16">
          {modules.map(({ name, path, icon: Icon, color }) => (
            <Link
              key={path}
              to={path}
              className={`bg-gradient-to-br ${color} text-white rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl hover:scale-105 lg:hover:scale-110 hover:shadow-3xl transition-all duration-300 transform relative overflow-hidden`}
            >
              {/* Add animated overlay for a cool shimmer effect */}
              <span className="absolute inset-0 bg-white/10 rounded-3xl blur-xl opacity-0 hover:opacity-30 transition-opacity duration-500"></span>
              
              <Icon className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 drop-shadow-lg" />
              <h3 className="text-2xl sm:text-3xl font-bold">{name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
