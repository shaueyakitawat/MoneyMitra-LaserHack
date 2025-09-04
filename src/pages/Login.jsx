"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { login, signup, roles } from "../lib/auth"

const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: roles.LEARNER,
  })

  useEffect(() => {
    // Auto-fill demo user data if coming from home page
    const demoUser = location.state?.demoUser
    if (demoUser) {
      setFormData({
        ...formData,
        email: demoUser.email,
        password: "demo123",
      })
    }
  }, [location.state])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await signup(formData.email, formData.password, formData.name, formData.role)
      }
      navigate("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          backgroundColor: "#ffffff",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div style={{ marginBottom: "40px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: " green",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px",
                }}
              >
                <span style={{ color: "white", fontSize: "16px", fontWeight: "bold" }}>MM</span>
              </div>
              <span style={{ fontSize: "18px", fontWeight: "600", color: "#1F2937" }}>MoneyMitra</span>
            </div>

            <h1
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: "8px",
                lineHeight: "1.2",
              }}
            >
              {isLogin ? "Namaste," : "Create Account"}
            </h1>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: "8px",
                lineHeight: "1.2",
              }}
            >
              {isLogin ? "Welcome Back" : "Get Started"}
            </h2>
            <p
              style={{
                color: "#6B7280",
                fontSize: "16px",
                margin: 0,
              }}
            >
              {isLogin ? "Hey, welcome back to your special place" : "Create your account to get started"}
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "#FEE2E2",
                color: "#DC2626",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "24px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={{ marginBottom: "20px" }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "16px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "16px",
                    backgroundColor: "#F9FAFB",
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#8B5CF6")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <input
                type="email"
                name="email"
                placeholder="MoneyMitra@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#F9FAFB",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#8B5CF6")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <input
                type="password"
                name="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#F9FAFB",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#8B5CF6")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
              />
            </div>

            {!isLogin && (
              <div style={{ marginBottom: "20px" }}>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "16px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "16px",
                    backgroundColor: "#F9FAFB",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <option value={roles.LEARNER}>Learner</option>
                  <option value={roles.REVIEWER}>Reviewer</option>
                  <option value={roles.ADMIN}>Admin</option>
                </select>
              </div>
            )}

            {isLogin && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "32px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#6B7280",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "8px",
                      accentColor: "#8B5CF6",
                    }}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "green",
                    fontSize: "14px",
                    cursor: "pointer",
                    textDecoration: "none",
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: loading ? "green" : "blue",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
                marginBottom: "24px",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = "green"
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = "blue" 
              }}
            >
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span style={{ color: "#6B7280", fontSize: "14px" }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: "none",
                border: "none",
                color: "green",
                fontSize: "14px",
                cursor: "pointer",
                textDecoration: "underline",
                fontWeight: "500",
              }}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>

          <div
            style={{
              padding: "16px",
backgroundColor: "rgba(0, 128, 0, 0.2)",
              borderRadius: "8px",
              fontSize: "15px",
              color: "#6B7280",
              lineHeight: "1.5",
            }}
          >
            <strong style={{ color: "#374151" }}>Demo Credentials:</strong>
            <br />
            <b> learner@demo.com / demo123 </b>
            <br />
            <b>reviewer@demo.com / demo123</b>
            <br />
           <b> admin@demo.com / demo123</b>
          </div>
        </motion.div>
      </div>

      <div
        style={{
          flex: 1,
          background: "green",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            position: "relative",
            zIndex: 2,
          }}
        >
          <img
            src="/public/money.png"
            alt="Security illustration"
            style={{
              width: "1150px",
              height: "825px",
              objectFit: "contain",
            }}
          />
        </motion.div>

        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            width: "80px",
            height: "40px",
backgroundColor: "rgba(0, 128, 0, 0.2)",
            borderRadius: "40px",
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "40px",
            width: "120px",
            height: "60px",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: "60px",
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            left: "60px",
            width: "100px",
            height: "50px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50px",
            opacity: 0.5,
          }}
        />
      </div>
    </div>
  )
}

export default Login
