import React, { useState } from "react";
import { CalendarDays, Coins, Plus, Target, Trash2, Wallet } from "lucide-react";
import { api, dateLabel, monthName } from "../../lib/api";
import {
  Card,
  Empty,
  Field,
  Modal,
  MonthPicker,
  PageHeader,
  useAuth,
  useLoad,
  useMonth,
  useToast,
  useConfirm,
} from "../../components/UIComponents";
import { formatMoney, LoadableContent } from "./PageHelpers";
export function Budgets() {
  const toast = useToast();
  const confirm = useConfirm();
  const { user } = useAuth();
  const [selection, setSelection] = useMonth();
  const load = useLoad(
    () => api(`/budgets?month=${selection.month}&year=${selection.year}`),
    [selection.month, selection.year],
  );
  const cats = useLoad(() => api("/categories"), []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    categoryId: "",
    limit: "",
    alertThreshold: 80,
    startDate: "",
    endDate: "",
  });
  const [busy, setBusy] = useState(false);
  const rows = load.data?.budgets || [];
  const now = new Date();
  const upcomingDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  const upcomingSelection = {
    month: upcomingDate.getUTCMonth() + 1,
    year: upcomingDate.getUTCFullYear(),
  };
  const isUpcomingPlanningMonth =
    now.getUTCDate() >= 15 &&
    selection.month === upcomingSelection.month &&
    selection.year === upcomingSelection.year;
  const monthStart = `${selection.year}-${String(selection.month).padStart(2, "0")}-01`;
  const monthEnd = new Date(Date.UTC(selection.year, selection.month, 0))
    .toISOString()
    .slice(0, 10);
  const hasIncome = Number(load.data?.incomeMinor || 0) > 0;
  function openBudget() {
    if (!hasIncome && !isUpcomingPlanningMonth) {
      toast("Add income for this month before setting a budget.", "error");
      return;
    }
    setForm((current) => ({
      ...current,
      startDate: monthStart,
      endDate: monthEnd,
    }));
    setOpen(true);
  }
  const expenses =
    cats.data?.categories?.filter((category) => category.type === "expense") ||
    [];
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await api("/budgets", {
        method: "POST",
        body: {
          ...selection,
          ...form,
          limit: Number(form.limit),
          alertThreshold: Number(form.alertThreshold),
        },
      });
      toast("Your budget is ready.");
      setOpen(false);
      setForm({
        categoryId: "",
        limit: "",
        alertThreshold: 80,
        startDate: "",
        endDate: "",
      });
      await load.reload();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBusy(false);
    }
  }
  async function remove(budget) {
    const approved = await confirm({
      title: "Delete this budget?",
      message: `${budget.category?.name || "This category"} budget and its progress will be removed. Your transactions will not be affected.`,
      confirmText: "Delete budget",
    });
    if (!approved) return;
    try {
      await api(`/budgets/${budget._id}`, {
        method: "DELETE",
      });
      await load.reload();
      toast("Budget removed.");
    } catch (error) {
      toast(error.message, "error");
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="SPEND WITH INTENTION"
        title="My budgets"
        desc="Plan category limits while protecting the income you want to save."
        action={
          <div className="button-row">
            <MonthPicker
              {...selection}
              allowNextMonthAfterMidpoint
              onChange={setSelection}
            />
            <button
              className="button button-primary"
              onClick={openBudget}
              disabled={!hasIncome && !isUpcomingPlanningMonth}
              title={
                !hasIncome && !isUpcomingPlanningMonth
                  ? "Add income first"
                  : "Set a budget"
              }
            >
              <Plus size={17} /> Set a budget
            </button>
          </div>
        }
      />
      {now.getUTCDate() >= 15 &&
        (selection.month !== upcomingSelection.month ||
          selection.year !== upcomingSelection.year) && (
          <div className="soft-info">
            <CalendarDays size={18} />
            <span>
              {monthName(upcomingSelection.month, upcomingSelection.year)} is
              open for early budget planning.
            </span>
            <button
              className="button button-outline button-small"
              onClick={() => setSelection(upcomingSelection)}
            >
              Plan {monthName(upcomingSelection.month, upcomingSelection.year)}
            </button>
          </div>
        )}
      <LoadableContent load={load}>
        <div className="budget-overview">
          <Card className="budget-summary">
            <div>
              <span className="eyebrow">PLANNED BUDGETS</span>
              <h2>{formatMoney(load.data?.plannedMinor, user?.currency)}</h2>
              <p>
                {formatMoney(load.data?.unallocatedIncomeMinor, user?.currency)}{" "}
                of income is not assigned to category limits.
              </p>
            </div>
            <span className="summary-icon">
              <Target size={36} />
            </span>
          </Card>
          <Card className="budget-summary">
            <div>
              <span className="eyebrow">ACTUAL SPENDING</span>
              <h2>{formatMoney(load.data?.expenseMinor, user?.currency)}</h2>
              <p>
                All recorded expenses for{" "}
                {monthName(selection.month, selection.year)}.
              </p>
            </div>
            <span className="summary-icon orange">
              <Wallet size={36} />
            </span>
          </Card>
          <Card className="budget-summary">
            <div>
              <span className="eyebrow">AVAILABLE SAVINGS</span>
              <h2>{formatMoney(load.data?.savingsMinor, user?.currency)}</h2>
              <p>
                Income left after recorded expenses this month.
              </p>
            </div>
            <span className="summary-icon blue">
              <Coins size={36} />
            </span>
          </Card>
        </div>
        <div className="budget-explainer">
          <Coins size={18} />
          <span>
            Every new income or expense updates available savings automatically.
            Category budgets are limits, so they do not count as spent until you
            record an expense.
          </span>
        </div>
        {!hasIncome && !isUpcomingPlanningMonth && (
          <div className="soft-info">
            <Coins size={18} />
            <span>Add income for {monthName(selection.month, selection.year)} before creating a budget.</span>
          </div>
        )}
        {rows.length ? (
          <div className="budget-cards">
            {rows.map((budget) => (
              <Card className="budget-card" key={budget._id}>
                <div className="budget-card-top">
                  <span className="category-symbol expense">
                    {budget.category?.name?.[0] || "?"}
                  </span>
                  <div>
                    <h3>{budget.category?.name || "Archived category"}</h3>
                    <small>
                      {budget.durationDays} day{budget.durationDays === 1 ? "" : "s"} · {dateLabel(budget.startDate)} to {dateLabel(budget.endDate)} · {budget.percent >= 100
                        ? "Budget exceeded"
                        : budget.percent >= budget.alertThreshold
                          ? "Almost at your limit"
                          : "Right on track"}
                    </small>
                  </div>
                  <button
                    className="icon-button danger"
                    title="Delete budget"
                    onClick={() => remove(budget)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="budget-amount">
                  <strong>
                    {formatMoney(budget.spentMinor, user?.currency)}
                  </strong>
                  <span>
                    of {formatMoney(budget.limitMinor, user?.currency)}
                  </span>
                </div>
                <div className="progress progress-large">
                  <span
                    className={
                      budget.percent >= 100
                        ? "danger"
                        : budget.percent >= budget.alertThreshold
                          ? "warning"
                          : ""
                    }
                    style={{
                      width: `${Math.min(100, budget.percent)}%`,
                    }}
                  />
                </div>
                <div className="budget-card-foot">
                  <span>{budget.percent}% used</span>
                  <span>
                    {budget.spentMinor <= budget.limitMinor
                      ? `${formatMoney(budget.limitMinor - budget.spentMinor, user?.currency)} left`
                      : `${formatMoney(budget.spentMinor - budget.limitMinor, user?.currency)} over`}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Empty
              title="No budgets for this month"
              message="Start with one flexible category, like food or transport."
              action={
                <button
                  onClick={openBudget}
                  disabled={!hasIncome && !isUpcomingPlanningMonth}
                  className="button button-primary"
                >
                  <Plus size={16} /> Set first budget
                </button>
              }
            />
          </Card>
        )}
      </LoadableContent>
      {open && (
        <Modal
          title="Set a monthly budget"
          subtitle={`For ${monthName(selection.month, selection.year)}`}
          onClose={() => setOpen(false)}
        >
          <form className="modal-form" onSubmit={submit}>
            <Field label="Expense category">
              <select
                required
                value={form.categoryId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    categoryId: event.target.value,
                  })
                }
              >
                <option value="">Choose category</option>
                {expenses.map((category) => (
                  <option value={category._id} key={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`Monthly limit (${user?.currency})`}>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.limit}
                onChange={(event) =>
                  setForm({
                    ...form,
                    limit: event.target.value,
                  })
                }
                placeholder="e.g. 8000"
              />
            </Field>
            <div className="form-grid">
              <Field label="Budget starts">
                <input
                  required
                  type="date"
                  min={monthStart}
                  max={monthEnd}
                  value={form.startDate}
                  onChange={(event) =>
                    setForm({ ...form, startDate: event.target.value })
                  }
                />
              </Field>
              <Field label="Budget ends">
                <input
                  required
                  type="date"
                  min={form.startDate || monthStart}
                  max={monthEnd}
                  value={form.endDate}
                  onChange={(event) =>
                    setForm({ ...form, endDate: event.target.value })
                  }
                />
              </Field>
            </div>
            {form.startDate && form.endDate && (
              <p className="form-hint">
                <CalendarDays size={15} /> This budget covers {Math.max(1, Math.floor((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1)} days.
              </p>
            )}
            <Field label="Alert me when budget reaches">
              <select
                value={form.alertThreshold}
                onChange={(event) =>
                  setForm({
                    ...form,
                    alertThreshold: event.target.value,
                  })
                }
              >
                {[70, 75, 80, 85, 90, 95].map((value) => (
                  <option key={value} value={value}>
                    {value}% used
                  </option>
                ))}
              </select>
            </Field>
            <div className="modal-footer">
              <button
                className="button button-outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button disabled={busy} className="button button-primary">
                {busy ? "Saving..." : "Save budget"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
