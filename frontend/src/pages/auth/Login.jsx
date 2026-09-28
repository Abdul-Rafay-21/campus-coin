/** Shared student / admin login view; only the API route and copy vary by role. */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth, useToast, Field } from "../../components/UIComponents";
import { AuthShell } from "./AuthLayout";

export function CampusLoginPage({ admin = false }) {
  const navigate = useNavigate();
  const showToast = useToast();
  const { setUser, user } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin/dashboard" : "/app/dashboard", {
        replace: true,
      });
    }
  }, [user, navigate]);

  function updateLoginField(fieldName, fieldValue) {
    setLoginForm((previousForm) => ({
      ...previousForm,
      [fieldName]: fieldValue,
    }));
  }

  async function submitCampusLogin(event) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const loginEndpoint = admin ? "/auth/admin/login" : "/auth/login";
      const loginResult = await api(loginEndpoint, {
        method: "POST",
        body: loginForm,
      });
      setUser(loginResult.user);
      showToast(`Welcome back, ${loginResult.user.name.split(" ")[0]}!`);
      navigate(
        loginResult.user.role === "admin"
          ? "/admin/dashboard"
          : "/app/dashboard",
        { replace: true },
      );
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      tag={admin ? "ADMINISTRATOR ACCESS" : "WELCOME BACK"}
      title={admin ? "Admin sign in." : "Good to see you again."}
      lead={
        admin
          ? "Sign in with your administrator credentials."
          : "Ready to make every coin count? Sign in to your workspace."
      }
      admin={admin}
    >
      <form
        className="auth-form campus-login-form"
        onSubmit={submitCampusLogin}
      >
        <Field label="Email address">
          <div className="input-icon">
            <Mail size={17} />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@university.edu"
              value={loginForm.email}
              onChange={(event) =>
                updateLoginField("email", event.target.value)
              }
            />
          </div>
        </Field>
        <Field label="Password">
          <div className="input-icon">
            <LockKeyhole size={17} />
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              value={loginForm.password}
              onChange={(event) =>
                updateLoginField("password", event.target.value)
              }
            />
            <button
              className="show-pass"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>
        <div className="auth-between">
          <span>Secure, private access</span>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <button
          disabled={isSubmitting}
          className="button button-primary button-full button-large"
        >
          {isSubmitting
            ? "Signing in..."
            : admin
              ? "Sign in as admin"
              : "Sign in to dashboard"}
          <ArrowRight size={18} />
        </button>
      </form>
      <div className="auth-alternate">
        {admin ? (
          <Link to="/login">
            Student login <ArrowRight size={15} />
          </Link>
        ) : (
          <>
            New to Campus Coin? <Link to="/register">Create an account</Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export { CampusLoginPage as Login };
