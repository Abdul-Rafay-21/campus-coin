/** Notification bell, unread counts, recent preview, and on-screen all-notifications dialog. */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronRight,
  Inbox,
  Lightbulb,
  Megaphone,
  TrendingUp,
  UserPlus,
  X,
} from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "./UIComponents";

const PAGE_SIZE = 40;
const IconFor = ({ type }) =>
  type === "budget" ? (
    <AlertTriangle size={18} />
  ) : type === "tip" ? (
    <Lightbulb size={18} />
  ) : type === "insight" ? (
    <TrendingUp size={18} />
  ) : type === "student" ? (
    <UserPlus size={18} />
  ) : type === "announcement" ? (
    <Megaphone size={18} />
  ) : (
    <Bell size={18} />
  );
const friendlyTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      });
};

/** Header bell: four recent items, then a paginated all-notifications modal. */
export function NotificationCenter({ admin = false }) {
  const base = admin ? "/admin/notifications" : "/notifications";
  const toast = useToast();
  const containerRef = useRef(null);
  const bellRef = useRef(null);
  const modalCloseRef = useRef(null);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const refresh = useCallback(
    async (full = false) => {
      try {
        const response = await api(
          full ? `${base}?page=1&limit=${PAGE_SIZE}` : `${base}/unread-count`,
        );
        if (full) {
          setItems(response.notifications || []);
          setCount(response.unreadCount ?? 0);
          setTotal(response.total ?? 0);
          setPage(1);
          setHasMore(Boolean(response.hasMore));
        } else {
          setCount(response.count || 0);
        }
      } catch (error) {
        if (full) toast(error.message, "error");
      }
    },
    [base, toast],
  );

  useEffect(() => {
    refresh();
    const tick = window.setInterval(() => refresh(), 45000);
    const onUpdate = () => refresh(open || all);
    window.addEventListener("notifications-updated", onUpdate);
    return () => {
      window.clearInterval(tick);
      window.removeEventListener("notifications-updated", onUpdate);
    };
  }, [refresh, open, all]);

  useEffect(() => {
    if (!open) return undefined;
    const outside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target))
        setOpen(false);
    };
    const key = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  useEffect(() => {
    if (!all) return undefined;
    modalCloseRef.current?.focus();
    const key = (event) => {
      if (event.key === "Escape") {
        setAll(false);
        bellRef.current?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [all]);

  async function markRead(item) {
    if (item.isRead) return;
    try {
      await api(`${base}/${item._id}`, { method: "PATCH" });
      setItems((rows) =>
        rows.map((row) =>
          row._id === item._id ? { ...row, isRead: true } : row,
        ),
      );
      setCount((value) => Math.max(0, value - 1));
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function markAll() {
    try {
      await api(`${base}/read-all`, { method: "PATCH" });
      setItems((rows) => rows.map((row) => ({ ...row, isRead: true })));
      setCount(0);
      toast("Notifications marked as read.");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function loadMore() {
    if (!hasMore || moreLoading) return;
    setMoreLoading(true);
    try {
      const response = await api(`${base}?page=${page + 1}&limit=${PAGE_SIZE}`);
      setItems((current) => {
        const known = new Set(current.map((item) => item._id));
        return [
          ...current,
          ...(response.notifications || []).filter(
            (item) => !known.has(item._id),
          ),
        ];
      });
      setPage((value) => value + 1);
      setHasMore(Boolean(response.hasMore));
      setTotal(response.total ?? total);
      setCount(response.unreadCount ?? count);
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setMoreLoading(false);
    }
  }

  async function toggle() {
    if (!open) {
      setLoading(true);
      await refresh(true);
      setLoading(false);
    }
    setOpen((value) => !value);
  }

  function closeModal() {
    setAll(false);
    bellRef.current?.focus();
  }

  const notificationList = (rows) =>
    rows.length ? (
      rows.map((item) => (
        <button
          type="button"
          key={item._id}
          className={`noti-item ${item.isRead ? "" : "noti-unread"}`}
          onClick={() => markRead(item)}
        >
          <span className={`noti-type noti-type-${item.type}`}>
            <IconFor type={item.type} />
          </span>
          <span className="noti-body">
            <strong>{item.title}</strong>
            <small>{item.message}</small>
            <time dateTime={item.createdAt}>
              {friendlyTime(item.createdAt)}
            </time>
          </span>
          {!item.isRead && <span className="noti-dot" aria-label="Unread" />}
        </button>
      ))
    ) : (
      <div className="noti-empty">
        <Inbox size={30} />
        <strong>You're all caught up</strong>
        <span>New alerts will appear here.</span>
      </div>
    );

  return (
    <div className="noti-root" ref={containerRef}>
      <button
        ref={bellRef}
        type="button"
        className={`icon-button topbar-bell ${count ? "has-unread" : ""}`}
        onClick={toggle}
        aria-expanded={open}
        aria-label={`Notifications, ${count} unread`}
        title="Notifications"
      >
        <Bell size={20} />
        {count > 0 && <span>{count > 99 ? "99+" : count}</span>}
      </button>
      {open && (
        <div
          className="noti-popover"
          role="dialog"
          aria-label="Recent notifications"
        >
          <div className="noti-head">
            <div>
              <strong>Notifications</strong>
              <small>{count} unread</small>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
          <div className="noti-preview">
            {loading ? (
              <p className="noti-loading">Loading updates…</p>
            ) : (
              notificationList(items.slice(0, 4))
            )}
          </div>
          <div className="noti-actions">
            {items.some((item) => !item.isRead) && (
              <button type="button" onClick={markAll}>
                <Check size={14} /> Mark all read
              </button>
            )}
            <button
              type="button"
              className="noti-show-all"
              onClick={() => {
                setOpen(false);
                setAll(true);
                refresh(true);
              }}
            >
              Show all <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      {all &&
        createPortal(
          <div
            className="noti-modal-backdrop"
            role="presentation"
            onMouseDown={(event) =>
              event.target === event.currentTarget && closeModal()
            }
          >
            <section
              className="noti-modal"
              role="dialog"
              aria-modal="true"
              aria-label="All notifications"
            >
              <div className="noti-modal-head">
                <div>
                  <span className="noti-kicker">YOUR UPDATES</span>
                  <h2>All notifications</h2>
                  <p>
                    Budget alerts, insights, platform updates and more — all in
                    one place.
                  </p>
                </div>
                <button
                  ref={modalCloseRef}
                  type="button"
                  className="icon-button"
                  onClick={closeModal}
                  aria-label="Close all notifications"
                >
                  <X size={22} />
                </button>
              </div>
              <div className="noti-modal-actions">
                <span>
                  {total} notifications · {count} unread
                </span>
                {items.some((item) => !item.isRead) && (
                  <button
                    type="button"
                    className="button button-outline button-small"
                    onClick={markAll}
                  >
                    <Check size={15} /> Mark all read
                  </button>
                )}
              </div>
              <div className="noti-full-list">
                {notificationList(items)}
                {hasMore && (
                  <button
                    type="button"
                    className="noti-load-more"
                    onClick={loadMore}
                    disabled={moreLoading}
                  >
                    {moreLoading
                      ? "Loading…"
                      : `Load more notifications (${items.length} of ${total})`}
                  </button>
                )}
              </div>
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}
