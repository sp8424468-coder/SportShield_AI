import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <Router>
      <Routes>

        {!token ? (
          <>
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Home setToken={setToken} />} />
            <Route path="/profile" element={<Profile />} />   {/* ✅ FIXED */}
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

      </Routes>
    </Router>
  );
}

export default App;