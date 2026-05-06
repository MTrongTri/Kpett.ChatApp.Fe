// components/chat/chat-info.tsx
import React from 'react';
import { X, Search, Bell, Image as ImageIcon, FileText, Users, ChevronRight } from 'lucide-react';

export default function ChatInfo({ conversationId, onClose }: { conversationId: string, onClose: () => void }) {
    return (
        <div className="w-[320px] h-full bg-card border-l border-border flex flex-col shrink-0 shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                <h3 className="font-semibold text-foreground">Chi tiết</h3>
                <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition">
                    <X size={20} className="text-muted-foreground" />
                </button>
            </div>

            {/* Profile chung */}
            <div className="flex flex-col items-center py-6 border-b border-border">
                <img src="https://github.com/shadcn.png" alt="Avatar" className="w-20 h-20 rounded-full mb-3 shadow-sm border border-border" />
                <h2 className="text-lg font-bold text-foreground">Phòng Chat Kpett</h2>
                <p className="text-sm text-muted-foreground">Đang hoạt động</p>

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

            {/* Các menu action (Mock) */}
            <div className="p-2 space-y-1">
                <InfoMenuItem icon={<Users size={20} />} title="Thành viên nhóm" />
                <InfoMenuItem icon={<ImageIcon size={20} />} title="File phương tiện, file và liên kết" />
                <InfoMenuItem icon={<FileText size={20} />} title="Tệp đính kèm" />
            </div>

            {/* Mock Media Gallery */}
            <div className="p-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase mb-3 block">File phương tiện gần đây</span>
                <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square bg-muted rounded-md overflow-hidden cursor-pointer hover:opacity-90">
                            <img src={`https://picsum.photos/seed/${i}/200`} alt="mock" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Component phụ trợ cho menu item
function InfoMenuItem({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <button className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-xl transition text-foreground">
            <div className="flex items-center gap-3">
                <div className="text-muted-foreground">{icon}</div>
                <span className="text-[15px] font-medium">{title}</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
        </button>
    );
}