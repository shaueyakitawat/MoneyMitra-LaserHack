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
import Admin from "./pages/Admin";
import Analyze from "./pages/Analyze";
import Assistance from "./pages/Assistance";
import GetReport from "./pages/GetReport";
import OfficialResources from "./pages/OfficialResources";
import NewsInsights from "./pages/NewsInsights";
import RiskAssessment from "./pages/RiskAssessment";
import Profile from "./pages/Profile";
// Strategy Builder & Virtual Portfolio
import StrategyBuilder from "./pages/StrategyBuilder";
import BacktestResultsPage from "./pages/BacktestResultsPage";
import VirtualPortfolio from "./pages/VirtualPortfolio";

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

              {/* Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Strategy Builder */}
              <Route
                path="/strategy-builder"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <StrategyBuilder />
                  </ProtectedRoute>
                }
              />

              {/* Backtest Results */}
              <Route
                path="/backtest-results"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <BacktestResultsPage />
                  </ProtectedRoute>
                }
              />

              {/* Virtual Portfolio */}
              <Route
                path="/virtual-portfolio"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <VirtualPortfolio />
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

              {/* News Insights */}
              <Route
                path="/news-insights"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <NewsInsights />
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
