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
  ErrorNotice,
} from "../../components/UIComponents";
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
export function Bookmarks() {
  const load = useLoad(() => api("/bookmarks"), []);
  const rows = load.data?.bookmarks || [];
  return (
    <>
      <PageHeader
        eyebrow="YOUR SAVED IDEAS"
        title="Bookmarks"
        desc="Keep the insights and tips worth coming back to."
      />
      <LoadableContent load={load}>
        {rows.length ? (
          <div className="tips-grid">
            {rows.map((b) => (
              <Card key={b._id} className="bookmark-card">
                <Pill tone={b.kind === "tip" ? "success" : "neutral"}>
                  {b.kind === "tip" ? "Saving tip" : "Insight"}
                </Pill>
                <h2>
                  {b.kind === "tip"
                    ? b.item.title
                    : `${monthName(b.item.month, b.item.year)} insight`}
                </h2>
                <p>
                  {b.kind === "tip" ? b.item.description : b.item.summaryText}
                </p>
                <Link
                  className="inline-link"
                  to={b.kind === "tip" ? "/app/tips" : "/app/insights"}
                >
                  Open {b.kind} <ArrowRight size={16} />
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Empty
              title="Nothing saved yet"
              message="Bookmark a helpful tip or monthly insight and it'll appear here."
              action={
                <Link className="button button-outline" to="/app/tips">
                  Browse saving tips
                </Link>
              }
            />
          </Card>
        )}
      </LoadableContent>
    </>
  );
}
