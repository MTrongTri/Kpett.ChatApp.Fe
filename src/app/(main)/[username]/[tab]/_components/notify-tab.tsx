"use client";

import type { NotifyForm } from "@/types/edit-profile";
import { NOTIFY_CHANNELS, NOTIFY_SETTINGS } from "../_data/edit-profile-data";
import SectionCard from "./section-card";
import FormToggle from "./form-toggle";
import { Separator } from "@/components/ui/separator";

interface NotifyTabProps {
  notify:   NotifyForm;
  onChange: (patch: NotifyForm) => void;
}

export default function NotifyTab({ notify, onChange }: NotifyTabProps) {
  return (
    <>
      {NOTIFY_CHANNELS.map((channel) => (
        <SectionCard
          key={channel.key}
          title={`${channel.label}`}
        >
          {NOTIFY_SETTINGS.map((setting, i) => {
            const key     = `${channel.key}_${setting.key}`;
            const checked = notify[key] ?? false;

            return (
              <div key={setting.key}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex-1 pr-4">
                    <p className="text-[14px] font-medium text-foreground leading-tight">
                      {setting.label}
                    </p>
                    <p className=" text-[11.5px] text-foreground/50 mt-0.5">
                      {setting.desc}
                    </p>
                  </div>
                  <FormToggle
                    checked={checked}
                    onChange={(v) => onChange({ ...notify, [key]: v })}
                    label={`${channel.label} - ${setting.label}`}
                  />
                </div>
                {i < NOTIFY_SETTINGS.length - 1 && (
                  <Separator className="bg-border" />
                )}
              </div>
            );
          })}
        </SectionCard>
      ))}
    </>
  );
}