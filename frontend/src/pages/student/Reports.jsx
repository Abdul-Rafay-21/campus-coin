import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  Plus,
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
  LockKeyhole,
  Save,
  BookOpen,
  Coins,
  X,
  Info,
} from "lucide-react";
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
export function Reports() {
  const toast = useToast(),
    { user } = useAuth(),
    [selection, setSelection] = useMonth(),
    [busy, setBusy] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    categoryId: "",
    incomeSource: "",
  });
  const cats = useLoad(() => api("/categories"), []);
  const query = new URLSearchParams({
    ...selection,
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
  }).toString();
  const load = useLoad(() => api(`/reports?${query}`), [query]);
  const report = load.data || {};
  const changeFilter = (key, value) =>
    setFilters((p) => ({
      ...p,
      [key]: value,
      ...(key === "categoryId" && value
        ? {
            incomeSource: "",
          }
        : {}),
      ...(key === "incomeSource" && value
        ? {
            categoryId: "",
          }
        : {}),
    }));
  async function csv() {
    setBusy("csv");
    try {
      await downloadApi(
        `/reports/csv?${query}`,
        `campus-coin-report-${selection.year}-${selection.month}.csv`,
      );
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy("");
    }
  }
  async function emailReport() {
    setBusy("email");
    try {
      const result = await api("/reports/email", {
        method: "POST",
        body: {
          ...selection,
          ...filters,
        },
      });
      toast(result.message);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="FIND YOUR MONEY PATTERNS"
        title="Reports & analytics"
        desc="A clearer view of your spending, minus the spreadsheets."
        action={
          <div className="button-row">
            <MonthPicker
              {...selection}
              disableFuture
              onChange={(p) => {
                setSelection(p);
                setFilters((f) => ({
                  ...f,
                  from: "",
                  to: "",
                }));
              }}
            />
            <button
              disabled={!!busy}
              className="button button-outline"
              onClick={csv}
            >
              <FileSpreadsheet size={16} /> CSV
            </button>
            <button
              disabled={!!busy}
              className="button button-outline"
              onClick={emailReport}
              title="Email the CSV report"
            >
              <Mail size={16} /> {busy === "email" ? "Sending..." : "Email CSV"}
            </button>
          </div>
        }
      />
      <Card className="report-filters">
        <div className="report-filter-grid">
          <Field label="From date">
            <input
              type="date"
              max={filters.to || today()}
              value={filters.from}
              onChange={(e) => changeFilter("from", e.target.value)}
            />
          </Field>
          <Field label="To date">
            <input
              type="date"
              min={filters.from || undefined}
              max={today()}
              value={filters.to}
              onChange={(e) => changeFilter("to", e.target.value)}
            />
          </Field>
          <Field label="Expense category">
            <select
              value={filters.categoryId}
              onChange={(e) => changeFilter("categoryId", e.target.value)}
            >
              <option value="">All expense categories</option>
              {cats.data?.categories
                ?.filter((c) => c.type === "expense")
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Income source">
            <select
              value={filters.incomeSource}
              onChange={(e) => changeFilter("incomeSource", e.target.value)}
            >
              <option value="">All income sources</option>
              {cats.data?.categories
                ?.filter((c) => c.type === "income")
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </Field>
        </div>
        <div className="report-filter-foot">
          <span>
            Filtering by income source shows income entries from that source.
            The six-month chart shows your overall history.
          </span>
          <button
            className="text-button"
            onClick={() =>
              setFilters({
                from: "",
                to: "",
                categoryId: "",
                incomeSource: "",
              })
            }
          >
            Clear filters
          </button>
        </div>
      </Card>
      <LoadableContent load={load}>
        <div className="report-export-area">
          {report.filtered && (
            <div className="report-period">
              <Filter size={15} /> Filtered period: {report.filterRange?.from}{" "}
              to {report.filterRange?.to}
            </div>
          )}
          <div className="report-summary">
            <StatCard
              icon={ArrowDownLeft}
              label="Total income"
              value={formatMoney(report.incomeMinor, user?.currency)}
              note={
                report.filtered
                  ? "Filtered entries"
                  : monthName(selection.month, selection.year)
              }
            />
            <StatCard
              icon={ArrowUpRight}
              label="Total expenses"
              value={formatMoney(report.expenseMinor, user?.currency)}
              note={`${report.count || 0} recorded entries`}
              tone="orange"
            />
            <StatCard
              icon={Wallet}
              label="Net balance"
              value={formatMoney(report.balanceMinor, user?.currency)}
              note="Income less expenses"
              tone="blue"
            />
          </div>
          <div className="dashboard-charts">
            <Card className="chart-card">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">SIX-MONTH VIEW / UNFILTERED</span>
                  <h2>Your money over time</h2>
                </div>
              </div>
              <TrendChart data={report.lastSix} currency={user?.currency} />
            </Card>
            <Card className="chart-card">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">BY CATEGORY / FILTERED</span>
                  <h2>Where your money went</h2>
                </div>
              </div>
              <CategoryChart
                data={report.categoryBreakdown}
                currency={user?.currency}
              />
            </Card>
          </div>
          <div className="dashboard-charts">
            <Card className="chart-card">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">DAILY BREAKDOWN / FILTERED</span>
                  <h2>Your daily spending</h2>
                </div>
              </div>
              <DailyChart
                data={report.daily}
                currency={user?.currency}
                maxBarSize={64}
              />
            </Card>
            <Card className="chart-card">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">WEEKLY BREAKDOWN / FILTERED</span>
                  <h2>Your weekly spending</h2>
                </div>
              </div>
              <DailyChart
                data={report.weekly}
                currency={user?.currency}
                maxBarSize={82}
              />
            </Card>
          </div>
        </div>
      </LoadableContent>
      <div className="report-disclaimer">
        <Info size={16} /> Based on the transactions you have recorded for
        this period.
      </div>
    </>
  );
}
