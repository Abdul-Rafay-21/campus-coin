/** Frontend routes. */
import React, { useEffect, useLayoutEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  AuthProvider,
  ConfirmProvider,
  ToastProvider,
  Require,
  useAuth,
} from "./components/UIComponents";
import { PublicLayout, AppLayout } from "./components/Layout";
import { Register } from "./pages/auth/Register";
import { Home } from "./pages/public/Home";
import { InfoPage } from "./pages/public/Info";
import { Sitemap } from "./pages/public/Sitemap";
import { NotFound } from "./pages/public/NotFound";
import { Login } from "./pages/auth/Login";
import { VerifyEmail } from "./pages/auth/VerifyEmail";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { Dashboard } from "./pages/student/Dashboard";
import { Transactions } from "./pages/student/Transactions";
import { Categories } from "./pages/student/Categories";
import { Budgets } from "./pages/student/Budgets";
import { Reports } from "./pages/student/Reports";
import { Insights } from "./pages/student/Insights";
import { MoneyCoach } from "./pages/student/MoneyCoach";
import { Tips } from "./pages/student/Tips";
import { Bookmarks } from "./pages/student/Bookmarks";
import { ImportCSV } from "./pages/student/ImportCSV";
import { Profile } from "./pages/student/Profile";
import { Settings } from "./pages/student/Settings";
import { DashboardPage as AdminDashboard } from "./pages/admin/Dashboard";
import { UsersPage as AdminUsers } from "./pages/admin/Users";
import { CategoriesPage as AdminCategories } from "./pages/admin/Categories";
import { AnnouncementsPage, TemplatesPage } from "./pages/admin/Content";
import { ActivityPage as AdminActivity } from "./pages/admin/Activity";

function ThemeSync() {
  const { user } = useAuth();
  useEffect(() => {
    document.documentElement.dataset.theme =
      window.localStorage.getItem("campuscoin-theme") ||
      user?.preferences?.theme ||
      "dark";
    document.documentElement.dataset.fontSize =
      user?.preferences?.fontSize || "normal";
  }, [user?.preferences?.theme, user?.preferences?.fontSize]);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function Routing() {
  return (
    <>
      <ThemeSync />
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="features" element={<InfoPage kind="features" />} />
          <Route
            path="how-it-works"
            element={<InfoPage kind="how-it-works" />}
          />
          <Route path="about" element={<InfoPage kind="about" />} />
          <Route path="faq" element={<InfoPage kind="faq" />} />
          <Route path="sitemap" element={<Sitemap />} />
          <Route path="privacy" element={<InfoPage kind="privacy" />} />
          <Route path="terms" element={<InfoPage kind="terms" />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="admin/login" element={<Login admin />} />

        <Route
          path="app"
          element={
            <Require role="student">
              <AppLayout />
            </Require>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="categories" element={<Categories />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="reports" element={<Reports />} />
          <Route path="insights" element={<Insights />} />
          <Route path="coach" element={<MoneyCoach />} />
          <Route path="tips" element={<Tips />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route
            path="notifications"
            element={<Navigate to="/app/dashboard" replace />}
          />
          <Route path="import" element={<ImportCSV />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route
          path="admin"
          element={
            <Require role="admin">
              <AppLayout admin />
            </Require>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="tips" element={<TemplatesPage />} />
          <Route
            path="templates"
            element={<Navigate to="/admin/tips" replace />}
          />
          <Route path="logs" element={<AdminActivity />} />
          <Route path="profile" element={<Profile admin />} />
          <Route path="settings" element={<Settings admin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <Routing />
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
