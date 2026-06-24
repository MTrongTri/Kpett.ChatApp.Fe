import { PostEditorMode } from '@/components/posts/post-editor/post-editor';
import type { Media } from '@/types/media';
import type { Post } from '@/types/post';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
    postLightBox: {
        isOpen: boolean;
        post: Post | null;
        postId: string | null;
        autoScrollTarget: string | null;
    };
    mediaLightBox: {
        isOpen: boolean;
        media: Media[];
        currentIndex: number;
    };
    postEditorModal: {
        isOpen: boolean;
        mode: PostEditorMode;
        postId: string | null;
        groupId: string | null;
    };
}

const initialState: ModalState = {
    postLightBox: { isOpen: false, post: null, postId: null, autoScrollTarget: null },
    mediaLightBox: { isOpen: false, media: [], currentIndex: 0 },
    postEditorModal: { isOpen: false, mode: "create", postId: null, groupId: null },
};

export const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        // Post Lightbox
        openPostLightBox: (
            state,
            action: PayloadAction<{ post?: Post | null; postId?: string; targetScroll?: string }>
        ) => {
            state.postLightBox.isOpen = true;
            state.postLightBox.post = action.payload.post || null;
            state.postLightBox.postId = action.payload.postId || null;
            state.postLightBox.autoScrollTarget = action.payload?.targetScroll || null;
        },
        closePostLightBox: (state) => {
            state.postLightBox.isOpen = false;
            state.postLightBox.post = null;
            state.postLightBox.postId = null;
            state.postLightBox.autoScrollTarget = null;
        },

        // Media Lightbox
        openMediaLightBox: (
            state,
            action: PayloadAction<{ media: Media[]; index: number }>
        ) => {
            state.mediaLightBox.isOpen = true;
            state.mediaLightBox.media = action.payload.media;
            state.mediaLightBox.currentIndex = action.payload.index;
        },
        closeMediaLightBox: (state) => {
            state.mediaLightBox.isOpen = false;
            state.mediaLightBox.media = [];
            state.mediaLightBox.currentIndex = 0;
        },

        // Post Editor Modal
        openPostEditorModal: (
            state,
            action: PayloadAction<{ mode: PostEditorMode; postId?: string | null; groupId?: string | null }>
        ) => {
            state.postEditorModal.isOpen = true;
            state.postEditorModal.mode = action.payload.mode;
            state.postEditorModal.postId = action.payload.postId || null;
            state.postEditorModal.groupId = action.payload.groupId || null;
        },
        closePostEditorModal: (state) => {
            state.postEditorModal.isOpen = false;
            state.postEditorModal.mode = "create";
            state.postEditorModal.postId = null;
            state.postEditorModal.groupId = null;
        },

        // 
        closeAllModal: (state) => {
            state.postEditorModal.isOpen = false;
            state.postLightBox.isOpen = false;
            state.mediaLightBox.isOpen = false;
        }
    },
});

export const {
    openPostLightBox, closePostLightBox,
    openMediaLightBox, closeMediaLightBox,
    openPostEditorModal, closePostEditorModal,

    closeAllModal
} = modalSlice.actions;

export default modalSlice.reducer;