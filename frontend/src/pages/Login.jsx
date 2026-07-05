import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("✅ Login button clicked");
    console.log("Form Data:", form);

    setLoading(true);
    setError("");

    try {
      const response = await api.post("token/", form);

      console.log("✅ Login Success:", response.data);

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      console.log("Access Token:", response.data.access);
      console.log("Refresh Token:", response.data.refresh);

      const profile = await api.get("profile/", {
        headers: {
          Authorization: `Bearer ${response.data.access}`,
        },
      });

      localStorage.setItem("user_id", profile.data.id);
      localStorage.setItem(
        "user_email",
        profile.data.email || profile.data.username || "User"
      );

      console.log(
        "Stored Access Token:",
        localStorage.getItem("access")
      );

      navigate("/");
    } catch (err) {
      console.error("❌ Login Error:", err);

      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Response:", err.response.data);
        console.log("Access in localStorage:", localStorage.getItem("access"));
        console.log("Refresh in localStorage:", localStorage.getItem("refresh"));
      } else {
        console.log("No response received from the server.");
      }

      setError(
        err.response?.data?.detail ||
          "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold">
          Welcome Back
        </h1>

        <p className="mb-6 text-center text-gray-500">
          Login to your Lexora account
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            required
            className="mb-4 w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="mb-6 w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <Link
            to="/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>

          <Link
            to="/register"
            className="text-blue-600 hover:underline"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;