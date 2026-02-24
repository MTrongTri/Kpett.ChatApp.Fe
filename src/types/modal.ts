import { ModalComponents } from "@/components/modals/modal-registry";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ModalType = keyof typeof ModalComponents | null;