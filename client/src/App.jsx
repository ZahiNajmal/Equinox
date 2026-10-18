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
  const requestedPreviewLevel = Number(new URLSearchParams(location.search).get("previewLevel"));
  const previewLevel = import.meta.env.DEV && Number.isInteger(requestedPreviewLevel) && requestedPreviewLevel >= 1
    ? requestedPreviewLevel
    : null;
  const viewUser = user && previewLevel ? { ...user, level: previewLevel, xp: Math.max(Number(user.xp) || 0, (previewLevel - 1) * 250) } : user;

  useEngagementXP({
    enabled: !!user,
    onUserUpdate: setUser,
    pathname: location.pathname
  });

  return (
    <>
      {previewLevel !== null && <div role="status" className="bg-amber-300 px-4 py-2 text-center text-sm font-bold text-amber-950">Developer preview only: displaying Level {previewLevel}. This does not change your account or server permissions.</div>}
      <Routes>
        <Route path="/signin" element={user ? <Navigate to="/" /> : <SignIn />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUp />} />
        <Route path="/" element={user ? <Dashboard user={viewUser} /> : <Navigate to="/signin" />} />
        <Route path="/atlas" element={user ? <Atlas level={viewUser.level} /> : <Navigate to="/signin" />} />
        <Route path="/mentor" element={user ? <Mentor /> : <Navigate to="/signin" />} />
        <Route path="/prisma" element={user ? <Prisma level={viewUser.level} /> : <Navigate to="/signin" />} />
        <Route path="/insight" element={user ? <Insight /> : <Navigate to="/signin" />} />
        <Route path="/codex" element={user ? <Codex level={viewUser.level} /> : <Navigate to="/signin" />} />
        <Route path="/sdg" element={user ? <SDG setUser={setUser} /> : <Navigate to="/signin" />} />
        <Route path="/vault" element={user ? <Vault /> : <Navigate to="/signin" />} />
        <Route path="/quiz" element={user ? <Quiz user={viewUser} setUser={setUser} /> : <Navigate to="/signin" />} />
      </Routes>
    </>
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
