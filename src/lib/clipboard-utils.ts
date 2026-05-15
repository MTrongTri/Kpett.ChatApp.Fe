
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        if (!navigator?.clipboard) {
            console.warn("Trình duyệt của bạn không hỗ trợ Clipboard API");
            return false;
        }

        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error("Lỗi khi sao chép vào bộ nhớ tạm: ", error);
        return false;
    }
};