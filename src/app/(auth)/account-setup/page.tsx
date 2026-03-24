"use client";

import { AtSign, ChevronLeft, FileText, User } from "lucide-react";
import React, { useState } from "react";
import UsernameInput from "./components/UsernameInput";

export default function SocialAccountSetup() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    bio: "",
    interests: [] as string[],
  });

  // State quản lý validation
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isUsernameChecking, setIsUsernameChecking] = useState(false);

  // State kiểm tra xem user đã "chạm" vào field Tên hiển thị chưa
  const [isDisplayNameTouched, setIsDisplayNameTouched] = useState(false);

  // Kiểm tra Tên hiển thị có hợp lệ không (không được rỗng hoặc chỉ có dấu cách)
  const isDisplayNameValid = formData.displayName.trim().length > 0;

  // Hàm cập nhật giá trị chung
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Hàm chọn/bỏ chọn sở thích
  const toggleInterest = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(tag)
        ? prev.interests.filter((t) => t !== tag)
        : [...prev.interests, tag],
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-[#0B0E14]">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 shadow-xl dark:border-slate-800 dark:bg-[#151921]">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1.5 w-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: step === 1 ? "50%" : "100%" }}
          ></div>
        </div>

        {step === 1 ? (
          <section className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Thiết lập định danh
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Bước 1: Thông tin cá nhân cơ bản
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                {/* --- DISPLAY NAME FIELD --- */}
                <div className="space-y-1.5">
                  <label className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Tên hiển thị <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      className={`absolute top-1/2 left-3.5 -translate-y-1/2 transition-colors ${
                        isDisplayNameTouched && !isDisplayNameValid
                          ? "text-red-500"
                          : "text-slate-400"
                      }`}
                      size={18}
                    />
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      onBlur={() => setIsDisplayNameTouched(true)}
                      placeholder="Ví dụ: Trọng Trí"
                      className={`w-full rounded-2xl border bg-transparent py-3.5 pr-4 pl-11 transition-all outline-none dark:text-white ${
                        isDisplayNameTouched && !isDisplayNameValid
                          ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                          : "border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700"
                      } `}
                    />
                  </div>
                  {/* Message báo lỗi */}
                  {isDisplayNameTouched && !isDisplayNameValid && (
                    <p className="animate-in fade-in slide-in-from-top-1 ml-1 text-xs font-medium text-red-500">
                      Tên hiển thị không được để trống
                    </p>
                  )}
                </div>

                {/* --- USERNAME FIELD --- */}
                <div className="space-y-1.5">
                  <UsernameInput
                    value={formData.username}
                    onChange={(val) =>
                      setFormData({ ...formData, username: val })
                    }
                    onValidation={(isValid) => setIsUsernameValid(isValid)}
                    onLoading={setIsUsernameChecking}
                  />
                </div>
              </div>

              {/* --- NEXT BUTTON --- */}
              <button
                onClick={() => setStep(2)}
                disabled={
                  !isDisplayNameValid || !isUsernameValid || isUsernameChecking
                }
                className="w-full cursor-pointer rounded-2xl bg-slate-900 py-4 font-bold text-white transition-all disabled:cursor-not-allowed disabled:bg-slate-900/50 dark:bg-orange-500 dark:disabled:bg-orange-500/50"
              >
                Tiếp tục
              </button>
            </div>
          </section>
        ) : (
          <section className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* ... Phần code Bước 2 giữ nguyên ... */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Kể thêm về bạn
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Bước 2: Sở thích cá nhân
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tiểu sử (Bio)
                </label>
                <div className="relative">
                  <FileText
                    className="absolute top-3.5 left-3.5 text-slate-400"
                    size={18}
                  />
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Viết đôi chút về bạn"
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-transparent py-3.5 pr-4 pl-11 outline-none focus:border-orange-500 dark:border-slate-700 dark:text-white"
                  ></textarea>
                </div>
              </div>

              <div className="space-y-3">
                <label className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Bạn quan tâm đến điều gì?
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "Ăn uống",
                    "Động vật",
                    "Thể thao",
                    "Thời trang",
                    "Công nghệ",
                  ].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleInterest(tag)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        formData.interests.includes(tag)
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => console.log("Final Data:", formData)}
                  className="flex-1 rounded-2xl bg-orange-500 py-4 font-bold text-white shadow-lg transition-transform active:scale-[0.98]"
                >
                  Hoàn tất thiết lập
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
