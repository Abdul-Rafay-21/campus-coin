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
  ChevronDown,
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
const INCOME_FIRST_MESSAGE =
  "Add your income first. You can record expenses after at least one income entry.";
function TransactionModal({
  row,
  categories,
  expenseLocked = false,
  onClose,
  onSaved,
}) {
  const { user } = useAuth(),
    toast = useToast(),
    isEdit = !!row?._id,
    [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: row?.type || "expense",
    amount: row?.amountMinor ? row.amountMinor / 100 : "",
    categoryId: getRecordId(row?.categoryId) || "",
    description: row?.description || "",
    date: toDateInput(row?.date),
    endDate: toDateInput(row?.endDate || row?.date),
    repeatMonthly: row ? Boolean(row.recurringMonthly) : true,
    source: row?.source || "",
  });
  const options = categories.filter((x) => x.type === form.type);
  const expenseDurationDays =
    form.date && form.endDate
      ? Math.max(
          1,
          Math.floor(
            (new Date(form.endDate) - new Date(form.date)) / 86400000,
          ) + 1,
        )
      : 0;
  const change = (key, value) => {
    setForm((p) => ({
      ...p,
      [key]: value,
      ...(key === "type"
        ? {
            categoryId: "",
          }
        : {}),
    }));
  };
  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        endDate: form.type === "expense" ? form.endDate : null,
      };
      await api(isEdit ? `/transactions/${row._id}` : "/transactions", {
        method: isEdit ? "PATCH" : "POST",
        body: payload,
      });
      toast(isEdit ? "Transaction updated." : "Transaction added.");
      onSaved();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      title={isEdit ? "Edit transaction" : `Add ${form.type}`}
      subtitle="A few details and you're all set."
      onClose={onClose}
    >
      <form onSubmit={submit} className="modal-form">
        <div className="segmented">
          <button
            type="button"
            className={form.type === "expense" ? "selected" : ""}
            disabled={expenseLocked}
            title={expenseLocked ? INCOME_FIRST_MESSAGE : undefined}
            onClick={() => change("type", "expense")}
          >
            <ArrowUpRight size={16} /> Expense
          </button>
          <button
            type="button"
            className={form.type === "income" ? "selected" : ""}
            onClick={() => change("type", "income")}
          >
            <ArrowDownLeft size={16} /> Income
          </button>
        </div>
        {expenseLocked && (
          <p className="form-hint">
            <Info size={15} /> {INCOME_FIRST_MESSAGE}
          </p>
        )}
        <Field label="Amount">
          <div className="amount-input">
            <span>{user?.currency || "PKR"}</span>
            <input
              autoFocus
              required
              type="number"
              min="0.01"
              max="1000000000"
              step="0.01"
              value={form.amount}
              onChange={(e) => change("amount", e.target.value)}
              placeholder="0.00"
            />
          </div>
        </Field>
        <Field label="Description">
          <input
            required
            value={form.description}
            onChange={(e) => change("description", e.target.value)}
            maxLength={250}
            placeholder={
              form.type === "expense"
                ? "e.g. Lunch at campus cafe"
                : "e.g. Monthly allowance"
            }
          />
        </Field>
        <Field label="Category">
          <select
            value={form.categoryId}
            required
            onChange={(e) => change("categoryId", e.target.value)}
          >
            <option value="">Choose a category</option>
            {options.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <div className={form.type === "expense" ? "form-grid" : ""}>
          <Field label={form.type === "expense" ? "Expense starts" : "Date"}>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => {
                const nextStart = e.target.value;
                setForm((current) => ({
                  ...current,
                  date: nextStart,
                  endDate:
                    current.type === "expense" && current.endDate < nextStart
                      ? nextStart
                      : current.endDate,
                }));
              }}
            />
          </Field>
          {form.type === "expense" && (
            <Field label="Expense ends">
              <input
                required
                type="date"
                min={form.date}
                value={form.endDate}
                onChange={(e) => change("endDate", e.target.value)}
              />
            </Field>
          )}
        </div>
        {form.type === "expense" && (
          form.date &&
          form.endDate && (
            <p className="form-hint">
              <CalendarDays size={15} /> This expense covers{" "}
              {expenseDurationDays} {expenseDurationDays === 1 ? "day" : "days"}
              , from {dateLabel(form.date)} to {dateLabel(form.endDate)}.
            </p>
          )
        )}
        {form.type === "income" && !isEdit && (
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.repeatMonthly}
              onChange={(e) => change("repeatMonthly", e.target.checked)}
            />
            <span>
              <strong>Repeat this income every month</strong>
              <small>
                The same income will appear automatically each month and can
                be edited later.
              </small>
            </span>
          </label>
        )}
        <Field label="Note / source (optional)">
          <input
            maxLength={100}
            value={form.source}
            onChange={(e) => change("source", e.target.value)}
            placeholder="e.g. Cash, wallet, scholarship"
          />
        </Field>
        <div className="modal-footer">
          <button
            className="button button-outline"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="button button-primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add transaction"}{" "}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function Transactions() {
  const { user } = useAuth(),
    toast = useToast(),
    confirm = useConfirm(),
    [params] = useSearchParams(),
    [modal, setModal] = useState(
      params.get("new")
        ? {
            type: params.get("new"),
          }
        : null,
    ),
    [history, setHistory] = useState(null),
    [search, setSearch] = useState(""),
    [type, setType] = useState(""),
    [category, setCategory] = useState(""),
    [page, setPage] = useState(1);
  const cats = useLoad(() => api("/categories"), []);
  const incomeCheck = useLoad(
    () => api("/transactions?type=income&limit=1"),
    [],
  );
  // Unknown while loading; the API enforces the same rule either way.
  const expenseLocked = Boolean(incomeCheck.data) && !incomeCheck.data.total;
  const list = useLoad(
    () =>
      api(
        `/transactions?page=${page}&limit=15&search=${encodeURIComponent(search)}&type=${type}&categoryId=${category}`,
      ),
    [page, search, type, category],
  );
  const rows = list.data?.transactions || [],
    categories = cats.data?.categories || [];
  useEffect(() => {
    const type = params.get("new");
    if (["income", "expense"].includes(type))
      setModal({
        type,
      });
  }, [params.toString()]);
  useEffect(() => {
    if (expenseLocked && modal && !modal._id && modal.type === "expense") {
      toast(INCOME_FIRST_MESSAGE, "error");
      setModal({
        type: "income",
      });
    }
  }, [expenseLocked, modal]);
  async function remove(row) {
    const approved = await confirm({
      title: "Archive transaction?",
      message: `“${row.description}” will be removed from active totals. Its audit history will remain available.`,
      confirmText: "Archive",
    });
    if (!approved) return;
    try {
      await api(`/transactions/${row._id}`, {
        method: "DELETE",
      });
      await list.reload();
      incomeCheck.reload().catch(() => {});
      toast("Transaction archived.");
    } catch (e) {
      toast(e.message, "error");
    }
  }
  async function showHistory(row) {
    try {
      const result = await api(`/transactions/${row._id}/history`);
      setHistory({
        row,
        events: result.history,
      });
    } catch (e) {
      toast(e.message, "error");
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="EVERY COIN HAS A STORY"
        title="Transactions"
        desc="One clear place for everything coming in and going out."
        action={
          <div className="button-row transaction-page-actions">
            <Link to="/app/import" className="button button-outline">
              <FileSpreadsheet size={17} /> Import CSV
            </Link>
            <button
              className="button button-outline"
              onClick={() =>
                setModal({
                  type: "income",
                })
              }
            >
              <ArrowDownLeft size={17} /> Add income
            </button>
            <button
              className="button button-primary"
              onClick={() =>
                setModal({
                  type: "expense",
                })
              }
            >
              <Plus size={17} /> Add expense
            </button>
          </div>
        }
      />
      <Card className="table-card">
        <div className="filter-row">
          <div className="search-input">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search transactions..."
            />
          </div>
          <div className="filter-select">
            <select
              aria-label="Filter type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </div>
          <div className="filter-select filter-select-category">
            <select
              aria-label="Filter category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </div>
          <span className="filter-count">{list.data?.total || 0} entries</span>
        </div>
        {list.error && <ErrorNotice message={list.error} retry={list.reload} />}
        <TransactionTable
          rows={rows}
          currency={user?.currency}
          actions
          onEdit={setModal}
          onDelete={remove}
          onHistory={showHistory}
        />
        <div className="table-footer">
          <span>
            Page {page} of {list.data?.pages || 1}
          </span>
          <div>
            <button
              className="button button-outline button-small"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <button
              className="button button-outline button-small"
              disabled={page >= (list.data?.pages || 1)}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </Card>
      {modal && (
        <TransactionModal
          key={modal._id || modal.type}
          row={modal}
          categories={categories}
          expenseLocked={expenseLocked && !modal._id}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            list.reload().catch(() => {});
            incomeCheck.reload().catch(() => {});
          }}
        />
      )}
      {history && (
        <Modal
          title="Transaction history"
          subtitle={history.row.description}
          onClose={() => setHistory(null)}
        >
          <div className="history-list">
            {history.events.map((x) => (
              <div key={x._id}>
                <span className="history-dot" />
                <div>
                  <strong>{x.action.toUpperCase()}</strong>
                  <small>
                    {dateLabel(x.at)} / {new Date(x.at).toLocaleTimeString()}
                  </small>
                  <p>
                    {x.action === "update"
                      ? "Transaction details changed."
                      : x.action === "delete"
                        ? "Entry archived; record preserved."
                        : "Transaction created."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
