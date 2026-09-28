/** Admin Logs administrator dashboard page and related management UI. */
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
import { LoadState } from "./PageHelpers";
export function ActivityPage() {
  const load = useLoad(() => api("/admin/logs"), []);
  return (
    <>
      <PageHeader
        eyebrow="AUDIT TRAIL"
        title="Administrator activity"
        desc="A record of changes made in the admin workspace."
      />
      <LoadState load={load} />
      {load.data && (
        <Card className="table-card">
          {load.data.logs?.length ? (
            <div className="table-scroller">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Administrator</th>
                    <th>Target</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {load.data.logs.map((l) => (
                    <tr key={l._id}>
                      <td>
                        <Pill>{l.action}</Pill>
                      </td>
                      <td>{l.adminId?.name || "Administrator"}</td>
                      <td>
                        <small>{l.targetId || "--"}</small>
                      </td>
                      <td>{dateLabel(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="No admin activity yet"
              message="Changes to users, categories and content will appear here."
            />
          )}
        </Card>
      )}
    </>
  );
}
