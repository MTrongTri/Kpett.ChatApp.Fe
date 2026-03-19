"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AccountForm } from "@/types/edit-profile";
import { FormInput } from "./form-input";
import SectionCard from "./section-card";
import FormField from "./form-field";

// ── PASSWORD STRENGTH ─────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const len = password.length;
  const score =
    (len >= 4 ? 1 : 0) +
    (len >= 7 ? 1 : 0) +
    (len >= 10 ? 1 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 1 : 0);

  const levels = [
    { label: "Rất yếu",  color: "bg-destructive"  },
    { label: "Yếu",      color: "bg-orange-500"    },
    { label: "Trung bình",color: "bg-primary"      },
    { label: "Mạnh",     color: "bg-emerald-500"   },
  ];
  const current = levels[Math.max(0, score - 1)];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {levels.map((l, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 h-[3px] rounded-full transition-colors duration-300",
              i < score ? current.color : "bg-foreground/10"
            )}
          />
        ))}
      </div>
      <p className=" text-[10px] text-foreground/40">{current.label}</p>
    </div>
  );
}

// ── PASSWORD INPUT ────────────────────────────────────────────────────
function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value:       string;
  onChange:    (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <FormInput
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      suffix={
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="text-foreground/40 hover:text-foreground transition-colors p-0.5"
          tabIndex={-1}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
    />
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────
interface AccountTabProps {
  form:     AccountForm;
  onChange: (patch: Partial<AccountForm>) => void;
}

export default function AccountTab({ form, onChange }: AccountTabProps) {
  return (
    <>
      {/* ── Account info ── */}
      <SectionCard title="Thông tin tài khoản">
        <FormField
          label="Email"
          required
          hint="Dùng để đăng nhập và nhận thông báo hệ thống"
        >
          <FormInput
            type="email"
            value={form.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="you@example.com"
          />
        </FormField>

        <FormField label="Số điện thoại">
          <FormInput
            type="tel"
            value={form.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="xxx xxx xxxx"
          />
        </FormField>
      </SectionCard>

      {/* ── Change password ── */}
      <SectionCard className="hidden" title="Đổi mật khẩu">
        <FormField label="Mật khẩu hiện tại">
          <PasswordInput
            value={form.currentPass}
            onChange={(v) => onChange({ currentPass: v })}
            placeholder="••••••••"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Mật khẩu mới">
            <PasswordInput
              value={form.newPass}
              onChange={(v) => onChange({ newPass: v })}
              placeholder="Tối thiểu 8 ký tự"
            />
            <PasswordStrength password={form.newPass} />
          </FormField>

          <FormField label="Xác nhận mật khẩu mới">
            <PasswordInput
              value={form.confirmPass}
              onChange={(v) => onChange({ confirmPass: v })}
              placeholder="Nhập lại mật khẩu"
            />
            {form.confirmPass && form.newPass !== form.confirmPass && (
              <p className=" text-[10px] text-destructive mt-1.5">
                Mật khẩu không khớp
              </p>
            )}
            {form.confirmPass && form.newPass === form.confirmPass && (
              <p className=" text-[10px] text-emerald-500 mt-1.5">
                ✓ Khớp
              </p>
            )}
          </FormField>
        </div>
      </SectionCard>

      {/* ── Delete account ── */}
      <SectionCard
        title="Xoá tài khoản"
        desc="Xoá vĩnh viễn tài khoản và toàn bộ dữ liệu. Hành động này không thể hoàn tác."
      >
        <Button
          variant="outline"
          size="sm"
          className="
            gap-2  text-[11px] uppercase tracking-wider
            border-destructive/40 text-destructive bg-destructive/5
            hover:bg-destructive/10 hover:border-destructive/60
          "
        >
          <Trash2 size={13} />
          Xoá tài khoản
        </Button>
      </SectionCard>
    </>
  );
}