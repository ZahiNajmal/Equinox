import React, { useState, useEffect, useCallback } from "react";
import { BeakerIcon, GlobeAltIcon, CalculatorIcon, AcademicCapIcon, AdjustmentsHorizontalIcon, CurrencyDollarIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

// --- START: Self-Contained Modal Component Definition ---
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

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

// --- START: Visualization Components (Specialized) ---

// 1. Physics Wave Model (IDs 1, 2, 3)
const PhysicsWaveModel = ({ frequency, amplitude, isRunning }) => {
    const [phaseShift, setPhaseShift] = useState(0);

    useEffect(() => {
        if (!isRunning) {
            setPhaseShift(0);
            return;
        }

        let frameId;
        const speed = 0.08; 
        const tick = () => {
            setPhaseShift(prev => (prev + speed) % (Math.PI * 2));
            frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [isRunning]);

    const points = [];
    const width = 300; 
    const height = 150;
    const verticalCenter = height / 2;

    for (let x = 0; x <= width; x++) {
        const cycles = 5; 
        const radians = (x / width) * (Math.PI * 2 * cycles) * frequency + phaseShift; 
        const displacement = (amplitude / 100) * 40; 
        const y = verticalCenter - Math.sin(radians) * displacement; 
        points.push(`${x},${y}`);
    }

    const pathData = `M${points.join(' L')}`;

    return (
        <div className="flex justify-center items-center bg-white rounded-lg border border-blue-200 p-4 relative overflow-hidden my-4 shadow-lg h-40">
            {isRunning && (
                <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center backdrop-blur-sm z-10">
                    <span className="text-blue-700 font-semibold text-lg animate-pulse">Running Wave Simulation...</span>
                </div>
            )}
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-w-sm">
                <line x1="0" y1={verticalCenter} x2={width} y2={verticalCenter} stroke="#ccc" strokeWidth="1" strokeDasharray="4 2" />
                <path 
                    d={pathData} 
                    fill="none" 
                    stroke="#3B82F6" // Blue
                    strokeWidth="3" 
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

// 2. Generic Data Visualization (IDs 4, 5, 6, 7)
const DataVisualization = ({ primary, secondary, isRunning, title }) => {
    const normalizedPrimary = primary * 100; // 0-100
    const normalizedSecondary = secondary; // 10-100
    const maxBarHeight = 100;
    const bar1Height = (normalizedPrimary * maxBarHeight) / 100;
    const bar2Height = (normalizedSecondary * maxBarHeight) / 100;

    return (
        <div className="flex flex-col items-center bg-white rounded-lg border border-blue-200 p-4 relative overflow-hidden my-4 shadow-lg h-40">
            {isRunning && (
                <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center backdrop-blur-sm z-10">
                    <span className="text-blue-700 font-semibold text-lg animate-pulse">Calculating Data Model...</span>
                </div>
            )}
            <p className="text-sm font-semibold text-gray-700 mb-2">{title}</p>
            <div className="flex justify-around items-end h-full w-full max-w-xs">
                <div className="flex flex-col items-center">
                    <div style={{ height: `${bar1Height}px` }} className={`w-10 bg-orange-500 rounded-t-lg transition-all duration-500 ease-out`} />
                    <span className="text-xs mt-1 text-orange-700 font-medium">Input A</span>
                </div>
                <div className="flex flex-col items-center">
                    <div style={{ height: `${bar2Height}px` }} className={`w-10 bg-purple-500 rounded-t-lg transition-all duration-500 ease-out`} />
                    <span className="text-xs mt-1 text-purple-700 font-medium">Input B</span>
                </div>
            </div>
        </div>
    );
};

// 3. K-Means Clustering Visualization (ID 8)
const ClusteringVisualization = ({ frequency, amplitude, isRunning }) => {
    const [clusterPositions, setClusterPositions] = useState([]);
    const K = Math.max(2, Math.round(frequency * 10)); // 2 to 10 clusters
    const pointCount = 50;

    // Fixed color set for clusters (Orange, Purple, Blue, plus others)
    const colors = ["#F97316", "#A855F7", "#3B82F6", "#F59E0B", "#6366F1", "#EC4899", "#14B8A6", "#EF4444", "#64748B", "#10B981"];

    useEffect(() => {
        // Initialize random point positions and K centroids
        const initialPoints = Array.from({ length: pointCount }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            cluster: Math.floor(Math.random() * K), // Initial random assignment
        }));

        const initialCentroids = Array.from({ length: K }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
        }));

        setClusterPositions({ points: initialPoints, centroids: initialCentroids });
    }, [K, frequency, amplitude]);

    useEffect(() => {
        if (!isRunning) return;

        let frameId;
        let iteration = 0;
        const maxIterations = 20;

        const tick = () => {
            if (iteration >= maxIterations) {
                return;
            }
            
            setClusterPositions(prev => {
                const { points, centroids } = prev;

                // Step 1: Assignment - Points move slightly towards their current centroid
                const newPoints = points.map(p => {
                    const centroid = centroids[p.cluster];
                    const speed = (amplitude / 100) * 0.5 * (1 - iteration / maxIterations); // movement decays
                    
                    if (centroid) {
                        return {
                            ...p,
                            x: p.x + (centroid.x - p.x) * speed,
                            y: p.y + (centroid.y - p.y) * speed,
                        };
                    }
                    return p;
                });

                // Step 2: Update - Centroids move toward the center of their points
                const newCentroids = centroids.map((c, cIndex) => {
                    const assignedPoints = newPoints.filter(p => p.cluster === cIndex);
                    if (assignedPoints.length === 0) return c;

                    const avgX = assignedPoints.reduce((sum, p) => sum + p.x, 0) / assignedPoints.length;
                    const avgY = assignedPoints.reduce((sum, p) => sum + p.y, 0) / assignedPoints.length;
                    
                    // Simple centroid movement (no decay for centroids)
                    return { x: avgX, y: avgY };
                });

                // Recalculate nearest centroid for points (true assignment step)
                const finalPoints = newPoints.map(p => {
                    let minDistance = Infinity;
                    let nearestCluster = p.cluster;

                    newCentroids.forEach((c, cIndex) => {
                        const distSq = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
                        if (distSq < minDistance) {
                            minDistance = distSq;
                            nearestCluster = cIndex;
                        }
                    });

                    return { ...p, cluster: nearestCluster };
                });

                return { points: finalPoints, centroids: newCentroids };
            });

            iteration++;
            frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [isRunning, K, amplitude]);


    return (
        <div className="flex flex-col items-center bg-white rounded-lg border border-blue-200 p-4 relative overflow-hidden my-4 shadow-lg h-40">
            {isRunning && (
                <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center backdrop-blur-sm z-10">
                    <span className="text-blue-700 font-semibold text-lg animate-pulse">Running K-Means Iterations...</span>
                </div>
            )}
            <p className="text-sm font-semibold text-gray-700 mb-2">Clustering {pointCount} Data Points into {K} Clusters</p>
            <svg viewBox="0 0 100 100" className="w-full h-full max-w-sm border border-dashed border-gray-300 rounded-lg">
                {clusterPositions.points && clusterPositions.points.map((p, index) => (
                    <circle
                        key={index}
                        cx={p.x}
                        cy={p.y}
                        r={amplitude / 30 + 0.5} // point size based on amplitude
                        fill={colors[p.cluster % colors.length]}
                        opacity="0.8"
                        className="transition-all duration-300"
                    />
                ))}
                {clusterPositions.centroids && clusterPositions.centroids.map((c, index) => (
                    <rect
                        key={`centroid-${index}`}
                        x={c.x - 1.5}
                        y={c.y - 1.5}
                        width="3"
                        height="3"
                        fill="#000"
                        stroke="#fff"
                        strokeWidth="0.5"
                        className="transition-all duration-300"
                    />
                ))}
            </svg>
        </div>
    );
};

// 4. Exoplanet Transit Visualization (ID 9)
const ExoplanetTransitVisualization = ({ frequency, amplitude, isRunning }) => {
    const [time, setTime] = useState(0); // Time for orbital rotation

    // Star size based on frequency (0.01-1) -> scaled up 50-100px diameter
    const starRadius = 25 + frequency * 25; 
    
    // Orbital period (10-100) -> affects rotation speed
    const orbitalPeriod = amplitude; 
    
    // Planet size (arbitrary small scale)
    const planetRadius = 3;

    // Simulation loop
    useEffect(() => {
        if (!isRunning) {
            setTime(0);
            return;
        }

        let frameId;
        const tick = () => {
            const speed = 0.005 / (orbitalPeriod / 50); // Speed scales inversely with period
            setTime(prev => prev + speed);
            frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [isRunning, orbitalPeriod]);

    // Planet position (assuming orbit radius is fixed for visualization)
    const orbitRadius = 150;
    const planetX = 150 + Math.cos(time) * orbitRadius;
    const planetY = 150 + Math.sin(time) * orbitRadius * 0.1; // Make orbit slightly elliptical for perspective

    // Calculate light curve brightness
    let brightness = 100;
    
    // Simple transit logic: when planet crosses the center line (star)
    if (Math.abs(planetX - 150) < starRadius + planetRadius && Math.abs(planetY - 150) < 5) {
        // Calculate overlap depth
        const overlap = Math.max(0, starRadius + planetRadius - Math.abs(planetX - 150));
        brightness = 100 - (overlap / starRadius) * 10; // Max 10% dip
        brightness = Math.max(90, brightness); // Min brightness is 90
    }

    // Light curve points (mock/sample data for the plot)
    const lightCurvePoints = Array.from({ length: 300 }, (_, i) => {
        const x = i;
        // Simulates repeated dip linked to orbital period
        const periodFactor = 100 / orbitalPeriod;
        const transitEffect = Math.max(0, 10 * Math.sin((i * periodFactor + time * 10) / 100)); 
        let y = 140 - transitEffect * 1.5;
        
        // Ensure the current brightness is plotted correctly at the end
        if (i === 299) {
            y = 140 - (100 - brightness) * 4;
        }
        
        return `${x},${y}`;
    }).join(' ');


    return (
        <div className="flex flex-col items-center bg-white rounded-lg border border-blue-200 p-4 relative overflow-hidden my-4 shadow-lg h-80">
            {isRunning && (
                <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center backdrop-blur-sm z-10">
                    <span className="text-blue-700 font-semibold text-lg animate-pulse">Detecting Transit Signal...</span>
                </div>
            )}
            <p className="text-sm font-semibold text-gray-700 mb-2">Star Radius: {starRadius.toFixed(0)}px | Period: {orbitalPeriod.toFixed(0)}d</p>
            
            <div className="flex-1 w-full flex justify-around p-2">
                {/* Orbital View (Left) */}
                <div className="w-1/2 flex items-center justify-center relative">
                    <svg viewBox="0 0 300 300" className="w-40 h-40">
                        {/* Star */}
                        <circle cx="150" cy="150" r={starRadius} fill="#FCD34D" /> {/* Yellow/Orange */}
                        {/* Planet Orbit (faint) */}
                        <ellipse cx="150" cy="150" rx={orbitRadius} ry={orbitRadius * 0.1} stroke="#E5E7EB" fill="none" />
                        {/* Planet */}
                        <circle cx={planetX} cy={planetY} r={planetRadius} fill="#9CA3AF" /> {/* Gray/Blue */}
                    </svg>
                </div>

                {/* Light Curve (Right) */}
                <div className="w-1/2 p-2">
                    <h5 className="text-xs font-medium text-center text-gray-500 mb-1">Observed Brightness (Light Curve)</h5>
                    <svg viewBox="0 0 300 150" className="w-full h-24 border border-gray-300 rounded-md">
                        <polyline
                            points={lightCurvePoints}
                            fill="none"
                            stroke="#F97316" // Orange
                            strokeWidth="2"
                        />
                        <text x="5" y="15" fontSize="10" fill="#374151">100%</text>
                        <text x="5" y="145" fontSize="10" fill="#374151">Low</text>
                    </svg>
                    <p className="text-sm text-center mt-2 font-bold" style={{ color: brightness > 95 ? "#3B82F6" : "#F97316" }}>
                        Current Brightness: {brightness.toFixed(2)}%
                    </p>
                </div>
            </div>
        </div>
    );
};

// 5. Supply Chain Visualization (ID 10)
const SupplyChainVisualization = ({ frequency, amplitude, isRunning }) => {
    const [flowShift, setFlowShift] = useState(0);
    
    // Inventory level based on input. Low demand variability (frequency) and high cost (amplitude) leads to high inventory risk.
    const inventoryRisk = frequency * (amplitude / 100) * 100; // 0-100 scale

    // Animation loop for flow
    useEffect(() => {
        if (!isRunning) {
            setFlowShift(0);
            return;
        }
        let frameId;
        const speed = 0.5;
        const tick = () => {
            setFlowShift(prev => (prev + speed) % 20); // 20 is the cycle length for dash offset
            frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [isRunning]);

    // Define coordinates for the 3 main nodes
    const supplier = { x: 50, y: 50, label: "Source" };
    const distribution = { x: 150, y: 150, label: "DC / Inventory" };
    const retailer = { x: 250, y: 50, label: "Market" };
    
    // Inventory level color (Blue to Orange to Purple based on risk)
    let inventoryColor;
    if (inventoryRisk < 30) {
        inventoryColor = "#3B82F6"; // Blue (Low Risk)
    } else if (inventoryRisk < 60) {
        inventoryColor = "#F97316"; // Orange (Medium Risk)
    } else {
        inventoryColor = "#A855F7"; // Purple (High Risk)
    }

    return (
        <div className="flex flex-col items-center bg-white rounded-lg border border-blue-200 p-4 relative overflow-hidden my-4 shadow-lg h-40">
            {isRunning && (
                <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center backdrop-blur-sm z-10">
                    <span className="text-blue-700 font-semibold text-lg animate-pulse">Simulating Logistics Flow...</span>
                </div>
            )}
            <p className="text-sm font-semibold text-gray-700 mb-2">Inventory Risk: {inventoryRisk.toFixed(0)}%</p>
            <svg viewBox="0 0 300 200" className="w-full h-full max-w-sm">
                
                {/* Flow Lines (Goods) - Blue for flow */}
                <line x1={supplier.x} y1={supplier.y} x2={distribution.x} y2={distribution.y} stroke="#3B82F6" strokeWidth="3" strokeDasharray="10 10" strokeDashoffset={flowShift} />
                <line x1={distribution.x} y1={distribution.y} x2={retailer.x} y2={retailer.y} stroke="#3B82F6" strokeWidth="3" strokeDasharray="10 10" strokeDashoffset={flowShift} />
                
                {/* Nodes */}
                <circle cx={supplier.x} cy={supplier.y} r="10" fill="#F97316" stroke="#fff" strokeWidth="2" /> {/* Orange */}
                <rect x={distribution.x - 15} y={distribution.y - 15} width="30" height="30" fill={inventoryColor} stroke="#fff" strokeWidth="2" rx="5" />
                <circle cx={retailer.x} cy={retailer.y} r="10" fill="#A855F7" stroke="#fff" strokeWidth="2" /> {/* Purple */}
                
                {/* Labels */}
                <text x={supplier.x} y={supplier.y - 15} fontSize="12" textAnchor="middle" fill="#374151">{supplier.label}</text>
                <text x={distribution.x} y={distribution.y + 25} fontSize="12" textAnchor="middle" fill="#374151">{distribution.label}</text>
                <text x={retailer.x} y={retailer.y - 15} fontSize="12" textAnchor="middle" fill="#374151">{retailer.label}</text>

                {/* Inventory Indicator */}
                <text x={distribution.x} y={distribution.y + 5} fontSize="10" textAnchor="middle" fill="#fff" fontWeight="bold">{inventoryRisk.toFixed(0)}%</text>

            </svg>
        </div>
    );
};

// --- END: Visualization Components (Specialized) ---

// --- START: Visualization Router ---
const ExperimentVisualization = ({ selectedId, variables, isRunning }) => {
    const { frequency, amplitude } = variables;

    // Use specialized visuals for unique domains
    if (selectedId === 8) {
        return <ClusteringVisualization frequency={frequency} amplitude={amplitude} isRunning={isRunning} />;
    }
    if (selectedId === 9) {
        return <ExoplanetTransitVisualization frequency={frequency} amplitude={amplitude} isRunning={isRunning} />;
    }
    if (selectedId === 10) {
        return <SupplyChainVisualization frequency={frequency} amplitude={amplitude} isRunning={isRunning} />;
    }
    
    // Use Physics Wave Model for traditional science (IDs 1, 2, 3)
    if ([1, 2, 3].includes(selectedId)) {
        return <PhysicsWaveModel frequency={frequency} amplitude={amplitude} isRunning={isRunning} />;
    }
    
    // Use Generic Data Model for math/data-driven experiments (IDs 4, 5, 6, 7)
    const titleMap = {
        4: "Portfolio Risk vs. Capital",
        5: "Flow Velocity vs. Resilience",
        6: "Density vs. Speed Limit",
        7: "Growth Rate vs. Initial Pop.",
    };

    return (
        <DataVisualization 
            primary={frequency} 
            secondary={amplitude} 
            isRunning={isRunning} 
            title={titleMap[selectedId] || "Model Variables"}
        />
    );
};
// --- END: Visualization Router ---

export default function Prisma({ level = 1 }) {
    const currentLevel = Math.max(1, Number(level) || 1);
    const [experiments, setExperiments] = useState([]); 
    const [selected, setSelected] = useState(null);
    const [variables, setVariables] = useState({ frequency: 0.1, amplitude: 50 });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true); 
    const [error, setError] = useState(null);

    const showMessage = useCallback((msg) => {
        console.log(msg);
    }, []);

    // Map state keys ('frequency', 'amplitude') to user-friendly labels based on selected experiment
    const getVariableLabels = (id) => {
        switch (id) {
            case 4: // Optimal Portfolio Allocation
                return { 
                    freqLabel: "Risk Tolerance (Low 0.01 - High 1.0)",
                    ampLabel: "Initial Capital (10k - 100k)"
                };
            case 5: // River Erosion Prediction
                return { 
                    freqLabel: "Flow Velocity (Low 0.01 - High 1.0 m/s)",
                    ampLabel: "Soil Resilience (10 - 100 Index)" 
                };
            case 6: // Traffic Flow Dynamics
                return { 
                    freqLabel: "Density Factor (Low 0.01 - High 1.0)",
                    ampLabel: "Speed Limit (10 - 100 mph)"
                };
            case 7: // Historical Population Growth
                return { 
                    freqLabel: "Growth Rate (Low 0.01 - High 1.0 %)",
                    ampLabel: "Initial Population (10k - 100k)" 
                };
            case 8: // Data Clustering Analysis (K-Means)
                return { 
                    freqLabel: "K-Value (Number of Clusters 0.01-1.0 -> 2-10)",
                    ampLabel: "Feature Space Dimensionality (10-100)"
                };
            case 9: // Exoplanet Transit Detection
                return { 
                    freqLabel: "Star Size (0.01-1.0 Solar Radii)", 
                    ampLabel: "Planet Orbital Period (10-100 Earth Days)" 
                };
            case 10: // Supply Chain Optimization
                return { 
                    freqLabel: "Demand Variability (Low 0.01 - High 1.0)",
                    ampLabel: "Storage Cost Index (10 - 100)"
                };
            case 11:
                return { freqLabel: "Emissions Reduction Rate (0.01 - 1.0)", ampLabel: "Starting Emissions (10 - 100 units)" };
            case 12:
                return { freqLabel: "Transmission Rate (0.01 - 1.0)", ampLabel: "Initial Cases (10 - 100)" };
            case 13:
                return { freqLabel: "Sunlight Availability (0.01 - 1.0)", ampLabel: "Panel Area (10 - 100 m²)" };
            case 14:
                return { freqLabel: "Orbital Distance Factor (0.01 - 1.0)", ampLabel: "Planet Mass (10 - 100 units)" };
            case 1:
            case 2:
            case 3:
            default:
                return { 
                    freqLabel: "Frequency (0.01 - 1)",
                    ampLabel: "Amplitude (10 - 100)"
                };
        }
    };

    // Icon mapping for card visualization
    const getIcon = (tags) => {
        if (tags.includes("Physics") || tags.includes("Astronomy")) {
            return { icon: RocketLaunchIcon, color: "text-blue-500" }; // Blue
        }
        if (tags.includes("Chemistry") || tags.includes("Biology")) {
            return { icon: BeakerIcon, color: "text-blue-500" }; // Blue
        }
        if (tags.includes("Data Science") || tags.includes("AI")) {
            return { icon: AdjustmentsHorizontalIcon, color: "text-orange-500" }; // Orange
        }
        if (tags.includes("Economics") || tags.includes("Finance") || tags.includes("Logistics")) {
            return { icon: CurrencyDollarIcon, color: "text-purple-500" }; // Purple
        }
        if (tags.includes("Mathematics") || tags.includes("Optimization") || tags.includes("Engineering")) {
            return { icon: CalculatorIcon, color: "text-purple-500" }; // Purple
        }
        return { icon: GlobeAltIcon, color: "text-orange-500" }; // Default Orange
    };

    useEffect(() => {
        const fetchExperiments = async () => {
            try {
                // Mock data for display, expanded to include diverse subjects
                const mockData = [
                    { id: 1, title: "Quantum Entanglement Analysis", description: "Simulating wave-particle duality and spin observation.", tags: ["Physics", "Simulation", "Advanced"] },
                    { id: 2, title: "Gene Expression Model", description: "Exploring the impact of environmental factors on RNA synthesis.", tags: ["Biology", "Genetics"] },
                    { id: 3, title: "Chemical Reaction Kinetics", description: "Observing reaction rates under varying temperature and pressure.", tags: ["Chemistry", "Kinetics"] },
                    { id: 4, title: "Optimal Portfolio Allocation", description: "Modeling risk and return to determine the ideal asset mix.", tags: ["Finance", "Mathematics", "Optimization"] },
                    { id: 5, title: "River Erosion Prediction", description: "Forecasting bank erosion rates based on flow velocity and soil type.", tags: ["Geography", "Geomorphology", "Environmental"] },
                    { id: 6, title: "Traffic Flow Dynamics", description: "Analyzing density and speed limits on highway networks.", tags: ["Engineering", "Applied Math", "Transport"] },
                    { id: 7, title: "Historical Population Growth", description: "Using the logistic model to forecast regional demographic shifts.", tags: ["Social Science", "Statistics", "Forecasting"] },
                    { id: 8, title: "Data Clustering Analysis (K-Means)", description: "Applying K-Means to identify natural groupings in multi-dimensional datasets.", tags: ["Data Science", "Statistics", "AI"] },
                    { id: 9, title: "Exoplanet Transit Detection", description: "Modeling stellar brightness reduction to estimate exoplanet size and orbit.", tags: ["Astronomy", "Physics", "Modeling"] },
                    { id: 10, title: "Supply Chain Optimization", description: "Simulating inventory and logistics costs to find the most efficient distribution network.", tags: ["Economics", "Engineering", "Logistics"] },
                    { id: 11, title: "Climate Emissions Pathway", description: "Model how reduction effort changes emissions over a simulated period.", tags: ["Climate", "Environmental", "Mathematics"] },
                    { id: 12, title: "Epidemic Spread Model", description: "Explore how transmission and starting cases affect an outbreak scenario.", tags: ["Biology", "Public Health", "Statistics"] },
                    { id: 13, title: "Solar Panel Output", description: "Estimate clean-energy production from sunlight and panel area.", tags: ["Physics", "Energy", "Engineering"] },
                    { id: 14, title: "Planetary Orbit Explorer", description: "Compare a planet's mass and orbital distance in a simplified orbit model.", tags: ["Astronomy", "Physics", "Space"] },
                ];
                setExperiments(mockData.map((experiment) => ({
                    ...experiment,
                    requiredLevel: experiment.id <= 3 ? 1 : experiment.id <= 6 ? 4 : experiment.id <= 10 ? 7 : 11,
                })));

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
        
        // Determine input and output structure based on experiment ID
        const { frequency, amplitude } = variables;
        let mockOutput;
        const baseEfficiency = (amplitude * frequency * 2 / 100);

        switch (selected.id) {
            case 4: // Math/Finance
                mockOutput = {
                    "Expected Annual Return": `${(baseEfficiency * 15).toFixed(2)}%`,
                    "Sharpe Ratio": (baseEfficiency * 0.5 + 0.5).toFixed(3),
                    "Observation Time": new Date().toLocaleTimeString(),
                    "Simulation Duration": "1.5s"
                };
                break;
            case 5: // Geography
                mockOutput = {
                    "Predicted Erosion Rate": `${(amplitude * frequency / 20).toFixed(2)} cm/year`,
                    "Bank Stability Index": (100 - amplitude / 10 - frequency * 50).toFixed(1),
                    "Observation Time": new Date().toLocaleTimeString(),
                    "Simulation Duration": "2.5s"
                };
                break;
            case 6: // Engineering/Math
                mockOutput = {
                    "Max Throughput": `${(amplitude * frequency * 100).toFixed(0)} vehicles/hour`,
                    "Congestion Risk": `${(100 - amplitude / 10 + frequency * 50).toFixed(1)}%`,
                    "Observation Time": new Date().toLocaleTimeString(),
                    "Simulation Duration": "1.8s"
                };
                break;
            case 7: // Social Science/Stats
                mockOutput = {
                    "20 Year Forecast": `${(amplitude * (1 + frequency * 5) * 1000).toFixed(0)}`,
                    "Carrying Capacity": `${(amplitude * 1.5 * 1000).toFixed(0)}`,
                    "Observation Time": new Date().toLocaleTimeString(),
                    "Simulation Duration": "3.0s"
                };
                break;
            case 8: // Data Clustering Analysis (Data Science/Stats)
                mockOutput = {
                    "Optimal Cluster Count (K)": Math.max(2, Math.round(frequency * 10)),
                    "Silhouette Score": (0.5 + baseEfficiency * 0.4).toFixed(3),
                    "Observation Time": new Date().toLocaleTimeString(),
                    "Simulation Duration": "3.5s"
                };
                break;
            case 9: // Exoplanet Transit Detection (Astronomy/Physics)
                mockOutput = {
                    "Planet Radius (Earth R)": (amplitude * frequency / 50).toFixed(2),
                    "Transit Probability": (frequency * 100).toFixed(1) + "%",
                    "Observation Time": new Date().toLocaleTimeString(),
                    "Simulation Duration": "2.8s"
                };
                break;
            case 10: // Supply Chain Optimization (Economics/Engineering)
                mockOutput = {
                    "Optimal Safety Stock": (amplitude * frequency * 5).toFixed(0),
                    "Annual Savings Potential": `${(amplitude * 10000 * (1 - frequency)).toFixed(0)} $`,
                    "Inventory Cost Risk": `${((amplitude/100) * frequency * 100).toFixed(1)}%`,
                    "Observation Time": new Date().toLocaleTimeString(),
                    "Simulation Duration": "2.2s"
                };
                break;
            case 11:
                mockOutput = {
                    "Projected Emissions": `${(amplitude * (1 - frequency * 0.6)).toFixed(1)} units`,
                    "Total Reduction": `${(amplitude * frequency * 0.6).toFixed(1)} units`,
                    "Model Note": "Simplified educational scenario, not a real-world forecast",
                    "Observation Time": new Date().toLocaleTimeString(),
                };
                break;
            case 12:
                mockOutput = {
                    "Estimated Next-Period Cases": Math.round(amplitude * (1 + frequency * 1.8)),
                    "Scenario Risk": `${Math.min(100, frequency * 100).toFixed(1)}%`,
                    "Model Note": "Illustrative only; not medical advice or a real forecast",
                    "Observation Time": new Date().toLocaleTimeString(),
                };
                break;
            case 13:
                mockOutput = {
                    "Estimated Daily Energy": `${(amplitude * frequency * 4.5).toFixed(1)} kWh`,
                    "Sunlight Factor": `${(frequency * 100).toFixed(1)}%`,
                    "Model Note": "Simplified estimate; actual output depends on location and equipment",
                    "Observation Time": new Date().toLocaleTimeString(),
                };
                break;
            case 14:
                mockOutput = {
                    "Relative Orbital Period": `${Math.sqrt(Math.pow(1 / Math.max(frequency, 0.01), 3) / Math.max(amplitude / 50, 0.2)).toFixed(2)} model units`,
                    "Orbital Distance Factor": frequency.toFixed(2),
                    "Model Note": "Simplified educational model, not an ephemeris",
                    "Observation Time": new Date().toLocaleTimeString(),
                };
                break;
            case 1:
            case 2:
            case 3:
            default: // Science
                mockOutput = {
                    "Peak Wavelength": (Math.random() * 600 + 400).toFixed(2) + " nm",
                    "System Efficiency": baseEfficiency.toFixed(4),
                    "Observation Time": new Date().toLocaleTimeString(),
                    "Simulation Duration": "2.0s"
                };
                break;
        }

        try {
            // Mock result generation delay
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulates network delay and computation

            setResult({
                experimentId: selected.id,
                status: "Completed",
                input: variables,
                output: mockOutput
            });
            showMessage("Simulation complete! Results are ready.");

        } catch (err) {
            console.error("Simulation error:", err);
            showMessage("Simulation failed due to an internal error.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="text-center mt-20">Loading experiments...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

    // Get dynamic labels for the selected experiment
    const currentLabels = selected ? getVariableLabels(selected.id) : { freqLabel: "", ampLabel: "" };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* === START: Heading Block === */}
                <div className="text-center mb-16 pt-10">
                    <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500">
                        Prisma Virtual Labs
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                        Welcome to the simulation environment. Select an experiment below to configure variables and run your simulated analysis.
                    </p>
                </div>
                {/* === END: Heading Block */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {experiments.map((exp) => {
                        const { icon: Icon, color: iconColor } = getIcon(exp.tags);
                        const isSelected = selected && selected.id === exp.id;
                        const isLocked = currentLevel < exp.requiredLevel;
                        return (
                            <div
                                key={exp.id}
                                onClick={() => {
                                    if (isLocked) return;
                                    setSelected(exp);
                                    setVariables({ frequency: 0.1, amplitude: 50 }); // defaults
                                    setResult(null); // Clear result when new experiment is selected
                                }}
                                aria-disabled={isLocked}
                                className={`relative bg-white rounded-2xl shadow-xl transition transform p-6 border-2 ${isLocked ? "cursor-not-allowed opacity-65" : "cursor-pointer hover:shadow-2xl hover:-translate-y-2"} ${
                                    isSelected 
                                        ? "border-blue-500 ring-4 ring-orange-300" // New gradient-themed selection style
                                        : "border-gray-100"
                                }`}
                            >
                                {/* Dynamic Icon based on tags */}
                                <Icon className={`h-16 w-16 ${iconColor} mx-auto mb-4`} /> 
                                
                                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{exp.title || "Untitled"}</h3>
                                <p className="text-gray-600 text-center mb-4 text-sm">{exp.description || "No description available."}</p>
                                {isLocked && <p className="mb-3 text-center text-sm font-bold text-purple-700">Unlocks at Level {exp.requiredLevel}</p>}
                                {!isLocked && exp.requiredLevel > 1 && <p className="mb-3 text-center text-xs font-semibold text-emerald-700">Level {exp.requiredLevel} Lab Pack unlocked</p>}
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {(exp.tags || []).map((tag) => (
                                        <span 
                                            key={tag} 
                                            className="px-3 py-1 text-xs bg-blue-100/70 text-blue-800 rounded-full font-medium" // Blue tag background
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* === Simulation Configuration Modal === */}
                <Modal 
                    isOpen={!!selected} 
                    onClose={() => { setSelected(null); setLoading(false); }} 
                    title={selected ? selected.title : "Simulation"}
                >
                    <div className="p-6">
                        <p className="text-gray-600 mb-6">{selected?.description}</p>

                        {/* Visualization Area */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Live Visualization</h4>
                            {selected && (
                                <ExperimentVisualization 
                                    selectedId={selected.id} 
                                    variables={variables} 
                                    isRunning={loading} 
                                />
                            )}
                        </div>

                        {/* Input Controls */}
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Input Parameters</h4>
                        <div className="space-y-6">
                            {/* Frequency Slider */}
                            <div>
                                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                                    {currentLabels.freqLabel} ({variables.frequency.toFixed(2)})
                                </label>
                                <input
                                    id="frequency"
                                    type="range"
                                    min="0.01"
                                    max="1.0"
                                    step="0.01"
                                    value={variables.frequency}
                                    onChange={(e) => setVariables(prev => ({ ...prev, frequency: parseFloat(e.target.value) }))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg bg-gradient-to-r from-orange-400 to-purple-400"
                                    disabled={loading}
                                />
                            </div>

                            {/* Amplitude Slider */}
                            <div>
                                <label htmlFor="amplitude" className="block text-sm font-medium text-gray-700">
                                    {currentLabels.ampLabel} ({variables.amplitude.toFixed(0)})
                                </label>
                                <input
                                    id="amplitude"
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="1"
                                    value={variables.amplitude}
                                    onChange={(e) => setVariables(prev => ({ ...prev, amplitude: parseFloat(e.target.value) }))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg bg-gradient-to-r from-purple-400 to-blue-400"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Run Button */}
                        <button
                            onClick={runSimulation}
                            disabled={loading || !selected}
                            className={`w-full mt-8 py-3 px-6 rounded-lg text-white font-semibold transition duration-300 transform shadow-lg
                                ${loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 hover:scale-[1.01]'
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Running Simulation...
                                </div>
                            ) : (
                                `Run ${selected?.title || "Experiment"}`
                            )}
                        </button>
                        
                        {/* Results Display */}
                        {result && (
                            <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
                                <h4 className="text-lg font-bold text-gray-800 mb-3">Simulation Results (ID: {result.experimentId})</h4>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    {Object.entries(result.output).map(([key, value]) => (
                                        <div key={key} className="flex flex-col">
                                            <dt className="font-medium text-gray-500">{key}</dt>
                                            <dd className="font-bold text-gray-900">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
}
