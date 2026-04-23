import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user/user-avatar";
import { RootState } from "@/store/store";
import { Globe, Lock, Users } from "lucide-react";
import { useSelector } from "react-redux";

// --- TYPES ---

export interface ComposeProps {
  content: string;
  setContent: (val: string) => void;
  privacy: string;
  setPrivacy: (val: string) => void;
}

interface StepComposeProps {
  props: ComposeProps;
}

// --- COMPONENT ---

export default function StepCompose({ props }: StepComposeProps) {
  const { content, setContent, privacy, setPrivacy } = props;

  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="flex flex-col gap-6">
      {/* Tác giả & Quyền riêng tư */}
      <div className="flex items-center gap-3">
        <UserAvatar user={user!} />
        <div>
          <div className="text-foreground text-sm font-semibold">{user?.displayName}</div>
          <div className="mt-1 flex gap-1.5">
            {[
              { id: "public", icon: Globe, label: "Công khai" },
              { id: "friends", icon: Users, label: "Bạn bè" },
              { id: "private", icon: Lock, label: "Riêng tư" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = privacy.toLocaleLowerCase() === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPrivacy(item.id)}
                  className={`flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold transition-colors ${isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Icon className="h-3 w-3" /> {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nội dung */}
      <div className="mt-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Bạn đang nghĩ gì? Chia sẻ khoảnh khắc, câu chuyện, hay cảm xúc hôm nay..."
          rows={10}
          className="bg-secondary/30 text-foreground min-h-30 resize-y text-[10px] tracking-wide"
        />
        <div className="mt-1.5 flex justify-between">
          <span className="text-muted-foreground text-[10px]">
            Shift+Enter để xuống dòng
          </span>
        </div>
      </div>
    </div>
  );
}
