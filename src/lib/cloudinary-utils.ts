/**
 * Hàm tự động chèn các tham số tối ưu hóa vào URL của Cloudinary.
 * @param url Chuỗi URL gốc
 * @param type Loại media ('image' hoặc 'video') để áp dụng chiến lược nén khác nhau
 */
export const getOptimizedCloudinaryUrl = (url: string, type: "image" | "video" = "image"): string => {
    if (!url || !url.includes("cloudinary.com")) return url;

    if (url.includes("f_auto") || url.includes("q_auto")) return url;

    const uploadToken = "/upload/";
    const uploadIndex = url.indexOf(uploadToken);

    if (uploadIndex === -1) return url;

    const baseUrl = url.substring(0, uploadIndex + uploadToken.length);
    const imagePath = url.substring(uploadIndex + uploadToken.length);

    let optimizationParams = "f_auto,q_auto";

    if (type === "image") {
        optimizationParams = "f_auto,q_auto,c_limit,w_1080";
    } else if (type === "video") {
        optimizationParams = "f_auto,q_auto";
    }

    return `${baseUrl}${optimizationParams}/${imagePath}`;
};