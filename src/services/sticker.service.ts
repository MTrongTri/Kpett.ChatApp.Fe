import http from '@/lib/axios';

export interface StickerResponse {
  id: string;
  stickerPackId: string;
  mediaUrl: string;
  publicId?: string;
  emoji?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  createdAt: string;
}

export interface StickerPackResponse {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  ownerId: string;
  isPublic: boolean;
  stickerCount: number;
  createdAt: string;
  stickers?: StickerResponse[];
}

export interface CreateStickerPackRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddStickerRequest {
  mediaUrl: string;
  publicId?: string;
  emoji?: string;
}

const API_URL = '/stickers';

export const stickerService = {
  createPack: async (data: CreateStickerPackRequest): Promise<StickerPackResponse> => {
    const response = await http.post(`${API_URL}/packs`, data);
    return response.data.data;
  },

  addSticker: async (packId: string, data: AddStickerRequest): Promise<StickerResponse> => {
    const response = await http.post(`${API_URL}/packs/${packId}/stickers`, data);
    return response.data.data;
  },

  getMyPacks: async (): Promise<StickerPackResponse[]> => {
    const response = await http.get(`${API_URL}/packs/my`);
    return response.data.data;
  },

  getPublicPacks: async (): Promise<StickerPackResponse[]> => {
    const response = await http.get(`${API_URL}/packs/public`);
    return response.data.data;
  },

  deletePack: async (packId: string): Promise<void> => {
    await http.delete(`${API_URL}/packs/${packId}`);
  },

  deleteSticker: async (stickerId: string): Promise<void> => {
    await http.delete(`${API_URL}/stickers/${stickerId}`);
  },
};
