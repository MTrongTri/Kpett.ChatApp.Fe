"use client";

import { AtSign, ChevronLeft, FileText, User, Loader2 } from "lucide-react";
import React, { useState } from "react";
import UsernameInput from "./components/UsernameInput";
import { accountSetup } from "@/services/user.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/features/authSlice";
import Cookies from "js-cookie";
import { setAuthSession } from "@/lib/cookie-storage-utils";

export default function SocialAccountSetup() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    biography: "",
    interests: [] as string[],
  });

  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isUsernameChecking, setIsUsernameChecking] = useState(false);
  const [isDisplayNameTouched, setIsDisplayNameTouched] = useState(false);

  const isDisplayNameValid = formData.displayName.trim().length > 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(tag)
        ? prev.interests.filter((t) => t !== tag)
        : [...prev.interests, tag],
    }));
  };

  const handleCompleted = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data } = await accountSetup(formData);

      if (!data) {
        toast.error("Đã có lỗi xảy ra");
        return;
      }

      setAuthSession({ isProfileCompleted: data.isProfileCompleted });

      dispatch(
        setCredentials({
          user: data,
          isLogedIn: true,
          isProfileCompleted: true,
        }),
      );
      toast.success("Thiết lập tài khoản thành công!");
      router.push("/");
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi lưu thông tin");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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
                      }`}
                    />
                  </div>
                  {isDisplayNameTouched && !isDisplayNameValid && (
                    <p className="animate-in fade-in slide-in-from-top-1 ml-1 text-xs font-medium text-red-500">
                      Tên hiển thị không được để trống
                    </p>
                  )}
                </div>

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

              <button
                onClick={() => setStep(2)}
                disabled={
                  !isDisplayNameValid || !isUsernameValid || isUsernameChecking
                }
                className="w-full cursor-pointer rounded-2xl bg-slate-900 py-4 font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-900/50 dark:bg-orange-500 dark:disabled:bg-orange-500/50"
              >
                Tiếp tục
              </button>
            </div>
          </section>
        ) : (
          <section className="animate-in fade-in slide-in-from-right-4 duration-500">
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
                    name="biography" // Đã sửa từ "bio" thành "biography" để khớp với state
                    rows={3}
                    value={formData.biography}
                    onChange={handleChange}
                    placeholder="Viết đôi chút về bạn"
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-transparent py-3.5 pr-4 pl-11 transition-all outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:text-white"
                  ></textarea>
                </div>
              </div>

              <div className="space-y-3">
                <label className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Bạn quan tâm đến điều gì?
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Ăn uống",
                    "Động vật",
                    "Thể thao",
                    "Thời trang",
                    "Công nghệ",
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        formData.interests.includes(tag)
                          ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20"
                          : "border-slate-200 text-slate-600 hover:border-orange-200 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleCompleted}
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Đang lưu...
                    </>
                  ) : (
                    "Hoàn tất thiết lập"
                  )}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
