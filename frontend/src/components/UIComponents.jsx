/** Ui shared React component used by website or dashboards. */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api, monthName } from "../lib/api";
import {
  AlertCircle,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Inbox,
  AlertTriangle,
} from "lucide-react";
const AuthContext = createContext(null),
  ToastContext = createContext(null),
  ConfirmContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      const result = await api("/auth/me");
      setUser(result.user);
    } catch (error) {
      if (error.status === 401 || error.status === 403) setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const invalidate = () => setUser(null);
    refresh();
    const interval = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    window.addEventListener("campus-auth-invalid", invalidate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("campus-auth-invalid", invalidate);
    };
  }, [refresh]);
  const logout = async () => {
    await api("/auth/logout", {
      method: "POST",
    });
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = "success") => {
    setToast({
      message,
      type,
      id: Date.now(),
    });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4700);
    return () => clearTimeout(timer);
  }, [toast]);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.type === "error" ? (
            <AlertCircle size={19} />
          ) : (
            <CheckCircle2 size={19} />
          )}
          <span>{toast.message}</span>
          <button
            className="icon-button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        setRequest({
          title: "Are you sure?",
          message: "Please confirm this action.",
          confirmText: "Confirm",
          cancelText: "Cancel",
          tone: "danger",
          ...(typeof options === "string" ? { message: options } : options),
          resolve,
        });
      }),
    [],
  );
  const finish = useCallback((answer) => {
    setRequest((current) => {
      current?.resolve(answer);
      return null;
    });
  }, []);
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <Modal
          title={request.title}
          subtitle={request.subtitle}
          onClose={() => finish(false)}
          className="confirm-modal"
        >
          <div className="confirm-dialog-body">
            <span className={`confirm-dialog-icon ${request.tone}`}>
              <AlertTriangle size={25} />
            </span>
            <p>{request.message}</p>
          </div>
          <div className="modal-footer confirm-dialog-actions">
            <button
              type="button"
              className="button button-outline"
              autoFocus
              onClick={() => finish(false)}
            >
              {request.cancelText}
            </button>
            <button
              type="button"
              className={`button ${request.tone === "danger" ? "button-danger" : "button-primary"}`}
              onClick={() => finish(true)}
            >
              {request.confirmText}
            </button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}
export const useConfirm = () => useContext(ConfirmContext);
export function Require({ role, children }) {
  const { user, loading } = useAuth(),
    location = useLocation();
  if (loading)
    return (
      <div className="full-loading">
        <LoaderCircle className="spin" size={32} />
        <p>Opening Campus Coin...</p>
      </div>
    );
  if (!user)
    return (
      <Navigate
        to={role === "admin" ? "/admin/login" : "/login"}
        state={{
          from: location,
        }}
        replace
      />
    );
  if (role && user.role !== role)
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/app/dashboard"}
        replace
      />
    );
  return children;
}
export function PageHeader({ eyebrow, title, desc, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {desc && <p className="muted">{desc}</p>}
      </div>
      {action && <div className="page-actions">{action}</div>}
    </div>
  );
}
export function Card({ children, className = "", ...props }) {
  return (
    <section className={`card ${className}`} {...props}>
      {children}
    </section>
  );
}
export function Pill({ children, tone = "neutral" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}
export function Empty({
  title = "Nothing here yet",
  message = "Add your first entry to get started.",
  action,
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Inbox size={28} />
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
export function Spinner() {
  return (
    <div className="page-spinner">
      <LoaderCircle size={28} className="spin" /> Loading your data...
    </div>
  );
}
export function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
  className = "",
}) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className={`modal ${wide ? "modal-wide" : ""} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={21} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function MonthPicker({
  month,
  year,
  onChange,
  disableFuture = true,
  allowNextMonthAfterMidpoint = false,
}) {
  const now = new Date();
  const futureMonthAllowance =
    allowNextMonthAfterMidpoint && now.getUTCDate() >= 15 ? 1 : 0;
  const latestAllowedDate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + futureMonthAllowance,
      1,
    ),
  );
  const selectedDate = new Date(Date.UTC(year, month - 1, 1));
  const atLatestAllowedMonth = selectedDate >= latestAllowedDate;
  useEffect(() => {
    if (disableFuture && selectedDate > latestAllowedDate) {
      onChange({
        month: latestAllowedDate.getUTCMonth() + 1,
        year: latestAllowedDate.getUTCFullYear(),
      });
    }
  }, [
    disableFuture,
    selectedDate.getTime(),
    latestAllowedDate.getTime(),
    onChange,
  ]);
  const shift = (amount) => {
    const nextSelectedDate = new Date(Date.UTC(year, month - 1 + amount, 1));
    if (disableFuture && nextSelectedDate > latestAllowedDate) return;
    onChange({
      month: nextSelectedDate.getUTCMonth() + 1,
      year: nextSelectedDate.getUTCFullYear(),
    });
  };
  return (
    <div className="month-picker">
      <button
        className="icon-button"
        onClick={() => shift(-1)}
        aria-label="Previous month"
      >
        <ChevronLeft size={18} />
      </button>
      <span>{monthName(month, year)}</span>
      <button
        className="icon-button"
        onClick={() => shift(1)}
        disabled={disableFuture && atLatestAllowedMonth}
        aria-label="Next month"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
export function useMonth() {
  const currentDate = new Date();
  const [selection, setSelection] = useState({
    month: currentDate.getUTCMonth() + 1,
    year: currentDate.getUTCFullYear(),
  });
  return [selection, setSelection];
}
export function useLoad(fetcher, deps = []) {
  const [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher();
      setData(result);
      setError("");
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, deps);
  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);
  return {
    data,
    setData,
    loading,
    error,
    reload,
  };
}
export function ErrorNotice({ message, retry }) {
  return (
    <div className="alert alert-error">
      <AlertCircle size={18} />
      <span>{message}</span>
      {retry && (
        <button className="text-button" onClick={() => retry().catch(() => {})}>
          Retry
        </button>
      )}
    </div>
  );
}
