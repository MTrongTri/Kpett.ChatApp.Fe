"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user/user-avatar";
import { Search, Loader2, Check } from "lucide-react";
import { getFriendsWithFilter } from "@/services/friend.service";
import { chatService } from "@/services/chat.service";
import { toast } from "sonner";
import { UserProfile } from "@/types/user";
import { useDebounce } from "@/hooks/use-debounce";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (conversationId: string) => void;
}

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Dùng hook debounce để tránh giật/gọi API 2 lần
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (isOpen) {
      setGroupName("");
      setSearch("");
      setSelectedIds([]);
    } else {
      setFriends([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchFriends = async () => {
      try {
        setIsSearching(true);
        const data = await getFriendsWithFilter({ search: debouncedSearch, limit: 20, cursor: null });
        if (data && data.items) {
          setFriends(data.items);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchFriends();
  }, [debouncedSearch, isOpen]);

  const toggleSelect = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.warning("Vui lòng nhập tên nhóm");
      return;
    }
    if (selectedIds.length < 1) {
      toast.warning("Vui lòng chọn ít nhất 1 bạn bè để tạo nhóm");
      return;
    }

    try {
      setIsLoading(true);
      const data = await chatService.createGroupConversation(groupName.trim(), selectedIds);
      toast.success("Tạo nhóm thành công!");

      onSuccess(data.id);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Không thể tạo nhóm");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tạo nhóm chat mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            placeholder="Tên nhóm chat"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full h-auto py-3 focus-visible:ring-0"
            autoFocus
          />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Tìm kiếm bạn bè..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 h-auto py-3 focus-visible:ring-0"
            />
          </div>

          <div className="text-sm font-medium text-muted-foreground">
            Đã chọn: {selectedIds.length} người
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-1 custom-scrollbar -mx-2 px-2">
            {isSearching ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Không tìm thấy bạn bè nào.
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => toggleSelect(friend.id)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar user={friend} className="w-10 h-10" />
                    <div>
                      <div className="font-semibold text-sm">{friend.displayName}</div>
                      <div className="text-xs text-muted-foreground">@{friend.username}</div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedIds.includes(friend.id) ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                    {selectedIds.includes(friend.id) && <Check size={14} className="text-primary-foreground" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCreate} disabled={isLoading || !groupName.trim() || selectedIds.length === 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo nhóm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
