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
import { DEFAULT_EDIT_STATE, EDIT_TABS } from "../data/edit-profile-data";
import GeneralTab from "./general-tab";
import AccountTab from "./account-tab";
import LinksTab from "./links-tab";
import PrivacyTab from "./privacy-tab";
import NotifyTab from "./notify-tab";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

