import React, { useState } from "react";
import { Bookmark, CheckCircle2, Lightbulb, Sparkles } from "lucide-react";
import { api, dateLabel, monthName } from "../../lib/api";
import {
  Card,
  Empty,
  MonthPicker,
  PageHeader,
  useLoad,
  useMonth,
  useToast,
} from "../../components/UIComponents";
import { LoadableContent } from "./PageHelpers";

export function Insights() {
  const toast = useToast();
  const [selection, setSelection] = useMonth();
  const [busy, setBusy] = useState(false);
  const load = useLoad(() => api("/insights"), []);

  async function generate() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await api("/insights/generate", {
        method: "POST",
        body: selection,
      });
      toast("Monthly summary created using spending rules.");
      await load.reload();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function bookmark(id) {
    try {
      const result = await api("/bookmarks/toggle", {
        method: "POST",
        body: { kind: "insight", refId: id },
      });
      toast(result.bookmarked ? "Insight bookmarked." : "Bookmark removed.");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  const generateButton = () => (
    <button
      className="button button-primary"
      disabled={busy}
      onClick={generate}
    >
      <Sparkles size={17} />
      {busy ? "Generating..." : "Generate insight"}
    </button>
  );

  return (
    <>
      <PageHeader
        eyebrow="A CLOSER LOOK AT YOUR HABITS"
        title="Monthly insights"
        desc="Short, readable spending summaries based on your own transactions."
        action={
          <div className="button-row">
            <MonthPicker {...selection} onChange={setSelection} />
            {generateButton()}
          </div>
        }
      />
      <div className="soft-info">
        <Sparkles size={19} />
        <span>
          Campus Coin creates this summary from your recorded totals and simple
          spending rules.
        </span>
      </div>
      <LoadableContent load={load}>
        <div className="insight-list">
          {load.data?.sharedInsights?.map((insight) => (
            <Card className="insight-card admin-tip-card" key={insight._id}>
              <div className="insight-head">
                <span className="insight-star"><Sparkles size={22} /></span>
                <div>
                  <span className="eyebrow">FROM CAMPUS COIN / ADMIN INSIGHT</span>
                  <h2>{insight.title}</h2>
                </div>
              </div>
              <p className="insight-summary">{insight.body}</p>
            </Card>
          ))}
          {load.data?.insights?.length ? (
            load.data.insights.map((insight) => (
              <Card className="insight-card" key={insight._id}>
                <div className="insight-head">
                  <span className="insight-star">
                    <Sparkles size={22} />
                  </span>
                  <div>
                    <span className="eyebrow">
                      {monthName(insight.month, insight.year)} / RULE-BASED
                    </span>
                    <h2>Your monthly money story</h2>
                  </div>
                  <button
                    className="icon-button"
                    title="Toggle bookmark"
                    onClick={() => bookmark(insight._id)}
                  >
                    <Bookmark size={19} />
                  </button>
                </div>
                <p className="insight-summary">{insight.summaryText}</p>
                {insight.highlights?.map((highlight, index) => (
                  <div className="insight-highlight" key={index}>
                    <CheckCircle2 size={16} />
                    {highlight}
                  </div>
                ))}
                <div className="insight-advice">
                  <Lightbulb size={19} />
                  <div>
                    <strong>Something to try</strong>
                    <p>{insight.tipText}</p>
                  </div>
                </div>
                <small className="muted">
                  Generated {dateLabel(insight.generatedAt)} / General budgeting
                  guidance only.
                </small>
              </Card>
            ))
          ) : !load.data?.sharedInsights?.length ? (
            <Card>
              <Empty
                title="Your money story starts here"
                message="Generate your first summary after recording a few transactions."
                action={generateButton()}
              />
            </Card>
          ) : null}
        </div>
      </LoadableContent>
    </>
  );
}
