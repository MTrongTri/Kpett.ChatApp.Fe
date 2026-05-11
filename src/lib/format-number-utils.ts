/**
 * Format số lượng thành dạng rút gọn (1K, 1.5M, v.v.)
 * @param {number} num - Số cần format
 * @returns {string} - Chuỗi đã được format rút gọn
 */
export const formatCompactNumber = (num : number) => {
  if (typeof num !== 'number') return '0';

  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  return formatter.format(num).toLowerCase(); 
};