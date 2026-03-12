import { LucideIcon } from "lucide-react";

// ── TAB ──────────────────────────────────────────────────────────────
export type EditProfileTab =
  | "general"
  | "account"
  | "links"
  | "privacy"
  | "notify";

export interface TabConfig {
  key:   EditProfileTab;
  label: string;
  icon:  LucideIcon;
}

// ── FORM ─────────────────────────────────────────────────────────────
export interface GeneralForm {
  displayName:  string;
  username:     string;
  role:         string;
  bio:          string;
  location:     string;
  website:      string;
  birthday:     string;
  /** CSS gradient string for the avatar */
  avatarGradient: string;
  /** First letter shown in avatar */
  avatarInitial:  string;
  /** CSS gradient string for the cover */
  coverGradient:  string;
}

export interface AccountForm {
  email:        string;
  phone:        string;
  currentPass:  string;
  newPass:      string;
  confirmPass:  string;
}

/** key = platform slug, value = URL string */
export type LinksForm = Record<string, string>;

export interface PrivacyForm {
  account:       "public" | "private";
  showActivity:  boolean;
  allowMention:  boolean;
  showLikes:     boolean;
  allowShare:    boolean;
}

/** key = `${channel}_${setting}`, value = boolean */
export type NotifyForm = Record<string, boolean>;

// ── DATA SHAPES ───────────────────────────────────────────────────────
export interface LinkPlatform {
  key:         string;
  icon:        LucideIcon;
  label:       string;
  placeholder: string;
}

export interface PrivacyOption {
  key:   "public" | "private";
  label: string;
  desc:  string;
}

export interface NotifySetting {
  key:   string;
  label: string;
  desc:  string;
}

export interface NotifyChannel {
  key:   string;
  label: string;
  icon:  LucideIcon;
}

// ── COMBINED STATE (used by shell) ────────────────────────────────────
export interface EditProfileState {
  general: GeneralForm;
  account: AccountForm;
  links:   LinksForm;
  privacy: PrivacyForm;
  notify:  NotifyForm;
}