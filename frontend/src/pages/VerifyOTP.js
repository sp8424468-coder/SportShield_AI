import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  // 🔢 Handle OTP input
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // 👉 Move to next box
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // 🔙 Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 4) {
      alert("Enter complete OTP");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: finalOtp
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registered successfully 🎉");
        navigate("/login");
      } else {
        alert(data.detail || "Invalid OTP");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 to-pink-100">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">

        {/* 🔐 Icon */}
        <div className="text-5xl mb-4">🔒</div>

        <h2 className="text-2xl font-bold mb-2">Verify OTP</h2>

        <p className="text-gray-500 mb-6 text-sm">
          Enter the 4-digit code sent to your email
        </p>

        {/* 🔢 OTP BOXES */}
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          ))}
        </div>

        {/* 🔁 Resend */}
        <p className="text-sm text-gray-500 mb-4">
          Didn't receive code?{" "}
          <span className="text-purple-500 cursor-pointer font-semibold">
            Resend OTP
          </span>
        </p>

        {/* ✅ Button */}
        <button
          onClick={handleVerify}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Verify Code →
        </button>

      </div>
    </div>
  );
}