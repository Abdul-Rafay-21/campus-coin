/** Forgot Password account access and recovery UI. */
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
export function ForgotPassword() {
  const [email, setEmail] = useState(""),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState(null),
    toast = useToast();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      setResult(
        await api("/auth/forgot-password", {
          method: "POST",
          body: {
            email,
          },
        }),
      );
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell
      tag="RESET YOUR PASSWORD"
      title="We'll help you get back in."
      lead="Enter your registered email and we'll send a secure reset link."
    >
      {result ? (
        <div className="auth-success">
          <Mail size={39} />
          <p>{result.message}</p>
          <Preview url={result.previewUrl} />
        </div>
      ) : (
        <form onSubmit={submit} className="auth-form">
          <Field label="Email address">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
            />
          </Field>
          <button
            disabled={busy}
            className="button button-primary button-full button-large"
          >
            {busy ? "Sending..." : "Send reset link"}
            <ArrowRight size={18} />
          </button>
        </form>
      )}
      <div className="auth-alternate">
        <Link to="/login">&larr; Back to login</Link>
      </div>
    </AuthShell>
  );
}
