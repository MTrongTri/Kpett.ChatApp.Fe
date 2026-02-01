// app/not-found.js
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2>404 - Không tìm thấy trang</h2>
      <p>Rất tiếc, nội dung bạn tìm kiếm không tồn tại.</p>
      <Link href="/" className="text-blue-500 underline">
        Quay lại trang chủ
      </Link>
    </div>
  )
}