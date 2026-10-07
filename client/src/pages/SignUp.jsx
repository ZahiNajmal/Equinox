// client/src/pages/SignUp.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/signup", { username, email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed — try another email");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-pink-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">
        <h1 className="text-6xl font-bold text-center text-purple-700 mb-8">Join Equinox</h1>
        {error && <p className="text-red-500 text-center mb-6 text-lg">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none text-lg"
            required
            minLength="3"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none text-lg"
            required
          />
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (6+ chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 pr-14 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none text-lg"
              required
              minLength="6"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
            >
              {showPassword ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-700 to-pink-600 text-white font-bold text-xl py-5 rounded-xl hover:scale-105 transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600 text-lg">
          Have an account? <Link to="/signin" className="text-purple-600 font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}