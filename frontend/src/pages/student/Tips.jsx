import React, { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";
import { api } from "../../lib/api";
import {
  Card,
  Empty,
  MonthPicker,
  PageHeader,
  Pill,
  useAuth,
  useLoad,
  useMonth,
  useToast,
} from "../../components/UIComponents";
import { formatMoney, LoadableContent } from "./PageHelpers";

export function Tips() {
  const { user } = useAuth();
  const toast = useToast();
  const [selection, setSelection] = useMonth();
  const [busy, setBusy] = useState(false);
  const load = useLoad(() => api("/tips"), []);
  const rows = load.data?.tips || [];
  const adminTips = load.data?.templates || [];

  async function generate() {
    if (busy) return;
    setBusy(true);
    try {
      await api("/tips/generate", { method: "POST", body: selection });
      await load.reload();
      toast("Saving tips refreshed.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function update(id, status) {
    try {
      await api(`/tips/${id}`, { method: "PATCH", body: { status } });
      await load.reload();
      toast(
        status === "pinned"
          ? "Tip pinned."
          : status === "dismissed"
            ? "Tip dismissed."
            : "Tip restored.",
      );
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function bookmark(id) {
    try {
      const result = await api("/bookmarks/toggle", {
        method: "POST",
        body: { kind: "tip", refId: id },
      });
      toast(result.bookmarked ? "Tip bookmarked." : "Bookmark removed.");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  const generateButton = (label) => (
    <button
      className="button button-primary"
      disabled={busy}
      onClick={generate}
    >
      <RefreshCcw className={busy ? "spin" : ""} size={16} />
      {busy ? "Generating..." : label}
    </button>
  );

  return (
    <>
      <PageHeader
        eyebrow="SMALL HABITS, BIG DIFFERENCE"
        title="Saving tips"
        desc="Personal suggestions drawn from your budget and spending patterns."
        action={
          <div className="button-row">
            <MonthPicker {...selection} onChange={setSelection} />
            {generateButton("Refresh tips")}
          </div>
        }
      />
      <LoadableContent load={load}>
        {adminTips.length > 0 && (
          <section className="shared-tips-section">
            <div className="section-heading-row">
              <div>
                <span className="eyebrow">FROM CAMPUS COIN</span>
                <h2>Admin saving guides</h2>
              </div>
            </div>
            <div className="tips-grid">
              {adminTips.map((tip) => (
                <Card key={tip._id} className="saving-tip-card admin-tip-card">
                  <div className="tip-card-top">
                    <span className="tip-card-icon"><Lightbulb size={22} /></span>
                    <Pill tone="success">Admin tip</Pill>
                  </div>
                  <h2>{tip.title}</h2>
                  <p>{tip.body}</p>
                </Card>
              ))}
            </div>
          </section>
        )}
        {rows.length ? (
          <div className="tips-grid">
            {rows.map((tip) => (
              <Card
                key={tip._id}
                className={`saving-tip-card ${tip.status === "dismissed" ? "tip-dismissed" : ""}`}
              >
                <div className="tip-card-top">
                  <span className="tip-card-icon">
                    <Lightbulb size={22} />
                  </span>
                  <span className="tip-badges">
                    <Pill tone="neutral">Spending rule</Pill>
                    <Pill
                      tone={tip.status === "pinned" ? "success" : "neutral"}
                    >
                      {tip.status}
                    </Pill>
                  </span>
                </div>
                <h2>{tip.title}</h2>
                <p>{tip.description}</p>
                <div className="tip-potential">
                  <TrendingUp size={16} />
                  Potential saving:{" "}
                  {formatMoney(tip.potentialSavingMinor, user?.currency)}*
                </div>
                <div className="tip-card-actions">
                  <button
                    className="button button-outline button-small"
                    onClick={() =>
                      update(
                        tip._id,
                        tip.status === "pinned" ? "active" : "pinned",
                      )
                    }
                  >
                    <BookmarkCheck size={15} />
                    {tip.status === "pinned" ? "Unpin" : "Pin"}
                  </button>
                  <button
                    className="button button-outline button-small"
                    onClick={() => bookmark(tip._id)}
                  >
                    <Bookmark size={15} /> Save
                  </button>
                  <button
                    className="text-button"
                    onClick={() =>
                      update(
                        tip._id,
                        tip.status === "dismissed" ? "active" : "dismissed",
                      )
                    }
                  >
                    {tip.status === "dismissed" ? "Restore" : "Dismiss"}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Empty
              title="No tips to show just yet"
              message="Log expenses across a few categories, set budgets, then generate your first suggestions."
              action={generateButton("Generate tips")}
            />
          </Card>
        )}
      </LoadableContent>
      <p className="report-disclaimer">
        * Estimated savings are based on your recent activity.
      </p>
    </>
  );
}
