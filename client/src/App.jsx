// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./utils/api";
import Navbar from "./components/Navbar";
import useEngagementXP from "./hooks/useEngagementXP";

import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Atlas from "./pages/Atlas";
import Mentor from "./pages/Mentor";
import Prisma from "./pages/Prisma";
import Insight from "./pages/Insight";
import Codex from "./pages/Codex";
import SDG from "./pages/SDG";
import Vault from "./pages/Vault";
import Quiz from "./pages/Quiz";

function AppRoutes({ user, setUser }) {
  const location = useLocation();

  useEngagementXP({
    enabled: !!user,
    onUserUpdate: setUser,
    pathname: location.pathname
  });

  return (
    <Routes>
      <Route path="/signin" element={user ? <Navigate to="/" /> : <SignIn />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUp />} />
      <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/signin" />} />
      <Route path="/atlas" element={user ? <Atlas level={user.level} /> : <Navigate to="/signin" />} />
      <Route path="/mentor" element={user ? <Mentor /> : <Navigate to="/signin" />} />
      <Route path="/prisma" element={user ? <Prisma level={user.level} /> : <Navigate to="/signin" />} />
      <Route path="/insight" element={user ? <Insight /> : <Navigate to="/signin" />} />
      <Route path="/codex" element={user ? <Codex /> : <Navigate to="/signin" />} />
      <Route path="/sdg" element={user ? <SDG setUser={setUser} /> : <Navigate to="/signin" />} />
      <Route path="/vault" element={user ? <Vault /> : <Navigate to="/signin" />} />
      <Route path="/quiz" element={user ? <Quiz user={user} setUser={setUser} /> : <Navigate to="/signin" />} />
    </Routes>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/user/progress")
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-4xl font-bold">Loading Equinox...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {user && <Navbar user={user} />}
      <AppRoutes user={user} setUser={setUser} />
    </BrowserRouter>
  );
}
