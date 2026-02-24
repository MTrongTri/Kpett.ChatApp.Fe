"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Tìm kiếm</DialogTitle>
          <DialogDescription>Tìm kiếm người dùng, bài viết, từ khóa...</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <input 
            type="text" 
            placeholder="Nhập nội dung tìm kiếm..." 
            className="w-full p-2 border rounded-md"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}