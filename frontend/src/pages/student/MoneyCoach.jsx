import React, { useEffect, useRef, useState } from "react";
import { Bot, Send, Target, Wallet } from "lucide-react";
import { api } from "../../lib/api";
import {
  Card,
  MonthPicker,
  PageHeader,
  Pill,
  useAuth,
  useMonth,
  useToast,
} from "../../components/UIComponents";
import { formatMoney } from "./PageHelpers";
const starters = [
  "How much have I saved this month?",
  "Which budget needs attention?",
  "Would a monthly food stock-up help me?",
];
export function MoneyCoach() {
  const { user } = useAuth();
  const toast = useToast();
  const [selection, setSelection] = useMonth();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask me about your recorded income, expenses, category budgets, savings goal, spending habits, or how to use Campus Coin. I only answer questions about your money and this app.",
      generatedBy: "rules",
    },
  ]);
  const messagesRef = useRef(null);
  useEffect(() => {
    const messageList = messagesRef.current;
    if (!messageList) return;
    messageList.scrollTo({
      top: messageList.scrollHeight,
      behavior: messages.length > 1 ? "smooth" : "auto",
    });
  }, [messages, busy]);
  async function ask(question = text) {
    const message = question.trim();
    if (!message || busy) return;
    const next = [
      ...messages,
      {
        role: "user",
        content: message,
      },
    ];
    setMessages(next);
    setText("");
    setBusy(true);
    try {
      const result = await api("/coach", {
        method: "POST",
        body: {
          ...selection,
          message,
          history: messages.slice(-8).map(({ role, content }) => ({
            role,
            content,
          })),
        },
      });
      setSummary(result.summary);
      setMessages([
        ...next,
        {
          role: "assistant",
          content: result.reply,
          generatedBy: result.generatedBy,
        },
      ]);
    } catch (error) {
      toast(error.message, "error");
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "I could not read your money summary just now. Please try again.",
          generatedBy: "rules",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }
  function submit(event) {
    event.preventDefault();
    ask();
  }
  return (
    <>
      <PageHeader
        eyebrow="YOUR PERSONAL MONEY GUIDE"
        title="Money coach"
        desc="Ask questions grounded in your recorded transactions, budgets and savings goal."
        action={<MonthPicker {...selection} onChange={setSelection} />}
      />
      <div className="coach-layout">
        <Card className="coach-panel">
          <div className="coach-heading">
            <span className="coach-avatar">
              <Bot size={22} />
            </span>
            <div>
              <h2>Campus Coin coach</h2>
              <p>Private context from the selected month</p>
            </div>
            <Pill tone="green">
              Spending rules
            </Pill>
          </div>
          <div className="coach-starters">
            {starters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => ask(item)}
                disabled={busy}
              >
                {item}
              </button>
            ))}
          </div>
          <div
            ref={messagesRef}
            className="coach-messages"
            aria-live="polite"
          >
            {messages.map((item, index) => (
              <div
                className={`coach-message ${item.role}`}
                key={`${item.role}-${index}`}
              >
                <p>{item.content}</p>
                {item.role === "assistant" && (
                  <small>Based on your recorded summary</small>
                )}
              </div>
            ))}
            {busy && (
              <div className="coach-message assistant coach-typing">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>
          <form className="coach-composer" onSubmit={submit}>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={600}
              rows={2}
              placeholder="Ask about savings, food spending or a category budget..."
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  ask();
                }
              }}
            />
            <button
              className="button button-primary"
              disabled={busy || text.trim().length < 2}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </Card>
        <aside className="coach-summary">
          <Card>
            <Wallet size={20} />
            <span>Available savings</span>
            <strong>
              {formatMoney(summary?.savingsMinor || 0, user?.currency)}
            </strong>
            <small>Recorded income minus expenses</small>
          </Card>
          <Card>
            <Target size={20} />
            <span>Savings goal</span>
            <strong>
              {summary?.savingsGoalMinor
                ? `${summary.savingsGoalProgress}%`
                : "Not set"}
            </strong>
            <small>
              {summary?.savingsGoalMinor
                ? `${formatMoney(summary.savingsGoalMinor, user?.currency)} monthly target`
                : "Set it in My profile"}
            </small>
          </Card>
          <p className="coach-disclaimer">
            Guidance is based on the data you have recorded. You always make
            the final call.
          </p>
        </aside>
      </div>
    </>
  );
}
