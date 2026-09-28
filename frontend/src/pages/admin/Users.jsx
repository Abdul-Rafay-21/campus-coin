/** Admin Users administrator dashboard page and related management UI. */
import React, { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Coins,
  Eye,
  LockKeyhole,
  Search,
  Target,
  Trash2,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { api, dateLabel, money } from "../../lib/api";
import {
  Card,
  Empty,
  Modal,
  PageHeader,
  Pill,
  Spinner,
  useLoad,
  useToast,
  useConfirm,
} from "../../components/UIComponents";
import { UserAvatar } from "../../components/Layout";
import { LoadState } from "./PageHelpers";

function SummaryCard({ icon: Icon, label, value, tone = "" }) {
  return (
    <div className={`student-summary-card ${tone}`}>
      <Icon size={19} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StudentDetails({ state, onClose }) {
  const details = state.data;
  const currency = details?.user?.currency || "PKR";
  return (
    <Modal
      wide
      title="Student financial activity"
      subtitle="Account details and recorded Campus Coin activity."
      onClose={onClose}
    >
      <div className="admin-student-detail">
        {state.loading ? (
          <Spinner />
        ) : state.error ? (
          <div className="alert alert-error">{state.error}</div>
        ) : (
          details && (
            <>
              <div className="student-detail-head">
                <UserAvatar user={details.user} />
                <div>
                  <h3>{details.user.name}</h3>
                  <p>{details.user.email}</p>
                </div>
                <Pill
                  tone={details.user.status === "active" ? "success" : "danger"}
                >
                  {details.user.status}
                </Pill>
              </div>
              <div className="student-detail-meta">
                <span>
                  Academic year{" "}
                  <strong>
                    {details.user.academicYear || "Not specified"}
                  </strong>
                </span>
                <span>
                  Currency <strong>{currency}</strong>
                </span>
                <span>
                  Joined <strong>{dateLabel(details.user.createdAt)}</strong>
                </span>
                <span>
                  Email{" "}
                  <strong>
                    {details.user.emailVerified ? "Verified" : "Pending"}
                  </strong>
                </span>
              </div>
              <div className="student-summary-grid">
                <SummaryCard
                  icon={Wallet}
                  label="Total income"
                  value={money(details.summary.incomeMinor, currency)}
                />
                <SummaryCard
                  icon={TrendingDown}
                  label="Total expenses"
                  value={money(details.summary.expenseMinor, currency)}
                  tone="expense"
                />
                <SummaryCard
                  icon={Coins}
                  label="Balance"
                  value={money(details.summary.balanceMinor, currency)}
                />
                <SummaryCard
                  icon={ArrowUpRight}
                  label="Transactions"
                  value={details.summary.transactionCount.toLocaleString()}
                />
              </div>
              <div className="student-detail-columns">
                <section>
                  <div className="card-heading">
                    <div>
                      <h2>Where money was used</h2>
                      <p>Expense totals grouped by category.</p>
                    </div>
                  </div>
                  {details.categoryUsage.length ? (
                    <div className="category-usage-list">
                      {details.categoryUsage.map((item) => {
                        const percent = details.summary.expenseMinor
                          ? Math.round(
                              (item.amountMinor /
                                details.summary.expenseMinor) *
                                100,
                            )
                          : 0;
                        return (
                          <div key={item._id}>
                            <span>
                              <strong>{item.name}</strong>
                              <small>{item.count} entries</small>
                            </span>
                            <div className="admin-bar-track">
                              <i
                                style={{ width: `${Math.max(4, percent)}%` }}
                              />
                            </div>
                            <strong>{money(item.amountMinor, currency)}</strong>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Empty
                      title="No expense activity"
                      message="Category usage will appear after the student records expenses."
                    />
                  )}
                </section>
                <section>
                  <div className="card-heading">
                    <div>
                      <h2>Budgets</h2>
                      <p>Latest category limits created by this student.</p>
                    </div>
                  </div>
                  {details.budgets.length ? (
                    <div className="student-budget-list">
                      {details.budgets.slice(0, 8).map((budget) => (
                        <div key={budget._id}>
                          <Target size={16} />
                          <span>
                            <strong>
                              {budget.categoryId?.name || "Archived category"}
                            </strong>
                            <small>
                              {budget.month}/{budget.year} / Alert at{" "}
                              {budget.alertThreshold}%
                            </small>
                          </span>
                          <strong>{money(budget.limitMinor, currency)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty
                      title="No budgets"
                      message="This student has not created a budget yet."
                    />
                  )}
                </section>
              </div>
              <section className="student-transactions">
                <div className="card-heading">
                  <div>
                    <h2>Recent transactions</h2>
                    <p>
                      Latest 50 active entries, including category and source.
                    </p>
                  </div>
                  <span className="pill">
                    {details.summary.unreadNotifications} unread /{" "}
                    {details.summary.savingTips} tips
                  </span>
                </div>
                {details.recentTransactions.length ? (
                  <div className="table-scroller">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Source</th>
                          <th>Type</th>
                          <th className="cell-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.recentTransactions.map((item) => (
                          <tr key={item._id}>
                            <td>{dateLabel(item.date)}</td>
                            <td>
                              <strong>{item.description}</strong>
                            </td>
                            <td>{item.categoryId?.name || "Archived"}</td>
                            <td>{item.source || "Manual entry"}</td>
                            <td>
                              <Pill
                                tone={
                                  item.type === "income" ? "success" : "warning"
                                }
                              >
                                {item.type}
                              </Pill>
                            </td>
                            <td className="cell-right">
                              <strong>
                                {money(item.amountMinor, currency)}
                              </strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty
                    title="No transactions found"
                    message="This student has not recorded any active transactions."
                  />
                )}
              </section>
            </>
          )
        )}
      </div>
    </Modal>
  );
}

export function UsersPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState(null);
  const [details, setDetails] = useState(null);
  const load = useLoad(
    () => api(`/admin/users?page=${page}&search=${encodeURIComponent(search)}`),
    [page, search],
  );

  async function viewDetails(user) {
    setDetails({ loading: true, error: "", data: null });
    try {
      const data = await api(`/admin/users/${user._id}/details`);
      setDetails({ loading: false, error: "", data });
    } catch (error) {
      setDetails({ loading: false, error: error.message, data: null });
    }
  }

  async function toggleStatus(user) {
    const enabling = user.status !== "active";
    const approved = await confirm({
      title: `${enabling ? "Enable" : "Disable"} student account?`,
      message: `${user.name}'s account will be ${enabling ? "restored and they can sign in again" : "disabled and they will lose access until it is enabled"}.`,
      confirmText: enabling ? "Enable account" : "Disable account",
      tone: enabling ? "primary" : "danger",
    });
    if (!approved) return;
    try {
      await api(`/admin/users/${user._id}/status`, {
        method: "PATCH",
        body: { status: user.status === "active" ? "disabled" : "active" },
      });
      await load.reload();
      toast("Account status updated.");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function resetPassword(user) {
    const approved = await confirm({
      title: "Generate password reset?",
      message: `Create a new password-reset link for ${user.email}.`,
      confirmText: "Generate link",
      tone: "primary",
    });
    if (!approved) return;
    try {
      const result = await api(`/admin/users/${user._id}/reset`, {
        method: "POST",
      });
      setPreview(result.previewUrl || null);
      toast("Password reset link sent or generated.");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function deleteStudent(user) {
    const approved = await confirm({
      title: "Permanently delete student?",
      message: `${user.name}'s account, transactions, budgets, categories, tips and notifications will all be deleted. This cannot be undone.`,
      confirmText: "Delete permanently",
    });
    if (!approved) return;
    try {
      const result = await api(`/admin/users/${user._id}`, {
        method: "DELETE",
      });
      setDetails(null);
      if (load.data?.users?.length === 1 && page > 1) setPage(page - 1);
      else await load.reload();
      toast(result.message);
    } catch (error) {
      toast(error.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="STUDENT MANAGEMENT"
        title="Student accounts"
        desc="Review account status and recorded financial activity."
      />
      <Card className="table-card">
        <div className="filter-row">
          <div className="search-input">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Find a student by name or email"
            />
          </div>
          <span className="filter-count">{load.data?.total || 0} accounts</span>
        </div>
        <LoadState load={load} />
        {load.data && (
          <>
            <div className="table-scroller">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Academic year</th>
                    <th>Verified</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {load.data.users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="student-row">
                          <UserAvatar user={user} small />
                          <div>
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>{user.academicYear || "--"}</td>
                      <td>{user.emailVerified ? "Yes" : "No"}</td>
                      <td>
                        <Pill
                          tone={user.status === "active" ? "success" : "danger"}
                        >
                          {user.status}
                        </Pill>
                      </td>
                      <td>{dateLabel(user.createdAt)}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="button button-outline button-small"
                            onClick={() => viewDetails(user)}
                          >
                            <Eye size={15} /> View details
                          </button>
                          <button
                            className="button button-outline button-small"
                            onClick={() => toggleStatus(user)}
                          >
                            {user.status === "active" ? "Disable" : "Enable"}
                          </button>
                          <button
                            className="icon-button"
                            title="Reset password"
                            aria-label={`Reset password for ${user.name}`}
                            onClick={() => resetPassword(user)}
                          >
                            <LockKeyhole size={16} />
                          </button>
                          <button
                            className="icon-button danger"
                            title="Permanently delete student"
                            aria-label={`Permanently delete ${user.name}`}
                            onClick={() => deleteStudent(user)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>
                Page {page} of {load.data.pages}
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
                  disabled={page >= load.data.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
      {details && (
        <StudentDetails state={details} onClose={() => setDetails(null)} />
      )}
      {preview && (
        <Modal
          title="Development reset preview"
          subtitle="SMTP is not configured. This link is only exposed in development."
          onClose={() => setPreview(null)}
        >
          <div className="modal-form">
            <a className="inline-link" href={preview}>
              Open password reset link <ArrowRight size={16} />
            </a>
          </div>
        </Modal>
      )}
    </>
  );
}
