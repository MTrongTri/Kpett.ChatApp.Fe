import dynamic from "next/dynamic";

export const ModalComponents = {
  search_sidebar: dynamic(() => import("./search-modal")),
  create_post: dynamic(() => import("./create-post-modal")),
  notifications: dynamic(() => import("./create-post-modal")),
} as const;
