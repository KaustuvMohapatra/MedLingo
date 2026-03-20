import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import GlobalLayout from "./components/GlobalLayout";
import HeaderHUD from "./components/HeaderHUD";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";
import SubjectScreen from "./screens/SubjectScreen";
import PathScreen from "./screens/PathScreen";
import QuizScreen from "./screens/QuizScreen";
import VictoryScreen from "./screens/VictoryScreen";
import ProgressScreen from "./screens/ProgressScreen";
import useProgressStore from "./store/useProgressStore";

// Loading splash
function LoadingSplash() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0e1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
      <div style={{ width: "60px", height: "60px", backgroundColor: "#6D28D9", border: "4px solid #FFC107", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", boxShadow: "0 6px 0 0 #2E1065" }}>🧬</div>
      <p style={{ fontFamily: "'Press Start 2P', monospace", color: "#FFC107", fontSize: "10px", animation: "pulse 1s ease-in-out infinite" }}>LOADING...</p>
      <style>{`@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}`}</style>
    </div>
  );
}

// Auth guard — waits for session check before deciding
function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSplash />;
  if (!user)   return <Navigate to="/auth" state={{ from: location }} replace />;
  return children;
}

// Sync user ID to progress store
function UserSync() {
  const { user } = useAuth();
  const setUserId = useProgressStore(s => s.setUserId);
  useEffect(() => {
    setUserId(user?.id ?? null);
  }, [user?.id]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <UserSync />
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<AuthScreen />} />

        {/* Protected */}
        <Route path="/*" element={
          <AuthGuard>
            <GlobalLayout>
              <HeaderHUD />
              <Routes>
                <Route path="/"                    element={<HomeScreen />} />
                <Route path="/subject/:subject"    element={<SubjectScreen />} />
                <Route path="/path/:subject/:mode" element={<PathScreen />} />
                <Route path="/quiz/:topic"          element={<QuizScreen />} />
                <Route path="/victory/:topic"       element={<VictoryScreen />} />
                <Route path="/progress"             element={<ProgressScreen />} />
                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </GlobalLayout>
          </AuthGuard>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
