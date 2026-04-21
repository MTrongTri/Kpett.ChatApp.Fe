"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import * as z from "zod";

import ProfileAvatarRow from "@/app/(main)/[username]/components/profile-avatar-row";
import ProfileCover from "@/app/(main)/[username]/components/profile-cover";
import { DateSelectGroup } from "@/components/input/date-select-group";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { checkUsername, getMyProfile, updateUserGeneralInfo } from "@/services/user.service";
import { ApiResponse } from "@/types/common/api";
import { UserProfile } from "@/types/user";
import { ProfileGeneralFormSkeleton } from "./profile-general-form-skeleton";
import { toast } from "sonner";

// Định nghĩa schema validation cho form
const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự." }).max(50),
  username: z
    .string()
    .min(3, { message: "Username phải có ít nhất 3 ký tự." })
    .max(30)
    .regex(/^[a-zA-Z0-9_.]+$/, {
      message: "Username chỉ được chứa chữ cái, số, dấu chấm và gạch dưới.",
    }),
  biography: z.string().max(160, { message: "Tiểu sử không vượt quá 160 ký tự." }).optional(),
  occupation: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  dateOfBirth: z
    .custom<Date>(
      (val) => val instanceof Date && !isNaN(val.getTime()),
      { message: "Vui lòng chọn đầy đủ Ngày, Tháng, Năm." }
    )
    .refine(
      (date) => date <= new Date(),
      { message: "Ngày sinh không thể là tương lai." }
    ).optional(),
});

type ProfileFormValues = z.input<typeof profileFormSchema>;

export default function ProfileGeneralForm() {
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Khởi tạo ref để lưu trữ timer của debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: response, isLoading, error } = useSWR<ApiResponse<UserProfile>>(
    '/users/me',
    () => getMyProfile(),
    {
      revalidateOnFocus: false,
    }
  );

  const userProfile = response?.data;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      username: userProfile?.username || "",
      biography: "",
      occupation: "",
      location: "",
      dateOfBirth: undefined,
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        displayName: userProfile.displayName || "",
        username: userProfile.username || "",
        biography: userProfile.biography || "",
        occupation: userProfile.occupation || "",
        location: userProfile.location || "",
        dateOfBirth: userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth) : undefined,
      });
    }
  }, [userProfile, form]);

  // Xử lý onChange riêng cho Username để Debounce mà không làm re-render toàn bộ form
  const handleUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void
  ) => {
    const value = e.target.value;

    onChange(value);

    // Clear timer cũ nếu user vẫn đang gõ
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Đặt timer mới (500ms)
    debounceTimerRef.current = setTimeout(async () => {
      // Bỏ qua nếu giá trị giống với username ban đầu của user
      if (value === userProfile?.username) {
        form.clearErrors("username");
        return;
      }

      // Kiểm tra xem format có hợp lệ không (độ dài, ký tự đặc biệt) trước khi gọi API
      const currentError = form.getFieldState("username").error;
      const isFormatValid = !currentError || currentError.type === "manual";

      if (value.length >= 3 && isFormatValid) {
        setIsCheckingUsername(true);
        try {
          const { data } = await checkUsername(value);

          if (!data?.isAvailable) {
            form.setError("username", {
              type: "manual",
              message: "Username này đã được người khác sử dụng.",
            });
          } else {
            form.clearErrors("username");
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra username", error);
        } finally {
          setIsCheckingUsername(false);
        }
      }
    }, 500);
  };

  // Xử lý Submit
  async function onSubmit(data: ProfileFormValues) {
    const formattedData = {
      ...data,
      dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, "yyyy-MM-dd") : null
    };

    const res = await updateUserGeneralInfo(formattedData);

    if (res.isSuccess) {
      toast.success("Cập nhật thông tin thành công!");
    }
    else {
      toast.error("Cập nhật thông tin thất bại. Vui lòng thử lại.");
    }
  }

  // --- HIỂN THỊ SKELETON KHI ĐANG TẢI DỮ LIỆU ---
  if (isLoading) {
    return <ProfileGeneralFormSkeleton />;
  }

  // Xử lý Lỗi (Tuỳ chọn hiển thị UI Lỗi)
  if (error || !userProfile) {
    return <div className="text-center text-red-500 py-10">Đã xảy ra lỗi khi tải dữ liệu hồ sơ.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* --- PHẦN 1: ẢNH BÌA & AVATAR --- */}
      <div className="relative group">
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden relative">
          <ProfileCover cover={userProfile?.coverUrl} isOwner={true} className="h-48 md:h-52" />
        </div>

        <ProfileAvatarRow profile={userProfile} isOwner={true} />

      </div>

      <div className="h-12"></div>

      {/* --- PHẦN 2: THÔNG TIN CHI TIẾT (FORM) --- */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 gap-x-6 px-4 md:px-0">

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên hiển thị</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên của bạn" {...field} className="h-12 text-base px-4 py-1 focus-visible:ring-0" />
                  </FormControl>
                  <div className="min-h-5">
                    <FormMessage className="text-xs" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Tên người dùng (Username)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="nguyenvana"
                        {...field}
                        // Thay thế onChange mặc định bằng hàm tùy chỉnh có chứa logic debounce
                        onChange={(e) => handleUsernameChange(e, field.onChange)}
                        className={cn(
                          "h-12 text-base px-4 py-1",
                          "ring-0 ring-offset-0 outline-none shadow-none",
                          "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
                          fieldState.invalid && "border-red-500 focus-visible:border-red-500"
                        )} />
                      {isCheckingUsername && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <div className="min-h-5">
                    <FormMessage className="text-xs" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nghề nghiệp</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Software Engineer" {...field} className="h-12 text-base px-4 py-1 focus-visible:ring-0" />
                  </FormControl>
                  <div className="min-h-5">
                    <FormMessage className="text-xs" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col justify-end">
                  <FormLabel>Ngày sinh</FormLabel>
                  <FormControl>
                    <DateSelectGroup value={field.value} onChange={field.onChange} className="h-12!" hasError={fieldState.invalid} />
                  </FormControl>
                  <div className="min-h-5">
                    <FormMessage className="text-xs" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input placeholder="Thành phố, Quốc gia..." {...field} className="h-12 text-base px-4 py-1 focus-visible:ring-0" />
                  </FormControl>
                  <div className="min-h-5">
                    <FormMessage className="text-xs" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="biography"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Tiểu sử</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Viết vài dòng giới thiệu về bản thân..."
                      className="resize-none h-24 focus-visible:ring-0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex justify-between">
                    <span>Được phép sử dụng các thẻ tag, mention.</span>
                    <span>{field.value?.length || 0}/160</span>
                  </FormDescription>
                  <div className="min-h-5">
                    <FormMessage className="text-xs" />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end px-4 md:px-0 mt-6 gap-4">
            <Button variant="outline" type="button" onClick={() => form.reset()}>Hủy bỏ</Button>
            <Button
              type="submit"
              disabled={isCheckingUsername || form.formState.isSubmitting}
            >
              {(isCheckingUsername || form.formState.isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}