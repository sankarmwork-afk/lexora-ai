import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import api from "../services/api";
function Navbar() {
  const isLoggedIn = !!localStorage.getItem("access");
  const [profile, setProfile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      api.get("profile/")
        .then((res) => setProfile(res.data))
        .catch((err) => console.error(err));
    }
  }, [isLoggedIn]);

  const displayName = profile?.email || profile?.username || "Loading...";
  const initial = displayName.charAt(0).toUpperCase();
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <Link
        to="/"
        style={{
          textDecoration: "none",
          color: "inherit",
          fontWeight: "bold",
          fontSize: "24px",
        }}
      >
        Lexora
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <Link
          to="/"
          style={{ textDecoration: "none", color: "#111827", fontWeight: "600" }}
        >
          Home
        </Link>
        <Link
          to="/categories"
          style={{ textDecoration: "none", color: "#111827", fontWeight: "600" }}
        >
          Categories
        </Link>
        <span style={{ color: "#6b7280" }}>About (Coming Soon)</span>

        <input
          type="text"
          placeholder="Search..."
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <button
          style={{
            padding: "8px 15px",
            border: "none",
            background: "#222",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
        {isLoggedIn ? (
          <>
            <div
              onClick={() => setShowMenu(!showMenu)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {initial}
              </div>

              <span>{displayName}</span>

              {showMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "55px",
                    right: 0,
                    width: "220px",
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                    padding: "10px",
                    zIndex: 1000,
                  }}
                >
                  <div style={{ padding: "8px 0", fontWeight: "bold" }}>My Profile</div>
                  <div style={{ padding: "8px 0" }}>Change Password</div>
                  <Link
                    to="/forgot-password"
                    style={{
                      display: "block",
                      padding: "8px 0",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    Forgot Password
                  </Link>
                  <div style={{ padding: "8px 0" }}>Bookmarks</div>
                  <div style={{ padding: "8px 0" }}>Settings</div>
                  <hr />
                  <div
                    style={{ padding: "8px 0", color: "#dc2626", cursor: "pointer" }}
                    onClick={() => {
                      localStorage.removeItem("access");
                      localStorage.removeItem("refresh");
                      window.location.href = "/";
                    }}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login">
              <button
                style={{
                  padding: "8px 15px",
                  border: "1px solid #ccc",
                  background: "white",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Log in
              </button>
            </Link>

            <Link to="/register">
              <button
                style={{
                  padding: "8px 15px",
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Sign Up
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;