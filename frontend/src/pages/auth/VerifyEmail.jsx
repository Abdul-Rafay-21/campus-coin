/** Verify Email account access and recovery UI. */
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { api } from "../../lib/api";
import { Field } from "../../components/UIComponents";
import { AuthShell, Preview } from "./AuthLayout";

export function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState({ loading: true, message: "", error: "" });
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(null);

  useEffect(() => {
    let active = true;
    if (!token) {
      setState({
        loading: false,
        message: "",
        error: "Missing verification token.",
      });
      return () => {
        active = false;
      };
    }
    api(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((result) => {
        if (active)
          setState({ loading: false, message: result.message, error: "" });
      })
      .catch((error) => {
        if (active)
          setState({ loading: false, message: "", error: error.message });
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function resend(event) {
    event.preventDefault();
    if (resending) return;
    setResending(true);
    try {
      const result = await api("/auth/resend-verification", {
        method: "POST",
        body: { email },
      });
      setResent(result);
    } catch (error) {
      setResent({ error: error.message });
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell
      tag="EMAIL VERIFICATION"
      title="One last little step."
      lead="Verifying your email keeps your account secure."
    >
      <div className="auth-success verification-status">
        {state.loading ? (
          <p>Verifying your email...</p>
        ) : state.error ? (
          <>
            <AlertCircle className="text-danger" size={42} />
            <h2>This link cannot be used</h2>
            <p>{state.error}</p>
            <p className="muted">
              It may have expired, been replaced by a newer email, or already
              been used.
            </p>
            {resent ? (
              <div className="verification-result">
                {resent.error ? (
                  <p className="text-danger">{resent.error}</p>
                ) : (
                  <>
                    <Mail size={28} />
                    <p>{resent.message}</p>
                    <Preview url={resent.previewUrl} />
                  </>
                )}
              </div>
            ) : (
              <form
                className="auth-form verification-recovery"
                onSubmit={resend}
              >
                <Field label="Email address">
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@university.edu"
                  />
                </Field>
                <button
                  className="button button-primary button-full"
                  disabled={resending}
                >
                  {resending ? "Sending..." : "Send a new verification link"}
                  <Mail size={17} />
                </button>
              </form>
            )}
            <Link className="button button-outline button-full" to="/login">
              Already verified? Log in <ArrowRight size={17} />
            </Link>
          </>
        ) : (
          <>
            <CheckCircle2 size={42} />
            <h2>Email verified</h2>
            <p>{state.message}</p>
            <Link className="button button-primary button-full" to="/login">
              Continue to login <ArrowRight size={17} />
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
