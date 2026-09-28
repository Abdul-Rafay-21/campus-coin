import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Download,
  Mail,
  CalendarDays,
  Ellipsis,
  Trash2,
  Pencil,
  Search,
  Filter,
  RefreshCcw,
  Check,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  Bell,
  Repeat2,
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Target,
  ChevronRight,
  History,
  Image,
  LockKeyhole,
  Save,
  BookOpen,
  Coins,
  X,
  Info,
} from "lucide-react";
import { toPng } from "html-to-image";
import {
  api,
  downloadApi,
  money,
  dateLabel,
  today,
  monthName,
} from "../../lib/api";
import {
  Card,
  Pill,
  Empty,
  Spinner,
  Modal,
  Field,
  PageHeader,
  MonthPicker,
  useMonth,
  useLoad,
  useAuth,
  useToast,
  useConfirm,
  ErrorNotice,
} from "../../components/UIComponents";
import { TrendChart, CategoryChart, DailyChart } from "../../components/Charts";
import {
  isValidTransactionRow,
  formatMoney,
  getRecordId,
  toDateInput,
  getFirstName,
  LoadableContent,
  StatCard,
  TransactionTable,
} from "./PageHelpers";
export function Categories() {
  const toast = useToast(),
    confirm = useConfirm(),
    load = useLoad(() => api("/categories"), []),
    [modal, setModal] = useState(null),
    [form, setForm] = useState({
      name: "",
      type: "expense",
    }),
    [saving, setSaving] = useState(false);
  const cats = load.data?.categories || [];
  function open(c) {
    setModal(c || {});
    setForm({
      name: c?.name || "",
      type: c?.type || "expense",
    });
  }
  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api(modal._id ? `/categories/${modal._id}` : "/categories", {
        method: modal._id ? "PATCH" : "POST",
        body: form,
      });
      toast(modal._id ? "Category updated." : "New category created.");
      setModal(null);
      load.reload();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }
  async function remove(c) {
    const approved = await confirm({
      title: "Archive category?",
      message: `${c.name} will stop appearing in new entries. Existing transactions remain unchanged.`,
      confirmText: "Archive",
    });
    if (!approved) return;
    try {
      await api(`/categories/${c._id}`, {
        method: "DELETE",
      });
      load.reload();
      toast("Category archived.");
    } catch (e) {
      toast(e.message, "error");
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="ORGANIZE YOUR SPENDING"
        title="My categories"
        desc="Your money, your way. Create categories that fit your life."
        action={
          <button className="button button-primary" onClick={() => open()}>
            <Plus size={17} /> New category
          </button>
        }
      />
      <LoadableContent load={load}>
        <div className="category-columns">
          {["expense", "income"].map((type) => (
            <Card className="category-section" key={type}>
              <div className="card-heading">
                <div>
                  <span className="eyebrow">
                    {type === "income" ? "MONEY COMING IN" : "MONEY GOING OUT"}
                  </span>
                  <h2>{type === "income" ? "Income" : "Expense"} categories</h2>
                </div>
                <Pill tone={type === "income" ? "success" : "neutral"}>
                  {cats.filter((x) => x.type === type).length} categories
                </Pill>
              </div>
              <div className="category-list">
                {cats
                  .filter((c) => c.type === type)
                  .map((c) => (
                    <div className="category-list-row" key={c._id}>
                      <span className={`category-symbol ${type}`}>
                        {(c.name || "?")[0]}
                      </span>
                      <div>
                        <strong>{c.name}</strong>
                        <small>
                          {c.isDefault
                            ? "Campus Coin default"
                            : "Your custom category"}
                        </small>
                      </div>
                      {!c.isDefault && (
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            title="Edit"
                            onClick={() => open(c)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-button danger"
                            title="Archive"
                            onClick={() => remove(c)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </Card>
          ))}
        </div>
      </LoadableContent>
      {modal && (
        <Modal
          title={modal._id ? "Edit category" : "Create category"}
          subtitle="Give your money a place to belong."
          onClose={() => setModal(null)}
        >
          <form className="modal-form" onSubmit={submit}>
            <Field label="Category name">
              <input
                autoFocus
                required
                maxLength={45}
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="e.g. Weekend trips"
              />
            </Field>
            <Field label="Category type">
              <select
                value={form.type}
                disabled={!!modal._id}
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
            <div className="modal-footer">
              <button
                className="button button-outline"
                type="button"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button className="button button-primary" disabled={saving}>
                {saving ? "Saving..." : "Save category"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
