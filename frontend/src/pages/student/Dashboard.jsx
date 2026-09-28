import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  CalendarDays,
  Coins,
  LayoutDashboard,
  Lightbulb,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
  ArrowLeftRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api, monthName } from "../../lib/api";
import {
  Card,
  Empty,
  MonthPicker,
  useAuth,
  useLoad,
  useMonth,
  useToast,
} from "../../components/UIComponents";
import { CategoryChart, TrendChart } from "../../components/Charts";
import {
  getFirstName,
  formatMoney,
  StatCard,
  LoadableContent,
  TransactionTable,
} from "./PageHelpers";
export function Dashboard() {
  const { user } = useAuth();
  const [selection, setSelection] = useMonth();
  const toast = useToast();
  const load = useLoad(
    () => api(`/dashboard?month=${selection.month}&year=${selection.year}`),
    [selection.month, selection.year],
  );
  const data = load.data || {};
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  async function refreshTips() {
    try {
      await api("/tips/generate", {
        method: "POST",
        body: selection,
      });
      await load.reload();
      toast("Your saving tips are up to date.");
    } catch (error) {
      toast(error.message, "error");
    }
  }
  return (
    <LoadableContent load={load}>
      <div className="dashboard-page">
        <div className="welcome-row">
          <div>
            <span className="eyebrow">YOUR MONEY AT A GLANCE</span>
            <h1>
              {greeting}, {getFirstName(user?.name)}
            </h1>
            <p>Here's what's happening with your money. You've got this.</p>
          </div>
          <MonthPicker {...selection} onChange={setSelection} />
        </div>
        {data.announcements?.map((item) => (
          <div className="announcement-strip" key={item._id}>
            <strong>{item.title}</strong>
            <span>{item.message}</span>
          </div>
        ))}
        <nav
          className="dashboard-tabs"
          aria-label="Student overview navigation"
        >
          <Link className="active" to="/app/dashboard">
            <LayoutDashboard size={16} /> Overview
          </Link>
          <Link to="/app/transactions">
            <ArrowLeftRight size={16} /> Transactions
          </Link>
          <Link to="/app/reports">
            <BarChart3 size={16} /> Reports & statistics
          </Link>
        </nav>
        <section
          className="balance-spotlight"
          aria-label="Monthly money summary"
        >
          <div>
            <span className="spotlight-overline">
              <Wallet size={16} />{" "}
              {monthName(selection.month, selection.year).toUpperCase()} / MONEY
              LEFT
            </span>
            <strong className="spotlight-total">
              {formatMoney(data.savingsMinor, user?.currency)}
            </strong>
            <p className="spotlight-caption">
              Your recorded income minus expenses for the selected month. Every
              entry brings you a clearer picture.
            </p>
          </div>
          <div className="spotlight-right">
            <span>
              <Target size={16} /> Progress at a glance
            </span>
            <strong>{data.savingsRate || 0}% of income left</strong>
            <Link to="/app/budgets">
              Manage your budgets <ArrowRight size={15} />
            </Link>
            <small className="spotlight-disclaimer">
              Calculated from the transactions you have recorded.
            </small>
          </div>
        </section>
        <div className="kpi-grid">
          <StatCard
            icon={Wallet}
            label="Total income"
            value={formatMoney(data.incomeMinor, user?.currency)}
            note="Money received this month"
          />
          <StatCard
            icon={ArrowUpRight}
            label="Total expenses"
            value={formatMoney(data.expenseMinor, user?.currency)}
            note="Recorded spending this month"
            tone="orange"
          />
          <StatCard
            icon={Coins}
            label="Available savings"
            value={formatMoney(data.savingsMinor, user?.currency)}
            note={`${data.savingsRate || 0}% of income left`}
            tone="blue"
          />
          <StatCard
            icon={Target}
            label="Savings goal"
            value={formatMoney(data.savingsGoalMinor, user?.currency)}
            note={
              data.savingsGoalMinor
                ? `${data.savingsGoalProgress || 0}% achieved`
                : "Set a target in My profile"
            }
            tone="purple"
          />
        </div>
        <div className="dashboard-action-strip">
          <div>
            <span className="action-strip-icon">
              <TrendingUp size={20} />
            </span>
            <div>
              <strong>Keep your momentum going.</strong>
              <p>
                Available savings update from your recorded income and expenses.
              </p>
            </div>
          </div>
          <div>
            <Link to="/app/coach" className="button button-outline">
              <Bot size={17} /> Ask coach
            </Link>
            <Link
              to="/app/transactions?new=income"
              className="button button-outline"
            >
              <Plus size={17} /> Add income
            </Link>
            <Link
              to="/app/transactions?new=expense"
              className="button button-primary"
            >
              <Plus size={17} /> Add expense
            </Link>
          </div>
        </div>
        <div className="dashboard-charts">
          <Card className="chart-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">YOUR CASH FLOW</span>
                <h2>Income vs. spending</h2>
                <p>A clear view of how your money moves.</p>
              </div>
              <span className="chart-label">
                <span className="legend-dot green" /> Income{" "}
                <span className="legend-dot orange" /> Expenses
              </span>
            </div>
            <TrendChart data={data.lastSix} currency={user?.currency} />
          </Card>
          <Card className="chart-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">WHERE IT GOES</span>
                <h2>Spending breakdown</h2>
                <p>Your expenses, category by category.</p>
              </div>
            </div>
            <CategoryChart
              data={data.categoryBreakdown}
              currency={user?.currency}
            />
          </Card>
        </div>
        <div className="dashboard-bottom">
          <Card className="recent-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">LATEST ACTIVITY</span>
                <h2>Recent transactions</h2>
              </div>
              <Link className="inline-link" to="/app/transactions">
                View all <ArrowRight size={16} />
              </Link>
            </div>
            <TransactionTable rows={data.recent} currency={user?.currency} />
          </Card>
          <div className="dashboard-aside">
            <Card className="budget-widget">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">STAY ON TRACK</span>
                  <h2>My budgets</h2>
                </div>
                <Link
                  className="icon-button"
                  to="/app/budgets"
                  aria-label="View budgets"
                >
                  <ArrowRight size={17} />
                </Link>
              </div>
              {data.budgets?.length ? (
                data.budgets.slice(0, 3).map((budget) => (
                  <div className="budget-mini" key={budget._id}>
                    <div>
                      <strong>{budget.category?.name || "Category"}</strong>
                      <small>
                        {formatMoney(budget.spentMinor, user?.currency)} /{" "}
                        {formatMoney(budget.limitMinor, user?.currency)}
                      </small>
                    </div>
                    <div className="progress">
                      <span
                        className={
                          budget.percent >= 100
                            ? "danger"
                            : budget.percent >= 80
                              ? "warning"
                              : ""
                        }
                        style={{
                          width: `${Math.min(100, budget.percent)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <Empty
                  title="No budgets yet"
                  message="Set a budget for your everyday expenses."
                  action={
                    <Link
                      to="/app/budgets"
                      className="button button-outline button-small"
                    >
                      Create budget
                    </Link>
                  }
                />
              )}
            </Card>
            <Card className="tip-widget">
              <div className="tip-icon">
                <Lightbulb size={22} />
              </div>
              <span className="eyebrow">YOUR MONEY MOMENT</span>
              <h2>
                {data.tips?.[0]?.title ||
                  data.templates?.[0]?.title ||
                  "Every coin adds up."}
              </h2>
              <p>
                {data.tips?.[0]?.description ||
                  data.templates?.[0]?.body ||
                  "Track a few transactions, then refresh your tips to spot saving opportunities."}
              </p>
              <div className="tip-widget-actions">
                <button
                  type="button"
                  className="inline-link"
                  onClick={refreshTips}
                >
                  <RefreshCcw size={15} /> Refresh tips
                </button>
                <Link className="inline-link" to="/app/tips">
                  See all <ArrowRight size={15} />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </LoadableContent>
  );
}
