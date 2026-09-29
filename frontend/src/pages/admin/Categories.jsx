/** Admin Categories administrator dashboard page and related management UI. */
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
export function CategoriesPage() {
  const toast = useToast(),
    confirm = useConfirm(),
    load = useLoad(() => api("/admin/categories"), []),
    [modal, setModal] = useState(null),
    [form, setForm] = useState({
      name: "",
      type: "expense",
      icon: "tag",
    }),
    [busy, setBusy] = useState(false);
  function open(item) {
    setModal(item || {});
    setForm({
      name: item?.name || "",
      type: item?.type || "expense",
      icon: item?.icon || "tag",
    });
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(
        modal._id ? `/admin/categories/${modal._id}` : "/admin/categories",
        {
          method: modal._id ? "PATCH" : "POST",
          body: form,
        },
      );
      toast("Default category saved.");
      setModal(null);
      load.reload();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  async function archive(c) {
    const approved = await confirm({
      title: "Archive global category?",
      message: `${c.name} will stop appearing as an available category. Existing student transactions will remain unchanged.`,
      confirmText: "Archive",
    });
    if (!approved) return;
    try {
      await api(`/admin/categories/${c._id}`, {
        method: "DELETE",
      });
      load.reload();
      toast("Category archived.");
    } catch (e) {
      toast(e.message, "error");
    }
  }
  async function restore(c) {
    try {
      await api(`/admin/categories/${c._id}`, {
        method: "PATCH",
        body: {
          isActive: true,
        },
      });
      load.reload();
      toast("Category restored.");
    } catch (e) {
      toast(e.message, "error");
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="DEFAULTS FOR EVERY STUDENT"
        title="Global categories"
        desc="Manage the categories available to every new and existing student."
        action={
          <button onClick={() => open()} className="button button-primary">
            <Plus size={17} /> New default category
          </button>
        }
      />
      <LoadState load={load} />
      <div className="category-columns">
        {["expense", "income"].map((type) => (
          <Card className="category-section" key={type}>
            <div className="card-heading">
              <div>
                <span className="eyebrow">GLOBAL {type.toUpperCase()}</span>
                <h2>{type === "expense" ? "Expense" : "Income"} categories</h2>
              </div>
            </div>
            <div className="category-list">
              {load.data?.categories
                ?.filter((c) => c.type === type)
                .map((c) => (
                  <div className="category-list-row" key={c._id}>
                    <span className={`category-symbol ${type}`}>
                      {c.name?.[0]}
                    </span>
                    <div>
                      <strong>{c.name}</strong>
                      <small>
                        {c.isActive ? "Active default" : "Archived"}
                      </small>
                    </div>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        onClick={() => open(c)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      {c.isActive ? (
                        <button
                          className="icon-button danger"
                          title="Archive"
                          onClick={() => archive(c)}
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          className="button button-outline button-small"
                          onClick={() => restore(c)}
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>
      {modal && (
        <Modal
          title={modal._id ? "Edit default category" : "Add default category"}
          onClose={() => setModal(null)}
        >
          <form className="modal-form" onSubmit={save}>
            <Field label="Category name">
              <input
                required
                minLength={2}
                maxLength={45}
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </Field>
            <Field label="Type">
              <select
                disabled={!!modal._id}
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                  })
                }
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </Field>
            <Field label="Icon (Lucide name)">
              <input
                value={form.icon}
                maxLength={30}
                onChange={(e) =>
                  setForm({
                    ...form,
                    icon: e.target.value,
                  })
                }
              />
            </Field>
            <div className="modal-footer">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button disabled={busy} className="button button-primary">
                {busy ? "Saving..." : "Save category"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
