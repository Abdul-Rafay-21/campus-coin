import React, { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  FileSpreadsheet,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { api } from "../../lib/api";
import {
  Card,
  ErrorNotice,
  PageHeader,
  Pill,
  useLoad,
  useToast,
} from "../../components/UIComponents";
import { isValidTransactionRow } from "./PageHelpers";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
function fileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
export function ImportCSV() {
  const toast = useToast();
  const categoriesLoad = useLoad(() => api("/categories"), []);
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const categories = categoriesLoad.data?.categories || [];
  function chooseFile(nextFile) {
    if (!nextFile) return;
    if (!nextFile.name.toLowerCase().endsWith(".csv")) {
      toast("Choose a file with the .csv extension.", "error");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      toast("CSV files must be 2 MB or smaller.", "error");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(nextFile);
    setPreview(null);
  }
  function clearFile() {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }
  function drop(event) {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }
  async function inspect() {
    if (!file) {
      toast("Choose a CSV file first.", "error");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await api("/imports/preview", {
        method: "POST",
        body: form,
      });
      setPreview(result);
      toast("CSV preview ready. Review categories before importing.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBusy(false);
    }
  }
  function updateRow(index, key, value) {
    setPreview((current) => ({
      ...current,
      preview: current.preview.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [key]: value,
              ...(key === "type"
                ? {
                    categoryId: "",
                  }
                : {}),
            }
          : row,
      ),
    }));
  }
  async function confirm() {
    const rows = preview?.preview || [];
    if (rows.some((row) => !isValidTransactionRow(row))) {
      toast(
        "Fix invalid rows and choose a category for every transaction.",
        "error",
      );
      return;
    }
    setBusy(true);
    try {
      const payload = rows.map(
        ({ date, description, amount, type, categoryId }) => ({
          date,
          description,
          amount: Number(amount),
          type,
          categoryId,
        }),
      );
      const result = await api("/imports/confirm", {
        method: "POST",
        body: {
          fileName: preview.fileName,
          rows: payload,
        },
      });
      toast(result.message);
      clearFile();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="BRING YOUR HISTORY ALONG"
        title="Import from CSV"
        desc="Move your old transaction records in a couple of thoughtful steps."
      />
      {categoriesLoad.error && (
        <ErrorNotice
          message={categoriesLoad.error}
          retry={categoriesLoad.reload}
        />
      )}
      <div className="import-layout">
        <Card
          className={`import-upload ${dragging ? "drag-active" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setDragging(false);
          }}
          onDrop={drop}
        >
          <input
            ref={inputRef}
            className="upload-input"
            aria-label="Choose CSV file"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => chooseFile(event.target.files?.[0])}
          />
          <div className="upload-icon">
            <UploadCloud size={38} />
          </div>
          <h2>{dragging ? "Drop the file to add it" : "Drop your CSV here"}</h2>
          <p>Use a .csv file up to 2 MB with a maximum of 500 transactions.</p>
          <button
            className="button button-outline upload-picker"
            type="button"
            onClick={() => inputRef.current?.click()}
          >
            <FileSpreadsheet size={17} /> Choose CSV file
          </button>
          {file && (
            <div className="chosen-file">
              <span className="chosen-file-icon">
                <FileSpreadsheet size={19} />
              </span>
              <span>
                <strong>{file.name}</strong>
                <small>{fileSize(file.size)}</small>
              </span>
              <button
                className="icon-button"
                type="button"
                onClick={clearFile}
                aria-label="Remove selected file"
              >
                <X size={17} />
              </button>
            </div>
          )}
          <button
            className="button button-primary"
            disabled={!file || busy || categoriesLoad.loading}
            onClick={inspect}
          >
            {busy ? "Preparing preview..." : "Preview transactions"}{" "}
            <ArrowRight size={17} />
          </button>
        </Card>

        <Card className="import-guide">
          <span className="eyebrow">CSV FORMAT</span>
          <h2>A tidy file makes a tidy budget.</h2>
          <p>Start with a header row containing these columns:</p>
          <code>date,description,amount,type,category</code>
          <div className="csv-example">
            2026-09-01,Allowance,20000,income,Allowance
            <br />
            2026-09-02,Campus Cafe,450,expense,Food
          </div>
          <div className="soft-info">
            <ShieldCheck size={17} />
            You'll get a chance to review and correct categories before anything
            is saved.
          </div>
        </Card>
      </div>

      {preview && (
        <Card className="import-preview">
          <div className="card-heading">
            <div>
              <span className="eyebrow">REVIEW BEFORE IMPORT</span>
              <h2>{preview.preview.length} transactions found</h2>
            </div>
            <button
              className="button button-primary"
              disabled={
                busy ||
                preview.preview.some((row) => !isValidTransactionRow(row))
              }
              onClick={confirm}
            >
              {busy ? "Importing..." : "Confirm import"} <Check size={17} />
            </button>
          </div>
          <div className="table-scroller">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Check</th>
                </tr>
              </thead>
              <tbody>
                {preview.preview.map((row, index) => (
                  <tr key={row.row}>
                    <td>{row.row}</td>
                    <td>
                      <input
                        className="preview-input"
                        type="date"
                        value={row.date}
                        onChange={(event) =>
                          updateRow(index, "date", event.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="preview-input"
                        value={row.description}
                        onChange={(event) =>
                          updateRow(index, "description", event.target.value)
                        }
                      />
                    </td>
                    <td>
                      <select
                        value={row.type}
                        onChange={(event) =>
                          updateRow(index, "type", event.target.value)
                        }
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className="preview-input amount-preview"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={row.amount}
                        onChange={(event) =>
                          updateRow(index, "amount", event.target.value)
                        }
                      />
                    </td>
                    <td>
                      <select
                        aria-label={`Category for row ${row.row}`}
                        value={row.categoryId}
                        onChange={(event) =>
                          updateRow(index, "categoryId", event.target.value)
                        }
                      >
                        <option value="">Choose category</option>
                        {categories
                          .filter((category) => category.type === row.type)
                          .map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td>
                      {isValidTransactionRow(row) ? (
                        <Pill tone="success">Ready</Pill>
                      ) : (
                        <Pill tone="danger">Fix row</Pill>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
