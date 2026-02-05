import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Register from './auth/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './auth/ProtectedRoute';
import { isAuthenticated } from './auth/authService';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/login" 
          element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Register />} 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
