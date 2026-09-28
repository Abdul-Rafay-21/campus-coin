/**
 * Idempotent development seed for Campus Coin.
 *
 * Creates the configured administrator, demo students, default categories,
 * six months of transactions, transaction audit rows, and current budgets.
 * Re-running this script only replaces records created by this demo seed.
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import {
  Budget,
  Category,
  Transaction,
  TransactionAudit,
  User,
} from "../src/models/models.js";
import { defaultCategories } from "../src/data/defaultCategories.js";

const {
  MONGO_URI,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_NAME,
  DEMO_USER_PASSWORD = "StudentDemo123!",
  NODE_ENV,
  ALLOW_DEMO_SEED,
} = process.env;

const seedSource = "Campus Coin demo seed v1";

const demoStudents = [
  {
    name: "Ayesha Khan",
    email: "ayesha.demo@campuscoin.test",
    academicYear: "3rd Year",
    monthlyAllowance: 45000,
    monthlySavingsGoal: 9000,
    status: "active",
  },
  {
    name: "Bilal Ahmed",
    email: "bilal.demo@campuscoin.test",
    academicYear: "2nd Year",
    monthlyAllowance: 38000,
    monthlySavingsGoal: 6000,
    status: "active",
  },
  {
    name: "Hira Ali",
    email: "hira.demo@campuscoin.test",
    academicYear: "Final Year",
    monthlyAllowance: 52000,
    monthlySavingsGoal: 12000,
    status: "active",
  },
  {
    name: "Usman Raza",
    email: "usman.demo@campuscoin.test",
    academicYear: "1st Year",
    monthlyAllowance: 32000,
    monthlySavingsGoal: 5000,
    status: "disabled",
  },
  {
    name: "Sara Noor",
    email: "sara.demo@campuscoin.test",
    academicYear: "3rd Year",
    monthlyAllowance: 47000,
    monthlySavingsGoal: 10000,
    status: "active",
  },
];

function validateEnvironment() {
  if (!MONGO_URI) throw new Error("Set MONGO_URI in backend/.env first.");
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error(
      "Set ADMIN_EMAIL and a strong ADMIN_PASSWORD (12+ chars) in backend/.env first.",
    );
  }
  if (DEMO_USER_PASSWORD.length < 12) {
    throw new Error("DEMO_USER_PASSWORD must contain at least 12 characters.");
  }
  if (NODE_ENV === "production" && ALLOW_DEMO_SEED !== "true") {
    throw new Error(
      "Demo seeding is disabled in production. Set ALLOW_DEMO_SEED=true only if intentional.",
    );
  }
}

async function seedAdministrator() {
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });

  if (existing && existing.role !== "admin") {
    throw new Error("ADMIN_EMAIL belongs to a student. Use a different email.");
  }
  if (existing) return { account: existing, created: false };

  const account = await User.create({
    name: ADMIN_NAME || "Campus Admin",
    email,
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
    role: "admin",
    emailVerified: true,
    status: "active",
  });
  return { account, created: true };
}

async function seedCategories() {
  for (const [type, categories] of Object.entries(defaultCategories)) {
    for (const [name, icon] of categories) {
      await Category.updateOne(
        { type, name, userId: null, isDefault: true },
        {
          $set: { icon, isActive: true },
          $setOnInsert: { type, name, userId: null, isDefault: true },
        },
        { upsert: true },
      );
    }
  }

  const categories = await Category.find({ userId: null, isDefault: true });
  return new Map(categories.map((category) => [category.name, category]));
}

async function seedStudents(passwordHash) {
  for (const student of demoStudents) {
    await User.updateOne(
      { email: student.email },
      {
        $set: {
          ...student,
          passwordHash,
          role: "student",
          emailVerified: true,
          currency: "PKR",
          preferences: {
            theme: "dark",
            fontSize: "normal",
            notificationsEnabled: true,
          },
        },
      },
      { upsert: true, runValidators: true },
    );
  }

  return User.find({ email: { $in: demoStudents.map(({ email }) => email) } });
}

function monthDate(monthOffset, day, hour = 12) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1, hour);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const safeDay = monthOffset === 0 ? Math.min(day, now.getDate()) : day;
  date.setDate(Math.min(safeDay, lastDay));
  return date;
}

function transactionRows(student, studentIndex, categories) {
  const amountFactor = 1 + studentIndex * 0.08;
  const rows = [];
  const add = (monthOffset, day, type, category, amount, description) => {
    rows.push({
      userId: student._id,
      categoryId: categories.get(category)._id,
      type,
      amountMinor: Math.round(amount * amountFactor * 100),
      description,
      date: monthDate(monthOffset, day),
      source: seedSource,
      status: "active",
    });
  };

  for (let month = 5; month >= 0; month -= 1) {
    add(month, 2, "income", "Allowance", 36000, "Monthly family allowance");
    if ((month + studentIndex) % 2 === 0) {
      add(month, 8, "income", "Part-time Job", 12500, "Campus freelance work");
    }
    add(month, 4, "expense", "Hostel/Rent", 12000, "Hostel contribution");
    add(month, 6, "expense", "Food", 4200, "Groceries and cafeteria");
    add(month, 10, "expense", "Transport", 2400, "Bus and ride fares");
    add(month, 13, "expense", "Academics", 3100, "Books and course supplies");
    add(month, 17, "expense", "Food", 3600, "Meals with classmates");
    add(month, 20, "expense", "Subscriptions", 1200, "Mobile and streaming plans");
    add(month, 23, "expense", "Entertainment", 1800, "Weekend outing");
  }

  return rows;
}

async function replaceDemoTransactions(students, categories) {
  const oldTransactions = await Transaction.find({
    userId: { $in: students.map(({ _id }) => _id) },
    source: seedSource,
  }).select("_id");
  const oldIds = oldTransactions.map(({ _id }) => _id);

  if (oldIds.length) {
    await TransactionAudit.deleteMany({ transactionId: { $in: oldIds } });
    await Transaction.deleteMany({ _id: { $in: oldIds } });
  }

  const documents = students.flatMap((student, index) =>
    transactionRows(student, index, categories),
  );
  const transactions = await Transaction.insertMany(documents);
  await TransactionAudit.insertMany(
    transactions.map((transaction) => ({
      userId: transaction.userId,
      transactionId: transaction._id,
      action: "create",
      before: null,
      after: transaction.toObject(),
      at: transaction.createdAt,
    })),
  );
  return transactions;
}

async function seedBudgets(students, categories) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  const plans = [
    ["Food", 11000],
    ["Transport", 5000],
    ["Entertainment", 4000],
  ];

  for (const student of students) {
    for (const [categoryName, limit] of plans) {
      const categoryId = categories.get(categoryName)._id;
      await Budget.updateOne(
        { userId: student._id, categoryId, month, year },
        {
          $set: {
            startDate,
            endDate,
            limitMinor: limit * 100,
            alertThreshold: 80,
          },
        },
        { upsert: true, runValidators: true },
      );
    }
  }
}

validateEnvironment();

try {
  await mongoose.connect(MONGO_URI);

  const [{ account: administrator, created }, categories, passwordHash] =
    await Promise.all([
      seedAdministrator(),
      seedCategories(),
      bcrypt.hash(DEMO_USER_PASSWORD, 12),
    ]);
  const students = await seedStudents(passwordHash);
  const transactions = await replaceDemoTransactions(students, categories);
  await seedBudgets(students, categories);

  console.log(`${created ? "Created" : "Found"} administrator: ${administrator.email}`);
  console.log(`Seeded ${students.length} demo students.`);
  console.log(`Seeded ${categories.size} default categories.`);
  console.log(`Seeded ${transactions.length} demo transactions with audit history.`);
  console.log(`Seeded ${students.length * 3} current-month budgets.`);
  console.log(`Demo student password: ${DEMO_USER_PASSWORD}`);
} catch (error) {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
