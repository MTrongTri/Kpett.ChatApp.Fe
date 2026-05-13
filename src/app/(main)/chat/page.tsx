// app/chat/page.tsx
import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function ChatIndexPage() {
  return (
    <div className="hidden flex-1 flex-col items-center justify-center bg-muted/30 md:flex">
      <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
        <MessageSquare size={40} />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">Kpett Chat</h2>
      <p className="text-muted-foreground">Chọn một đoạn chat hoặc bắt đầu cuộc hội thoại mới</p>
    </div>
  );
}
