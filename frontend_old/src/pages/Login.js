import { useState } from "react";
import { loginUser } from "../api/api";

export default function Login({ setLoggedIn }) {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleLogin = async () => {
    const res = await loginUser(form);
    const data = await res.json();

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      setLoggedIn(true);
    } else {
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="username"
        onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input type="password" placeholder="password"
        onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}