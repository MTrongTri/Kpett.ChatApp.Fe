"use client";

import { X } from "lucide-react";
import type { LinksForm } from "@/types/edit-profile";
import { LINK_PLATFORMS } from "../data/edit-profile-data";
import SectionCard from "./section-card";
import { FormInput } from "./form-input";

interface LinksTabProps {
  links: LinksForm;
  onChange: (patch: LinksForm) => void;
}

export default function LinksTab({ links, onChange }: LinksTabProps) {
  const filledCount = LINK_PLATFORMS.filter((p) => links[p.key]?.trim()).length;

  return (
    <SectionCard
      title="Liên kết mạng xã hội"
      desc={`Thêm tối đa ${LINK_PLATFORMS.length} liên kết hiển thị trên trang cá nhân · ${filledCount}/${LINK_PLATFORMS.length} đã điền`}
    >
      <div className="flex flex-col gap-4">
        {LINK_PLATFORMS.map((platform) => {
          const val = links[platform.key] ?? "";

          return (
            <div key={platform.key} className="flex items-center gap-3">
              {/* Platform icon */}
              <div
                className="
                  h-10 w-10 flex-shrink-0 rounded-[10px]
                  bg-foreground/5 border border-border
                  flex items-center justify-center text-lg
                  select-none
                "
              >
                {<platform.icon />}
              </div>

              {/* Input */}
              <div className="flex-1 min-w-0">
                <p className="
                   text-[10.5px] font-semibold
                  uppercase tracking-[0.1em] text-foreground/40 mb-1.5
                ">
                  {platform.label}
                </p>
                <FormInput
                  type="url"
                  value={val}
                  onChange={(e) =>
                    onChange({ ...links, [platform.key]: e.target.value })
                  }
                  placeholder={platform.placeholder}
                />
              </div>

              {/* Clear button — only when field has value */}
              {val.trim() ? (
                <button
                  type="button"
                  onClick={() => onChange({ ...links, [platform.key]: "" })}
                  className="
                    mt-5 h-8 w-8 flex-shrink-0 rounded-lg
                    border border-border bg-transparent
                    text-foreground/30
                    hover:text-destructive hover:border-destructive/50
                    flex items-center justify-center
                    transition-all duration-150
                  "
                  aria-label={`Xoá ${platform.label}`}
                >
                  <X size={13} />
                </button>
              ) : (
                <div className="mt-5 h-8 w-8 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}