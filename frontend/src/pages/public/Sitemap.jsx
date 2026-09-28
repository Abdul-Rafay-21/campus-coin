import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Globe2,
  GraduationCap,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { PhotoTile } from "../../components/PublicSections";

const popularPages = [
  {
    to: "/features",
    image: "/images/analytics-laptop.webp",
    alt: "A laptop on a desk showing colourful charts and totals",
    tag: "MOST VISITED",
    title: "Explore every feature",
    cta: "View features",
  },
  {
    to: "/how-it-works",
    image: "/images/monthly-planner.webp",
    alt: "A monthly planner with goals written on it beside a cup of coffee",
    tag: "NEW HERE?",
    title: "See how it works",
    cta: "Read the workflow",
  },
  {
    to: "/faq",
    image: "/images/laptop-coffee-notes.webp",
    alt: "An open notebook and pen in front of a laptop and a coffee mug",
    tag: "HELP CENTER",
    title: "Find quick answers",
    cta: "Open the FAQ",
  },
];

const sitemapGroups = [
  {
    icon: Globe2,
    title: "Public website",
    description: "Learn what Campus Coin does before creating an account.",
    links: [
      ["Home", "/"],
      ["Features", "/features"],
      ["How it works", "/how-it-works"],
      ["About", "/about"],
      ["Frequently asked questions", "/faq"],
      ["Privacy overview", "/privacy"],
      ["Terms and usage", "/terms"],
    ],
  },
  {
    icon: GraduationCap,
    title: "Student workspace",
    description: "Record, organize and review your own student finances.",
    links: [
      ["Dashboard", "/app/dashboard"],
      ["Transactions", "/app/transactions"],
      ["Categories", "/app/categories"],
      ["Budgets", "/app/budgets"],
      ["Reports", "/app/reports"],
      ["Insights", "/app/insights"],
      ["Money coach", "/app/coach"],
      ["Saving tips", "/app/tips"],
      ["Bookmarks", "/app/bookmarks"],
      ["CSV import", "/app/import"],
      ["Profile", "/app/profile"],
      ["Settings", "/app/settings"],
    ],
  },
  {
    icon: ShieldCheck,
    title: "Administration",
    description: "Manage students, shared content and platform activity.",
    links: [
      ["Admin login", "/admin/login"],
      ["Administrator dashboard", "/admin/dashboard"],
      ["Students", "/admin/users"],
      ["Categories", "/admin/categories"],
      ["Announcements", "/admin/announcements"],
      ["Tip templates", "/admin/tips"],
      ["Activity logs", "/admin/logs"],
    ],
  },
];

export function Sitemap() {
  return (
    <main className="public-detail wrap sitemap-page">
      <div className="detail-hero">
        <span className="section-kicker">FIND YOUR WAY</span>
        <h1>
          Every Campus Coin page,
          <br />
          <em>in one clear map.</em>
        </h1>
        <p>
          Explore the public website or move directly to the student and
          administrator workspaces. Protected pages will ask you to sign in.
        </p>
      </div>

      <div className="sitemap-popular">
        {popularPages.map((page) => (
          <PhotoTile key={page.to} compact {...page} />
        ))}
      </div>

      <div className="sitemap-directory">
        {sitemapGroups.map(({ icon: Icon, title, description, links }) => (
          <section key={title} className="sitemap-directory-group">
            <div className="sitemap-directory-head">
              <span>
                <Icon size={23} />
              </span>
              <div>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
            </div>
            <div className="sitemap-directory-links">
              {links.map(([label, to]) => (
                <Link to={to} key={to}>
                  {label} <ChevronRight size={15} />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="sitemap-help">
        <HelpCircle size={27} />
        <div>
          <h2>Not sure where to begin?</h2>
          <p>
            Read the workflow first, then create your student account when you
            are ready to record your first transaction.
          </p>
        </div>
        <Link to="/how-it-works" className="button button-primary">
          View the workflow <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
