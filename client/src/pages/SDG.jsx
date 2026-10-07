import React, { useState } from 'react';
import api from "../utils/api";
import { 
  Heart, 
  BookOpen, 
  Users, 
  Droplets, 
  Sun, 
  Briefcase, 
  Factory, 
  Scale, 
  Building2, 
  Infinity as InfinityIcon, 
  Globe, 
  Fish, 
  TreePine, 
  Handshake,
  Soup,
  Wallet,
  X,
  ArrowRightLeft,
  Bird
} from 'lucide-react';

// Official SDG Color Palette with secondary shades for gradients
const sdgColors = {
  1: { primary: "#E5243B", secondary: "#B91D2F" },
  2: { primary: "#DDA63A", secondary: "#AF842D" },
  3: { primary: "#4C9F38", secondary: "#3A7B2A" },
  4: { primary: "#C5192D", secondary: "#9A1423" },
  5: { primary: "#FF3A21", secondary: "#CC2E1A" },
  6: { primary: "#26BDE2", secondary: "#1E97B5" },
  7: { primary: "#FCC30B", secondary: "#C99C09" },
  8: { primary: "#A21942", secondary: "#811435" },
  9: { primary: "#FD6925", secondary: "#CA541D" },
  10: { primary: "#DD1367", secondary: "#B10F52" },
  11: { primary: "#FD9D24", secondary: "#CA7D1D" },
  12: { primary: "#BF8B2E", secondary: "#996F25" },
  13: { primary: "#3F7E44", secondary: "#326536" },
  14: { primary: "#0A97D9", secondary: "#0879AE" },
  15: { primary: "#56C02B", secondary: "#459A22" },
  16: { primary: "#00689D", secondary: "#00537E" },
  17: { primary: "#19486A", secondary: "#143A55" }
};

const sdgGoals = [
  { id: 1, name: "No Poverty", icon: Wallet, description: "End poverty in all its forms everywhere." },
  { id: 2, name: "Zero Hunger", icon: Soup, description: "End hunger, achieve food security and improved nutrition and promote sustainable agriculture." },
  { id: 3, name: "Good Health and Well-being", icon: Heart, description: "Ensure healthy lives and promote well-being for all at all ages." },
  { id: 4, name: "Quality Education", icon: BookOpen, description: "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all." },
  { id: 5, name: "Gender Equality", icon: ArrowRightLeft, description: "Achieve gender equality and empower all women and girls." },
  { id: 6, name: "Clean Water and Sanitation", icon: Droplets, description: "Ensure availability and sustainable management of water and sanitation for all." },
  { id: 7, name: "Affordable and Clean Energy", icon: Sun, description: "Ensure access to affordable, reliable, sustainable and modern energy for all." },
  { id: 8, name: "Decent Work and Economic Growth", icon: Briefcase, description: "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all." },
  { id: 9, name: "Industry, Innovation and Infrastructure", icon: Factory, description: "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation." },
  { id: 10, name: "Reduced Inequalities", icon: Scale, description: "Reduce inequality within and among countries." },
  { id: 11, name: "Sustainable Cities and Communities", icon: Building2, description: "Make cities and human settlements inclusive, safe, resilient and sustainable." },
  { id: 12, name: "Responsible Consumption and Production", icon: InfinityIcon, description: "Ensure sustainable consumption and production patterns." },
  { id: 13, name: "Climate Action", icon: Globe, description: "Take urgent action to combat climate change and its impacts." },
  { id: 14, name: "Life Below Water", icon: Fish, description: "Conserve and sustainably use the oceans, seas and marine resources for sustainable development." },
  { id: 15, name: "Life on Land", icon: TreePine, description: "Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss." },
  { id: 16, name: "Peace, Justice and Strong Institutions", icon: Bird, description: "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels." },
  { id: 17, name: "Partnerships for the Goals", icon: Handshake, description: "Strengthen the means of implementation and revitalize the global partnership for sustainable development." },
];

