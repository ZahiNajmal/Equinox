import { useState, useEffect } from "react";
// Removed external dependencies that cannot be resolved in a single-file environment
// import api from "../utils/api"; 
import { BeakerIcon } from "@heroicons/react/24/outline";
// import Modal from "../components/Modal"; // Removed external import

// --- START: Self-Contained Modal Component Definition ---
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    // Fixed structure for better accessibility and responsiveness
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl transform transition-all scale-100 opacity-100 max-h-[90vh] flex flex-col">
                {/* Header */}
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
// --- END: Self-Contained Modal Component Definition ---

// --- START: Interactive Wave Model Visualization ---
const WaveModel = ({ frequency, amplitude, isRunning }) => {
    const points = [];
    const width = 300;
    const height = 150;
    const verticalCenter = height / 2;

    // Generate points for a sine wave path
    for (let x = 0; x <= width; x++) {
        // Normalize x to create cycles based on frequency
        const cycles = 5; // Total cycles shown
        const radians = (x / width) * (Math.PI * 2 * cycles) * frequency;
        
        // Scale amplitude (10-100) to a display size (max 40px displacement)
        const displacement = (amplitude / 100) * 40; 
        
        // Calculate y coordinate
        const y = verticalCenter - Math.sin(radians) * displacement; 
        
        points.push(`${x},${y}`);
    }

    const pathData = `M${points.join(' L')}`;

    return (
        <div className="flex justify-center items-center h-40 bg-white rounded-lg border border-indigo-200 p-2 relative overflow-hidden my-4 shadow-lg">
            {isRunning && (
                <div className="absolute inset-0 bg-indigo-50/80 flex items-center justify-center backdrop-blur-sm z-10">
                    <span className="text-indigo-700 font-semibold text-lg animate-pulse">Running Simulation...</span>
                </div>
            )}
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {/* Center line */}
                <line x1="0" y1={verticalCenter} x2={width} y2={verticalCenter} stroke="#ccc" strokeWidth="1" strokeDasharray="4 2" />
                {/* Wave Path */}
                <path 
                    d={pathData} 
                    fill="none" 
                    stroke="#4F46E5" // indigo-600
                    strokeWidth="3" 
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className={isRunning ? "opacity-50" : "opacity-100 transition-opacity duration-300"}
                />
            </svg>
        </div>
    );
};
// --- END: Interactive Wave Model Visualization ---


// Assuming 'primary', 'accent1', and 'accent3' are defined in the parent Tailwind config.
// For the heading, we use standard Tailwind colors (indigo/purple) to simulate a common "primary" gradient effect.

