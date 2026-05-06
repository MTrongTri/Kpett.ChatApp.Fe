export type DateTimeFormatStyle = "long" | "short" | "absolute";

export interface DateFormatOptions {
  style?: DateTimeFormatStyle; // 'long' (5 phút trước), 'short' (5 ph), 'absolute' (16/03/2026)
  showTime?: boolean; // Có kèm giờ phút không? (vd: 14:32 · 16/03)
  hideYearIfCurrent?: boolean; // Nếu là năm nay thì có ẩn năm đi không?
}

export function formatRelativeTime(
  dateInput: string | Date | null | undefined,
  options?: DateFormatOptions,
): string {
  if (!dateInput) return "";

  // Hỗ trợ truyền vào cả chuỗi ISO hoặc object Date
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  // Kiểm tra ngày hợp lệ (Tránh lỗi Invalid Date)
  if (isNaN(date.getTime())) return "";

  const now = new Date();

  // Thiết lập cấu hình mặc định nếu người dùng không truyền vào
  const config: DateFormatOptions = {
    style: "long",
    showTime: true,
    hideYearIfCurrent: true,
    ...options,
  };

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // --- 1. Chuẩn bị các chuỗi ngày giờ cơ bản ---
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const timeString = `${hours}:${minutes}`;

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  // Tạo chuỗi ngày (Date string) dựa trên config
  let dateString =
    config.hideYearIfCurrent && year === now.getFullYear()
      ? `${day} thg ${month}`
      : `${day}/${month}/${year}`;

  // Chuỗi thời gian tuyệt đối (Absolute string)
  const absoluteString = config.showTime
    ? `${timeString} · ${dateString}`
    : dateString;

  // --- 2. Xử lý logic format ---

  // Nếu người dùng ép buộc dùng kiểu hiển thị tuyệt đối (Absolute)
  if (config.style === "absolute") {
    return absoluteString;
  }

  // --- Tính toán khoảng cách thời gian ---
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  // Kiểu hiển thị NGẮN (Short) - Thường dùng cho Comment, Notification
  if (config.style === "short") {
    if (diffInSeconds < 60) return "1 ph"; // Tránh chữ "vừa xong" quá dài
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ph`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} ngày`; // Dưới 7 ngày
    return dateString; // Cũ hơn thì hiện ngày ngắn gọn
  }

  // Kiểu hiển thị DÀI (Long) - Thường dùng cho Post Feed (Mặc định)
  if (isToday) {
    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    // Chỉ ghi "X giờ trước" nếu thực sự nó xảy ra trong cùng một ngày
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  }

  if (isYesterday) {
    return config.showTime ? `Hôm qua lúc ${timeString}` : "Hôm qua";
  }

  // Các bài viết cũ hơn (Mặc định)
  return absoluteString;
}

export const formatMessageDateHeader = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  // Đưa về cùng mốc 0h để so sánh ngày
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const dateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  if (dateTime === startOfToday) return "Hôm nay";
  if (dateTime === startOfYesterday) return "Hôm qua";

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatMessageTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};
