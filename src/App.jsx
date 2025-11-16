import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "./lib/auth";
import "./styles/theme.css";
import "./i18n";

// Components
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Learn from "./pages/Learn";
import Leaderboard from "./pages/Leaderboard";
import Market from "./pages/Market";
import Portfolio from "./pages/Portfolio";
import Backtest from "./pages/Backtest";
import Admin from "./pages/Admin";
import Analyze from "./pages/Analyze";
import Assistance from "./pages/Assistance";
import GetReport from "./pages/GetReport";
import OfficialResources from "./pages/OfficialResources";
import RiskAssessment from "./pages/RiskAssessment";
import AlgoBuilder from "./pages/AlgoBuilder";

function App() {
  const user = getCurrentUser();

  return (
    <BrowserRouter>
      {/* Top Horizontal Bar */}
      {user && <TopBar />}

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Left Sidebar */}
        {user && <Sidebar />}

        {/* Main Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <main style={{ flex: 1, padding: "20px" }}>
            <Routes>
              {/* Login Page */}
              <Route
                path="/login"
                element={user ? <Navigate to="/" replace /> : <Login />}
              />

              {/* Home */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              {/* Learn */}
              <Route
                path="/learn"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <Learn />
                  </ProtectedRoute>
                }
              />

              

              {/* Leaderboard */}
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />

              {/* Market */}
              <Route
                path="/market"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <Market />
                  </ProtectedRoute>
                }
              />

              {/* Portfolio */}
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <Portfolio />
                  </ProtectedRoute>
                }
              />

              {/* Backtest */}
              <Route
                path="/backtest"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <Backtest />
                  </ProtectedRoute>
                }
              />

              {/* Analyzer */}
              <Route
                path="/analyze"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <Analyze />
                  </ProtectedRoute>
                }
              />

              {/* AI Mentor */}
              <Route
                path="/assistance"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <Assistance />
                  </ProtectedRoute>
                }
              />

              {/* Financial Report */}
              <Route
                path="/get-report"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <GetReport />
                  </ProtectedRoute>
                }
              />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="reviewer">
                    <Admin />
                  </ProtectedRoute>
                }
              />

              {/* Official Resources */}
              <Route
                path="/resources"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <OfficialResources />
                  </ProtectedRoute>
                }
              />

              {/* Risk Assessment */}
              <Route
                path="/risk-assessment"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <RiskAssessment />
                  </ProtectedRoute>
                }
              />

              {/* Algo Builder */}
              <Route
                path="/algo-builder"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <AlgoBuilder />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          {user && (
            <footer
              style={{
                background: "var(--neutralCard)",
                borderTop: "1px solid var(--border)",
                padding: "24px 0",
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--textMuted)", fontSize: "14px" }}>
                <strong>
                  MoneyMitra provides educational content only. Not investment
                  advice.
                </strong>
              </p>
            </footer>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
