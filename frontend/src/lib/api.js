/** Browser API client. All authenticated requests share the same base URL and session cookie. */
export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

/** Request a Campus Coin endpoint and return JSON, or throw an actionable error. */
export async function api(endpoint, options = {}) {
  const { method = "GET", body, headers = {}, ...requestOptions } = options;
  const isFileUpload =
    typeof FormData !== "undefined" && body instanceof FormData;
  const requestHeaders = {
    ...(!isFileUpload && body !== undefined
      ? { "Content-Type": "application/json" }
      : {}),
    ...headers,
  };

  let apiResponse;
  try {
    apiResponse = await fetch(`${API_BASE}${endpoint}`, {
      method,
      credentials: "include",
      headers: requestHeaders,
      ...(body !== undefined
        ? { body: isFileUpload ? body : JSON.stringify(body) }
        : {}),
      ...requestOptions,
    });
  } catch {
    throw new Error(
      "Cannot connect to the Campus Coin API. Start the backend and check VITE_API_URL.",
    );
  }

  const responseData = await apiResponse.json().catch(() => ({
    message: apiResponse.statusText || "Request failed.",
  }));
  if (!apiResponse.ok) {
    const apiError = new Error(responseData.message || "Request failed.");
    apiError.status = apiResponse.status;
    if (apiResponse.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("campus-auth-invalid"));
    }
    throw apiError;
  }
  return responseData;
}

/** Download a server-generated report file without exposing session credentials. */
export async function downloadApi(endpoint, fileName) {
  const fileResponse = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
  });
  if (!fileResponse.ok) {
    const errorResponse = await fileResponse.json().catch(() => ({}));
    throw new Error(errorResponse.message || "Download failed.");
  }

  const reportBlob = await fileResponse.blob();
  const temporaryUrl = URL.createObjectURL(reportBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = temporaryUrl;
  downloadLink.download = fileName;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(temporaryUrl);
}

/** API stores whole-number minor units to avoid floating point money errors. */
export function money(minorUnits, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format((Number(minorUnits) || 0) / 100);
}

export function dateLabel(dateValue) {
  if (!dateValue) return "--";
  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function monthName(month, year) {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
