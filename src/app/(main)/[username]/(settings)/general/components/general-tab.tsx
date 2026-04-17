"use client";

import { cn } from "@/lib/utils";
import type { GeneralForm } from "@/types/edit-profile";
import SectionCard from "./section-card";
import FormField from "./form-field";
import ColorPicker from "./color-picker";
import { AVATAR_GRADIENTS, COVER_GRADIENTS } from "../data/edit-profile-data";
import { FormInput, FormTextarea } from "./form-input";

interface GeneralTabProps {
  form: GeneralForm;
  onChange: (patch: Partial<GeneralForm>) => void;
}

// ── LIVE COVER + AVATAR PREVIEW ───────────────────────────────────────
function CoverPreview({ form }: { form: GeneralForm }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border mb-5">
      {/* Cover */}
      <div className={cn("relative h-28 bg-gradient-to-br", form.coverGradient)}>
        {/* grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px)," +
              "linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Avatar */}
        <div
          className={cn(
            "absolute -bottom-5 left-4",
            "h-[58px] w-[58px] rounded-full",
            "bg-gradient-to-br flex items-center justify-center",
            "font-extrabold text-[22px] text-white",
            "border-[3px] border-background",
            "shadow-[0_6px_20px_rgba(0,0,0,0.4)]",
            form.avatarGradient
          )}
        >
          {form.avatarInitial || "?"}
        </div>
      </div>
      {/* spacer so avatar doesn't clip */}
      <div className="h-8 bg-card" />
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────
export default function GeneralTab({ form, onChange }: GeneralTabProps) {
  return (
    <>
      {/* ── Avatar & Cover ── */}
      <SectionCard title="Ảnh đại diện & Ảnh bìa">
        <CoverPreview form={form} />

        <FormField label="Màu ảnh bìa" className="mb-5">
          <ColorPicker
            options={COVER_GRADIENTS}
            value={form.coverGradient}
            onChange={(v) => onChange({ coverGradient: v })}
            variant="cover"
          />
        </FormField>

        <FormField label="Màu avatar">
          <ColorPicker
            options={AVATAR_GRADIENTS}
            value={form.avatarGradient}
            onChange={(v) => onChange({ avatarGradient: v })}
            variant="avatar"
            initial={form.avatarInitial}
          />
        </FormField>
      </SectionCard>

      {/* ── Basic info ── */}
      <SectionCard title="Thông tin cơ bản">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Tên hiển thị" required>
            <FormInput
              value={form.displayName}
              onChange={(e) => onChange({ displayName: e.target.value })}
              placeholder="Họ và tên"
              maxLength={50}
            />
          </FormField>

          <FormField
            label="Tên người dùng"
            required
            hint="Chỉ dùng chữ, số và dấu chấm. Không thay đổi được sau 30 ngày."
          >
            <FormInput
              value={form.username}
              onChange={(e) => onChange({ username: e.target.value })}
              placeholder="username"
              maxLength={30}
              prefix="@"
            />
          </FormField>
        </div>

        <FormField
          label="Nghề nghiệp / Vai trò"
          hint="Hiển thị ngay dưới tên người dùng của bạn"
        >
          <FormInput
            value={form.role}
            onChange={(e) => onChange({ role: e.target.value })}
            placeholder="VD: Backend Developer · Travel Photographer"
            maxLength={60}
          />
        </FormField>

        <FormField label="Tiểu sử">
          <FormTextarea
            value={form.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Kể về bản thân bạn..."
            maxLength={160}
            rows={4}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Vị trí">
            <FormInput
              value={form.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="Thành phố, Quốc gia"
            />
          </FormField>

          <FormField label="Website">
            <FormInput
              value={form.website}
              onChange={(e) => onChange({ website: e.target.value })}
              placeholder="yoursite.com"
              type="url"
            />
          </FormField>
        </div>

        <FormField label="Ngày sinh">
          <FormInput
            type="date"
            value={form.birthday}
            onChange={(e) => onChange({ birthday: e.target.value })}
            className="w-fit"
          />
        </FormField>
      </SectionCard>
    </>
  );
}