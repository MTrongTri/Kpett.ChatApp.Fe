// components/chat/chat-info.tsx
import React, { useState } from 'react';
import { X, Search, Bell, Image as ImageIcon, FileText, Users, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { useConversations } from '@/hooks/chat/use-conversations';
import { ConversationAvatar } from './conversation-avatar';
import { GroupMembersModal } from './group-members-modal';
import { cn } from '@/lib/utils';

export default function ChatInfo({
    conversationId,
    onClose,
    className,
}: {
    conversationId: string;
    onClose: () => void;
    className?: string;
}) {
    const { conversations } = useConversations();
    const currentConversationFromList = conversations.find(c => c.id === conversationId);

    const { data: fetchedConversation } = useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: () => chatService.getConversationById(conversationId),
        enabled: !currentConversationFromList && !!conversationId,
    });

    const currentConversation = currentConversationFromList || fetchedConversation;
    const [isMembersOpen, setIsMembersOpen] = useState(false);

    if (!currentConversation) return null;

    const chatName = currentConversation.name || "Người dùng";
    const isGroup = currentConversation.type === 'Group';
    return (
        <div className={cn("w-[320px] h-full bg-card border-l border-border flex flex-col shrink-0 shadow-xl overflow-y-auto", className)}>
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-end sticky top-0 bg-card z-10">
                <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition">
                    <X size={20} className="text-muted-foreground" />
                </button>
            </div>

            {/* Profile chung */}
            <div className="flex flex-col items-center py-6 border-b border-border">
                <ConversationAvatar conversation={currentConversation} className="w-20 h-20 mb-3" />
                <h2 className="text-lg wrap-break-word font-bold text-foreground">{chatName}</h2>
                <p className="text-sm text-muted-foreground">{isGroup ? `${currentConversation.participants?.length} thành viên` : 'Đang hoạt động'}</p>

                <div className="flex gap-6 mt-5 text-foreground">
                    <div className="flex flex-col items-center cursor-pointer hover:opacity-80">
                        <div className="p-2.5 bg-muted rounded-full mb-1"><Search size={18} /></div>
                        <span className="text-xs">Tìm kiếm</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer hover:opacity-80">
                        <div className="p-2.5 bg-muted rounded-full mb-1"><Bell size={18} /></div>
                        <span className="text-xs">Tắt thông báo</span>
                    </div>
                </div>
            </div>

            {/* Các menu action */}
            <div className="p-2 space-y-1">
                {isGroup && (
                    <InfoMenuItem
                        icon={<Users size={20} />}
                        title="Thành viên nhóm"
                        onClick={() => setIsMembersOpen(true)}
                    />
                )}
                {/* <InfoMenuItem icon={<ImageIcon size={20} />} title="File phương tiện, file và liên kết" onClick={() => {}} />
                <InfoMenuItem icon={<FileText size={20} />} title="Tệp đính kèm" onClick={() => {}} /> */}
            </div>

            {/* Mock Media Gallery */}
            <div className="hidden p-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase mb-3 block">File phương tiện gần đây</span>
                <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square bg-muted rounded-md overflow-hidden cursor-pointer hover:opacity-90">
                            <img src={`https://picsum.photos/seed/${i}/200`} alt="mock" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            {isGroup && (
                <GroupMembersModal
                    isOpen={isMembersOpen}
                    onClose={() => setIsMembersOpen(false)}
                    conversationId={conversationId}
                    participants={currentConversation.participants || []}
                />
            )}
        </div>
    );
}

// Component phụ trợ cho menu item
function InfoMenuItem({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick?: () => void }) {
    return (
        <button onClick={onClick} className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-xl transition text-foreground">
            <div className="flex items-center gap-3">
                <div className="text-muted-foreground">{icon}</div>
                <span className="text-[15px] font-medium">{title}</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
        </button>
    );
}
