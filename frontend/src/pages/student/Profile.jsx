import React, { useEffect, useRef, useState } from "react";
import { Camera, Save, ShieldCheck, Trash2 } from "lucide-react";
import { api, dateLabel } from "../../lib/api";
import {
  Card,
  Field,
  PageHeader,
  Pill,
  useAuth,
  useToast,
} from "../../components/UIComponents";

const academicYears = [
  "1st year",
  "2nd year",
  "3rd year",
  "4th year",
  "Graduate",
  "Other",
];
const currencies = ["PKR", "USD", "INR", "GBP", "EUR", "AED"];
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This image could not be opened."));
    };
    image.src = url;
  });
}

async function prepareAvatar(file) {
  if (!imageTypes.has(file.type))
    throw new Error("Choose a JPG, PNG, or WebP image.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Choose an image smaller than 5 MB.");

  const { image, url } = await loadImage(file);
  try {
    const size = Math.min(image.naturalWidth, image.naturalHeight);
    const sourceX = (image.naturalWidth - size) / 2;
    const sourceY = (image.naturalHeight - size) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not process this image.");
    context.fillStyle = "#eef8f1";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      image,
      sourceX,
      sourceY,
      size,
      size,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.84),
    );
    if (!blob) throw new Error("Your browser could not process this image.");
    return new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function Profile({ admin = false }) {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const fileInput = useRef(null);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    academicYear: user?.academicYear || "",
    monthlyAllowance: user?.monthlyAllowance || 0,
    monthlySavingsGoal: user?.monthlySavingsGoal || 0,
    currency: user?.currency || "PKR",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name,
      academicYear: user.academicYear || "",
      monthlyAllowance: user.monthlyAllowance || 0,
      monthlySavingsGoal: user.monthlySavingsGoal || 0,
      currency: user.currency || "PKR",
    });
  }, [user?._id]);

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const body = admin
        ? { name: form.name }
        : {
            ...form,
            monthlyAllowance: Number(form.monthlyAllowance),
            monthlySavingsGoal: Number(form.monthlySavingsGoal),
          };
      const result = await api("/users/profile", {
        method: "PATCH",
        body,
      });
      setUser(result.user);
      toast("Profile updated.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(event) {
    const source = event.target.files?.[0];
    event.target.value = "";
    if (!source) return;
    setPhotoBusy(true);
    try {
      const avatar = await prepareAvatar(source);
      const body = new FormData();
      body.append("avatar", avatar);
      const result = await api("/users/profile/avatar", {
        method: "POST",
        body,
      });
      setUser(result.user);
      toast("Profile photo updated.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function removePhoto() {
    setPhotoBusy(true);
    try {
      const result = await api("/users/profile/avatar", { method: "DELETE" });
      setUser(result.user);
      toast("Profile photo removed.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setPhotoBusy(false);
    }
  }

  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "C";

  return (
    <>
      <PageHeader
        eyebrow={admin ? "ADMINISTRATOR ACCOUNT" : "THE PERSON BEHIND THE PLAN"}
        title="My profile"
        desc={
          admin
            ? "Manage your administrator identity and profile photo."
            : "Keep your account details and money preferences up to date."
        }
      />
      <div className="profile-layout">
        <Card className="profile-card">
          <div className="profile-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" />
            ) : (
              initial
            )}
          </div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <Pill tone={user?.emailVerified ? "success" : "neutral"}>
            <ShieldCheck size={13} />
            {user?.emailVerified
              ? "Verified account"
              : "Email verification pending"}
          </Pill>
          <input
            ref={fileInput}
            className="visually-hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={uploadPhoto}
          />
          <div className="profile-photo-actions">
            <button
              type="button"
              className="button button-outline"
              disabled={photoBusy}
              onClick={() => fileInput.current?.click()}
            >
              <Camera size={16} />
              {photoBusy
                ? "Processing..."
                : user?.avatarUrl
                  ? "Change photo"
                  : "Upload photo"}
            </button>
            {user?.avatarUrl && (
              <button
                type="button"
                className="icon-button profile-photo-remove"
                disabled={photoBusy}
                onClick={removePhoto}
                aria-label="Remove profile photo"
                title="Remove profile photo"
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>
          <small className="profile-photo-help">
            JPG, PNG or WebP. Images are cropped and optimized automatically.
          </small>
          <div className="profile-member">
            Member since {dateLabel(user?.createdAt)}
          </div>
        </Card>

        <Card className="profile-form">
          <div className="card-heading">
            <div>
              <h2>{admin ? "Administrator details" : "Personal details"}</h2>
              <p>
                {admin
                  ? "Keep the name shown across the administration workspace up to date."
                  : "Set your allowance baseline and monthly savings goal."}
              </p>
            </div>
          </div>
          <form onSubmit={saveProfile} className="modal-form">
            <div className="form-grid">
              <Field label="Full name">
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </Field>
              {admin ? (
                <Field label="Email address" hint="Administrator email is managed securely.">
                  <input value={user?.email || ""} readOnly disabled />
                </Field>
              ) : (
                <Field label="Academic year">
                  <select
                    value={form.academicYear}
                    onChange={(event) =>
                      setForm({ ...form, academicYear: event.target.value })
                    }
                  >
                    <option value="">Not specified</option>
                    {academicYears.map((year) => (
                      <option key={year}>{year}</option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
            {!admin && (
              <>
                <div className="form-grid">
                  <Field label="Monthly allowance baseline">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.monthlyAllowance}
                      onChange={(event) =>
                        setForm({ ...form, monthlyAllowance: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Monthly savings goal">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.monthlySavingsGoal}
                      onChange={(event) =>
                        setForm({ ...form, monthlySavingsGoal: event.target.value })
                      }
                    />
                  </Field>
                </div>
                <Field
                  label="Currency"
                  hint="Currency cannot be changed after you record transactions."
                >
                  <select
                    value={form.currency}
                    onChange={(event) =>
                      setForm({ ...form, currency: event.target.value })
                    }
                  >
                    {currencies.map((currency) => (
                      <option key={currency}>{currency}</option>
                    ))}
                  </select>
                </Field>
              </>
            )}
            <div className="modal-footer">
              <button disabled={saving} className="button button-primary">
                <Save size={17} /> {saving ? "Saving..." : "Save profile"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
