"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AtSign, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { checkUsername } from "@/services/user.service";

interface UsernameFieldProps {
  value: string;
  onChange: (val: string) => void;
  onValidation: (isValid: boolean) => void;
  onLoading: (isLoading: boolean) => void;
}

export default function UsernameInput({
  value,
  onChange,
  onValidation,
  onLoading,
}: UsernameFieldProps) {
  const [errorMsg, setErrorMsg] = useState("");
  const debouncedUsername = useDebounce(value, 500);

  const isFormatInvalid = useMemo(() => {
    if (!value) return false;
    return /[^a-z0-9._]/.test(value);
  }, [value]);

  const shouldFetch =
    debouncedUsername.length >= 3 && !/[^a-z0-9._]/.test(debouncedUsername);

  const {
    data,
    isFetching,
    error
  } = useQuery({
    queryKey: ["check-username", debouncedUsername],
    queryFn: () => checkUsername(debouncedUsername),
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    const checking =
      (value !== debouncedUsername && value.length >= 3) || isFetching;
    onLoading(checking);
  }, [value, debouncedUsername, isFetching, onLoading]);

  useEffect(() => {
    if (value.length === 0) {
      setErrorMsg("");
      onValidation(false);
      return;
    }

    if (isFormatInvalid) {
      setErrorMsg("Chỉ dùng chữ cái, số, dấu chấm (.) và gạch dưới (_)");
      onValidation(false);
      return;
    }

    if (value.length < 3) {
      setErrorMsg("Username phải có ít nhất 3 ký tự");
      onValidation(false);
      return;
    }

    if (isFetching) {
      setErrorMsg("");
      return;
    }

    if (data) {
      if (data.isAvailable) {
        setErrorMsg("");
        onValidation(true);
      } else {
        setErrorMsg("Tên này đã có người sử dụng");
        onValidation(false);
      }
    }

    if (error) {
      setErrorMsg("Lỗi kết nối máy chủ");
      onValidation(false);
    }
  }, [value, isFormatInvalid, data, isFetching, error, onValidation]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    onChange(val);
  };

  const showSuccess = shouldFetch && !isFetching && data?.isAvailable;
  const showLoading = isFetching;
  const showErrorIcon =
    (value.length > 0 && isFormatInvalid) ||
    (value.length >= 3 && !isFetching && data && !data.isAvailable) ||
    (value.length > 0 && value.length < 3 && !isFetching);

  return (
    <div className="space-y-1.5">
      <label className="text-foreground ml-1 text-sm font-semibold">
        Username <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <AtSign
          className="text-muted-foreground absolute top-1/2 left-3.5 -translate-y-1/2"
          size={18}
        />

        <input
          type="text"
          value={value}
          onChange={handleTextChange}
          spellCheck={false}
          placeholder="trongtri.dev"
          className={`focus:ring-primary/10 w-full rounded-2xl border bg-transparent py-3.5 pr-10 pl-11 text-slate-700 transition-all outline-none focus:ring-4 dark:text-slate-300 ${errorMsg ? "border-destructive" : "border-input"} ${showSuccess ? "border-green-500" : ""} `}
        />

        <div className="absolute top-1/2 right-3.5 flex -translate-y-1/2 items-center">
          {showLoading && (
            <Loader2 className="text-primary animate-spin" size={18} />
          )}
          {showSuccess && <CheckCircle2 className="text-green-500" size={18} />}
          {showErrorIcon && !showLoading && (
            <XCircle className="text-destructive" size={18} />
          )}
        </div>
      </div>

      {errorMsg && (
        <p className="text-destructive animate-in fade-in slide-in-from-top-1 ml-1 text-xs font-medium">
          {errorMsg}
        </p>
      )}
    </div>
  );
}