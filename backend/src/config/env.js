import "dotenv/config";

const required = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

export function getConfig() {
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(
        `Missing ${key}. Copy backend/.env.example to backend/.env and configure it.`,
      );
    }
  }

  if (
    process.env.JWT_SECRET.length < 32 ||
    process.env.JWT_SECRET.includes("replace-with")
  ) {
    throw new Error("JWT_SECRET must contain at least 32 random characters.");
  }

  return {
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGO_URI,
    clientUrls: process.env.CLIENT_URL.split(",").map((value) =>
      value.trim().replace(/\/$/, ""),
    ),
  };
}
