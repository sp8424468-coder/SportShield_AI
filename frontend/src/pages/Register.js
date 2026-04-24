import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    age: ""
  });

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password || !form.age) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        alert("OTP sent to your email 📩");

        navigate("/verify-otp", {
          state: {
            email: form.email,
            password: form.password,
            username: form.username,
            age: form.age
          }
        });
      } else {
        alert(data.detail || "Registration failed");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-r from-purple-100 to-pink-100">

      {/* 🔵 LEFT SIDE */}
      <div className="hidden md:flex w-1/2 flex-col justify-center px-16 bg-white">

        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          SportShield AI
        </h1>

        <h2 className="text-4xl font-bold mb-4">
          Create your <span className="text-blue-600">account</span>
        </h2>

        <p className="text-gray-600 mb-8">
          Join our community and protect your content with AI
        </p>

        <div className="text-6xl mb-6">🔐</div>

        <p className="text-gray-500 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-500 cursor-pointer font-semibold"
          >
            Login
          </span>
        </p>

      </div>

      {/* 🟣 RIGHT SIDE (FORM) */}
      <div className="flex w-full md:w-1/2 items-center justify-center">

        <div className="bg-white p-8 rounded-2xl shadow-xl w-96">

          <h2 className="text-2xl font-bold mb-2 text-center">
            Create Account
          </h2>

          <p className="text-gray-500 text-center mb-6">
            Fill in the details to get started
          </p>

          {/* Username */}
          <input
            type="text"
            placeholder="Enter username"
            className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Enter email"
            className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Create password"
            className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* Age */}
          <input
            type="number"
            placeholder="Enter your age"
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />

          {/* Button */}
          <button
            onClick={handleRegister}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Register →
          </button>

          {/* Footer */}
          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-500 cursor-pointer font-semibold"
            >
              Login
            </span>
          </p>

        </div>
      </div>

    </div>
  );
}