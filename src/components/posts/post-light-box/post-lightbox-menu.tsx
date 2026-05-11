import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EyeOff, Flag, Link2, MoreHorizontal, Pencil, Trash2, UserMinus } from "lucide-react";

export const PostLightboxMenu = ({ isAuthor, onEdit, onDelete }: any) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground/40 hover:bg-foreground/8 hover:text-foreground h-8 w-8 shrink-0 rounded-lg">
                    <MoreHorizontal size={15} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border text-[12px] text-card-foreground/80 w-44 rounded-lg space-y-1">
                {isAuthor && (
                    <>
                        <DropdownMenuItem className="hover:text-primary cursor-pointer gap-2" onClick={onEdit}>
                            <Pencil size={13} /> Chỉnh sửa bài viết
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:text-primary cursor-pointer gap-2" onClick={onDelete}>
                            <Trash2 size={13} /> Xóa bài viết
                        </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuItem className="cursor-pointer gap-2"><Link2 size={13} /> Sao chép liên kết</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2"><EyeOff size={13} /> Ẩn bài viết</DropdownMenuItem>
                {!isAuthor && (
                    <DropdownMenuItem className="cursor-pointer gap-2"><UserMinus size={13} /> Bỏ theo dõi</DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer gap-2">
                    <Flag size={13} /> Báo cáo
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};