import {
  Heart,
  LucideIcon,
  MessageCircle,
  Repeat2,
  UserPlus,
} from "lucide-react";

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  html: string;
  time: string;
  iconColor: string;
}

const ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    icon: Heart,
    html: "<strong>minh.photo</strong> đã thích bài viết của bạn",
    time: "5 phút trước",
    iconColor: "text-red-500",
  },
  {
    id: "2",
    icon: MessageCircle,
    html: '<strong>hung.travel</strong> bình luận: <em>"Quá đẹp!"</em>',
    time: "28 phút trước",
    iconColor: "text-blue-500",
  },
  {
    id: "3",
    icon: UserPlus,
    html: "<strong>nam.design</strong> bắt đầu theo dõi bạn",
    time: "1 giờ trước",
    iconColor: "text-green-500",
  },
  {
    id: "4",
    icon: Repeat2,
    html: "<strong>anh_thu99</strong> đã chia sẻ bài viết của bạn",
    time: "2 giờ trước",
    iconColor: "text-emerald-500",
  },
  {
    id: "5",
    icon: Heart,
    html: "<strong>linh_art</strong> và <strong>14 người khác</strong> thích ảnh",
    time: "3 giờ trước",
    iconColor: "text-red-500",
  },
];

export default function ActivityCard() {
  return (
    <div className="border-border bg-card rounded-xl border">
      {ACTIVITY.map((item) => (
        <div key={item.id} className="flex gap-3 px-4 py-3">
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] ${item.iconColor || "text-foreground"}`}
          >
            {<item.icon />}
          </div>
          <div>
            <p
              className="text-foreground/70 [&_strong]:text-foreground [&_em]:text-foreground/60 text-[12.5px] leading-normal [&_em]:not-italic [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: item.html }}
            />
            <p className="text-foreground/30 mt-1 text-[10px]">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
