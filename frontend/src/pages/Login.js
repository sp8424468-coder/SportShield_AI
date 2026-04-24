import { useState } from "react";
import { loginUser } from "../api/api";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ setToken }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await loginUser(form);
      const data = await res.json();

      if (res.ok && data.access_token) {
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        navigate("/");
      } else {
        alert(data.detail || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-r from-blue-100 to-indigo-100">

      {/* 🔵 LEFT SIDE */}
      <div className="hidden md:flex w-1/2 flex-col justify-center px-16 bg-white">

        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          SportShield AI
        </h1>

        <h2 className="text-4xl font-bold mb-4">
          AI-Powered <br /> Image Protection
        </h2>

        <p className="text-gray-600 mb-8">
          Detect duplicates, prevent misuse, and keep your content safe with intelligent AI.
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">🛡️ Smart Detection</h3>
            <p className="text-gray-500 text-sm">
              AI detects duplicate and suspicious images
            </p>
          </div>

          <div>
            <h3 className="font-semibold">⚡ Real-time Protection</h3>
            <p className="text-gray-500 text-sm">
              Instant analysis and moderation
            </p>
          </div>

          <div>
            <h3 className="font-semibold">👥 Community Driven</h3>
            <p className="text-gray-500 text-sm">
              Users build a trusted platform together
            </p>
          </div>
        </div>
      </div>

      {/* 🟣 RIGHT SIDE (LOGIN FORM) */}
      <div className="flex w-full md:w-1/2 items-center justify-center">

        <div className="bg-white p-8 rounded-2xl shadow-xl w-96">

          <h2 className="text-2xl font-bold mb-2 text-center">
            Welcome Back
          </h2>

          <p className="text-gray-500 text-center mb-6">
            Login to your account
          </p>

          {/* Username */}
          <input
            type="text"
            placeholder="Enter your username"
            className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          {/* Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Login →
          </button>

          {/* Footer */}
          <p className="text-sm text-center mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 font-semibold">
              Register
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}