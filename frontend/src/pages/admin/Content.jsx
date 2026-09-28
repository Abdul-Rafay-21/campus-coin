/** Admin Content administrator dashboard page and related management UI. */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  ArrowLeftRight,
  Tags,
  Plus,
  Pencil,
  Trash2,
  Search,
  ShieldCheck,
  LockKeyhole,
  MessagesSquare,
  Activity,
  NotebookPen,
  BarChart3,
  ArrowRight,
  CalendarDays,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";
import { api, dateLabel } from "../../lib/api";
import {
  PageHeader,
  Card,
  Pill,
  Empty,
  Spinner,
  Modal,
  Field,
  useLoad,
  useToast,
  useConfirm,
  ErrorNotice,
} from "../../components/UIComponents";
import { LoadState } from "./PageHelpers";
function Content({ kind }) {
  const announcements = kind === "announcements",
    base = announcements ? "announcements" : "templates",
    title = announcements ? "Announcements" : "Tip templates",
    sub = announcements
      ? "Send helpful platform updates to students."
      : "Manage platform-wide saving tip templates.",
    tag = announcements ? "STUDENT MESSAGES" : "SAVING TIP LIBRARY",
    toast = useToast(),
    confirm = useConfirm(),
    load = useLoad(() => api(`/admin/${base}`), [base]),
    [modal, setModal] = useState(null),
    [form, setForm] = useState({
      title: "",
      message: "",
      body: "",
      active: true,
      kind: "tip",
    }),
    [busy, setBusy] = useState(false);
  const rows = load.data?.[base] || [];
  function open(x) {
    setModal(x || {});
    setForm({
      title: x?.title || "",
      message: x?.message || "",
      body: x?.body || "",
      active: x?.active ?? true,
      kind: x?.kind || "tip",
    });
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const payload = announcements
      ? {
          title: form.title,
          message: form.message,
          active: form.active,
        }
      : {
          title: form.title,
          body: form.body,
          active: form.active,
          kind: form.kind,
        };
    try {
      await api(`/admin/${base}${modal._id ? `/${modal._id}` : ""}`, {
        method: modal._id ? "PATCH" : "POST",
        body: payload,
      });
      toast(`${announcements ? "Announcement" : "Template"} saved.`);
      setModal(null);
      load.reload();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  async function remove(item) {
    const approved = await confirm({
      title: `Delete ${announcements ? "announcement" : "template"}?`,
      message: `“${item.title}” will be permanently removed and will no longer appear for students.`,
      confirmText: "Delete",
    });
    if (!approved) return;
    try {
      await api(`/admin/${base}/${item._id}`, {
        method: "DELETE",
      });
      load.reload();
      toast("Deleted.");
    } catch (e) {
      toast(e.message, "error");
    }
  }
  async function toggle(item) {
    try {
      await api(`/admin/${base}/${item._id}`, {
        method: "PATCH",
        body: {
          active: !item.active,
        },
      });
      load.reload();
    } catch (e) {
      toast(e.message, "error");
    }
  }
  return (
    <>
      <PageHeader
        eyebrow={tag}
        title={title}
        desc={sub}
        action={
          <button className="button button-primary" onClick={() => open()}>
            <Plus size={17} /> New {announcements ? "announcement" : "template"}
          </button>
        }
      />
      <LoadState load={load} />
      {load.data &&
        (rows.length ? (
          <div className="tips-grid">
            {rows.map((x) => (
              <Card className="admin-content-card" key={x._id}>
                <Pill tone={x.active ? "success" : "neutral"}>
                  {x.active ? "Published" : "Hidden"}
                </Pill>
                {!announcements && <Pill tone="neutral">{x.kind || "tip"}</Pill>}
                <h2>{x.title}</h2>
                <p>{announcements ? x.message : x.body}</p>
                <div className="tip-card-actions">
                  <button
                    onClick={() => open(x)}
                    className="button button-outline button-small"
                  >
                    <Pencil size={15} /> Edit
                  </button>
                  <button
                    onClick={() => toggle(x)}
                    className="button button-outline button-small"
                  >
                    {x.active ? "Hide" : "Publish"}
                  </button>
                  <button
                    onClick={() => remove(x)}
                    className="icon-button danger"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Empty
              title={`No ${title.toLowerCase()} yet`}
              message="Create the first item using the button above."
            />
          </Card>
        ))}
      {modal && (
        <Modal
          title={
            modal._id
              ? "Edit item"
              : `Create ${announcements ? "announcement" : "tip template"}`
          }
          onClose={() => setModal(null)}
        >
          <form onSubmit={save} className="modal-form">
            <Field label="Title">
              <input
                required
                minLength={2}
                maxLength={100}
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
              />
            </Field>
            <Field label={announcements ? "Message" : "Tip body"}>
              <textarea
                required
                minLength={2}
                maxLength={1000}
                rows={5}
                value={announcements ? form.message : form.body}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [announcements ? "message" : "body"]: e.target.value,
                  })
                }
              />
            </Field>
            {!announcements && (
              <Field label="Show to students as">
                <select
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value })}
                >
                  <option value="tip">Saving tip</option>
                  <option value="insight">Insight</option>
                </select>
              </Field>
            )}
            <label className="check-label">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({
                    ...form,
                    active: e.target.checked,
                  })
                }
              />{" "}
              Publish immediately
            </label>
            <div className="modal-footer">
              <button
                className="button button-outline"
                type="button"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button className="button button-primary" disabled={busy}>
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
export const AnnouncementsPage = () => <Content kind="announcements" />;
export const TemplatesPage = () => <Content kind="templates" />;
