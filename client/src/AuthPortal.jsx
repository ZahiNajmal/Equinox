import React, { useState, useEffect } from "react";
// Removed Link import since it requires a surrounding <BrowserRouter>
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// Firebase imports
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signInWithCustomToken,
    signInAnonymously
} from 'firebase/auth';

// --- Global Variable Access (MANDATORY for Firebase Init) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase App instance once
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Function to handle navigation without react-router-dom
    const handleNavigate = (path) => {
        // FIX: Using window.location.hash instead of window.location.href
        // This avoids the "Failed to set the 'href' property on 'Location'" error
        if (path === '/') {
            window.location.hash = ''; // Go to base hash
        } else {
            // e.g., /signup becomes #/signup
            window.location.hash = path; 
        }
    };

    // 1. Authentication Check & Setup
    useEffect(() => {
        if (!auth) {
            setError("Firebase is not initialized. Check configuration.");
            setLoading(false);
            return;
        }

        // Handle initial authentication (required for the environment)
        const initAuth = async () => {
             // Use custom token if available, otherwise sign in anonymously
            if (initialAuthToken) {
                try {
                    await signInWithCustomToken(auth, initialAuthToken);
                } catch (e) {
                    console.warn("Custom token sign-in failed, falling back to anonymous.", e);
                    await signInAnonymously(auth);
                }
            } else {
                await signInAnonymously(auth);
            }
        };
        
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && !user.isAnonymous) { // Check if it's a permanent user (not anonymous)
                setIsAuthenticated(true);
                // Redirect user after successful sign-in
                handleNavigate("/");
            }
            setLoading(false);
        });

        initAuth();
        return () => unsubscribe();
    }, []);

    // 2. Handle Login Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!auth) {
            setError("Authentication service not available.");
            setLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Redirection logic is now handled in onAuthStateChanged
            // The state change will trigger the redirect if successful
        } catch (err) {
            console.error("Login Error:", err);
            // Firebase error codes are often more descriptive
            setError(err.message || "Login failed. Please check your credentials.");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-green-50">
                <p className="text-xl font-semibold text-green-700">Already signed in. Redirecting...</p>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-full">
                <h1 className="text-4xl sm:text-5xl font-bold text-center text-blue-700 mb-6 sm:mb-8">Sign In</h1>
                
                {error && <p className="text-red-500 text-center mb-6 text-lg p-3 bg-red-100 rounded-lg border border-red-200">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none text-lg transition duration-200"
                        required
                        autoComplete="email"
                        disabled={loading}
                    />
                    
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 pr-14 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none text-lg transition duration-200"
                            required
                            autoComplete="current-password"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition"
                            disabled={loading}
                        >
                            {showPassword ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold text-xl py-5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <p className="text-center mt-8 text-gray-600 text-lg">
                    No account? 
                    {/* Replaced <Link> with a clickable span that redirects, fixing the routing context error */}
                    <span 
                        onClick={() => handleNavigate("/signup")} 
                        className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                        Sign Up
                    </span>
                </p>
            </div>
        </div>
    );
}