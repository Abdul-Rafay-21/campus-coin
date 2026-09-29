/** Not Found public website page with Campus Coin information and navigation. */
import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUp,
  ShieldCheck,
  Wallet,
  Target,
  Lightbulb,
  Sparkles,
  Check,
  ChevronRight,
  BookOpen,
  Heart,
  GraduationCap,
  Instagram,
  Github,
  Coins,
} from "lucide-react";
import { Logo } from "../../components/Layout";
export function NotFound() {
  return (
    <div className="not-found">
      <div className="notfound-code">
        404<span>*</span>
      </div>
      <h1>This page wandered off campus.</h1>
      <p>Don't worry, your budget is still right where you left it.</p>
      <Link to="/" className="button button-primary">
        Back to home <ArrowRight size={17} />
      </Link>
    </div>
  );
}
