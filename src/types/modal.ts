import { Comment } from "./comment";
import { Post } from "./post";

export type ModalPayloadMap = {
  search_sidebar: Record<string, never>;
  create_post: { communityId?: string };
  notifications: Record<string, never>;
  post_light_box: { post: Post; comments: Comment[] };
};

export type ModalType = keyof ModalPayloadMap | null;

export type ModalPayload = {
  [K in keyof ModalPayloadMap]: {
    type: K;
    data?: ModalPayloadMap[K];
  };
}[keyof ModalPayloadMap];
