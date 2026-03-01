import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/users/register", form);
      // Log in with same credentials to get token
      const loginRes = await api.post("/users/login", {
        email: form.email,
        password: form.password,
      });
      login(loginRes.data);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || err.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: 24 }}>
      <h2 style={{ marginBottom: 24, fontSize: 24 }}>Sign up</h2>
      {error && <p style={{ color: "var(--color-primary)", marginBottom: 12 }}>{error}</p>}
      <form onSubmit={submit} className="login-register-form">
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="airbnb-input"
          style={{ marginBottom: 12 }}
        >
          <option value="user">User</option>
          <option value="host">Host</option>
        </select>
        <button
          type="submit"
          className="airbnb-btn airbnb-btn-blue"
          style={{ width: "100%" }}
        >
          Sign up
        </button>
      </form>
    </div>
  );
}