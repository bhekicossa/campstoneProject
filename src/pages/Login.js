import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/users/login", { email, password });
      login(res.data);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Login failed";
      await Swal.fire({
        icon: "error",
        title: "Login failed",
        text: msg,
        confirmButtonColor: "#ff385c",
      });
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: "info",
      title: "Forgot Password",
      text: "Please contact support to reset your password.",
      confirmButtonColor: "#0066cc",
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: 24 }}>
      <h2 style={{ marginBottom: 24, fontSize: 24 }}>Login</h2>
      <form onSubmit={submit} className="login-register-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <a href="#forgot" className="login-forgot" onClick={handleForgotPassword}>
          Forgot Password ?
        </a>
        <button type="submit" className="airbnb-btn airbnb-btn-blue" style={{ width: "100%" }}>
          Login
        </button>
      </form>
    </div>
  );
}
