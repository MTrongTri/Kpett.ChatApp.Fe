"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CheckCircle2, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

import EditProfileSaveBar from "./edit-profile-save-bar";

import type {
  EditProfileTab,
  EditProfileState,
  GeneralForm,
  AccountForm,
  LinksForm,
  PrivacyForm,
  NotifyForm,
} from "@/types/edit-profile";
import { DEFAULT_EDIT_STATE, EDIT_TABS } from "../_data/edit-profile-data";
import GeneralTab from "./general-tab";
import AccountTab from "./account-tab";
import LinksTab from "./links-tab";
import PrivacyTab from "./privacy-tab";
import NotifyTab from "./notify-tab";

// ── SIDEBAR ───────────────────────────────────────────────────────────
function Sidebar({
  activeTab,
  onTabChange,
  preview,
}: {
  activeTab: EditProfileTab;
  onTabChange: (tab: EditProfileTab) => void;
  preview: GeneralForm;
}) {
  return (
    <aside className="w-[20%] shrink-0 sticky top-17.5 self-start space-y-4">
      {/* Tab list */}
      <nav className="rounded-md border border-border bg-card overflow-hidden">
        {EDIT_TABS.map((tab, i) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "w-full flex items-center gap-2.5 px-4 py-2.75",
                "text-sm font-medium",
                "text-left transition-all duration-150",
                i > 0 && "border-t border-border",
                active
                  ? "bg-primary/8 text-primary"
                  : "text-foreground/45 hover:text-foreground/70 hover:bg-foreground/4",
              )}
            >
              <tab.icon />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Mini profile preview */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Cover */}
        <div
          className={cn(
            "relative h-16 bg-gradient-to-br",
            preview.coverGradient,
          )}
        >
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px)," +
                "linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Avatar */}
          <div
            className={cn(
              "absolute -bottom-5 left-3",
              "h-11 w-11 rounded-full",
              "bg-gradient-to-br flex items-center justify-center",
              "font-extrabold text-[18px] text-white",
              "border-[2px] border-background shadow-md",
              preview.avatarGradient,
            )}
          >
            {preview.avatarInitial || "?"}
          </div>
        </div>

        {/* Info */}
        <div className="pt-7 pb-3.5 px-3.5">
          <p className="text-[13px] font-bold text-foreground truncate">
            {preview.displayName || "Tên hiển thị"}
          </p>
          <p className=" text-[10px] text-foreground/35 truncate mt-0.5">
            @{preview.username || "username"}
          </p>
          {preview.role && (
            <p className=" text-[10px] text-foreground/50 truncate mt-1 leading-snug">
              {preview.role}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

// ── TOPNAV ────────────────────────────────────────────────────────────
function TopNav({ username, saved }: { username: string; saved: boolean }) {
  const router = useRouter();

  return (
    <header
      className="
        sticky top-0 z-40 h-[54px]
        flex items-center justify-between px-5
        border-b border-border
        bg-background/94 backdrop-blur-xl
      "
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/profile/${username}`)}
        className="gap-1.5  text-[11px] uppercase tracking-wider
                   text-foreground/50 hover:text-foreground px-2"
      >
        <ArrowLeft size={14} />
        Trang cá nhân
      </Button>

      {/* Logo */}
      <span
        className="absolute left-1/2 -translate-x-1/2
                   font-bold italic text-[20px] text-primary tracking-tight"
        style={{ fontFamily: "var(--font-fraunces, Georgia, serif)" }}
      >
        VŌ<span className="not-italic font-light text-foreground">ID</span>
      </span>

      {/* Save indicator */}
      <div
        className={cn(
          "flex items-center gap-1.5  text-[11px] text-emerald-500",
          "transition-all duration-300",
          saved ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <CheckCircle2 size={14} />
        Đã lưu
      </div>
    </header>
  );
}

// ── SHELL ─────────────────────────────────────────────────────────────
interface EditProfileShellProps {
  username: string;
}

export default function EditProfileShell({ username }: EditProfileShellProps) {
  const [state, setState] = useState<EditProfileState>(DEFAULT_EDIT_STATE);
  const [activeTab, setActiveTab] = useState<EditProfileTab>("general");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Typed patch helpers
  const patchGeneral = useCallback((patch: Partial<GeneralForm>) => {
    setState((s) => ({ ...s, general: { ...s.general, ...patch } }));
    setDirty(true);
    setSaved(false);
  }, []);

  const patchAccount = useCallback((patch: Partial<AccountForm>) => {
    setState((s) => ({ ...s, account: { ...s.account, ...patch } }));
    setDirty(true);
    setSaved(false);
  }, []);

  const patchLinks = useCallback((links: LinksForm) => {
    setState((s) => ({ ...s, links }));
    setDirty(true);
    setSaved(false);
  }, []);

  const patchPrivacy = useCallback((patch: Partial<PrivacyForm>) => {
    setState((s) => ({ ...s, privacy: { ...s.privacy, ...patch } }));
    setDirty(true);
    setSaved(false);
  }, []);

  const patchNotify = useCallback((notify: NotifyForm) => {
    setState((s) => ({ ...s, notify }));
    setDirty(true);
    setSaved(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Replace with your API call, e.g. await updateProfile(state)
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDiscard = () => {
    setState(DEFAULT_EDIT_STATE);
    setDirty(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      <TopNav username={username} saved={saved} />

      <div className="px-5 pt-8 pb-6">
        {/* Page heading */}
        <div className="mb-7">
          <h1
            className="text-[28px] font-bold text-foreground tracking-tight"
          >
            Chỉnh sửa trang cá nhân
          </h1>
          <p className=" text-[12px] text-foreground/40 mt-1">
            Thay đổi sẽ được hiển thị công khai trên trang của bạn
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-5 items-start">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            preview={state.general}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {activeTab === "general" && (
              <GeneralTab form={state.general} onChange={patchGeneral} />
            )}
            {activeTab === "account" && (
              <AccountTab form={state.account} onChange={patchAccount} />
            )}
            {activeTab === "links" && (
              <LinksTab links={state.links} onChange={patchLinks} />
            )}
            {activeTab === "privacy" && (
              <PrivacyTab privacy={state.privacy} onChange={patchPrivacy} />
            )}
            {activeTab === "notify" && (
              <NotifyTab notify={state.notify} onChange={patchNotify} />
            )}

            {/* Inline save row */}
            <div className="flex justify-end gap-2.5 mt-2">
              {dirty && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDiscard}
                  disabled={saving}
                  className=" text-[11px] uppercase tracking-wider border-border"
                >
                  Huỷ thay đổi
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  "gap-1.5  text-[11px] uppercase tracking-wider min-w-[130px]",
                  "transition-all duration-200",
                  dirty
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_rgba(245,158,11,0.3)]"
                    : "bg-foreground/8 text-foreground/35 cursor-not-allowed shadow-none",
                )}
              >
                {saving ? "Đang lưu..." : <span className="flex gap-2 items-center"><Save /> Lưu thay đổi</span>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating save bar */}
      <EditProfileSaveBar
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </div>
  );
}
