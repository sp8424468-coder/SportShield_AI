import { useState } from "react";
import { registerUser } from "../api/api";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleRegister = async () => {
    const res = await registerUser(form);
    const data = await res.json();

    alert(data.message || "Registered");
  };

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="username"
        onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input type="password" placeholder="password"
        onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}