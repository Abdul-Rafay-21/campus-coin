/** shared account access and recovery UI. */
import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Coins,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "../../components/Layout";
function AuthShell({ tag, title, lead, children, admin = false }) {
  return (
    <div className="auth-shell finza-auth">
      <div className="auth-brand">
        <img
          className="auth-brand-photo"
          src="/images/students-together.webp"
          alt="Three students laughing together while working on laptops"
        />
        <div className="auth-brand-tint" />
        <div className="auth-brand-top">
          <Logo to="/" light />
          <span className="auth-photo-badge">
            <ShieldCheck size={15} /> PRIVATE BY DESIGN
          </span>
        </div>
        <div className="auth-brand-message">
          <span className="auth-small-label">
            <GraduationCap size={18} /> STUDENT MONEY, MADE SIMPLE
          </span>
          <h2>
            Big campus days.
            <br />
            <em>Smarter money moves.</em>
          </h2>
          <p>
            Spend mindfully, stay on top of your budgets, and make room for what
            matters.
          </p>
          <div className="auth-brand-card">
            <span className="auth-card-icon">
              <Check size={20} />
            </span>
            <div>
              <small>Built for real student life</small>
              <strong>Budgets, reports and saving tips in one place.</strong>
            </div>
            <ArrowUpRight size={19} />
          </div>
        </div>
        <span className="auth-brand-foot">
          CAMPUS COIN / OWN YOUR MONEY STORY
        </span>
      </div>
      <div className="auth-right">
        <div className="auth-mobile-logo">
          <Logo />
        </div>
        <div className="auth-form-wrap">
          <span className="section-kicker">{tag}</span>
          <h1>{title}</h1>
          <p className="auth-lead">{lead}</p>
          {children}
        </div>
        <div className="auth-help">
          <Link to="/">← Back to website</Link>
          <span>
            {admin
              ? "Secure administration"
              : "Student-first budgeting, made simple."}
          </span>
        </div>
      </div>
    </div>
  );
}
function Preview({ url }) {
  return (
    url && (
      <div className="dev-preview">
        <strong>Local email preview</strong>
        <p>
          SMTP is not configured. This development-only link is provided for
          testing.
        </p>
        <a href={url}>
          Open verification or reset link <ArrowRight size={14} />
        </a>
      </div>
    )
  );
}
export { AuthShell, Preview };
