import { Comment } from "@/types/comment";
import { CommentItem } from "./comment-item";

interface CommentListProps {
  postId: string;
  comments: Comment[];
}

export const CommentList = ({ postId, comments }: CommentListProps) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-gray-500">
        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  );
};
