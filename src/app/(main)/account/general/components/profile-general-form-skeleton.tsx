export function ProfileGeneralFormSkeleton() {
    // Định nghĩa một class dùng chung cho các khối skeleton để code gọn hơn
    const baseSkeleton = "bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md";

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* --- PHẦN 1: ẢNH BÌA & AVATAR SKELETON --- */}
            <div className="relative group">
                {/* Cover Skeleton */}
                <div className="h-48 md:h-52 w-full rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />

                {/* Avatar Skeleton */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                    <div className="h-28 w-28 md:h-36 md:w-36 rounded-full border-4 border-white dark:border-slate-950 bg-slate-300 dark:bg-slate-700 animate-pulse" />
                </div>
            </div>

            {/* Spacing cho avatar lồi ra */}
            <div className="h-12"></div>

            {/* --- PHẦN 2: FORM FIELDS SKELETON --- */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 gap-x-6 px-4 md:px-0">

                    {/* Name Skeleton */}
                    <div className="space-y-2">
                        <div className={`h-4 w-24 ${baseSkeleton}`} /> {/* Label */}
                        <div className={`h-12 w-full ${baseSkeleton}`} /> {/* Input */}
                    </div>

                    {/* Username Skeleton */}
                    <div className="space-y-2">
                        <div className={`h-4 w-40 ${baseSkeleton}`} />
                        <div className={`h-12 w-full ${baseSkeleton}`} />
                    </div>

                    {/* Occupation Skeleton */}
                    <div className="space-y-2">
                        <div className={`h-4 w-28 ${baseSkeleton}`} />
                        <div className={`h-12 w-full ${baseSkeleton}`} />
                    </div>

                    {/* DOB Skeleton */}
                    <div className="space-y-2 flex flex-col justify-end">
                        <div className={`h-4 w-20 mb-2 ${baseSkeleton}`} />
                        <div className={`h-12 w-full ${baseSkeleton}`} />
                    </div>

                    {/* Address Skeleton */}
                    <div className="space-y-2 md:col-span-2">
                        <div className={`h-4 w-16 ${baseSkeleton}`} />
                        <div className={`h-12 w-full ${baseSkeleton}`} />
                    </div>

                    {/* Bio Skeleton */}
                    <div className="space-y-2 md:col-span-2">
                        <div className={`h-4 w-16 ${baseSkeleton}`} />
                        <div className={`h-24 w-full ${baseSkeleton}`} /> {/* Textarea cao hơn */}
                    </div>
                </div>

                {/* Buttons Skeleton */}
                <div className="flex justify-end px-4 md:px-0 mt-6 gap-4">
                    <div className={`h-10 w-24 ${baseSkeleton}`} />
                    <div className={`h-10 w-32 ${baseSkeleton}`} />
                </div>
            </div>
        </div>
    );
}