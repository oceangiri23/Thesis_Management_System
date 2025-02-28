import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import StudentGroups from "./components/StudentGroups";
import SupervisorDashboard from "./components/SupervisorDashboard";
import Navbar from "./components/Navbar";
import Tables from "./components/Tables.jsx";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Tables />
                  </PrivateRoute>
                }
              />
              <Route
                path="/groups"
                element={
                  <PrivateRoute>
                    <StudentGroups />
                  </PrivateRoute>
                }
              />
              <Route
                path="/supervisor-dashboard"
                element={
                  <PrivateRoute>
                    <SupervisorDashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
