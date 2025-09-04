import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './lib/auth';
import './styles/theme.css';
import './i18n';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Learn from './pages/Learn';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import Market from './pages/Market';
import Portfolio from './pages/Portfolio';
import Backtest from './pages/Backtest';
import Admin from './pages/Admin';
import Analyze from './pages/Analyze';
import Assistance from './pages/Assistance';   // ✅ new page

function App() {
  const user = getCurrentUser();

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {user && <Navbar />}
        
        <main style={{ flex: 1 }}>
          <Routes>
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" replace /> : <Login />} 
            />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/learn"
              element={
                <ProtectedRoute requiredRole="learner">
                  <Learn />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/quiz"
              element={
                <ProtectedRoute requiredRole="learner">
                  <Quiz />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute requiredRole="learner">
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/market"
              element={
                <ProtectedRoute requiredRole="learner">
                  <Market />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute requiredRole="learner">
                  <Portfolio />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/backtest"
              element={
                <ProtectedRoute requiredRole="learner">
                  <Backtest />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/analyze"
              element={
                <ProtectedRoute requiredRole="learner">
                  <Analyze />
                </ProtectedRoute>
              }
            />

            <Route
              path="/assistance"
              element={
                <ProtectedRoute requiredRole="learner">
                  <Assistance />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="reviewer">
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {user && (
          <footer style={{ 
            background: 'var(--neutralCard)', 
            borderTop: '1px solid var(--border)', 
            padding: '24px 0',
            textAlign: 'center'
          }}>
            <div className="container">
              <p style={{ color: 'var(--textMuted)', fontSize: '14px' }}>
                <strong>MoneyMitra provides educational content only. Not investment advice.</strong>
              </p>
            </div>
          </footer>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
