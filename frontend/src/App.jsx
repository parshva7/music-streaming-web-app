import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Favorites from "./pages/Favorites";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import MiniPlayer from "./components/MiniPlayer";
import Podcasts from "./pages/Podcasts";

function App() {
  return (
    <>
      {/* Top Navigation */}
      <Navbar />

      {/* Routes */}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
         <Route
          path="/podcasts"
          element={
            <ProtectedRoute>
              <Podcasts />
            </ProtectedRoute>
          }
        />


        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>

      {/* Global audio player */}
      <MiniPlayer />
    </>
  );
}

export default App;
