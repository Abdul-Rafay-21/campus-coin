import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Ellipsis,
  History,
  Pencil,
  Trash2,
} from "lucide-react";
import { dateLabel, money, today } from "../../lib/api";
import {
  Card,
  Empty,
  ErrorNotice,
  Spinner,
} from "../../components/UIComponents";

function isValidTransactionRow(row) {
  const hasValidType = ["income", "expense"].includes(row.type);
  const amount = Number(row.amount);
  const hasValidAmount = Number.isFinite(amount) && amount > 0 && amount <= 1e9;
  const hasDescription = Boolean(String(row.description || "").trim());
  const hasValidDate = !Number.isNaN(new Date(row.date).getTime());
  return (
    hasValidType &&
    hasValidAmount &&
    hasDescription &&
    hasValidDate &&
    Boolean(row.categoryId)
  );
}

function formatMoney(amountInMinorUnits, currency) {
  return money(amountInMinorUnits, currency);
}

function getRecordId(record) {
  return record?._id || record;
}

function toDateInput(date) {
  return date ? new Date(date).toISOString().slice(0, 10) : today();
}

function getFirstName(name) {
  return name?.split(" ")?.[0] || "there";
}

function LoadableContent({ load, children }) {
  if (load.loading && !load.data) return <Spinner />;
  if (load.error && !load.data) {
    return <ErrorNotice message={load.error} retry={load.reload} />;
  }
  return children;
}

function StatCard({ icon: Icon, label, value, note, tone = "green" }) {
  return (
    <Card className={`kpi-card kpi-${tone}`}>
      <div className="kpi-top">
        <span className="kpi-icon">
          <Icon size={20} />
        </span>
        <span className="kpi-more">
          <Ellipsis size={20} />
        </span>
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{note}</small>
    </Card>
  );
}

function TransactionTable({
  rows = [],
  currency = "PKR",
  actions = false,
  onEdit,
  onDelete,
  onHistory,
}) {
  if (!rows.length) {
    return (
      <Empty
        title="No transactions found"
        message="Add an income or expense to start your money story."
      />
    );
  }

  return (
    <div className="table-scroller">
      <table className="data-table">
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Category</th>
            <th>Date</th>
            <th>Amount</th>
            {actions && <th className="cell-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((transaction) => (
            <tr key={transaction._id}>
              <td>
                <div className="transaction-cell">
                  <span className={`transaction-icon ${transaction.type}`}>
                    <span>
                      {transaction.type === "income" ? (
                        <ArrowDownLeft size={19} />
                      ) : (
                        <ArrowUpRight size={19} />
                      )}
                    </span>
                  </span>
                  <div>
                    <strong>{transaction.description}</strong>
                    <small>
                      {transaction.type === "income"
                        ? transaction.recurringMonthly
                          ? "Money in · Monthly"
                          : "Money in"
                        : "Money out"}
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <span className="category-tag">
                  {transaction.categoryId?.name || "Archived category"}
                </span>
              </td>
              <td className="muted">
                {transaction.type === "expense" && transaction.endDate ? (
                  <>
                    {dateLabel(transaction.date)} to {dateLabel(transaction.endDate)}
                    <small className="transaction-duration">
                      {Math.max(
                        1,
                        Math.floor(
                          (new Date(transaction.endDate) -
                            new Date(transaction.date)) /
                            86400000,
                        ) + 1,
                      )}{" "}
                      day(s)
                    </small>
                  </>
                ) : (
                  dateLabel(transaction.date)
                )}
              </td>
              <td>
                <strong
                  className={
                    transaction.type === "income" ? "text-green" : "text-ink"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatMoney(transaction.amountMinor, currency)}
                </strong>
              </td>
              {actions && (
                <td className="cell-right">
                  <div className="row-actions">
                    <button
                      title="History"
                      onClick={() => onHistory(transaction)}
                      className="icon-button"
                    >
                      <History size={16} />
                    </button>
                    <button
                      title="Edit"
                      onClick={() => onEdit(transaction)}
                      className="icon-button"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => onDelete(transaction)}
                      className="icon-button danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export {
  formatMoney,
  getFirstName,
  getRecordId,
  isValidTransactionRow,
  LoadableContent,
  StatCard,
  toDateInput,
  TransactionTable,
};
