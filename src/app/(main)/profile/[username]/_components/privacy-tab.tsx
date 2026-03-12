"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { PrivacyForm } from "@/types/edit-profile";
import SectionCard from "./section-card";
import { PRIVACY_OPTIONS, PRIVACY_TOGGLES } from "../_data/edit-profile-data";
import FormToggle from "./form-toggle";

interface PrivacyTabProps {
  privacy:  PrivacyForm;
  onChange: (patch: Partial<PrivacyForm>) => void;
}

export default function PrivacyTab({ privacy, onChange }: PrivacyTabProps) {
  return (
    <>
      {/* ── Account mode ── */}
      <SectionCard title="Chế độ tài khoản">
        <div className="flex flex-col gap-3">
          {PRIVACY_OPTIONS.map((opt) => {
            const active = privacy.account === opt.key;
            return (
              <label
                key={opt.key}
                onClick={() => onChange({ account: opt.key })}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl cursor-pointer",
                  "border transition-all duration-150",
                  active
                    ? "border-primary/60 bg-primary/5"
                    : "border-border bg-foreground/[0.02] hover:bg-foreground/5"
                )}
              >
                {/* Radio dot */}
                <div
                  className={cn(
                    "h-5 w-5 rounded-full flex-shrink-0",
                    "border-2 transition-all duration-150",
                    "flex items-center justify-center",
                    active
                      ? "border-primary bg-primary"
                      : "border-border bg-transparent"
                  )}
                >
                  {active && (
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-foreground leading-tight">
                    {opt.label}
                  </p>
                  <p className=" text-[11.5px] text-foreground/50 mt-0.5">
                    {opt.desc}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Advanced toggles ── */}
      <SectionCard title="Cài đặt nâng cao">
        {PRIVACY_TOGGLES.map((opt, i) => (
          <div key={opt.key}>
            <div className="flex items-center justify-between py-3">
              <div className="flex-1 pr-4">
                <p className="text-[14px] font-medium text-foreground leading-tight">
                  {opt.label}
                </p>
                <p className=" text-[11.5px] text-foreground/50 mt-0.5">
                  {opt.desc}
                </p>
              </div>
              <FormToggle
                checked={privacy[opt.key as keyof PrivacyForm] as boolean ?? true}
                onChange={(v) => onChange({ [opt.key]: v })}
                label={opt.label}
              />
            </div>
            {i < PRIVACY_TOGGLES.length - 1 && (
              <Separator className="bg-border" />
            )}
          </div>
        ))}
      </SectionCard>
    </>
  );
}