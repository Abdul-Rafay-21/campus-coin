import crypto from "node:crypto";

export class AppError extends Error {
  constructor(status, message, details) {
    super(message);

    this.name = "AppError";

    this.status = status;

    this.details = details;
  }
}

export function route(routeHandler) {
  return (request, response, next) => {
    Promise.resolve()

      .then(() => routeHandler(request, response, next))

      .catch(next);
  };
}

export function moneyToMinor(amount) {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0 ||
    numericAmount > 1e9
  ) {
    throw new AppError(400, "Enter a valid positive amount.");
  }

  const minorUnits = Math.round(numericAmount * 100);

  if (minorUnits < 1) throw new AppError(400, "Minimum amount is 0.01.");

  return minorUnits;
}

export function minorToMoney(minorUnits) {
  return Number((minorUnits / 100).toFixed(2));
}

export function period(month, year) {
  const selectedMonth = Number(month);
  const selectedYear = Number(year);

  const validMonth =
    Number.isInteger(selectedMonth) &&
    selectedMonth >= 1 &&
    selectedMonth <= 12;

  const validYear =
    Number.isInteger(selectedYear) &&
    selectedYear >= 2020 &&
    selectedYear <= 2200;

  if (!validMonth || !validYear)
    throw new AppError(400, "Invalid month or year.");

  return {
    month: selectedMonth,

    year: selectedYear,
    start: new Date(Date.UTC(selectedYear, selectedMonth - 1, 1)),
    end: new Date(Date.UTC(selectedYear, selectedMonth, 1)),
  };
}

export function currentPeriod() {
  const currentDate = new Date();

  return {
    month: currentDate.getUTCMonth() + 1,

    year: currentDate.getUTCFullYear(),
  };
}

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const newToken = () => crypto.randomBytes(32).toString("hex");

export function validDate(dateValue) {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime()))
    throw new AppError(400, "Invalid transaction date.");

  return parsedDate;
}

export const isObjectId = (recordId) =>
  /^[0-9a-fA-F]{24}$/.test(String(recordId || ""));

export const escapeRegex = (input) =>
  String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
