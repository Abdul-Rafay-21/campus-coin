/** Build a spreadsheet-safe CSV export for a student's transactions. */
export function createReportCsv(user, rows) {
  const header = [
    "date",
    "type",
    "category",
    "description",
    "amount",
    "currency",
    "source",
  ];
  const lines = rows.map((row) =>
    [
      new Date(row.date).toISOString().slice(0, 10),
      row.type,
      row.categoryId?.name || "Archived category",
      row.description,
      (row.amountMinor / 100).toFixed(2),
      user.currency,
      row.source,
    ]
      .map(csvCell)
      .join(","),
  );

  return Buffer.from(
    String.fromCharCode(0xfeff) +
      [header.join(","), ...lines].join("\r\n") +
      "\r\n",
    "utf8",
  );
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