export default function SDG({ setUser }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedGoal) return;
    const text = (reflection || "").trim();
    if (!text) {
      alert("Please write a reflection before saving.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.post("/sdg/reflection", {
        sdgId: selectedGoal.id,
        reflection: text,
      });

      if (res?.data?.user && typeof setUser === "function") {
        setUser((prev) => ({ ...(prev || {}), ...res.data.user }));
      }

      alert("Reflection saved! +5 XP");
      setReflection("");
      setSelectedGoal(null);
    } catch (err) {
      // Surface the real error so it's debuggable (401 vs 404 vs 500 vs network).
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.error;
      const fallbackMsg = err?.message || "Failed to save reflection. Please try again.";

      console.error("SDG reflection save failed:", { status, serverMsg, err });

      if (status === 401) {
        alert("Your session expired. Please sign in again.");
      } else if (status === 404) {
        alert("Save endpoint not found. Make sure the server is running and updated.");
      } else {
        alert(serverMsg || fallbackMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Centered Heading Section (Replaced Navbar) */}
      <header className="max-w-7xl mx-auto pt-16 pb-12 px-4 text-center">
        <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest mb-4 shadow-sm">
          SDG Action
        </div>
        <h1 className="text-4xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 text-slate-900 tracking-tighter uppercase mb-4 drop-shadow-sm">
          The Global Goals
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Transforming our world through 17 Sustainable Development Goals. 
          Select a goal to reflect and take action.
        </p>
      </header>

      {/* Main Infographic Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sdgGoals.map((goal) => {
            const Icon = goal.icon;
            const colors = sdgColors[goal.id];

            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` 
                }}
                className="aspect-square flex flex-col p-4 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group rounded-2xl shadow-md border border-white/10"
              >
                {/* ID Number */}
                <span className="text-2xl sm:text-4xl font-black opacity-40 self-start leading-none mb-1">
                  {goal.id}
                </span>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-end relative z-10">
                   <h3 className="text-left text-[0.7rem] sm:text-xs md:text-sm font-extrabold uppercase leading-tight tracking-wide break-words drop-shadow-md">
                     {goal.name}
                   </h3>
                </div>

                {/* Floating Icon Decor */}
                <div className="absolute top-2 right-2 bg-white/20 p-2 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-all">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                </div>

                {/* Background Pattern */}
                <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon className="w-24 h-24" />
                </div>
              </button>
            );
          })}
          
          {/* Global Logo Tile */}
          <div className="aspect-square bg-white flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl group hover:border-blue-200 transition-colors hidden xl:flex">
             <img src='https://images.twinkl.co.uk/tw1n/image/private/t_630/u/ux/screen-shot-2022-04-01-at-15.15.32_ver_1.png'></img>
          </div>
        </div>
      </main>

      {/* Interactive Detail Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
            onClick={() => setSelectedGoal(null)}
          ></div>

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header with Gradient */}
            <div 
              style={{ 
                background: `linear-gradient(135deg, ${sdgColors[selectedGoal.id].primary} 0%, ${sdgColors[selectedGoal.id].secondary} 100%)` 
              }} 
              className="p-8 text-white flex justify-between items-start shrink-0 relative"
            >
              <div className="flex items-center gap-5 relative z-10">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 shadow-inner">
                   {React.createElement(selectedGoal.icon, { className: "w-10 h-10 text-white" })}
                </div>
                <div>
                  <div className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Goal {selectedGoal.id}</div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight">
                    {selectedGoal.name}
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => setSelectedGoal(null)}
                className="bg-black/10 hover:bg-black/20 text-white rounded-full p-2 transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Decorative circle */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto">
              <div className="mb-8">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">The Mission</h4>
                <p className="text-slate-700 text-lg leading-relaxed font-light italic">
                  "{selectedGoal.description}"
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-inner">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                  Your Reflection
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="How can we help achieve this goal? Write your thoughts here..."
                  className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl text-slate-800 text-base focus:ring-4 focus:ring-opacity-20 focus:outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  style={{ 
                    '--tw-ring-color': sdgColors[selectedGoal.id].primary
                  }}
                />
                <div className="flex justify-end mt-4">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    style={{ background: sdgColors[selectedGoal.id].primary, opacity: saving ? 0.7 : 1 }}
                    className="w-full px-6 py-4 text-white font-black rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Reflection"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}