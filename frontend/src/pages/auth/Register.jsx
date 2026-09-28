/** Accessible, student-only Campus Coin registration form. */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast, Field } from "../../components/UIComponents";
import { AuthShell, Preview } from "./AuthLayout";

const academicYears = [
  "1st year",
  "2nd year",
  "3rd year",
  "4th year",
  "Graduate",
  "Other",
];
const initialCampusRegistration = {
  name: "",
  email: "",
  academicYear: "",
  password: "",
  confirm: "",
};

export function RegisterCampusStudentPage() {
  const showToast = useToast();
  const [registrationForm, setRegistrationForm] = useState(
    initialCampusRegistration,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  function updateRegistrationField(fieldName, fieldValue) {
    setRegistrationForm((currentForm) => ({
      ...currentForm,
      [fieldName]: fieldValue,
    }));
  }

  async function submitCampusRegistration(event) {
    event.preventDefault();
    if (registrationForm.password !== registrationForm.confirm) {
      showToast("Passwords do not match.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const { name, email, academicYear, password } = registrationForm;
      const campusRegistrationResult = await api("/auth/register", {
        method: "POST",
        body: { name, email, academicYear, password },
      });
      setRegistrationResult(campusRegistrationResult);
      showToast("Your account has been created.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      tag="YOUR MONEY JOURNEY STARTS HERE"
      title="Make more of your money."
      lead="Create your free student account in under a minute."
    >
      {registrationResult ? (
        <div className="auth-success campus-registration-success">
          <CheckCircle2 size={42} />
          <h2>Check your inbox</h2>
          <p>{registrationResult.message}</p>
          <Preview url={registrationResult.previewUrl} />
          <Link className="button button-primary button-full" to="/login">
            Go to login <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <form
          className="auth-form campus-register-form"
          onSubmit={submitCampusRegistration}
        >
          <Field label="Full name">
            <input
              required
              minLength={2}
              value={registrationForm.name}
              onChange={(event) =>
                updateRegistrationField("name", event.target.value)
              }
              placeholder="Your full name"
              autoComplete="name"
            />
          </Field>
          <Field label="Email address">
            <input
              required
              type="email"
              value={registrationForm.email}
              onChange={(event) =>
                updateRegistrationField("email", event.target.value)
              }
              placeholder="you@university.edu"
              autoComplete="email"
            />
          </Field>
          <Field label="Academic year (optional)">
            <select
              value={registrationForm.academicYear}
              onChange={(event) =>
                updateRegistrationField("academicYear", event.target.value)
              }
            >
              <option value="">Select your year</option>
              {academicYears.map((academicYear) => (
                <option key={academicYear}>{academicYear}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Password"
            hint="At least 8 characters, including a letter and number."
          >
            <input
              required
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={registrationForm.password}
              onChange={(event) =>
                updateRegistrationField("password", event.target.value)
              }
              placeholder="Create a strong password"
            />
          </Field>
          <Field label="Confirm password">
            <input
              required
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={registrationForm.confirm}
              onChange={(event) =>
                updateRegistrationField("confirm", event.target.value)
              }
              placeholder="Repeat your password"
            />
          </Field>
          <button
            disabled={isSubmitting}
            className="button button-primary button-full button-large"
          >
            {isSubmitting ? "Creating account..." : "Create my free account"}{" "}
            <ArrowRight size={17} />
          </button>
          <p className="form-fine">
            Free for students. Takes less than a minute.
          </p>
        </form>
      )}
      <div className="auth-alternate">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </AuthShell>
  );
}

// Existing router imports keep working while the actual component has a
// business-specific name that explains what this page does.
export { RegisterCampusStudentPage as Register };
