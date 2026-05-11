// store/features/chat-slice.ts
import { MessageResponse } from '@/types/chat';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatPopupState {
    conversationId: string;
    isMinimized: boolean;
    newMessage?: MessageResponse | null;
}

interface ChatUIState {
    openPopups: ChatPopupState[];
}

const initialState: ChatUIState = {
    openPopups: [],
};

export const chatSlice = createSlice({
    name: 'chatUI',
    initialState,
    reducers: {
        openChatPopup: (state, action: PayloadAction<string>) => {
            const conversationId = action.payload;
            const exists = state.openPopups.find(p => p.conversationId === conversationId);
            if (exists) {
                exists.isMinimized = false;
                return;
            }
            if (state.openPopups.length >= 3) {
                state.openPopups.shift();
            }
            state.openPopups.push({ conversationId, isMinimized: false, newMessage: null });
        },
        openChatPopupSilent: (state, action: PayloadAction<{ conversationId: string, newMessage: MessageResponse }>) => {
            const { conversationId, newMessage } = action.payload;
            const existingPopup = state.openPopups.find(p => p.conversationId === conversationId);

            // Nếu popup đã tồn tại, cập nhật tin nhắn mới và dừng lại
            if (existingPopup) {
                existingPopup.newMessage = newMessage;
                return;
            }

            // Nếu chưa tồn tại, kiểm tra giới hạn 3 popup
            if (state.openPopups.length >= 3) {
                state.openPopups.shift();
            }

            // Mở mới nhưng mặc định THU NHỎ (Làm bong bóng)
            state.openPopups.push({ conversationId, isMinimized: true, newMessage });
        },
        closeChatPopup: (state, action: PayloadAction<string>) => {
            state.openPopups = state.openPopups.filter(p => p.conversationId !== action.payload);
        },
        toggleMinimizePopup: (state, action: PayloadAction<string>) => {
            const popup = state.openPopups.find(p => p.conversationId === action.payload);
            if (popup) {
                popup.isMinimized = !popup.isMinimized;
            }
        },
        closeAllChatPopups: (state) => {
            state.openPopups = [];
        }
    },
});

export const { openChatPopup, openChatPopupSilent, closeChatPopup, toggleMinimizePopup, closeAllChatPopups } = chatSlice.actions;
export default chatSlice.reducer;