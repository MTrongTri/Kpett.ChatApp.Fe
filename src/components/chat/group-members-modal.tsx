"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user/user-avatar";
import { chatService } from "@/services/chat.service";
import { toast } from "sonner";
import { Loader2, UserMinus, Plus, Search, Check } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { useGroupMembers } from "@/hooks/chat/use-group-members";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/hooks/use-debounce";

interface GroupMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: string;
    participants: any[];
}

export function GroupMembersModal({ isOpen, onClose, conversationId, participants }: GroupMembersModalProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'add'>('list');

    const {
        members,
        isLoading: isMembersLoading,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage
    } = useGroupMembers(conversationId);

    // Cài đặt Intersection Observer để làm infinite scroll
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // States for 'add' mode
    const [search, setSearch] = useState("");
    const [friends, setFriends] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        if (isOpen && viewMode === 'add') {
            setSearch("");
            setSelectedIds([]);
        }
    }, [isOpen, viewMode]);

    useEffect(() => {
        if (!isOpen || viewMode !== 'add') return;

        fetchFriendsToAdd(debouncedSearch);
    }, [debouncedSearch, isOpen, viewMode]);

    const fetchFriendsToAdd = async (searchTerm: string) => {
        try {
            setIsSearching(true);
            const data = await chatService.getFriendsNotInGroup(conversationId, searchTerm, 20);
            if (data && data.items) {
                setFriends(data.items);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        try {
            setIsLoadingAction(true);
            await chatService.removeMember(conversationId, userId);
            toast.success("Đã xóa thành viên");
            // Làm mới cache danh sách thành viên sau khi xóa
            queryClient.invalidateQueries({ queryKey: ["group-members", conversationId] });
        } catch (error) {
            console.error(error);
            toast.error("Không thể xóa thành viên");
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleAddMembers = async () => {
        if (selectedIds.length === 0) return;
        try {
            setIsLoadingAction(true);
            await chatService.addMemberToGroup(conversationId, selectedIds);
            toast.success("Đã thêm thành viên");
            // Làm mới cache sau khi thêm
            queryClient.invalidateQueries({ queryKey: ["group-members", conversationId] });
            setViewMode('list');
        } catch (error) {
            console.error(error);
            toast.error("Không thể thêm thành viên");
        } finally {
            setIsLoadingAction(false);
        }
    };

    const toggleSelect = (userId: string) => {
        setSelectedIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    // Vẫn dùng participants prop truyền vào để biết role hiện tại của user nhanh nhất
    const myRole = participants.find(p => p.id === user?.id)?.role;
    const canManage = myRole === 'Owner' || myRole === 'Admin';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {viewMode === 'list' ? 'Thành viên nhóm' : 'Thêm thành viên'}
                    </DialogTitle>
                </DialogHeader>

                {viewMode === 'list' ? (
                    <div className="space-y-4 py-4">
                        {canManage && (
                            <Button
                                onClick={() => setViewMode('add')}
                                className="w-full justify-start gap-2 mb-2"
                                variant="outline"
                            >
                                <Plus size={18} /> Thêm thành viên
                            </Button>
                        )}
                        <div className="max-h-[400px] overflow-y-auto space-y-1 custom-scrollbar -mx-2 px-2">
                            {isMembersLoading ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                </div>
                            ) : (
                                members.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-muted transition-colors">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar user={{ ...p, avatarUrl: p.avatarUrl }} className="w-10 h-10" />
                                            <div>
                                                <div className="font-semibold text-sm flex items-center gap-1">
                                                    {p.displayName}
                                                    {p.role === 'Owner' && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">Owner</span>}
                                                </div>
                                                <div className="text-xs text-muted-foreground">@{p.username}</div>
                                            </div>
                                        </div>
                                        {canManage && p.id !== user?.id && p.role !== 'Owner' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 cursor-pointer"
                                                onClick={() => handleRemoveMember(p.id)}
                                                disabled={isLoadingAction}
                                            >
                                                <UserMinus size={16} />
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}

                            {/* Điểm neo để trigger load trang tiếp theo */}
                            {hasNextPage && (
                                <div ref={ref} className="flex justify-center p-4">
                                    {isFetchingNextPage && <Loader2 className="animate-spin text-primary" size={20} />}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // ... (Phần viewMode === 'add' giữ nguyên code cũ của bạn) ...
                    <div className="space-y-4 py-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                placeholder="Tìm kiếm bạn bè..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10"
                            />
                        </div>

                        <div className="max-h-[300px] overflow-y-auto space-y-1 custom-scrollbar -mx-2 px-2">
                            {isSearching ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                </div>
                            ) : friends.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    Không tìm thấy bạn bè nào để thêm.
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

                        <div className="flex justify-between items-center mt-4">
                            <Button variant="ghost" onClick={() => setViewMode('list')} disabled={isLoadingAction}>
                                Quay lại
                            </Button>
                            <Button onClick={handleAddMembers} disabled={isLoadingAction || selectedIds.length === 0}>
                                {isLoadingAction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Thêm ({selectedIds.length})
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}