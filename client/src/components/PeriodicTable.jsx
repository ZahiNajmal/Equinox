import { useState } from "react";

// --- Global Constants and Data ---

const GOOGLE_AI_KEY = import.meta.env.VITE_GOOGLE_AI_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GOOGLE_AI_KEY}`;

// Full 118-element data structure
const elements = [
    { name: "Hydrogen", symbol: "H", atomic: 1, category: "nonmetal", period: 1, x_pos: 1, y_pos: 1 },
    { name: "Helium", symbol: "He", atomic: 2, category: "noble gas", period: 1, x_pos: 18, y_pos: 1 },
    { name: "Lithium", symbol: "Li", atomic: 3, category: "alkali metal", period: 2, x_pos: 1, y_pos: 2 },
    { name: "Beryllium", symbol: "Be", atomic: 4, category: "alkaline earth metal", period: 2, x_pos: 2, y_pos: 2 },
    { name: "Boron", symbol: "B", atomic: 5, category: "metalloid", period: 2, x_pos: 13, y_pos: 2 },
    { name: "Carbon", symbol: "C", atomic: 6, category: "nonmetal", period: 2, x_pos: 14, y_pos: 2 },
    { name: "Nitrogen", symbol: "N", atomic: 7, category: "nonmetal", period: 2, x_pos: 15, y_pos: 2 },
    { name: "Oxygen", symbol: "O", atomic: 8, category: "nonmetal", period: 2, x_pos: 16, y_pos: 2 },
    { name: "Fluorine", symbol: "F", atomic: 9, category: "halogen", period: 2, x_pos: 17, y_pos: 2 },
    { name: "Neon", symbol: "Ne", atomic: 10, category: "noble gas", period: 2, x_pos: 18, y_pos: 2 },
    { name: "Sodium", symbol: "Na", atomic: 11, category: "alkali metal", period: 3, x_pos: 1, y_pos: 3 },
    { name: "Magnesium", symbol: "Mg", atomic: 12, category: "alkaline earth metal", period: 3, x_pos: 2, y_pos: 3 },
    { name: "Aluminium", symbol: "Al", atomic: 13, category: "post-transition metal", period: 3, x_pos: 13, y_pos: 3 },
    { name: "Silicon", symbol: "Si", atomic: 14, category: "metalloid", period: 3, x_pos: 14, y_pos: 3 },
    { name: "Phosphorus", symbol: "P", atomic: 15, category: "nonmetal", period: 3, x_pos: 15, y_pos: 3 },
    { name: "Sulfur", symbol: "S", atomic: 16, category: "nonmetal", period: 3, x_pos: 16, y_pos: 3 },
    { name: "Chlorine", symbol: "Cl", atomic: 17, category: "halogen", period: 3, x_pos: 17, y_pos: 3 },
    { name: "Argon", symbol: "Ar", atomic: 18, category: "noble gas", period: 3, x_pos: 18, y_pos: 3 },
    { name: "Potassium", symbol: "K", atomic: 19, category: "alkali metal", period: 4, x_pos: 1, y_pos: 4 },
    { name: "Calcium", symbol: "Ca", atomic: 20, category: "alkaline earth metal", period: 4, x_pos: 2, y_pos: 4 },
    { name: "Scandium", symbol: "Sc", atomic: 21, category: "transition metal", period: 4, x_pos: 3, y_pos: 4 },
    { name: "Titanium", symbol: "Ti", atomic: 22, category: "transition metal", period: 4, x_pos: 4, y_pos: 4 },
    { name: "Vanadium", symbol: "V", atomic: 23, category: "transition metal", period: 4, x_pos: 5, y_pos: 4 },
    { name: "Chromium", symbol: "Cr", atomic: 24, category: "transition metal", period: 4, x_pos: 6, y_pos: 4 },
    { name: "Manganese", symbol: "Mn", atomic: 25, category: "transition metal", period: 4, x_pos: 7, y_pos: 4 },
    { name: "Iron", symbol: "Fe", atomic: 26, category: "transition metal", period: 4, x_pos: 8, y_pos: 4 },
    { name: "Cobalt", symbol: "Co", atomic: 27, category: "transition metal", period: 4, x_pos: 9, y_pos: 4 },
    { name: "Nickel", symbol: "Ni", atomic: 28, category: "transition metal", period: 4, x_pos: 10, y_pos: 4 },
    { name: "Copper", symbol: "Cu", atomic: 29, category: "transition metal", period: 4, x_pos: 11, y_pos: 4 },
    { name: "Zinc", symbol: "Zn", atomic: 30, category: "transition metal", period: 4, x_pos: 12, y_pos: 4 },
    { name: "Gallium", symbol: "Ga", atomic: 31, category: "post-transition metal", period: 4, x_pos: 13, y_pos: 4 },
    { name: "Germanium", symbol: "Ge", atomic: 32, category: "metalloid", period: 4, x_pos: 14, y_pos: 4 },
    { name: "Arsenic", symbol: "As", atomic: 33, category: "metalloid", period: 4, x_pos: 15, y_pos: 4 },
    { name: "Selenium", symbol: "Se", atomic: 34, category: "nonmetal", period: 4, x_pos: 16, y_pos: 4 },
    { name: "Bromine", symbol: "Br", atomic: 35, category: "halogen", period: 4, x_pos: 17, y_pos: 4 },
    { name: "Krypton", symbol: "Kr", atomic: 36, category: "noble gas", period: 4, x_pos: 18, y_pos: 4 },
    { name: "Rubidium", symbol: "Rb", atomic: 37, category: "alkali metal", period: 5, x_pos: 1, y_pos: 5 },
    { name: "Strontium", symbol: "Sr", atomic: 38, category: "alkaline earth metal", period: 5, x_pos: 2, y_pos: 5 },
    { name: "Yttrium", symbol: "Y", atomic: 39, category: "transition metal", period: 5, x_pos: 3, y_pos: 5 },
    { name: "Zirconium", symbol: "Zr", atomic: 40, category: "transition metal", period: 5, x_pos: 4, y_pos: 5 },
    { name: "Niobium", symbol: "Nb", atomic: 41, category: "transition metal", period: 5, x_pos: 5, y_pos: 5 },
    { name: "Molybdenum", symbol: "Mo", atomic: 42, category: "transition metal", period: 5, x_pos: 6, y_pos: 5 },
    { name: "Technetium", symbol: "Tc", atomic: 43, category: "transition metal", period: 5, x_pos: 7, y_pos: 5 },
    { name: "Ruthenium", symbol: "Ru", atomic: 44, category: "transition metal", period: 5, x_pos: 8, y_pos: 5 },
    { name: "Rhodium", symbol: "Rh", atomic: 45, category: "transition metal", period: 5, x_pos: 9, y_pos: 5 },
    { name: "Palladium", symbol: "Pd", atomic: 46, category: "transition metal", period: 5, x_pos: 10, y_pos: 5 },
    { name: "Silver", symbol: "Ag", atomic: 47, category: "transition metal", period: 5, x_pos: 11, y_pos: 5 },
    { name: "Cadmium", symbol: "Cd", atomic: 48, category: "transition metal", period: 5, x_pos: 12, y_pos: 5 },
    { name: "Indium", symbol: "In", atomic: 49, category: "post-transition metal", period: 5, x_pos: 13, y_pos: 5 },
    { name: "Tin", symbol: "Sn", atomic: 50, category: "post-transition metal", period: 5, x_pos: 14, y_pos: 5 },
    { name: "Antimony", symbol: "Sb", atomic: 51, category: "metalloid", period: 5, x_pos: 15, y_pos: 5 },
    { name: "Tellurium", symbol: "Te", atomic: 52, category: "metalloid", period: 5, x_pos: 16, y_pos: 5 },
    { name: "Iodine", symbol: "I", atomic: 53, category: "halogen", period: 5, x_pos: 17, y_pos: 5 },
    { name: "Xenon", symbol: "Xe", atomic: 54, category: "noble gas", period: 5, x_pos: 18, y_pos: 5 },
    { name: "Caesium", symbol: "Cs", atomic: 55, category: "alkali metal", period: 6, x_pos: 1, y_pos: 6 },
    { name: "Barium", symbol: "Ba", atomic: 56, category: "alkaline earth metal", period: 6, x_pos: 2, y_pos: 6 },
    
    // Lanthanides (f-block) are placed visually in rows 9 (Ln) and 10 (Ac)
    { name: "Lanthanum", symbol: "La", atomic: 57, category: "lanthanide", period: 6, x_pos: 3, y_pos: 9 }, // Modified x_pos/y_pos for f-block display
    { name: "Cerium", symbol: "Ce", atomic: 58, category: "lanthanide", period: 6, x_pos: 4, y_pos: 9 },
    { name: "Praseodymium", symbol: "Pr", atomic: 59, category: "lanthanide", period: 6, x_pos: 5, y_pos: 9 },
    { name: "Neodymium", symbol: "Nd", atomic: 60, category: "lanthanide", period: 6, x_pos: 6, y_pos: 9 },
    { name: "Promethium", symbol: "Pm", atomic: 61, category: "lanthanide", period: 6, x_pos: 7, y_pos: 9 },
    { name: "Samarium", symbol: "Sm", atomic: 62, category: "lanthanide", period: 6, x_pos: 8, y_pos: 9 },
    { name: "Europium", symbol: "Eu", atomic: 63, category: "lanthanide", period: 6, x_pos: 9, y_pos: 9 },
    { name: "Gadolinium", symbol: "Gd", atomic: 64, category: "lanthanide", period: 6, x_pos: 10, y_pos: 9 },
    { name: "Terbium", symbol: "Tb", atomic: 65, category: "lanthanide", period: 6, x_pos: 11, y_pos: 9 },
    { name: "Dysprosium", symbol: "Dy", atomic: 66, category: "lanthanide", period: 6, x_pos: 12, y_pos: 9 },
    { name: "Holmium", symbol: "Ho", atomic: 67, category: "lanthanide", period: 6, x_pos: 13, y_pos: 9 },
    { name: "Erbium", symbol: "Er", atomic: 68, category: "lanthanide", period: 6, x_pos: 14, y_pos: 9 },
    { name: "Thulium", symbol: "Tm", atomic: 69, category: "lanthanide", period: 6, x_pos: 15, y_pos: 9 },
    { name: "Ytterbium", symbol: "Yb", atomic: 70, category: "lanthanide", period: 6, x_pos: 16, y_pos: 9 },
    { name: "Lutetium", symbol: "Lu", atomic: 71, category: "lanthanide", period: 6, x_pos: 17, y_pos: 9 },
    
    { name: "Hafnium", symbol: "Hf", atomic: 72, category: "transition metal", period: 6, x_pos: 4, y_pos: 6 },
    { name: "Tantalum", symbol: "Ta", atomic: 73, category: "transition metal", period: 6, x_pos: 5, y_pos: 6 },
    { name: "Tungsten", symbol: "W", atomic: 74, category: "transition metal", period: 6, x_pos: 6, y_pos: 6 },
    { name: "Rhenium", symbol: "Re", atomic: 75, category: "transition metal", period: 6, x_pos: 7, y_pos: 6 },
    { name: "Osmium", symbol: "Os", atomic: 76, category: "transition metal", period: 6, x_pos: 8, y_pos: 6 },
    { name: "Iridium", symbol: "Ir", atomic: 77, category: "transition metal", period: 6, x_pos: 9, y_pos: 6 },
    { name: "Platinum", symbol: "Pt", atomic: 78, category: "transition metal", period: 6, x_pos: 10, y_pos: 6 },
    { name: "Gold", symbol: "Au", atomic: 79, category: "transition metal", period: 6, x_pos: 11, y_pos: 6 },
    { name: "Mercury", symbol: "Hg", atomic: 80, category: "transition metal", period: 6, x_pos: 12, y_pos: 6 },
    { name: "Thallium", symbol: "Tl", atomic: 81, category: "post-transition metal", period: 6, x_pos: 13, y_pos: 6 },
    { name: "Lead", symbol: "Pb", atomic: 82, category: "post-transition metal", period: 6, x_pos: 14, y_pos: 6 },
    { name: "Bismuth", symbol: "Bi", atomic: 83, category: "post-transition metal", period: 6, x_pos: 15, y_pos: 6 },
    { name: "Polonium", symbol: "Po", atomic: 84, category: "metalloid", period: 6, x_pos: 16, y_pos: 6 },
    { name: "Astatine", symbol: "At", atomic: 85, category: "halogen", period: 6, x_pos: 17, y_pos: 6 },
    { name: "Radon", symbol: "Rn", atomic: 86, category: "noble gas", period: 6, x_pos: 18, y_pos: 6 },
    { name: "Francium", symbol: "Fr", atomic: 87, category: "alkali metal", period: 7, x_pos: 1, y_pos: 7 },
    { name: "Radium", symbol: "Ra", atomic: 88, category: "alkaline earth metal", period: 7, x_pos: 2, y_pos: 7 },
    
    // Actinides (f-block)
    { name: "Actinium", symbol: "Ac", atomic: 89, category: "actinide", period: 7, x_pos: 3, y_pos: 10 }, // Modified x_pos/y_pos for f-block display
    { name: "Thorium", symbol: "Th", atomic: 90, category: "actinide", period: 7, x_pos: 4, y_pos: 10 },
    { name: "Protactinium", symbol: "Pa", atomic: 91, category: "actinide", period: 7, x_pos: 5, y_pos: 10 },
    { name: "Uranium", symbol: "U", atomic: 92, category: "actinide", period: 7, x_pos: 6, y_pos: 10 },
    { name: "Neptunium", symbol: "Np", atomic: 93, category: "actinide", period: 7, x_pos: 7, y_pos: 10 },
    { name: "Plutonium", symbol: "Pu", atomic: 94, category: "actinide", period: 7, x_pos: 8, y_pos: 10 },
    { name: "Americium", symbol: "Am", atomic: 95, category: "actinide", period: 7, x_pos: 9, y_pos: 10 },
    { name: "Curium", symbol: "Cm", atomic: 96, category: "actinide", period: 7, x_pos: 10, y_pos: 10 },
    { name: "Berkelium", symbol: "Bk", atomic: 97, category: "actinide", period: 7, x_pos: 11, y_pos: 10 },
    { name: "Californium", symbol: "Cf", atomic: 98, category: "actinide", period: 7, x_pos: 12, y_pos: 10 },
    { name: "Einsteinium", symbol: "Es", atomic: 99, category: "actinide", period: 7, x_pos: 13, y_pos: 10 },
    { name: "Fermium", symbol: "Fm", atomic: 100, category: "actinide", period: 7, x_pos: 14, y_pos: 10 },
    { name: "Mendelevium", symbol: "Md", atomic: 101, category: "actinide", period: 7, x_pos: 15, y_pos: 10 },
    { name: "Nobelium", symbol: "No", atomic: 102, category: "actinide", period: 7, x_pos: 16, y_pos: 10 },
    { name: "Lawrencium", symbol: "Lr", atomic: 103, category: "actinide", period: 7, x_pos: 17, y_pos: 10 },
    
    { name: "Rutherfordium", symbol: "Rf", atomic: 104, category: "transition metal", period: 7, x_pos: 4, y_pos: 7 },
    { name: "Dubnium", symbol: "Db", atomic: 105, category: "transition metal", period: 7, x_pos: 5, y_pos: 7 },
    { name: "Seaborgium", symbol: "Sg", atomic: 106, category: "transition metal", period: 7, x_pos: 6, y_pos: 7 },
    { name: "Bohrium", symbol: "Bh", atomic: 107, category: "transition metal", period: 7, x_pos: 7, y_pos: 7 },
    { name: "Hassium", symbol: "Hs", atomic: 108, category: "transition metal", period: 7, x_pos: 8, y_pos: 7 },
    { name: "Meitnerium", symbol: "Mt", atomic: 109, category: "unknown", period: 7, x_pos: 9, y_pos: 7 },
    { name: "Darmstadtium", symbol: "Ds", atomic: 110, category: "unknown", period: 7, x_pos: 10, y_pos: 7 },
    { name: "Roentgenium", symbol: "Rg", atomic: 111, category: "unknown", period: 7, x_pos: 11, y_pos: 7 },
    { name: "Copernicium", symbol: "Cn", atomic: 112, category: "transition metal", period: 7, x_pos: 12, y_pos: 7 },
    { name: "Nihonium", symbol: "Nh", atomic: 113, category: "post-transition metal", period: 7, x_pos: 13, y_pos: 7 },
    { name: "Flerovium", symbol: "Fl", atomic: 114, category: "post-transition metal", period: 7, x_pos: 14, y_pos: 7 },
    { name: "Moscovium", symbol: "Mc", atomic: 115, category: "post-transition metal", period: 7, x_pos: 15, y_pos: 7 },
    { name: "Livermorium", symbol: "Lv", atomic: 116, category: "post-transition metal", period: 7, x_pos: 16, y_pos: 7 },
    { name: "Tennessine", symbol: "Ts", atomic: 117, category: "halogen", period: 7, x_pos: 17, y_pos: 7 },
    { name: "Oganesson", symbol: "Og", atomic: 118, category: "noble gas", period: 7, x_pos: 18, y_pos: 7 }
];

const categoryColors = {
    "alkali metal": "bg-red-500 hover:bg-red-600",
    "alkaline earth metal": "bg-orange-500 hover:bg-orange-600",
    "transition metal": "bg-yellow-500 hover:bg-yellow-600",
    "post-transition metal": "bg-gray-400 hover:bg-gray-500",
    "metalloid": "bg-green-500 hover:bg-green-600",
    "nonmetal": "bg-blue-500 hover:bg-blue-600",
    "halogen": "bg-pink-500 hover:bg-pink-600",
    "noble gas": "bg-purple-500 hover:bg-purple-600",
    "lanthanide": "bg-indigo-500 hover:bg-indigo-600",
    "actinide": "bg-teal-500 hover:bg-teal-600",
    "unknown": "bg-gray-700 hover:bg-gray-800"
};

// --- Modal Component Definition ---

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            {/* Added max-h-[90vh] and flex-col for better vertical responsiveness */}
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl transform transition-all scale-100 opacity-100 max-h-[90vh] flex flex-col">
                {/* Header is fixed at the top */}
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {/* Content body is scrollable */}
                <div className="overflow-y-auto flex-grow">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

export default function App() {
    const [selected, setSelected] = useState(null);
    const [aiResponse, setAiResponse] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    const askMentor = async () => {
        if (!selected || aiLoading) return;

        setAiResponse("");
        setAiLoading(true);

        try {
            const prompt = `You are the Equinox AI Mentor. Give a small, simple, and easy-to-understand explanation of the chemical element ${selected.name} (${selected.symbol}), suitable for a beginner student. Include its main use and a key fact.`;
            const body = {
                contents: [{ parts: [{ text: prompt }] }],
                tools: [{ "google_search": {} }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" }
                ]
            };

            const maxRetries = 3;
            let lastError = null;

            for (let i = 0; i < maxRetries; i++) {
                try {
                    const res = await fetch(GEMINI_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body)
                    });

                    if (!res.ok) {
                        throw new Error(`Gemini request failed with status: ${res.status}`);
                    }

                    const data = await res.json();
                    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n").trim();
                    setAiResponse(text || "No response");
                    return; // Success, exit retry loop

                } catch (err) {
                    lastError = err;
                    if (i < maxRetries - 1) {
                        const delay = Math.pow(2, i) * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
            throw lastError; // If all retries fail

        } catch (err) {
            console.error("Periodic table mentor error", err);
            setAiResponse("AI unavailable or an error occurred.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleModalClose = () => {
        setSelected(null);
        setAiResponse("");
        setAiLoading(false);
    }

    // Filter function for the main block elements (y_pos 1-7)
    const isMainBlockElement = (el) => el.y_pos <= 7;

    // Filter function for the Lanthanides (y_pos 9)
    const isLanthanide = (el) => el.y_pos === 9;

    // Filter function for the Actinides (y_pos 10)
    const isActinide = (el) => el.y_pos === 10;
    
    // Base Tile component
    const ElementTile = ({el}) => (
        <button
            key={el.atomic}
            onClick={() => setSelected(el)}
            className={`
                relative w-full aspect-square flex flex-col items-center justify-between p-1
                rounded-sm transition-transform shadow-md text-white border border-gray-900/10
                hover:scale-110 hover:z-20 hover:shadow-xl
                ${categoryColors[el.category] || "bg-gray-700 hover:bg-gray-800"}
            `}
            style={{ 
                gridColumn: el.x_pos, 
                gridRow: el.y_pos 
            }}
        >
            {/* Atomic Number: Top Left */}
            <span className="absolute top-0.5 left-1 text-[8px] sm:text-[9px] md:text-[10px] font-medium opacity-90">
                {el.atomic}
            </span>
            
            {/* Symbol: Center */}
            <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mt-2">
                {el.symbol}
            </span>
            
            {/* Name: Bottom */}
            <span className="text-[6px] sm:text-[7px] md:text-[8px] truncate max-w-full font-medium opacity-90 pb-0.5">
                {el.name}
            </span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-900 p-2 sm:p-6 font-sans flex flex-col items-center justify-center">
            
            <div className="w-full max-w-[1400px] overflow-x-auto pb-4">
                {/* Main Grid Container - 18 columns */}
                <div
                    className="grid gap-1 min-w-[900px] p-2"
                    style={{ 
                        gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
                        gridTemplateRows: "repeat(7, auto) 20px repeat(2, auto)", 
                    }}
                >
                    {/* --- Render Main Block Elements (y_pos 1 through 7) --- */}
                    {elements.filter(isMainBlockElement).map((el) => (
                        <ElementTile key={el.atomic} el={el} />
                    ))}

                    {/* --- Placeholders inside main grid --- */}
                    {/* Lanthanides Placeholder (57-71) */}
                    <div 
                        className="bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 text-[10px] sm:text-xs flex items-center justify-center rounded-sm cursor-pointer hover:bg-indigo-800/50 transition"
                        style={{ gridColumn: 3, gridRow: 6 }}
                        onClick={() => document.getElementById('f-block-start').scrollIntoView({ behavior: 'smooth' })}
                    >
                        57-71
                    </div>
                    
                    {/* Actinides Placeholder (89-103) */}
                    <div 
                        className="bg-teal-900/50 border border-teal-500/30 text-teal-200 text-[10px] sm:text-xs flex items-center justify-center rounded-sm cursor-pointer hover:bg-teal-800/50 transition"
                        style={{ gridColumn: 3, gridRow: 7 }}
                        onClick={() => document.getElementById('f-block-start').scrollIntoView({ behavior: 'smooth' })}
                    >
                        89-103
                    </div>

                    {/* --- Spacer Row 8 --- */}
                    <div style={{ gridColumn: '1 / span 18', gridRow: 8 }}></div>

                    {/* --- Render Lanthanides (f-block, visually Row 9) --- */}
                    <div id="f-block-start"></div> {/* Anchor for scrolling */}
                    {elements.filter(isLanthanide).map((el) => (
                        <ElementTile key={el.atomic} el={el} />
                    ))}
                    
                    {/* --- Render Actinides (f-block, visually Row 10) --- */}
                    {elements.filter(isActinide).map((el) => (
                        <ElementTile key={el.atomic} el={el} />
                    ))}
                </div>
            </div>

            {/* --- Legend --- */}
            <div className="w-full max-w-[1000px] mt-8 px-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-3">
                    {Object.entries(categoryColors).map(([category, colorClass]) => (
                        <div key={category} className="flex items-center space-x-2">
                            {/* Color Circle Indicator */}
                            <div className={`w-4 h-4 rounded-full shadow-sm ${colorClass.split(' ')[0]} border border-white/20`}></div>
                            <span className="text-gray-300 text-xs sm:text-sm capitalize font-medium">
                                {category}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Element Modal --- */}
            <Modal isOpen={!!selected} onClose={handleModalClose} title={selected?.name || "Element Details"}>
                <div className="text-center space-y-4 p-6">
                    <div className={`${categoryColors[selected?.category]?.split(' ')[0]} px-8 py-4 rounded-2xl text-white text-6xl font-bold mb-4 mx-auto w-32 h-32 flex items-center justify-center shadow-lg`}>
                        {selected?.symbol}
                    </div>
                    <p className="text-gray-700 text-lg"><strong>Atomic Number:</strong> {selected?.atomic}</p>
                    <p className="text-gray-700 text-lg"><strong>Category:</strong> {selected?.category.charAt(0).toUpperCase() + selected?.category.slice(1)}</p>
                    <p className="text-gray-700 text-lg"><strong>Period:</strong> {selected?.period}</p>
                    
                    {/* Ask AI button */}
                    <button 
                        onClick={askMentor} 
                        disabled={aiLoading}
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition duration-200 disabled:bg-gray-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg mt-6"
                    >
                        {aiLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Asking AI...
                            </div>
                        ) : `Ask AI Mentor about ${selected?.name}`}
                    </button>
                    
                    {/* AI Response */}
                    {(aiResponse || aiLoading) && (
                        <div className="mt-4 text-left bg-purple-50 p-4 rounded-xl shadow-inner border border-purple-200 max-h-48 overflow-y-auto">
                            <strong className="text-purple-800">AI Mentor Response:</strong>
                            {aiLoading ? (
                                <div className="animate-pulse space-y-2 mt-2">
                                    <div className="h-4 bg-purple-200 rounded w-full"></div>
                                    <div className="h-4 bg-purple-200 rounded w-5/6"></div>
                                    <div className="h-4 bg-purple-200 rounded w-4/6"></div>
                                </div>
                            ) : (
                                <p className="text-gray-800 mt-2 whitespace-pre-wrap">{aiResponse}</p>
                            )}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}