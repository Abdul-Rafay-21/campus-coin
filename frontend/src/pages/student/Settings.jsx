import React, { useEffect, useState } from "react";
import { LockKeyhole, Save, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import {
  Card,
  Field,
  PageHeader,
  useAuth,
  useToast,
} from "../../components/UIComponents";

const defaultPreferences = {
  theme: "dark",
  fontSize: "normal",
  notificationsEnabled: true,
};

export function Settings({ admin = false }) {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [preferences, setPreferences] = useState(
    user?.preferences || defaultPreferences,
  );
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user?.preferences)
      setPreferences({ ...defaultPreferences, ...user.preferences });
  }, [user?._id, user?.preferences]);

  async function savePreferences() {
    setSavingPreferences(true);
    try {
      const result = await api("/users/profile", {
        method: "PATCH",
        body: { preferences },
      });
      setUser(result.user);
      toast("Preferences saved.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setSavingPreferences(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast("New passwords do not match.", "error");
      return;
    }
    setChangingPassword(true);
    try {
      await api("/users/change-password", {
        method: "PATCH",
        body: {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
      });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast("Password updated.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={admin ? "ADMINISTRATOR PREFERENCES" : "YOUR SPACE, YOUR RULES"}
        title="Settings"
        desc={
          admin
            ? "Personalize the administration workspace and protect your account."
            : "Choose the experience that works for you."
        }
      />
      <div className="settings-grid">
        <Card className="settings-card">
          <h2>Preferences</h2>
          <p>Choose your text size and notification settings.</p>
          <Field label="Font size">
            <select
              value={preferences.fontSize}
              onChange={(event) =>
                setPreferences({ ...preferences, fontSize: event.target.value })
              }
            >
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </Field>
          <label className="settings-toggle">
            <span>
              <strong>In-app notifications</strong>
              <small>See updates and budget reminders.</small>
            </span>
            <input
              type="checkbox"
              checked={Boolean(preferences.notificationsEnabled)}
              onChange={(event) =>
                setPreferences({
                  ...preferences,
                  notificationsEnabled: event.target.checked,
                })
              }
            />
          </label>
          <button
            type="button"
            className="button button-primary settings-submit"
            disabled={savingPreferences}
            onClick={savePreferences}
          >
            <Save size={17} />{" "}
            {savingPreferences ? "Saving..." : "Save preferences"}
          </button>
        </Card>

        <Card className="settings-card">
          <h2>Security</h2>
          <p>Keep your account protected with a strong password.</p>
          <form className="modal-form" onSubmit={changePassword}>
            <Field label="Current password">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={passwords.currentPassword}
                onChange={(event) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: event.target.value,
                  })
                }
              />
            </Field>
            <Field
              label="New password"
              hint="At least 8 characters, including a letter and number."
            >
              <input
                type="password"
                minLength={8}
                pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}"
                required
                autoComplete="new-password"
                value={passwords.newPassword}
                onChange={(event) =>
                  setPasswords({
                    ...passwords,
                    newPassword: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
                value={passwords.confirmPassword}
                onChange={(event) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: event.target.value,
                  })
                }
              />
            </Field>
            <button
              className="button button-outline settings-submit"
              disabled={changingPassword}
            >
              <LockKeyhole size={17} />{" "}
              {changingPassword ? "Updating..." : "Change password"}
            </button>
          </form>
          <div className="security-note">
            <ShieldCheck size={22} />
            <span>
              Use a unique password and sign out when you use a shared device.
            </span>
          </div>
        </Card>
      </div>
    </>
  );
}
