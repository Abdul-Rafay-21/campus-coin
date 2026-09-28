/** Admin Dashboard administrator dashboard page and related management UI. */
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
  ErrorNotice,
} from "../../components/UIComponents";
import { LoadState, StatCard } from "./PageHelpers";
export function DashboardPage() {
  const load = useLoad(() => api("/admin/stats"), []);
  const stats = load.data || {};
  return (
    <>
      <PageHeader
        eyebrow="CAMPUS COIN CONTROL CENTER"
        title="Administrator overview"
        desc="Keep your student platform organized and running smoothly."
        action={
          <button
            className="button button-outline"
            onClick={() => load.reload().catch(() => {})}
          >
            <RefreshCcw size={16} /> Refresh
          </button>
        }
      />
      <LoadState load={load} />
      <div className="admin-quick-actions">
        <div>
          <span>
            <ShieldCheck size={20} />
          </span>
          <div>
            <strong>Campus Coin administration</strong>
            <p>
              Manage students and categories without accessing private student
              credentials.
            </p>
          </div>
        </div>
        <div className="button-row">
          <Link
            className="button button-outline button-small"
            to="/admin/users"
          >
            <Users size={15} /> Students
          </Link>
          <Link
            className="button button-outline button-small"
            to="/admin/categories"
          >
            <Tags size={15} /> Categories
          </Link>
          <Link
            className="button button-primary button-small"
            to="/admin/announcements"
          >
            <Plus size={15} /> Announcement
          </Link>
        </div>
      </div>
      {load.data && (
        <>
          <div className="admin-stat-grid">
            <StatCard
              icon={Users}
              label="Registered students"
              value={stats.students}
              description="All student accounts"
            />
            <StatCard
              icon={UserCheck}
              label="Active students"
              value={stats.activeStudents}
              description="Accounts currently enabled"
            />
            <StatCard
              icon={ArrowLeftRight}
              label="Transactions"
              value={stats.transactions}
              description="Entries owned by existing students"
            />
            <StatCard
              icon={Tags}
              label="Top categories"
              value={stats.mostUsedCategories?.length}
              description="Categories with activity"
            />
          </div>
          <div className="admin-dash-grid">
            <Card>
              <div className="card-heading">
                <div>
                  <span className="eyebrow">PLATFORM ACTIVITY</span>
                  <h2>Transactions by month</h2>
                </div>
              </div>
              <div className="admin-activity-chart">
                {stats.activity?.length ? (
                  stats.activity.map((x) => (
                    <div key={x._id}>
                      <span>{x._id}</span>
                      <div className="admin-bar-track">
                        <i
                          style={{
                            width: `${Math.max(6, (x.count / Math.max(...stats.activity.map((a) => a.count))) * 100)}%`,
                          }}
                        />
                      </div>
                      <strong>{x.count}</strong>
                    </div>
                  ))
                ) : (
                  <Empty
                    title="No activity yet"
                    message="Monthly activity will appear once students add transactions."
                  />
                )}
              </div>
            </Card>
            <Card>
              <div className="card-heading">
                <div>
                  <span className="eyebrow">MOST USED</span>
                  <h2>Category usage</h2>
                  <p>Share of all active student transactions.</p>
                </div>
              </div>
              <div className="admin-activity-chart">
                {stats.mostUsedCategories?.length ? (
                  stats.mostUsedCategories.map((x) => (
                    <div key={x._id}>
                      <span>{x.name || "Archived"}</span>
                      <div className="admin-bar-track">
                        <i
                          style={{
                            width: `${Math.max(4, x.percentage)}%`,
                          }}
                        />
                      </div>
                      <strong>{x.percentage}%</strong>
                    </div>
                  ))
                ) : (
                  <Empty title="No category data" />
                )}
              </div>
            </Card>
          </div>
          <Card className="table-card">
            <div className="card-heading">
              <h2>Newest students</h2>
              <Link to="/admin/users" className="inline-link">
                View students <ArrowRight size={16} />
              </Link>
            </div>
            <div className="table-scroller">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers?.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <Pill
                          tone={u.status === "active" ? "success" : "danger"}
                        >
                          {u.status}
                        </Pill>
                      </td>
                      <td>{dateLabel(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
