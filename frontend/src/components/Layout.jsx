/** Layout shared React component used by website or dashboards. */
import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import {
  Activity,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowUp,
  BarChart3,
  Bookmark,
  ChevronDown,
  Bot,
  Coins,
  FileUp,
  House,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  MessagesSquare,
  NotebookPen,
  Settings,
  Tags,
  Target,
  TrendingUp,
  UserRound,
  Users,
  X,
  Sun,
  Moon,
  MessageCircle,
  Send,
} from "lucide-react";
import { useAuth, useConfirm, useToast } from "./UIComponents";
import { api } from "../lib/api";
import { NotificationCenter } from "./NotificationCenter";
const studentLinks = [
  ["/app/dashboard", "Overview", LayoutDashboard],
  ["/app/transactions", "Transactions", ArrowLeftRight],
  ["/app/categories", "Categories", Tags],
  ["/app/budgets", "My budgets", Target],
  ["/app/reports", "Reports", BarChart3],
  ["/app/insights", "Insights", TrendingUp],
  ["/app/coach", "Money coach", Bot],
  ["/app/tips", "Saving tips", Lightbulb],
  ["/app/bookmarks", "Bookmarks", Bookmark],
  ["/app/import", "CSV import", FileUp],
];
const adminLinks = [
  ["/admin/dashboard", "Overview", LayoutDashboard],
  ["/admin/users", "Students", Users],
  ["/admin/categories", "Categories", Tags],
  ["/admin/announcements", "Announcements", MessagesSquare],
  ["/admin/tips", "Tip templates", NotebookPen],
  ["/admin/logs", "Activity logs", Activity],
];
export function UserAvatar({ user, small = false }) {
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "C";
  return (
    <span
      className={`avatar ${small ? "avatar-sm" : ""}`}
      aria-label={`${user?.name || "User"} profile photo`}
    >
      {user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initial}
    </span>
  );
}
export function Logo({ to = "/", light = false }) {
  return (
    <Link to={to} className={`brand ${light ? "brand-light" : ""}`}>
      <span className="brand-mark">
        <Coins size={22} strokeWidth={2.5} />
      </span>
      <span>
        campus<span className="brand-accent">coin</span>
        <i>.</i>
      </span>
    </Link>
  );
}
export function PublicLayout() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem("campuscoin-theme") || "dark",
  );
  const [showTop, setShowTop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const chatMessagesRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! Ask me about Campus Coin.",
    },
  ]);
  const close = () => setMobileMenu(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const area = chatMessagesRef.current;
    if (area) area.scrollTop = area.scrollHeight;
  }, [messages, chatBusy, chatOpen]);
  function togglePublicTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("campuscoin-theme", next);
  }
  async function askPublicAssistant(event) {
    event?.preventDefault();
    const message = chatText.trim();
    if (message.length < 2 || chatBusy) return;
    setMessages((items) => [...items, { role: "user", content: message }]);
    setChatText("");
    setChatBusy(true);
    try {
      const result = await api("/public/chat", {
        method: "POST",
        body: {
          message,
          history: messages.slice(-10).map(({ role, content }) => ({
            role,
            content,
          })),
        },
      });
      setMessages((items) => [
        ...items,
        { role: "assistant", content: result.reply, mode: result.mode },
      ]);
    } catch (error) {
      setMessages((items) => [
        ...items,
        { role: "assistant", content: error.message },
      ]);
    } finally {
      setChatBusy(false);
    }
  }
  return (
    <div className="public-shell">
      <header className="public-nav wrap">
        <Logo />
        <nav
          className={`public-links ${mobileMenu ? "public-links-open" : ""}`}
          aria-label="Website navigation"
        >
          <NavLink onClick={close} to="/features">
            Features
          </NavLink>
          <NavLink onClick={close} to="/how-it-works">
            How it works
          </NavLink>
          <NavLink onClick={close} to="/about">
            About
          </NavLink>
          <NavLink onClick={close} to="/faq">
            FAQ
          </NavLink>
          <Link className="mobile-login-link" onClick={close} to="/login">
            Log in
          </Link>
        </nav>
        <div className="public-actions">
          <button
            type="button"
            className="icon-button public-theme-toggle"
            onClick={togglePublicTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`${theme === "dark" ? "Light" : "Dark"} mode`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link className="link-login" to="/login">
            Log in
          </Link>
          <Link className="button button-dark" to="/register">
            Get started <ArrowUpRight size={15} />
          </Link>
          <button
            type="button"
            className="icon-button public-menu-button"
            onClick={() => setMobileMenu((v) => !v)}
            aria-label={mobileMenu ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>
      <Outlet />
      <footer className="site-footer">
        <div className="wrap footer-rich">
          <div className="footer-about">
            <Logo />
            <p>
              Keep track of the everyday. Make room for what matters most to
              your student life.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <Link to="/features">Features</Link>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/about">About us</Link>
            <Link to="/faq">FAQs</Link>
          </div>
          <div>
            <h3>Get started</h3>
            <Link to="/register">Student registration</Link>
            <Link to="/login">Student sign in</Link>
            <Link to="/admin/login">Admin sign in</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
          <div>
            <h3>Information</h3>
            <Link to="/privacy">Privacy overview</Link>
            <Link to="/terms">Terms & usage</Link>
            <p>Use the FAQ and workflow pages when you need help.</p>
          </div>
        </div>
        <div className="wrap footer-bottom">
          © {new Date().getFullYear()} Campus Coin. Smart spending, student
          style.
        </div>
      </footer>
      <div className="public-floating-actions">
        {showTop && (
          <button
            type="button"
            className="public-float-button back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            title="Back to top"
          >
            <ArrowUp size={20} />
          </button>
        )}
        <button
          type="button"
          className="public-float-button chat-launcher"
          onClick={() => setChatOpen((value) => !value)}
          aria-label={chatOpen ? "Close website assistant" : "Open website assistant"}
        >
          {chatOpen ? <X size={21} /> : <MessageCircle size={22} />}
        </button>
      </div>
      {chatOpen && (
        <section className="public-chat" aria-label="Website assistant">
          <header>
            <span><Bot size={19} /></span>
            <div><strong>Campus Coin assistant</strong><small>Website + general questions</small></div>
            <button className="icon-button" onClick={() => setChatOpen(false)} aria-label="Close chat"><X size={18} /></button>
          </header>
          <div ref={chatMessagesRef} className="public-chat-messages" aria-live="polite">
            {messages.map((item, index) => (
              <div className={`public-chat-message ${item.role}`} key={`${item.role}-${index}`}>
                <p>{item.content}</p>
                {item.role === "assistant" && item.mode === "local" && (
                  <small>Limited response · AI service temporarily unavailable</small>
                )}
              </div>
            ))}
            {chatBusy && <p className="public-chat-message assistant">Thinking…</p>}
          </div>
          <form onSubmit={askPublicAssistant}>
            <textarea
              rows={2}
              maxLength={1000}
              value={chatText}
              onChange={(event) => setChatText(event.target.value)}
              placeholder="Ask anything…"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  askPublicAssistant();
                }
              }}
            />
            <button className="button button-primary" disabled={chatBusy || chatText.trim().length < 2} aria-label="Send"><Send size={17} /></button>
          </form>
        </section>
      )}
    </div>
  );
}
export function AppLayout({ admin = false }) {
  const [open, setOpen] = useState(false);
  const { user, setUser, logout } = useAuth();
  const [currentTheme, setCurrentTheme] = useState(
    () => window.localStorage.getItem("campuscoin-theme") || "dark",
  );
  useEffect(
    () =>
      setCurrentTheme(
        window.localStorage.getItem("campuscoin-theme") ||
          user?.preferences?.theme ||
          "dark",
      ),
    [user?.preferences?.theme],
  );
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const links = admin ? adminLinks : studentLinks;
  const home = admin ? "/admin/dashboard" : "/app/dashboard";
  async function toggleTheme() {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setCurrentTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("campuscoin-theme", next);
    try {
      const result = await api("/users/profile", {
        method: "PATCH",
        body: {
          preferences: {
            theme: next,
          },
        },
      });
      if (result.user) setUser(result.user);
    } catch (error) {
      toast(
        "Theme saved on this device. Account preference could not sync.",
        "error",
      );
    }
  }
  async function signOut() {
    const approved = await confirm({
      title: "Log out of Campus Coin?",
      message: "Your saved data will stay in your account and you can sign in again at any time.",
      confirmText: "Log out",
      tone: "primary",
    });
    if (!approved) return;
    try {
      await logout();
      navigate("/");
      toast("You have logged out.");
    } catch (error) {
      toast(error.message, "error");
    }
  }
  return (
    <div className="app-shell">
      <div
        className={`sidebar-scrim ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Logo to={home} />
          <button
            className="icon-button mobile-close"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <div className="sidebar-section-label">
          {admin ? "ADMIN WORKSPACE" : "YOUR WORKSPACE"}
        </div>
        <nav className="sidebar-links">
          {links.map(([to, label, Icon]) => (
            <NavLink
              end={to === "/admin/dashboard"}
              onClick={() => setOpen(false)}
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink
            onClick={() => setOpen(false)}
            to={admin ? "/admin/profile" : "/app/profile"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <UserRound size={18} />
            My profile
          </NavLink>
          <NavLink
            onClick={() => setOpen(false)}
            to={admin ? "/admin/settings" : "/app/settings"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Settings size={18} />
            Settings
          </NavLink>
          <Link to="/" className="sidebar-link">
            <House size={18} />
            Public website
          </Link>
          <button onClick={signOut} className="sidebar-link sidebar-logout">
            <LogOut size={18} />
            Log out
          </button>
          <Link
            to={admin ? "/admin/profile" : "/app/profile"}
            onClick={() => setOpen(false)}
            className="sidebar-user"
            aria-label="Open my profile"
          >
            <UserAvatar user={user} />
            <div>
              <strong>{user?.name || "User"}</strong>
              <small>{admin ? "Administrator" : "Student account"}</small>
            </div>
            <ChevronDown size={15} />
          </Link>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <button
            onClick={() => setOpen(true)}
            className="icon-button menu-button"
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>
          <span className="topbar-workspace">
            {admin ? "Administration" : "My workspace"}
            <span className="topbar-separator"> / </span>
            <span className="topbar-muted">Campus Coin</span>
          </span>
          <div className="topbar-right">
            <button
              type="button"
              onClick={toggleTheme}
              className="icon-button theme-toggle"
              aria-label={
                currentTheme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
              title={currentTheme === "dark" ? "Light theme" : "Dark theme"}
            >
              {currentTheme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <NotificationCenter admin={admin} />
            <UserAvatar user={user} small />
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
        <div className="app-foot">
          Made for students who want to make every coin count.
        </div>
      </div>
    </div>
  );
}
