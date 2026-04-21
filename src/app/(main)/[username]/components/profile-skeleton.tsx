export default function ProfileSkeleton() {
    return (
        <div className="bg-background min-h-screen pt-14.5">
            <div className="min-w-0">
                {/* 1. Cover Skeleton: Chiều rộng full màn hình */}
                <div className="w-full h-50 md:h-62.5 bg-muted/60 animate-pulse" />

                {/* Bọc nội dung bên dưới và căn giữa */}
                <div className="px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">

                    {/* 2. Avatar Skeleton: Căn giữa, đè lên cover */}
                    <div className="relative -mt-16 mb-4">
                        <div className="w-32 h-32 rounded-full bg-muted animate-pulse border-4 border-background" />
                    </div>

                    {/* 3. Profile Info Skeleton: Căn giữa toàn bộ text */}
                    <div className="w-full flex flex-col items-center space-y-3 mb-6">
                        {/* Tên hiển thị */}
                        <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />

                        {/* Handle (@username) và Vai trò (Student) */}
                        <div className="h-4 w-40 bg-muted/70 animate-pulse rounded-md" />

                        {/* Location & Ngày tham gia */}
                        <div className="flex gap-4">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                            <div className="h-4 w-32 bg-muted animate-pulse rounded-md" />
                        </div>

                        {/* Bio */}
                        <div className="h-4 w-64 bg-muted/70 animate-pulse rounded-md mt-2" />
                    </div>

                    {/* 4. Action Buttons Skeleton: Hàng nút bấm */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        {/* Nút Thêm bạn bè */}
                        <div className="h-10 w-36 bg-muted animate-pulse rounded-full" />
                        {/* Nút Nhắn tin */}
                        <div className="h-10 w-32 bg-muted animate-pulse rounded-full" />
                        {/* Nút 3 chấm */}
                        <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                    </div>

                    {/* 5. Stats Card Skeleton: Khối thống kê bo góc */}
                    <div className="w-full max-w-3xl flex justify-around items-center border border-border/50 rounded-2xl py-6 bg-muted/10 animate-pulse mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                {/* Số lượng */}
                                <div className="h-6 w-8 bg-muted animate-pulse rounded-md" />
                                {/* Nhãn (Bài viết, Bạn bè...) */}
                                <div className="h-3 w-20 bg-muted/70 animate-pulse rounded-md" />
                            </div>
                        ))}
                    </div>

                    {/* 6. Tabs & Content Skeleton (Dự phòng cho phần bên dưới) */}
                    <div className="w-full max-w-3xl">
                        {/* Tabs Header */}
                        <div className="flex justify-center space-x-8 border-b border-border pb-px mb-6">
                            <div className="h-10 w-24 bg-muted animate-pulse rounded-t-md" />
                            <div className="h-10 w-24 bg-muted animate-pulse rounded-t-md" />
                        </div>
                        {/* Dummy Post Content */}
                        <div className="space-y-4">
                            <div className="w-full h-40 bg-muted/40 animate-pulse rounded-xl" />
                            <div className="w-full h-40 bg-muted/40 animate-pulse rounded-xl" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}