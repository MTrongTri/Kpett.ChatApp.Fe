"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreateModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Tạo bài viết mới</DialogTitle>
        </DialogHeader>
        <div className="py-10 flex items-center justify-center border-2 border-dashed rounded-xl border-zinc-200">
          <p className="text-zinc-500">Kéo thả ảnh hoặc video vào đây</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}