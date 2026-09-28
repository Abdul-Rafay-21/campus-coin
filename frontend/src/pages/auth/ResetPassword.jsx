/** Reset Password account access and recovery UI. */
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Coins,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth, useToast, Field } from "../../components/UIComponents";
import { Logo } from "../../components/Layout";
import { AuthShell, Preview } from "./AuthLayout";
export function ResetPassword() {
  const [params] = useSearchParams(),
    token = params.get("token") || "",
    toast = useToast(),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast("Passwords do not match.", "error");
    setBusy(true);
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: {
          token,
          password,
        },
      });
      setSuccess(true);
      toast("Password updated.");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell
      tag="NEW PASSWORD"
      title="A fresh start."
      lead="Choose a secure password for your Campus Coin account."
    >
      {success ? (
        <div className="auth-success">
          <CheckCircle2 size={40} />
          <p>Your password has been updated.</p>
          <Link className="button button-primary button-full" to="/login">
            Sign in <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <Field label="New password">
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ characters, letter and number"
            />
          </Field>
          <Field label="Confirm password">
            <input
              required
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
            />
          </Field>
          <button
            disabled={busy || !token}
            className="button button-primary button-full button-large"
          >
            {busy ? "Saving..." : "Update password"}
            <ArrowRight size={17} />
          </button>
        </form>
      )}
    </AuthShell>
  );
}