export default function Prisma() {
  const [experiments, setExperiments] = useState([]); // default empty array
  const [selected, setSelected] = useState(null);
  const [variables, setVariables] = useState({ frequency: 0.1, amplitude: 50 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // new state for loading experiments
  const [error, setError] = useState(null);

  // Helper function to safely handle alerts (since we cannot use standard alert in this environment)
  const showMessage = (msg) => {
    // In a real app, this would trigger a custom Toast or Notification component
    console.log(msg);
  };

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        // Mocking API call for demonstration, as the actual API might not be available
        // const res = await api.get("/experiments");
        // setExperiments(res.data || []); 

        // Mock data for display
        const mockData = [
          { id: 1, title: "Quantum Entanglement Analysis", description: "Simulating wave-particle duality and spin observation.", tags: ["Physics", "Simulation"] },
          { id: 2, title: "Gene Expression Model", description: "Exploring the impact of environmental factors on RNA synthesis.", tags: ["Biology", "Genetics"] },
          { id: 3, title: "Chemical Reaction Kinetics", description: "Observing reaction rates under varying temperature and pressure.", tags: ["Chemistry", "Kinetics"] },
        ];
        setExperiments(mockData);

      } catch (err) {
        console.error("Error fetching experiments:", err);
        setError("Failed to load experiments");
      } finally {
        setFetching(false);
      }
    };

    fetchExperiments();
  }, []);

  const runSimulation = async () => {
    if (!selected) return;

    setLoading(true);
    setResult(null); // Clear previous results
    try {
      // Mock result generation delay
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulates network delay and computation

      const mockResult = {
        experimentId: selected.id,
        status: "Completed",
        input: variables,
        output: {
          peakWavelength: (Math.random() * 600 + 400).toFixed(2) + " nm",
          efficiency: (variables.amplitude * variables.frequency * 2 / 100).toFixed(4),
          observationTime: new Date().toLocaleTimeString(),
          simulationDuration: "2.0s"
        }
      };
      setResult(mockResult);
      showMessage("Simulation complete! +100 XP");

    } catch (err) {
      console.error("Simulation error:", err);
      showMessage("Simulation error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center mt-20">Loading experiments...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* === START: Updated Heading Block === */}
        <div className="text-center mb-16 pt-10">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
            Prisma Virtual Labs
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to the simulation environment. Select an experiment below to configure variables and run your simulated analysis.
          </p>
        </div>
        {/* === END: Updated Heading Block === */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              onClick={() => {
                setSelected(exp);
                setVariables({ frequency: 0.1, amplitude: 50 }); // defaults
                setResult(null); // Clear result when new experiment is selected
              }}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer p-6 border border-gray-100"
            >
              <BeakerIcon className="h-16 w-16 text-indigo-500 mx-auto mb-4" /> {/* Adjusted icon color */}
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{exp.title || "Untitled"}</h3>
              <p className="text-gray-600 text-center mb-4 text-sm">{exp.description || "No description available."}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {(exp.tags || []).map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full font-medium"> {/* Adjusted tag color */}
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || "Experiment"}>
          <div className="space-y-6 p-4">
            <p className="text-lg text-gray-700">{selected?.description || "No description."}</p>

            {/* Interactive Model Visualization */}
            <WaveModel 
                frequency={variables.frequency} 
                amplitude={variables.amplitude} 
                isRunning={loading}
            />

            {/* Variable Controls */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold mb-3 border-b pb-2">Configuration</h4>
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Frequency (0.01 - 1) 
                    <span className="float-right text-indigo-600 font-bold">{variables.frequency.toFixed(2) || 0.10}</span>
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="1"
                    step="0.01"
                    value={variables.frequency || 0.1}
                    onChange={(e) => {setVariables({ ...variables, frequency: parseFloat(e.target.value) }); setResult(null);}}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-indigo-500"
                  />
                </div>
                <div className="mt-4">
                  <label className="block font-medium mb-2 text-gray-700">
                    Amplitude (10 - 100)
                    <span className="float-right text-indigo-600 font-bold">{variables.amplitude || 50}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={variables.amplitude || 50}
                    onChange={(e) => {setVariables({ ...variables, amplitude: parseFloat(e.target.value) }); setResult(null);}}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-indigo-500"
                  />
                </div>
            </div>


            <button
              onClick={runSimulation}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running Simulation...
                </span>
              ) : (
                "Run Simulation"
              )}
            </button>

            {result && (
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl shadow-inner">
                <h4 className="text-xl font-bold text-green-700 mb-4 flex items-center">
                    <BeakerIcon className="h-6 w-6 mr-2" />
                    Simulation Results
                </h4>
                <div className="space-y-3">
                    {/* Display Input Variables */}
                    <h5 className="font-semibold text-gray-800 border-b pb-1">Input Parameters</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <p className="text-gray-600">Frequency:</p>
                        <p className="font-mono text-gray-800">{result.input.frequency.toFixed(2)}</p>
                        <p className="text-gray-600">Amplitude:</p>
                        <p className="font-mono text-gray-800">{result.input.amplitude}</p>
                    </div>

                    {/* Display Output Metrics */}
                    <h5 className="font-semibold text-gray-800 border-b pb-1 pt-3">Key Output Metrics</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <p className="text-gray-600">Peak Wavelength:</p>
                        <p className="font-mono text-indigo-700 font-bold">{result.output.peakWavelength}</p>

                        <p className="text-gray-600">System Efficiency:</p>
                        <p className="font-mono text-indigo-700 font-bold">{result.output.efficiency}</p>

                        <p className="text-gray-600">Observation Time:</p>
                        <p className="font-mono text-gray-800">{result.output.observationTime}</p>

                        <p className="text-gray-600">Duration:</p>
                        <p className="font-mono text-gray-800">{result.output.simulationDuration}</p>
                    </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}