"use client";

import { useSelector, useDispatch } from 'react-redux';

import { MediaLightbox } from "@/components/posts/media-lightbox";
import { RootState } from '@/store/store';
import { closeMediaLightBox, closePostEditorModal, closePostLightBox } from '@/store/features/modal-slice';
import PostLightbox from '../posts/post-light-box/post-light-box';
import PostEditor from '../posts/post-editor/post-editor';

export function GlobalModalProvider() {
    const dispatch = useDispatch();
    const postModal = useSelector((state: RootState) => state.modal.postLightBox);
    const mediaModal = useSelector((state: RootState) => state.modal.mediaLightBox);
    const postEditorModal = useSelector((state: RootState) => state.modal.postEditorModal);

    return (
        <>
            {/* Post Lightbox */}
            {postModal.isOpen && (
                <PostLightbox
                    isOpen={postModal.isOpen}
                    initialPost={postModal.post}
                    postId={postModal.postId}
                    autoScrollTarget={postModal.autoScrollTarget || ""}
                    onClose={() => dispatch(closePostLightBox())}
                />
            )}

            {/* Media Lightbox */}
            {mediaModal.isOpen && mediaModal.media.length > 0 && (
                <MediaLightbox
                    isOpen={mediaModal.isOpen}
                    media={mediaModal.media}
                    initialIndex={mediaModal.currentIndex}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) dispatch(closeMediaLightBox());
                    }}
                    className="top-0 right-0 bottom-0 left-0 flex h-screen max-w-none! translate-x-0 translate-y-0"
                />
            )}

            {/* Post Editor Modal */}
            {postEditorModal.isOpen && (
                <PostEditor
                    open={postEditorModal.isOpen}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) dispatch(closePostEditorModal());
                    }}
                    mode={postEditorModal.mode}
                    postId={postEditorModal.postId}
                />
            )}
        </>
    );
}